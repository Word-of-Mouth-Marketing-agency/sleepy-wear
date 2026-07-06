"use client";

import { useCallback, useEffect, useState } from "react";
import { getCardUrl } from "@/lib/media";

type Props = {
  src?: string | null;
  alt: string;
  size?: "list" | "detail";
};

const sizeClasses = {
  list: "h-14 w-14 rounded-xl",
  detail: "h-[72px] w-[72px] rounded-2xl",
} as const;

export function OrderItemThumbnail({ src, alt, size = "list" }: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  const showImage = src && !failed;
  const initial = alt.trim().charAt(0) || "?";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-brand-light-pink ${sizeClasses[size]}`}
    >
      {showImage ? (
        <img
          alt={alt}
          className="h-full w-full object-cover"
          src={getCardUrl(src)}
          onError={handleError}
        />
      ) : (
        <span className="text-sm font-black text-brand-pink">{initial}</span>
      )}
    </div>
  );
}
