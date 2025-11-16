"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { upload } from "@vercel/blob/client";
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
import {
  postMemorySchema,
  type PostMemorySchema,
} from "@/modules/memory/schemas/postMemorySchema";
import { z } from "zod";
import { dateToLocalDateTimeInput } from "@/lib/datetime";

type MemoryActionsProps = {
  memoryLaneId: string;
  isAdmin: boolean;
};

const memoryFormSchema = postMemorySchema.omit({ images: true });
type MemoryFormSchema = z.infer<typeof memoryFormSchema>;

export function MemoryActions({ memoryLaneId, isAdmin }: MemoryActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localTimestamp, setLocalTimestamp] = useState(
    dateToLocalDateTimeInput(new Date())
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<MemoryFormSchema>({
    resolver: zodResolver(memoryFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      timestamp: new Date().toISOString(),
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = form;

  if (!isAdmin) {
    return null;
  }

  const onSubmit = (values: MemoryFormSchema) => {
    startTransition(async () => {
      try {
        if (!imageFiles.length) {
          toast.error("Please add at least one image");
          return;
        }

        const uploadedImages = await Promise.all(
          imageFiles.map(async (file, index) => {
            const blob = await upload(file.name, file, {
              access: "public",
              handleUploadUrl: "/api/blob-upload",
            });

            return {
              blobUrl: blob.url,
              blobPath: blob.pathname,
              order: index,
            };
          })
        );

        const payload: PostMemorySchema = {
          ...values,
          images: uploadedImages,
        };

        const response = await fetch(
          `/api/memory-lane/${memoryLaneId}/memory`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          toast.error("Failed to create memory");
          return;
        }

        toast.success("Memory created");
        setIsDialogOpen(false);
        reset();
        setLocalTimestamp(dateToLocalDateTimeInput(new Date()));
        setImageFiles([]);
        router.refresh();
      } catch (error) {
        toast.error("Something went wrong, please try again.");
      }
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      reset();
      setLocalTimestamp(dateToLocalDateTimeInput(new Date()));
      setImageFiles([]);
    }
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="cursor-pointer rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
        onClick={() => setIsDialogOpen(true)}
        disabled={isPending}
      >
        + Add memory
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>New memory</DialogTitle>
            <DialogDescription>
              Capture a moment in this lane. You can add details, choose when it
              happened, and attach images. Image uploads will be wired up later
              – for now, paste image URLs to preview the layout.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="memory-title">Title</Label>
              <Input
                id="memory-title"
                placeholder="Dinner by the lake, Graduation day..."
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
              <Label htmlFor="memory-description">Description</Label>
              <Textarea
                id="memory-description"
                className="min-h-[80px]"
                placeholder="Share a bit more about what happened, how it felt, or who was there."
                disabled={isPending}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="memory-timestamp">When did this happen?</Label>
              <Input
                id="memory-timestamp"
                type="datetime-local"
                value={localTimestamp}
                onChange={(event) => {
                  const value = event.target.value;
                  setLocalTimestamp(value);
                  const date = new Date(value);
                  if (!Number.isNaN(date.getTime())) {
                    setValue("timestamp", date.toISOString(), {
                      shouldValidate: true,
                    });
                  }
                }}
                disabled={isPending}
              />
              {errors.timestamp && (
                <p className="text-xs text-destructive">
                  {errors.timestamp.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="memory-images">Images</Label>
                <Input
                  id="memory-images"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isPending}
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setImageFiles(files);
                  }}
                />
                <p className="text-[11px] text-muted-foreground">
                  Select one or more images from your computer. They&apos;ll be uploaded to
                  secure storage when you add this memory.
                </p>
              </div>

              {imageFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {imageFiles.map((file, index) => (
                    <div
                      key={file.name + index}
                      className="h-20 w-28 overflow-hidden rounded-md border bg-muted text-[10px]"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer rounded-full px-4"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="cursor-pointer rounded-full px-4"
                disabled={isPending || !isValid}
              >
                {isPending ? "Saving..." : "Add memory"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}


