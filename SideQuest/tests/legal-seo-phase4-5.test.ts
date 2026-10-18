import { describe, it, expect } from "vitest";
import nextConfig from "../next.config";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import fs from "fs";
import path from "path";

describe("Phase 4 & 5 Verification Suite (Legal, SEO, Headers & GEO)", () => {
  it("next.config.ts specifies required HTTP security headers", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (typeof nextConfig.headers === "function") {
      const headersList = await nextConfig.headers();
      const globalHeaders = headersList.find((h) => h.source === "/:path*");
      expect(globalHeaders).toBeDefined();
      const keys = globalHeaders?.headers.map((h) => h.key);
      expect(keys).toContain("X-Frame-Options");
      expect(keys).toContain("X-Content-Type-Options");
      expect(keys).toContain("Referrer-Policy");
      expect(keys).toContain("Permissions-Policy");
      expect(keys).toContain("Strict-Transport-Security");

      const xFrame = globalHeaders?.headers.find((h) => h.key === "X-Frame-Options");
      expect(xFrame?.value).toBe("DENY");
    }
  });

  it("app/robots.ts permits Googlebot and Google-Extended, disallows private routes, and includes sitemap", () => {
    const robotsConfig = robots();
    expect(robotsConfig.sitemap).toContain("/sitemap.xml");
    const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules : [robotsConfig.rules];

    const googleExtendedRule = rules.find((r) => r.userAgent === "Google-Extended");
    expect(googleExtendedRule).toBeDefined();
    expect(googleExtendedRule?.allow).toBe("/");
    expect(googleExtendedRule?.disallow).toContain("/api/");

    const googleBotRule = rules.find((r) => r.userAgent === "Googlebot");
    expect(googleBotRule).toBeDefined();
    expect(googleBotRule?.allow).toBe("/");
  });

  it("app/sitemap.ts returns canonical URLs for static legal and dynamic hackathon routes", async () => {
    const map = await sitemap();
    const urls = map.map((m) => m.url);

    expect(urls.some((u) => u.endsWith("/privacy"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/terms"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/refunds"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/contact"))).toBe(true);
    expect(urls.some((u) => u.includes("/h/"))).toBe(true);
  });

  it("Privacy policy includes statutory DPDP Act & Grievance Officer details", () => {
    const privacyPath = path.join(process.cwd(), "app/privacy/page.tsx");
    expect(fs.existsSync(privacyPath)).toBe(true);
    const content = fs.readFileSync(privacyPath, "utf-8");
    expect(content).toContain("Digital Personal Data Protection Act, 2023");
    expect(content).toContain("Grievance Redressal Officer");
    expect(content).toContain("grievance@sidequest.camp");
    expect(content).toContain("DELETE /api/user/account");
  });

  it("Terms of Service includes AI extraction disclaimer and acceptable use", () => {
    const termsPath = path.join(process.cwd(), "app/terms/page.tsx");
    expect(fs.existsSync(termsPath)).toBe(true);
    const content = fs.readFileSync(termsPath, "utf-8");
    expect(content).toContain("Acceptable Use");
    expect(content).toContain("AI Data Extraction");
    expect(content).toContain("Limitation of Liability");
    expect(content).toContain("Raipur, Chhattisgarh, India");
  });

  it("Refund policy documents free tier and 48-hour organizer policy", () => {
    const refundsPath = path.join(process.cwd(), "app/refunds/page.tsx");
    expect(fs.existsSync(refundsPath)).toBe(true);
    const content = fs.readFileSync(refundsPath, "utf-8");
    expect(content).toContain("Free Tier for Students");
    expect(content).toContain("48 hours");
    expect(content).toContain("billing@sidequest.camp");
  });

  it("Custom 404, 500, and Global Error pages exist", () => {
    expect(fs.existsSync(path.join(process.cwd(), "app/not-found.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), "app/error.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), "app/global-error.tsx"))).toBe(true);
  });
});
