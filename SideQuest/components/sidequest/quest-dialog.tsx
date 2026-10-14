"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export function QuestDialog({
  open,
  onClose,
  title,
  kind,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  kind: "filters" | "detail" | "auth";
  children: ReactNode;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="sq-dialog-overlay" />
        <Dialog.Content
          className={`sq-quest-dialog sq-${kind}-dialog`}
          aria-describedby={undefined}
        >
          <Dialog.Title className={kind === "detail" ? "sr-only" : "sq-sheet-heading"}>
            {title}
          </Dialog.Title>
          <Dialog.Close asChild>
            <Button size="icon" variant="outline" aria-label="Close panel" className="sq-dialog-close">
              <X />
            </Button>
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
