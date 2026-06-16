import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/profile", "/my-learning"],
      },
    ],
    sitemap: "https://rabbiodomsilverstein.com/sitemap.xml",
  };
}
