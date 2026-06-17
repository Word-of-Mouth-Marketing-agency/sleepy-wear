"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Banner } from "@sleepywear/shared";
import { getMediaUrl } from "@/lib/media";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export function HeroSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/banners`, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setBanners(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!loaded) return <HeroPlaceholder label="جاري تحميل العروض" />;
  if (banners.length === 0) {
    return <HeroPlaceholder label="لا توجد عروض حالياً" />;
  }

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative h-[clamp(210px,62vw,330px)] w-full md:aspect-[1916/821] md:h-auto md:max-h-[90vh]">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            {banner.href ? (
              <Link href={banner.href} className="block h-full w-full">
                <img
                  src={getMediaUrl(banner.imageUrl)}
                  alt={banner.titleAr}
                  className="h-full w-full object-cover"
                />
              </Link>
            ) : (
              <img
                src={getMediaUrl(banner.imageUrl)}
                alt={banner.titleAr}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 ? (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`عرض البانر ${i + 1} من ${banners.length}`}
              aria-current={i === current ? "true" : undefined}
              onClick={() => setCurrent(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === current ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function HeroPlaceholder({ label }: { label: string }) {
  return (
    <section
      className="flex h-[clamp(210px,62vw,330px)] w-full items-center justify-center bg-brand-light-pink md:aspect-[1916/821] md:h-auto"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-brand-pink shadow-sm">
        <span className="h-2 w-2 rounded-full bg-brand-blue" />
        <span>{label}</span>
      </div>
    </section>
  );
}
