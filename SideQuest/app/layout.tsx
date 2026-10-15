import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Navigation } from "@/components/sidequest/navigation";
import { Footer } from "@/components/sidequest/footer";
import { AuthProvider } from "@/components/sidequest/auth-state";
import { BookmarksProvider } from "@/components/sidequest/discovery-state";
import { Toaster } from "@/components/ui/sonner";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sidequesttt.vercel.app"),
  title: "Every hackathon. One place. — SideQuest",
  description:
    "Find your next hackathon with SideQuest. One place for Indian student hackathons, deadlines, saved events, and reminders.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    siteName: "SideQuest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
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
      <body>
        <AuthProvider>
          <BookmarksProvider>
            <Navigation />
            <div className="sq-page-content">{children}</div>
            <Footer />
            <Toaster />
          </BookmarksProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
