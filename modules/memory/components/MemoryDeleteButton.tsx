"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type MemoryDeleteButtonProps = {
  id: string;
};

export function MemoryDeleteButton({ id }: MemoryDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/memory/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const message = await response.text();
          toast.error(message || "Failed to delete memory");
          return;
        }

        toast.success("Memory deleted");
        router.refresh();
      } catch {
        toast.error("Something went wrong, please try again.");
      }
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7 cursor-pointer text-xs text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Delete memory"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        "✕"
      )}
    </Button>
  );
}


