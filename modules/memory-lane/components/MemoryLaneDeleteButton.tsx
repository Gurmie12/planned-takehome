"use client";

import { MouseEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type MemoryLaneDeleteButtonProps = {
  id: string;
};

export function MemoryLaneDeleteButton({ id }: MemoryLaneDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    startTransition(async () => {
      try {
        const response = await fetch(`/api/memory-lane/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const message = await response.text();
          toast.error(message || "Failed to delete memory lane");
          return;
        }

        toast.success("Memory lane deleted");
        router.refresh();
      } catch (error) {
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
      aria-label="Delete memory lane"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        "✕"
      )}
    </Button>
  );
}


