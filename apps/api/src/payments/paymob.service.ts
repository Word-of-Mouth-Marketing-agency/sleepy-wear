import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { createHmac, timingSafeEqual } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";

type PaymobCreateIntentionResponse = {
  id?: string | number;
  intention_id?: string | number;
  client_secret?: string;
  payment_keys?: Array<{ key?: string; integration?: string | number }>;
};

type PaymobWebhookPayload = {
  hmac?: string;
  type?: string;
  obj?: Record<string, unknown>;
  [key: string]: unknown;
};

type PaymobIntentionItem = {
  name: string;
  amount: number;
  description: string;
  quantity: number;
};

@Injectable()
export class PaymobService {
  constructor(private readonly prisma: PrismaService) {}

  async createIntention(orderId: string) {
    const config = getPaymobConfig();
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new BadRequestException("Order not found");
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException("Order is already paid");
    }

    const amountCents = decimalToMinorUnits(order.total);
    if (amountCents < 100) {
      throw new BadRequestException("Order total is too small for payment");
    }

    const items = buildPaymobItems(order);
    const itemSumCents = sumPaymobItems(items);
    const paymentMethods = getPaymentMethods(config.integrationId);
    if (itemSumCents !== amountCents) {
      logPaymobPayloadSummary({
        amountCents,
        currency: config.currency,
        items,
        itemSumCents,
        paymentMethods,
      });
      throw new BadRequestException(
        `Paymob item total mismatch: amount=${amountCents}, items=${itemSumCents}`,
      );
    }

    const payload = {
      amount: amountCents,
      currency: config.currency,
      payment_methods: paymentMethods,
      special_reference: order.orderNumber,
      billing_data: {
        first_name: order.customerName || "SleepyWear",
        last_name: "-",
        phone_number: order.phone,
        email: order.email || "customer@sleepywear.local",
        street: order.address,
        city: order.city,
        country: "EG",
        apartment: "NA",
        floor: "NA",
        building: "NA",
      },
      items,
      extras: {
        internalOrderId: order.id,
        orderNumber: order.orderNumber,
      },
      notification_url: `${config.apiBaseUrlOverride}/api/payments/paymob/webhook`,
      redirection_url: config.successUrl,
    };

    logPaymobPayloadSummary({
      amountCents,
      currency: config.currency,
      items,
      itemSumCents,
      paymentMethods,
      payload,
    });

