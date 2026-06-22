import type { MetadataRoute } from "next";
import { DOMAIN } from "@sleepywear/shared";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"],
    },
    sitemap: `https://${DOMAIN}/sitemap.xml`,
  };
}
