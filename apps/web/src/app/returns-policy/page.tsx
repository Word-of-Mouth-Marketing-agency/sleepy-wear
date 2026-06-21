import { PolicyPage } from "@/components/site/PolicyPage";
import { getPolicyPage } from "@/lib/policy-pages";

export default async function ReturnsPolicyPage() {
  const page = await getPolicyPage("returns-policy");

  return <PolicyPage title={page.titleAr} content={page.contentAr} />;
}
