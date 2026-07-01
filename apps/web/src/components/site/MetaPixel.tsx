"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

type Props = {
  enabled: boolean;
  headScript: string | null;
};

export function MetaPixel({ enabled, headScript }: Props) {
  const pathname = usePathname();

  if (!enabled || !headScript) return null;

  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return null;

  const scriptContent = extractScriptContent(headScript);
  const noscriptSrc = extractNoscriptSrc(headScript);

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: scriptContent }}
      />
      {noscriptSrc ? (
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={noscriptSrc}
            alt=""
          />
        </noscript>
      ) : null}
    </>
  );
}

function extractScriptContent(raw: string): string {
  const match = raw.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
  if (match?.[1]) return match[1].trim();
  return raw.trim();
}

function extractNoscriptSrc(raw: string): string | null {
  const match = raw.match(/<noscript[\s\S]*?<img[^>]+src="([^"]+)"/i);
  if (match?.[1]) return match[1];
  return null;
}
