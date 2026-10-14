import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "./mascot";

export function Placeholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="sq-placeholder sq-container">
      <Link href="/" className="sq-placeholder-top">
        <ArrowLeft size={16} /> Back to SideQuest
      </Link>
      <div className="sq-placeholder-body">
        <div>
          <span className="sq-coming-tag">The next quest is loading</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <p>This page is coming in the next chapter. Until then, meet SideQuest.</p>
          <div className="sq-placeholder-actions">
            <Button asChild>
              <Link href="/">
                Back to home <ArrowUpRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/discover">Discover</Link>
            </Button>
          </div>
        </div>
        <Mascot className="sq-placeholder-mascot" />
      </div>
    </main>
  );
}

export function pageHead(title: string, description: string) {
  return {
    title: `${title} — SideQuest`,
    description,
    openGraph: {
      title: `${title} — SideQuest`,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — SideQuest`,
      description,
    },
  };
}
