import { PolicyPage } from "@/components/site/PolicyPage";
import { getPolicyPage } from "@/lib/policy-pages";

export default async function PrivacyPolicyPage() {
  const page = await getPolicyPage("privacy-policy");

  return <PolicyPage title={page.titleAr} content={page.contentAr} />;
}
