"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Minus, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import type { Order, OrderItem } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { OrderItemThumbnail } from "@/components/admin/OrderItemThumbnail";
import { API_URL, getAdminHeaders } from "@/lib/api";
import { getWhatsAppChatUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "جديد",
  CONFIRMED: "قيد المراجعة",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

const PAYMENT_LABELS: Record<string, string> = {
  COD: "الدفع عند الاستلام",
  PAYMOB: "أونلاين",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
  PAID: "مدفوع",
  FAILED: "فشل",
  CANCELED: "ملغي",
};

const statusStyles: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-blue-200 bg-blue-50 text-brand-blue",
  PROCESSING: "border-purple-200 bg-purple-50 text-purple-700",
  SHIPPED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  DELIVERED: "border-green-200 bg-green-50 text-green-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

const EDITABLE_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING"];

type ProductHit = {
  id: string;
  nameAr: string;
  category: { id: string; nameAr: string; isActive: boolean };
  variants: {
    id: string;
    sku: string;
    price: number;
    salePrice: number | null;
    stock: number;
    sizeLabel: string | null;
    colorName: string | null;
  }[];
};

type EditItem = {
  key: string;
  variantId: string;
  quantity: number;
  productName: string;
  variantLabel: string;
  sku: string;
  unitPrice: number;
  stock: number;
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editItems, setEditItems] = useState<EditItem[]>([]);
  const [products, setProducts] = useState<ProductHit[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductHit | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");

  const isEditable = order ? EDITABLE_STATUSES.includes(order.status) : false;
  const isPaidOnline = order?.paymentMethod === "PAYMOB" && order?.paymentStatus === "PAID";

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_URL}/orders/${params.id}`, {
        headers: { Accept: "application/json", ...getAdminHeaders() },
      });
      if (!res.ok) {
        if (res.status === 401) throw Object.assign(new Error(), { status: 401 });
        throw new Error();
      }
      const data = (await res.json()) as Order;
      setOrder(data);
      setEditItems(
        (data.items ?? []).map((item, i) => ({
          key: `e-${i}`,
          variantId: item.variantId ?? "",
          quantity: item.quantity,
          productName: item.productNameSnapshot,
          variantLabel: item.variantInfoSnapshot || "",
          sku: item.skuSnapshot,
          unitPrice: item.unitPriceSnapshot,
          stock: 999,
        })),
      );
    } catch (err: unknown) {
      if (err instanceof Error && "status" in err && (err as any).status === 401) {
        localStorage.removeItem("admin_token");
        router.replace("/admin/login");
        return;
      }
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  async function handleStatusUpdate(status: string) {
    setSaveError(null);
    setSaveSuccess(false);
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        if (res.status === 401) throw Object.assign(new Error(), { status: 401 });
        throw new Error("تعذر تحديث حالة الطلب.");
      }
      setSaveSuccess(true);
      fetchOrder();
    } catch (caught) {
      if (caught instanceof Error && "status" in caught && (caught as any).status === 401) {
        localStorage.removeItem("admin_token");
        router.replace("/admin/login");
        return;
      }
      setSaveError(caught instanceof Error ? caught.message : "تعذر تحديث حالة الطلب.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`هل أنت متأكد من حذف الطلب "${order?.orderNumber}"؟`)) return;
    setSaveError(null);
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/orders/${params.id}`, {
        method: "DELETE",
        headers: { ...getAdminHeaders() },
      });
      if (!res.ok) {
        if (res.status === 401) throw Object.assign(new Error(), { status: 401 });
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "تعذر حذف الطلب.");
      }
      router.push("/admin/orders");
      router.refresh();
    } catch (caught) {
      if (caught instanceof Error && "status" in caught && (caught as any).status === 401) {
        localStorage.removeItem("admin_token");
        router.replace("/admin/login");
        return;
      }
      setSaveError(caught instanceof Error ? caught.message : "تعذر حذف الطلب.");
    } finally {
      setDeleting(false);
    }
  }

  async function searchProducts(q: string) {
    setProductSearch(q);
    if (q.length < 1) {
      setProducts([]);
      setShowProductList(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`${API_URL}/products/admin/search?q=${encodeURIComponent(q)}`, {
        headers: { Accept: "application/json", ...getAdminHeaders() },
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as ProductHit[];
      setProducts(data);
      setShowProductList(true);
    } catch {
      setProducts([]);
    } finally {
      setSearching(false);
    }
  }

  function selectProduct(product: ProductHit) {
    setSelectedProduct(product);
    setSelectedVariantId(product.variants[0]?.id ?? "");
    setShowProductList(false);
    setProductSearch(product.nameAr);
  }

  function addProductToEdit() {
    if (!selectedProduct || !selectedVariantId) return;
    const variant = selectedProduct.variants.find((v) => v.id === selectedVariantId);
    if (!variant) return;

    const price = variant.salePrice ?? variant.price;
    const labelParts = [variant.sizeLabel, variant.colorName].filter(Boolean);
    const variantLabel = labelParts.length ? labelParts.join(" / ") : "عام";

    setEditItems((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}`,
        variantId: variant.id,
        quantity: 1,
        productName: selectedProduct.nameAr,
        variantLabel,
        sku: variant.sku,
        unitPrice: price,
        stock: variant.stock,
      },
    ]);
    setSelectedProduct(null);
    setSelectedVariantId("");
    setProductSearch("");
  }

  function updateEditItemQuantity(key: string, delta: number) {
    setEditItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  }

  function removeEditItem(key: string) {
    setEditItems((prev) => prev.filter((item) => item.key !== key));
  }

  const editSubtotal = useMemo(
    () =>
      editItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [editItems],
  );

  const editTotal = useMemo(() => {
    if (!order) return 0;
    const shipping = order.shippingTotal ?? 0;
    const discount = order.discountTotal ?? 0;
    return editSubtotal + shipping - discount;
  }, [editSubtotal, order]);

  async function handleSaveItems() {
    if (editItems.length === 0) {
      setSaveError("لا يمكن ترك الطلب بدون منتجات");
      return;
    }
    setSaveError(null);
    setSaveSuccess(false);
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/orders/${params.id}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify({
          items: editItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });
      if (!res.ok) {
        if (res.status === 401) throw Object.assign(new Error(), { status: 401 });
        const body = await res.json().catch(() => null);
        throw new Error(
          typeof body?.message === "string"
            ? body.message
            : "فشل تحديث الطلب",
        );
      }
      setSaveSuccess(true);
      setEditMode(false);
      fetchOrder();
    } catch (caught) {
      if (caught instanceof Error && "status" in caught && (caught as any).status === 401) {
        localStorage.removeItem("admin_token");
        router.replace("/admin/login");
        return;
      }
      setSaveError(caught instanceof Error ? caught.message : "فشل تحديث الطلب");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell title="الطلب" eyebrow="Admin" description="جاري التحميل..." noContainer>
        <div className="rounded-2xl border border-[var(--line)] bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">
          جاري تحميل الطلب...
        </div>
      </PageShell>
    );
  }

  if (error || !order) {
    return (
      <PageShell title="الطلب" eyebrow="Admin" description="تعذر التحميل" noContainer>
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          تعذر تحميل الطلب.
        </p>
      </PageShell>
    );
  }

  const statusOptions = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <PageShell
      title={`طلب ${order.orderNumber}`}
      eyebrow="Admin"
      description={`تم في ${new Date(order.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`}
      noContainer
      surface="plain"
    >
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-bold transition hover:border-brand-blue hover:text-brand-blue"
      >
        <ArrowRight size={16} />
        العودة للطلبات
      </Link>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold">بيانات العميل</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="الاسم" value={order.customerName} />
              <PhoneRow phone={order.phone} customerName={order.customerName} />
              <InfoRow label="البريد الإلكتروني" value={order.email ?? "—"} />
              <InfoRow label="المدينة" value={order.city ?? "—"} />
              <InfoRow label="العنوان" value={order.address ?? "—"} className="sm:col-span-2" />
              {order.notes ? (
                <InfoRow label="ملاحظات" value={order.notes} className="sm:col-span-2" />
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">المنتجات</h2>
              {isEditable && !editMode && (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-pink/40 bg-white px-3 py-1.5 text-xs font-bold text-brand-pink transition hover:bg-pink-50"
                >
                  <Pencil size={14} />
                  تعديل المنتجات
                </button>
              )}
            </div>

            {!editMode && (
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#fbf7fa] px-4 py-3 text-sm"
                  >
                    <OrderItemThumbnail
                      alt={item.productNameSnapshot}
                      size="detail"
                      src={item.displayImageUrl}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{item.productNameSnapshot}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {item.variantInfoSnapshot && `${item.variantInfoSnapshot} - `}
                        {item.skuSnapshot}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold text-[var(--muted)]">
                      {item.quantity} x {item.unitPriceSnapshot} = {item.total}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {editMode && (
              <div className="space-y-4">
                {isPaidOnline && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                    تم دفع هذا الطلب أونلاين. تعديل المنتجات سيغير بيانات الطلب داخل النظام فقط ولن يغير مبلغ الدفع لدى Paymob.
                  </div>
                )}

                <div className="space-y-2">
                  {editItems.map((item) => (
                    <div
                      key={item.key}
                      className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#fbf7fa] px-4 py-3 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm">{item.productName}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {item.variantLabel || item.sku}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-white px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateEditItemQuantity(item.key, -1)}
                          disabled={item.quantity <= 1}
                          className="grid h-6 w-6 place-items-center rounded-lg text-brand-pink hover:bg-pink-50 disabled:opacity-30"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-sm font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateEditItemQuantity(item.key, 1)}
                          disabled={item.quantity >= item.stock}
                          className="grid h-6 w-6 place-items-center rounded-lg text-brand-pink hover:bg-pink-50 disabled:opacity-30"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="w-16 shrink-0 text-right text-xs font-bold text-[var(--muted)]">
                        {item.unitPrice * item.quantity} ج
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEditItem(item.key)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                      />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => searchProducts(e.target.value)}
                        onFocus={() => products.length > 0 && setShowProductList(true)}
                        placeholder="ابحث عن منتج..."
                        className="w-full rounded-xl border border-[var(--line)] bg-white py-2 pr-9 pl-3 text-sm font-bold shadow-sm focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                      />
                    </div>
                    {selectedProduct && selectedVariantId && (
                      <button
                        type="button"
                        onClick={addProductToEdit}
                        className="rounded-xl bg-brand-pink px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-pink/90"
                      >
                        إضافة
                      </button>
                    )}
                  </div>

                  {showProductList && products.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-xl border border-[var(--line)] bg-white shadow-lg">
                      {searching && (
                        <p className="p-3 text-xs text-[var(--muted)]">جاري البحث...</p>
                      )}
                      {products.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectProduct(p)}
                          className="w-full px-4 py-2.5 text-right text-sm transition hover:bg-pink-50"
                        >
                          <p className="font-bold">{p.nameAr}</p>
                          <p className="text-xs text-[var(--muted)]">
                            {p.category.nameAr} &middot; {p.variants.length} مقاس/لون
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedProduct && (
                    <div className="mt-2 rounded-xl border border-[var(--line)] bg-[#fbf7fa] p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">{selectedProduct.nameAr}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(null);
                            setSelectedVariantId("");
                            setProductSearch("");
                          }}
                          className="text-[var(--muted)] hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {selectedProduct.variants.length > 1 && (
                        <select
                          value={selectedVariantId}
                          onChange={(e) => setSelectedVariantId(e.target.value)}
                          className="mt-2 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-bold"
                        >
                          {selectedProduct.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {[v.sizeLabel, v.colorName].filter(Boolean).join(" / ") || v.sku}
                              {" "}— {v.salePrice ?? v.price} ج (المخزون: {v.stock})
                            </option>
                          ))}
                        </select>
                      )}
                      {selectedProduct.variants.length === 1 && (
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {selectedProduct.variants[0].salePrice ?? selectedProduct.variants[0].price} ج
                          {" "}&middot; المخزون: {selectedProduct.variants[0].stock}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-dashed border-[var(--line)] bg-white p-3">
                  <div className="flex justify-between text-xs font-bold text-[var(--muted)]">
                    <span>المجموع الفرعي</span>
                    <span>{editSubtotal} ج</span>
                  </div>
                  {order.discountTotal && order.discountTotal > 0 && (
                    <div className="mt-1 flex justify-between text-xs font-bold text-red-600">
                      <span>الخصم {order.couponCode ? `(${order.couponCode})` : ""}</span>
                      <span>-{order.discountTotal} ج</span>
                    </div>
                  )}
                  <div className="mt-1 flex justify-between text-xs font-bold text-brand-blue">
                    <span>الشحن</span>
                    <span>{order.shippingTotal} ج</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-[var(--line)] pt-2 text-sm font-extrabold text-brand-pink">
                    <span>الإجمالي الجديد</span>
                    <span>{editTotal} ج</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveItems}
                    disabled={saving || editItems.length === 0}
                    className="flex-1 rounded-full bg-brand-pink px-4 py-3 text-sm font-extrabold text-white transition hover:bg-brand-pink/90 disabled:opacity-50"
                  >
                    {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    disabled={saving}
                    className="rounded-full border border-[var(--line)] bg-white px-6 py-3 text-sm font-bold transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                </div>

                {saveError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                    {saveError}
                  </p>
                )}
                {saveSuccess && (
                  <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
                    تم تحديث منتجات الطلب بنجاح
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold">حالة الطلب</h2>
            <div className="mb-3">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[order.status] ?? ""}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={saving || order.status === status}
                  onClick={() => handleStatusUpdate(status)}
                  className={`w-full rounded-2xl border px-4 py-2.5 text-right text-sm font-bold transition disabled:opacity-40 ${
                    order.status === status
                      ? "border-brand-pink bg-pink-50 text-brand-pink"
                      : "border-[var(--line)] hover:border-brand-pink hover:bg-pink-50"
                  }`}
                >
                  {STATUS_LABELS[status] ?? status}
                </button>
              ))}
            </div>
            {saveSuccess ? (
              <p className="mt-3 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
                تم تحديث حالة الطلب بنجاح.
              </p>
            ) : null}
            {saveError ? (
              <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {saveError}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold">الدفع</h2>
            <div className="space-y-3">
              <InfoRow label="طريقة الدفع" value={PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod} />
              <InfoRow label="حالة الدفع" value={PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus} />
            </div>
          </section>

          <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <button
              className="w-full rounded-2xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
              disabled={deleting}
              onClick={handleDelete}
              type="button"
            >
              {deleting ? "جاري الحذف..." : "حذف الطلب"}
            </button>
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold">إجماليات</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">المجموع الفرعي</span>
                <span className="font-bold">{order.subtotal} ج</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">الشحن</span>
                <span className="font-bold text-brand-blue">{order.shippingTotal} ج</span>
              </div>
              {order.discountTotal && order.discountTotal > 0 ? (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">
                    الخصم {order.couponCode ? `(${order.couponCode})` : ""}
                  </span>
                  <span className="font-bold text-red-600">-{order.discountTotal} ج</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-[var(--line)] pt-3 text-base font-black">
                <span>الإجمالي</span>
                <span className="text-brand-pink">{order.total} ج</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function InfoRow({
  label,
  value,
  dir,
  className = "",
}: {
  label: string;
  value: string;
  dir?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
      <p className="mt-0.5 text-sm font-bold" dir={dir}>
        {value}
      </p>
    </div>
  );
}

function PhoneRow({
  phone,
  customerName,
}: {
  phone: string;
  customerName: string;
}) {
  const whatsappUrl = getWhatsAppChatUrl(phone);
  return (
    <div>
      <p className="text-xs font-semibold text-[var(--muted)]">رقم الهاتف</p>
      <div className="mt-0.5 flex items-center gap-2" dir="ltr">
        <span className="text-sm font-bold">{phone}</span>
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`فتح محادثة واتساب مع ${customerName}`}
            className="inline-flex items-center justify-center rounded-full p-1.5 text-white transition hover:opacity-80"
            style={{ backgroundColor: "#25D366" }}
          >
            <WhatsAppIcon size={16} />
          </a>
        ) : null}
      </div>
    </div>
  );
}
