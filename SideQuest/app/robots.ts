import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sidequest.camp";

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/profile", "/reset-password"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/api/", "/profile", "/reset-password"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/profile", "/reset-password"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/profile", "/reset-password"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
