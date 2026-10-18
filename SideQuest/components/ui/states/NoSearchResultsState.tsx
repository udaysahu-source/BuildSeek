import React from "react";
import { SearchX, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NoSearchResultsProps {
  query?: string;
  onClear: () => void;
}

export function NoSearchResultsState({ query, onClear }: NoSearchResultsProps) {
  return (
    <div
      className="retro-card p-10 flex flex-col items-center justify-center text-center bg-white space-y-4 my-8"
      style={{
        border: "3px solid #0B1033",
        borderRadius: "24px",
        boxShadow: "5px 5px 0px #0B1033",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#FFE3A3",
          border: "2px solid #0B1033",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SearchX size={26} color="#0B1033" />
      </div>

      <div className="space-y-1">
        <h3
          className="font-display font-extrabold text-xl text-ink"
          style={{ fontFamily: "var(--font-display, sans-serif)", color: "#0B1033" }}
        >
          {query ? `No results found for "${query}"` : "No matches found"}
        </h3>
        <p className="text-sm text-ink-500 max-w-sm mx-auto" style={{ color: "#475569" }}>
          We couldn&apos;t find any hackathons matching your search terms. Try searching for broader keywords like &quot;AI&quot;, &quot;Web3&quot;, or &quot;Beginner&quot;.
        </p>
      </div>

      <div style={{ marginTop: "12px" }}>
        <Button
          onClick={onClear}
          style={{
            background: "#B6F500",
            color: "#0B1033",
            border: "2px solid #0B1033",
            boxShadow: "3px 3px 0px #0B1033",
            fontWeight: 700,
          }}
        >
          <XCircle size={15} /> Clear Search & Filters
        </Button>
      </div>
    </div>
  );
}

export default NoSearchResultsState;
