import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import TopNav from "@/components/navigation/TopNav";
import BottomPillNav from "@/components/navigation/BottomPillNav";
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
  title: "SideQuest | Find & Track Hackathons with Deadline Radar",
  description:
    "Free radar for Indian college students to discover hackathons across Unstop, Devfolio, MLH and campus clubs before deadlines close.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1033",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`}>
      <body className="bg-parchment text-ink min-h-screen flex flex-col antialiased selection:bg-lime selection:text-ink pb-20 md:pb-0">
        <TopNav />
        <main className="flex-1 flex flex-col">{children}</main>
        <BottomPillNav />
      </body>
    </html>
  );
}
