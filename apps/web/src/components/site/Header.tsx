import Link from "next/link";
import type { Category } from "@sleepywear/shared";
import { apiGet } from "@/lib/api";
import { HeaderSearch } from "./HeaderSearch";
import { NoticeBar } from "./NoticeBar";
import { CartIcon } from "./CartIcon";

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
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <CartIcon />
            <HeaderSearch />
          </div>

          <Link href="/">
            <img
              alt="SleepyWear"
              className="h-10 w-auto sm:h-12"
              src="/brand/blue-logo.png"
            />
          </Link>

          <div className="flex items-center gap-3 text-lg">
            <SocialIcon href="#" label="Instagram">
              <InstagramSvg />
            </SocialIcon>
            <SocialIcon href="#" label="Facebook">
              <FacebookSvg />
            </SocialIcon>
            <SocialIcon href="#" label="TikTok">
              <TikTokSvg />
            </SocialIcon>
            <SocialIcon href="https://t.me/sleepywear" label="Telegram">
              <TelegramSvg />
            </SocialIcon>
          </div>
        </div>
      </div>

      <nav className="border-t border-[var(--line)] bg-white">
        <div className="container">
          <ul className="flex justify-center gap-6 overflow-x-auto whitespace-nowrap py-2.5 text-sm hide-scrollbar">
              <li>
                <Link
                  href="/"
                  className="font-semibold text-brand-pink transition-colors hover:text-brand-pink"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-[var(--muted)] transition-colors hover:text-brand-pink"
                >
                  جميع المنتجات
                </Link>
              </li>
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-[var(--muted)] transition-colors hover:text-brand-pink"
                  >
                    {cat.nameAr}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--muted)] transition-colors hover:text-brand-pink"
    >
      {children}
    </a>
  );
}

function InstagramSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
  );
}

function FacebookSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
    </svg>
  );
}

function TikTokSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function TelegramSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3l-3.7-1.16c-.8-.26-.8-.78.17-1.17l14.56-5.6c.67-.25 1.3.16 1.07 1.16l-2.46 11.58c-.19.92-.73 1.14-1.48.71l-4.08-3-1.97 1.9c-.22.22-.4.4-.75.4z" />
    </svg>
  );
}


