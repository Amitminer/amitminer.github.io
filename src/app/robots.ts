import type { MetadataRoute } from "next";
import { PortfolioUrl } from "@/lib/config";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${PortfolioUrl}/sitemap.xml`,
  };
}
