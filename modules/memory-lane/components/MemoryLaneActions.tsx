"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  postMemoryLaneSchema,
  type PostMemoryLaneSchema,
} from "@/modules/memory-lane/schemas/postMemoryLane";

type MemoryLaneActionsProps = {
  isAdmin: boolean;
};

export function MemoryLaneActions({ isAdmin }: MemoryLaneActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<PostMemoryLaneSchema>({
    resolver: zodResolver(postMemoryLaneSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      isPublic: true,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
    setValue,
  } = form;

  const isPublic = watch("isPublic") ?? true;

  if (!isAdmin) {
    return null;
  }

  const onSubmit = (values: PostMemoryLaneSchema) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/memory-lane", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          toast.error('Failed to create memory lane');
          return;
        }

        toast.success("Memory lane created");
        setIsDialogOpen(false);
        reset();
        router.refresh();
      } catch (error) {
        toast.error("Something went wrong, please try again.");
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
        onClick={() => setIsDialogOpen(true)}
        disabled={isPending}
      >
        + New memory lane
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New memory lane</DialogTitle>
            <DialogDescription>
              Create a new lane to group memories in chronological order. You can mark it as
              private if you don&apos;t want it visible to viewers.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="lane-title">Title</Label>
              <Input
                id="lane-title"
                placeholder="Summer 2024, Wedding weekend, Family archive..."
                disabled={isPending}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lane-description">Description</Label>
              <Textarea
                id="lane-description"
                className="min-h-[80px]"
                placeholder="Add a short description so viewers know what this lane is about."
                disabled={isPending}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
              <div className="space-y-0.5">
                <p className="text-xs font-medium">Private lane</p>
                <p className="text-[11px] text-muted-foreground">
                  When enabled, this lane will be hidden from viewers who are not logged in.
                </p>
              </div>
              <Switch
                checked={!isPublic}
                onCheckedChange={(checked) =>
                  setValue("isPublic", !checked, { shouldValidate: true })
                }
                disabled={isPending}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full px-4"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="rounded-full px-4"
                disabled={isPending || !isValid}
              >
                {isPending ? "Creating..." : "Create lane"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}


