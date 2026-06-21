import { PolicyPage } from "@/components/site/PolicyPage";

export default function ShippingPolicyPage() {
  return (
    <PolicyPage title="سياسة الشحن">
      <p>
        بعد تأكيد عملية الشراء، نقوم بشحن وإرسال المنتج عبر الطريقة التي قمتم
        بإختيارها، إما عبر مسؤول الشحن الخاص بنا أو عبر خدمة أمانة إكسبريس.
      </p>

      <h2 className="mt-8 text-lg font-bold text-brand-black">طرق الشحن:</h2>

      <p>
        <strong>أمانة إكسبريس:</strong> خدمة تضمن لكم تسليم الإرساليات إلى العنوان
        المطلوب في مدة تتراوح بين 3 أيام و 7 أيام نحو الإتجاهات الرئيسية.
      </p>

      <p>
        <strong>مسؤول الشحن:</strong> متجرنا يتعاقد مع مجموعة من مسؤولي الشحن
        بمجموعة من المدن يقومون بإيصال المنتجات في مدة تتراوح بين يوم و3 أيام.
      </p>
    </PolicyPage>
  );
}