    const response = await fetch(`${config.apiBaseUrl}/v1/intention/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${config.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "");
      console.warn("[paymob] intention creation failed", {
        status: response.status,
        body: message,
        apiBaseUrl: config.apiBaseUrl,
        paymentMethods,
        integrationIdTypes: paymentMethods.map((method) => typeof method),
      });
      throw new ServiceUnavailableException(
        `Paymob intention creation failed: ${response.status} ${message} | payment_methods=${JSON.stringify(paymentMethods)}`,
      );
    }

    const data = (await response.json()) as PaymobCreateIntentionResponse;
    const clientSecret = data.client_secret ?? data.payment_keys?.[0]?.key;
    if (!clientSecret) {
      throw new ServiceUnavailableException(
        "Paymob did not return a checkout client secret",
      );
    }

    const intentionId = String(data.id ?? data.intention_id ?? "");
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: PaymentMethod.PAYMOB,
        paymentStatus: PaymentStatus.PENDING,
        paymobIntentionId: intentionId || null,
        paymobClientSecret: clientSecret,
      },
    });

    const checkoutUrl = buildUnifiedCheckoutUrl(
      config.publicKey,
      clientSecret,
      config.checkoutBaseUrl,
    );

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentStatus: PaymentStatus.PENDING,
      paymobIntentionId: intentionId || null,
      clientSecret,
      checkoutUrl,
    };
  }

  async handleWebhook(payload: PaymobWebhookPayload, queryHmac?: string) {
    const config = getPaymobConfig();
    const hmac = queryHmac ?? payload.hmac;
    if (!hmac || !verifyPaymobHmac(payload, hmac, config.hmacSecret)) {
      throw new ForbiddenException("Invalid Paymob HMAC");
    }

    const obj = getWebhookObject(payload);
    const internalOrderId = extractString(obj, [
      "extras.internalOrderId",
      "merchant_order_id",
      "order.merchant_order_id",
    ]);
    const paymobIntentionId = extractString(obj, [
      "intention.id",
      "intention_id",
      "payment_intention",
    ]);
    const orderFilters = [
      internalOrderId ? { id: internalOrderId } : undefined,
      paymobIntentionId ? { paymobIntentionId } : undefined,
    ].filter(Boolean) as Prisma.OrderWhereInput[];

    if (!orderFilters.length) {
      throw new BadRequestException("Paymob webhook did not include an order reference");
    }

    const order = await this.prisma.order.findFirst({
      where: { OR: orderFilters },
    });

    if (!order) {
      throw new BadRequestException("Matching internal order was not found");
    }

    const paymentStatus = mapPaymobStatus(obj);
    const transactionId = extractString(obj, ["id", "transaction_id"]);
    const paymobOrderId = extractString(obj, ["order.id", "order_id"]);

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: PaymentMethod.PAYMOB,
        paymentStatus,
        paymobTransactionId: transactionId ?? order.paymobTransactionId,
        paymobOrderId: paymobOrderId ?? order.paymobOrderId,
        paidAt:
          paymentStatus === PaymentStatus.PAID && !order.paidAt
            ? new Date()
            : order.paidAt,
      },
    });

    return {
      received: true,
      orderId: updated.id,
      paymentStatus: updated.paymentStatus,
    };
  }
}

function getPaymobConfig() {
  const secretKey = process.env.PAYMOB_SECRET_KEY;
  const publicKey = process.env.PAYMOB_PUBLIC_KEY;
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  const integrationId = process.env.PAYMOB_INTEGRATION_ID;
  if (!secretKey || !publicKey || !hmacSecret || !integrationId) {
    throw new ServiceUnavailableException("Paymob is not configured");
  }

  const apiBaseUrl =
    process.env.PAYMOB_API_BASE_URL?.replace(/\/$/, "") ??
    "https://accept.paymob.com";
  const siteBaseUrl =
    process.env.PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    process.env.WEB_ORIGIN?.replace(/\/$/, "") ??
    "http://localhost:4000";

  return {
    secretKey,
    publicKey,
    hmacSecret,
    integrationId,
    apiBaseUrl,
    apiBaseUrlOverride:
      process.env.API_PUBLIC_URL?.replace(/\/$/, "") ?? siteBaseUrl,
    checkoutBaseUrl:
      process.env.PAYMOB_CHECKOUT_BASE_URL?.replace(/\/$/, "") ??
      `${apiBaseUrl}/unifiedcheckout`,
    currency: process.env.PAYMOB_CURRENCY ?? "EGP",
    successUrl:
      process.env.PAYMOB_SUCCESS_URL ??
      "http://localhost:3000/payment/success",
  };
}

function decimalToMinorUnits(value: Prisma.Decimal) {
  return Math.round(value.toNumber() * 100);
}

function getPaymentMethods(integrationId: string) {
  const integrationIds = integrationId
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);

  if (!integrationIds.length) {
    throw new ServiceUnavailableException(
      "PAYMOB_INTEGRATION_ID must be a positive numeric integration id",
    );
  }

  return integrationIds;
}

type OrderForPaymob = Prisma.OrderGetPayload<{ include: { items: true } }>;

function buildPaymobItems(order: OrderForPaymob): PaymobIntentionItem[] {
  const discountMinor = decimalToMinorUnits(order.discountTotal);
  if (discountMinor > 0) {
    const totalMinor = decimalToMinorUnits(order.total);
    return [
      {
        name: `SleepyWear ${order.orderNumber}`,
        amount: totalMinor,
        description: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0637\u0644\u0628 \u0628\u0639\u062f \u0627\u0644\u062e\u0635\u0645",
        quantity: 1,
      },
    ];
  }

  const items: PaymobIntentionItem[] = order.items.map((item) => ({
    name: item.productNameSnapshot,
    amount: decimalToMinorUnits(item.unitPriceSnapshot),
    description: item.variantInfoSnapshot || item.skuSnapshot,
    quantity: item.quantity,
  }));

  const shippingMinor = decimalToMinorUnits(order.shippingTotal);
  if (shippingMinor > 0) {
    items.push({
      name: "\u0627\u0644\u0634\u062d\u0646",
      amount: shippingMinor,
      description: "\u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0634\u062d\u0646",
      quantity: 1,
    });
  }

  return items;
}

function sumPaymobItems(items: PaymobIntentionItem[]) {
  return items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
}

function logPaymobPayloadSummary({
  amountCents,
  currency,
  items,
  itemSumCents,
  paymentMethods,
  payload,
}: {
  amountCents: number;
  currency: string;
  items: PaymobIntentionItem[];
  itemSumCents: number;
  paymentMethods: number[];
  payload?: {
    billing_data: Record<string, unknown>;
    notification_url: string;
    redirection_url: string;
    special_reference: string;
  };
}) {
  if (process.env.NODE_ENV === "production" && process.env.PAYMOB_DEBUG !== "true") {
    return;
  }

  console.log("[paymob] intention payload summary", {
    amount: amountCents,
    currency,
    payment_methods: paymentMethods,
    integrationIdTypes: paymentMethods.map((method) => typeof method),
    billingDataPresent: Boolean(payload?.billing_data),
    special_reference: payload?.special_reference,
    notification_url: payload?.notification_url,
    redirection_url: payload?.redirection_url,
    itemSum: itemSumCents,
    items: items.map((item) => ({
      name: item.name,
      amount: item.amount,
      quantity: item.quantity,
      lineTotal: item.amount * item.quantity,
    })),
  });
}

function buildUnifiedCheckoutUrl(
  publicKey: string,
  clientSecret: string,
  checkoutBaseUrl: string,
) {
  const url = new URL(checkoutBaseUrl);
  url.searchParams.set("publicKey", publicKey);
  url.searchParams.set("clientSecret", clientSecret);
  return url.toString();
}

function getWebhookObject(payload: PaymobWebhookPayload) {
  return (payload.obj ?? payload) as Record<string, unknown>;
}

function verifyPaymobHmac(
  payload: PaymobWebhookPayload,
  suppliedHmac: string,
  secret: string,
) {
  const obj = getWebhookObject(payload);
  const source = PAYMOB_HMAC_FIELDS.map((field) => extractString(obj, [field]) ?? "").join("");
  const calculated = createHmac("sha512", secret).update(source).digest("hex");
  const fallback = createHmac("sha512", secret)
    .update(stableStringify(obj))
    .digest("hex");

  return safeEqual(calculated, suppliedHmac) || safeEqual(fallback, suppliedHmac);
}

const PAYMOB_HMAC_FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order.id",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
] as const;

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return String(value ?? "");
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${key}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(",")}}`;
}

function extractString(obj: Record<string, unknown>, paths: readonly string[]) {
  for (const path of paths) {
    const value = path.split(".").reduce<unknown>((current, key) => {
      if (!current || typeof current !== "object") return undefined;
      return (current as Record<string, unknown>)[key];
    }, obj);
    if (value !== undefined && value !== null) return String(value);
  }
  return null;
}

function mapPaymobStatus(obj: Record<string, unknown>) {
  const success = obj.success;
  const pending = obj.pending;
  const voided = obj.is_voided ?? obj.is_void;
  const error = obj.error_occured ?? obj.error_occurred;
  const status = String(obj.status ?? obj.state ?? "").toLowerCase();

  if (success === true || status === "paid" || status === "success") {
    return PaymentStatus.PAID;
  }
  if (voided === true || status === "canceled" || status === "cancelled") {
    return PaymentStatus.CANCELED;
  }
  if (error === true || status === "failed" || status === "failure") {
    return PaymentStatus.FAILED;
  }
  if (pending === true || status === "pending") return PaymentStatus.PENDING;
  return PaymentStatus.FAILED;
}
