"use client";

import React from "react";
import { FilterSidebar } from "./FilterSidebar";
import { HackathonFilterOptions } from "@/lib/db/hackathons";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: HackathonFilterOptions;
  onFilterChange: (newFilters: Partial<HackathonFilterOptions>) => void;
  onReset: () => void;
  totalResults: number;
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  totalResults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-h-[85vh] bg-white rounded-t-3xl border-t-2 border-x-2 border-ink shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Top Handle & Close Header */}
        <div className="pt-3 pb-2 px-5 border-b border-parchment-border flex items-center justify-between bg-parchment">
          <div className="w-12 h-1.5 bg-ink/20 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <h3 className="font-display font-extrabold text-lg text-ink">
            Filter Hackathons
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-ink flex items-center justify-center bg-white text-ink hover:bg-parchment-subtle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Filter Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <FilterSidebar
            filters={filters}
            onFilterChange={onFilterChange}
            onReset={onReset}
            isMobileModal={true}
          />
        </div>

        {/* Sticky Apply Button */}
        <div className="p-4 border-t-2 border-ink bg-parchment flex items-center gap-3">
          <Button
            variant="lime"
            size="lg"
            className="w-full"
            onClick={onClose}
          >
            Show {totalResults} Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterSheet;
