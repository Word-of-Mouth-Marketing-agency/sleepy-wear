import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateSettingDto } from "./dto/update-setting.dto";

const PUBLIC_KEYS = [
  "homepage_mid_banner",
  "homepage_why_sleepywear",
  "homepage_marquee",
  "homepage_best_sellers",
  "site_notice",
  "site_footer_text",
  "site_social_links",
  "checkout_notice",
  "marketing_pixel",
];

const DEFAULT_SETTINGS: Record<string, unknown> = {
  homepage_mid_banner: {
    title: "عرض خاص",
    subtitle: "خصم 10% على أول طلب",
    description: "+ توصيل مجاني للطلبات فوق 999 جنيه",
    buttonText: "تسوق الآن",
    buttonUrl: "/products",
    enabled: true,
  },
  homepage_why_sleepywear: {
    title: "ليه SleepyWear؟",
    subtitle: "كل اللي تحتاجيه لراحة البيت وأناقة كل يوم",
    enabled: true,
    reasons: [
      {
        title: "أسعار المصنع مباشرة",
        description: "اختيارات حقيقية بسعر قريب من المصنع من غير طبقات زيادة.",
        icon: "factory",
        enabled: true,
      },
      {
        title: "خامات مريحة وجودة عالية",
        description: "ملابس بيت ولانچيري بخامات ناعمة ومناسبة للاستخدام اليومي.",
        icon: "refresh",
        enabled: true,
      },
      {
        title: "تشكيلات متنوعة لكل الأذواق",
        description: "بيچامات، ساتان، كيرفي، لانچيري وكوليكشنات تتجدد باستمرار.",
        icon: "chat",
        enabled: true,
      },
      {
        title: "توصيل سريع لكل المحافظات",
        description: "نوصل طلبك لباب البيت مع متابعة واضحة لحد الاستلام.",
        icon: "truck",
        enabled: true,
      },
    ],
  },
  homepage_marquee: {
    messages: ["توصيل مجاني", "خصم 10%", "جودة من المصنع"],
  },
  homepage_best_sellers: {
    productIds: [],
  },
  site_notice: {
    text: "عروض و خصومات الشتاء .. اي اوردر يبدأ من 999 جنيه خصم 10% بأكواد خصم BF10 - S10",
    enabled: true,
  },
  site_footer_text: {
    description: "ملابس منزلية ولانجري بأفضل الأسعار من المصنع مباشرة.",
  },
  site_social_links: {
    facebook: "https://www.facebook.com/Sleepy.lingerie.HomeWear/",
    instagram: "https://www.instagram.com/sleepy.lingerie2?igsh=MTE2aTd3Y2N1aDM0OA==",
    tiktok: "https://www.tiktok.com/@sleepy.lingerie?_r=1&_t=ZS-97I0xGD5E61",
    telegram: "https://t.me/sleepylingerie",
  },
  name: "SleepyWear",
  domain: "sleepyweareg.com",
  currency: "EGP",
  marketing_pixel: { enabled: false, pixelId: "" },
  checkout_notice: {
    enabled: true,
    text: "يتم دفع ديبوزت قبل الشحن: 50 ج.م داخل القاهرة، و100 ج.م لباقي المحافظات.",
  },
};

const ALLOWED_KEYS = new Set([
  ...PUBLIC_KEYS,
  "name",
  "domain",
  "currency",
]);

