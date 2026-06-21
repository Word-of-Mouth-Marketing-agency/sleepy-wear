import Link from "next/link";
import type { Category } from "@sleepywear/shared";
import { apiGet } from "@/lib/api";
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

export async function SiteHeader() {
  const categories = await getCategories();

  return <SiteHeaderContent categories={categories} />;
}

export function SiteHeaderContent({ categories }: { categories: Category[] }) {
  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <NoticeBar>
        <div className="bg-brand-blue text-white text-center py-1.5 text-xs sm:text-sm px-2">
          عروض و خصومات الشتاء .. اي اوردر يبدأ من 999 جنيه خصم 10% بأكواد خصم BF10 - S10
        </div>
      </NoticeBar>

      <div className="bg-white">
        <div className="container grid grid-cols-3 items-center py-3">
          <div className="flex items-center gap-3 justify-self-start text-black">
            <CartIcon />
            <HeaderSearch />
          </div>

          <Link href="/" className="justify-self-center">
            <img
              alt="SleepyWear"
              className="h-10 w-auto sm:h-12"
              src="/brand/pink-logo.png"
            />
          </Link>

          <div className="desktop-header-social items-center justify-self-end text-black">
            <SocialLinks />
          </div>
          <div className="justify-self-end">
            <MobileHeaderMenu categories={categories} />
          </div>
        </div>
      </div>

      <DesktopCategoryNav categories={categories} />
    </header>
  );
}


