import Link from "next/link";
import type { Category } from "@sleepywear/shared";

type CategorySliderProps = {
  categories: Category[];
};

export function CategorySlider({ categories }: CategorySliderProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className="flex shrink-0 flex-col items-center gap-2"
        >
          <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-brand-light-pink text-brand-pink sm:h-[120px] sm:w-[120px]">
            <span className="text-sm font-semibold text-center px-2">
              {cat.nameAr}
            </span>
          </div>
          <span className="text-xs font-semibold text-center">
            {cat.nameAr}
          </span>
        </Link>
      ))}
    </div>
  );
}