function validateSettingValue(
  key: string,
  value: unknown,
): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new BadRequestException("القيمة يجب أن تكون كائن (object)");
  }

  const obj = value as Record<string, unknown>;

  switch (key) {
    case "marketing_pixel": {
      if (typeof obj.enabled !== "boolean") {
        throw new BadRequestException("enabled يجب أن يكون قيمة منطقية");
      }
      if (obj.enabled) {
        const script =
          typeof obj.headScript === "string" ? obj.headScript.trim() : "";
        if (script.length > 20000) {
          throw new BadRequestException("كود Meta Pixel طويل جدًا");
        }
        if (script && !/fbq/i.test(script)) {
          throw new BadRequestException(
            "كود Meta Pixel غير صالح: يجب أن يحتوي على fbq",
          );
        }
        const blockedDomains =
          /google-analytics|googletagmanager|gtag|tiktok\.com|snap\.chat|pinterest\.com|twitter\.com|linkedin\.com/i;
        if (blockedDomains.test(script)) {
          throw new BadRequestException(
            "هذا المكان مخصص لكود Meta Pixel فقط. لا تضف أكواد أخرى",
          );
        }
      }
      break;
    }

    case "site_notice":
    case "checkout_notice": {
      if (typeof obj.enabled !== "boolean") {
        throw new BadRequestException("enabled يجب أن يكون قيمة منطقية");
      }
      if (typeof obj.text !== "string") {
        throw new BadRequestException("text يجب أن يكون نصًا");
      }
      if (obj.text.length > 500) {
        throw new BadRequestException(
          "النص طويل جدًا. الحد الأقصى 500 حرف",
        );
      }
      break;
    }

    case "site_footer_text": {
      if (typeof obj.description !== "string") {
        throw new BadRequestException("description يجب أن يكون نصًا");
      }
      if (obj.description.length > 500) {
        throw new BadRequestException(
          "الوصف طويل جدًا. الحد الأقصى 500 حرف",
        );
      }
      break;
    }

    case "site_social_links": {
      const urlFields = ["facebook", "instagram", "tiktok", "telegram"];
      for (const field of urlFields) {
        if (
          obj[field] !== undefined &&
          typeof obj[field] !== "string"
        ) {
          throw new BadRequestException(
            `${field} يجب أن يكون رابطًا نصيًا`,
          );
        }
        if (
          typeof obj[field] === "string" &&
          (obj[field] as string).length > 500
        ) {
          throw new BadRequestException(
            `${field} طويل جدًا. الحد الأقصى 500 حرف`,
          );
        }
      }
      break;
    }

    case "homepage_mid_banner": {
      if (typeof obj.title !== "string") {
        throw new BadRequestException("title يجب أن يكون نصًا");
      }
      if (obj.title.length > 200) {
        throw new BadRequestException("العنوان طويل جدًا");
      }
      break;
    }

    case "homepage_why_sleepywear": {
      if (typeof obj.title !== "string") {
        throw new BadRequestException("title يجب أن يكون نصًا");
      }
      break;
    }

    case "homepage_marquee": {
      if (!Array.isArray(obj.messages)) {
        throw new BadRequestException("messages يجب أن يكون مصفوفة");
      }
      for (const msg of obj.messages) {
        if (typeof msg !== "string") {
          throw new BadRequestException("كل رسالة يجب أن تكون نصًا");
        }
        if (msg.length > 200) {
          throw new BadRequestException(
            "بعض الرسائل طويلة جدًا. الحد الأقصى 200 حرف للرسالة",
          );
        }
      }
      break;
    }

    case "homepage_best_sellers": {
      if (!Array.isArray(obj.productIds)) {
        throw new BadRequestException("productIds يجب أن يكون مصفوفة");
      }
      for (const id of obj.productIds) {
        if (typeof id !== "string") {
          throw new BadRequestException("كل productId يجب أن يكون نصًا");
        }
      }
      break;
    }

    default:
      break;
  }
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic() {
    const settings = await this.prisma.setting.findMany({
      where: { key: { in: PUBLIC_KEYS } },
    });

    const result: Record<string, unknown> = {
      name: DEFAULT_SETTINGS.name,
      domain: DEFAULT_SETTINGS.domain,
      currency: DEFAULT_SETTINGS.currency,
    };

    for (const key of PUBLIC_KEYS) {
      const row = settings.find((s) => s.key === key);
      result[key] = row?.value ?? DEFAULT_SETTINGS[key];
    }

    return result;
  }

  async findOne(key: string) {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    if (!row) throw new NotFoundException("Setting not found");
    return { key: row.key, value: row.value };
  }

  async update(key: string, dto: UpdateSettingDto) {
    if (!ALLOWED_KEYS.has(key)) {
      throw new BadRequestException("مفتاح الإعداد غير صالح");
    }

    validateSettingValue(key, dto.value);

    const value = dto.value as Prisma.InputJsonValue;
    const row = await this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return { key: row.key, value: row.value as Record<string, unknown> };
  }
}