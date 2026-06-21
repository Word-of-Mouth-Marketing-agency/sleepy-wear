import { PolicyPage } from "@/components/site/PolicyPage";
import { getPolicyPage } from "@/lib/policy-pages";

export default async function ShippingPolicyPage() {
  const page = await getPolicyPage("shipping-policy");

  return <PolicyPage title={page.titleAr} content={page.contentAr} />;
}
