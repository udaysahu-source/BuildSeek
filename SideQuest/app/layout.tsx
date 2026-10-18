import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Navigation } from "@/components/sidequest/navigation";
import { Footer } from "@/components/sidequest/footer";
import { AuthProvider } from "@/components/sidequest/auth-state";
import { BookmarksProvider } from "@/components/sidequest/discovery-state";
import { Toaster } from "@/components/ui/sonner";
import { GlobalUIStateProvider } from "@/components/ui/states";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sidequest.camp"),
  title: "Every hackathon. One place. — SideQuest",
  description:
    "Find your next hackathon with SideQuest. One place for Indian student hackathons, deadlines, saved events, and reminders.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
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
    title: "SideQuest — Every hackathon. One place.",
    description: "Every hackathon from across platforms and colleges in one place with deadline radar.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://sidequest.camp",
    siteName: "SideQuest",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SideQuest — Every hackathon. One place.",
    description: "Every hackathon from across platforms and colleges in one place with deadline radar.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://sidequest.camp/#webapp",
      "name": "SideQuest",
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
      "name": "SideQuest",
      "url": "https://sidequest.camp",
      "logo": "https://sidequest.camp/og-image.png",
      "sameAs": ["https://t.me/SideQuestAlertsBot"],
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#B6F500",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`}>
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
