"use client";

import { useState, useEffect } from "react";

export function NoticeBar({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        hidden ? "max-h-0" : "max-h-12"
      }`}
    >
      {children}
    </div>
  );
}
