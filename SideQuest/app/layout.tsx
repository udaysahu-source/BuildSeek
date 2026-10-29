import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Bricolage_Grotesque, Inter } from "next/font/google";
import { Navigation } from "@/components/sidequest/navigation";
import { Footer } from "@/components/sidequest/footer";
import { AuthProvider } from "@/components/sidequest/auth-state";
import { BookmarksProvider } from "@/components/sidequest/discovery-state";
import { Toaster } from "@/components/ui/sonner";
import { GlobalUIStateProvider } from "@/components/ui/states";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const barlow = Barlow({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const rawUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sidequest.camp";
const safeAppUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  metadataBase: new URL(safeAppUrl),
  title: {
    default: "BuildSeek — Every hackathon. One place.",
    template: "%s | BuildSeek",
  },
  description:
    "Find your next hackathon with BuildSeek. One place for Indian student hackathons, deadlines, saved events, and reminders.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "BuildSeek — Every hackathon. One place.",
    description: "Every hackathon from across platforms and colleges in one place with deadline radar.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://sidequest.camp",
    siteName: "BuildSeek",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuildSeek — Every hackathon. One place.",
    description: "Every hackathon from across platforms and colleges in one place with deadline radar.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://sidequest.camp/#webapp",
      "name": "BuildSeek",
      "url": "https://sidequest.camp",
      "applicationCategory": "DeveloperApplication, EducationalApplication",
      "operatingSystem": "All",
      "description": "Every Indian student hackathon in one place with deadline radar and Telegram alerts.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://sidequest.camp/#organization",
      "name": "BuildSeek",
      "url": "https://sidequest.camp",
      "logo": "https://sidequest.camp/og-image.png",
      "sameAs": ["https://t.me/BuildSeekAlertsBot"],
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#0F1B33",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${barlow.variable} ${bricolage.variable} ${inter.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <GlobalUIStateProvider>
          <AuthProvider>
            <BookmarksProvider>
              <Navigation />
              <div className="sq-page-content">{children}</div>
              <Footer />
              <Toaster />
            </BookmarksProvider>
          </AuthProvider>
        </GlobalUIStateProvider>
      </body>
    </html>
  );
}
