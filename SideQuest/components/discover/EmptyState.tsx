import React from "react";
import Mascot from "@/components/ui/Mascot";
import Button from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface EmptyStateProps {
  onReset: () => void;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onReset,
  message = "No hackathons matched your active filters.",
}) => {
  return (
    <div className="retro-card p-10 flex flex-col items-center justify-center text-center bg-white space-y-4 my-8">
      <Mascot size={110} expression="sleeping" />
      <div className="space-y-1">
        <h3 className="font-display font-extrabold text-xl text-ink">
          Quest Radar is Quiet
        </h3>
        <p className="text-sm text-ink-500 max-w-sm mx-auto">
          {message} Try broadening your city, mode, or prize filters to see more events.
        </p>
      </div>
      <Button
        variant="lime"
        size="md"
        icon={<RotateCcw className="w-4 h-4" />}
        onClick={onReset}
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default EmptyState;
