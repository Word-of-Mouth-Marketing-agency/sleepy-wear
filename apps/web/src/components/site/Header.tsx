import Image from "next/image";
import Link from "next/link";
import type { Category } from "@sleepywear/shared";
import { apiGet, apiFetch } from "@/lib/api";
import { HeaderSearch } from "./HeaderSearch";
import { NoticeBar } from "./NoticeBar";
import { CartIcon } from "./CartIcon";
import { MobileHeaderMenu } from "./MobileHeaderMenu";
import { DesktopCategoryNav } from "./DesktopCategoryNav";
import { SocialLinks } from "./SocialLinks";

async function getCategories() {
  try {
    return await apiGet<Category[]>("/categories");
  } catch {
    return [];
  }
}

async function getSettings() {
  return apiFetch<Record<string, unknown>>("/settings");
}

export async function SiteHeader() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSettings(),
  ]);

  const notice = (settings?.site_notice ?? {
    text: "عروض و خصومات الشتاء .. اي اوردر يبدأ من 999 جنيه خصم 10% بأكواد خصم BF10 - S10",
    enabled: true,
  }) as { text: string; enabled: boolean };

  const socialUrls = settings?.site_social_links as
    | { facebook?: string; instagram?: string; tiktok?: string; telegram?: string }
    | undefined;

  return (
    <SiteHeaderContent
      categories={categories}
      noticeText={notice.enabled ? notice.text : ""}
      socialUrls={socialUrls}
    />
  );
}

export function SiteHeaderContent({
  categories,
  noticeText,
  socialUrls,
}: {
  categories: Category[];
  noticeText?: string;
  socialUrls?: { facebook?: string; instagram?: string; tiktok?: string; telegram?: string };
}) {
  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {noticeText ? (
        <NoticeBar>
          <div className="bg-brand-blue text-white text-center py-1.5 text-xs sm:text-sm px-2">
            {noticeText}
          </div>
        </NoticeBar>
      ) : null}

      <div className="bg-white">
        <div className="container grid grid-cols-3 items-center py-3">
          <div className="flex items-center gap-3 justify-self-start text-black">
            <CartIcon />
            <HeaderSearch />
          </div>

          <Link href="/" className="justify-self-center">
            <Image
              alt="SleepyWear"
              width={160}
              height={48}
              className="h-10 w-auto sm:h-12"
              src="/brand/pink-logo.png"
              priority
            />
          </Link>

          <div className="desktop-header-social items-center justify-self-end text-black">
            <SocialLinks urls={socialUrls} />
          </div>
          <div className="justify-self-end">
            <MobileHeaderMenu categories={categories} socialUrls={socialUrls} />
          </div>
        </div>
      </div>

      <DesktopCategoryNav categories={categories} />
    </header>
  );
}


