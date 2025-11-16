"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { upload } from "@vercel/blob/client";
import { Pencil, Loader2 } from "lucide-react";
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
  patchMemorySchema,
  type PatchMemorySchema,
} from "@/modules/memory/schemas/putMemorySchema";
import type { Memory, MemoryImage } from "@/app/generated/prisma/client";
import { dateToLocalDateTimeInput } from "@/lib/datetime";

type MemoryWithImages = Memory & {
  images: MemoryImage[];
};

type MemoryEditButtonProps = {
  memory: MemoryWithImages;
};

export function MemoryEditButton({ memory }: MemoryEditButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isImagePending, startImageTransition] = useTransition();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initialDate = new Date(memory.timestamp);
  const form = useForm<PatchMemorySchema>({
    resolver: zodResolver(patchMemorySchema),
    mode: "onChange",
    defaultValues: {
      title: memory.title,
      description: memory.description ?? "",
      timestamp: initialDate.toISOString(),
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = form;

  const [localTimestamp, setLocalTimestamp] = useState(
    dateToLocalDateTimeInput(initialDate)
  );

  const onSubmit = (values: PatchMemorySchema) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/memory/${memory.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          toast.error("Failed to update memory");
          return;
        }

        toast.success("Memory updated");
        setIsOpen(false);
        router.refresh();
      } catch {
        toast.error("Something went wrong, please try again.");
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 cursor-pointer text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(true)}
        aria-label="Edit memory"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit memory</DialogTitle>
            <DialogDescription>
              Update the details of this memory. Image edits will be added
              later; currently you can edit the title, description, and
              timestamp.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor={`memory-title-${memory.id}`}>Title</Label>
              <Input
                id={`memory-title-${memory.id}`}
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
              <Label htmlFor={`memory-description-${memory.id}`}>
                Description
              </Label>
              <Textarea
                id={`memory-description-${memory.id}`}
                className="min-h-[80px]"
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
              <Label htmlFor={`memory-timestamp-${memory.id}`}>
                When did this happen?
              </Label>
              <Input
                id={`memory-timestamp-${memory.id}`}
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

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Images</Label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []);
                      if (!files.length) return;

                      startImageTransition(async () => {
                        try {
                          const uploaded = await Promise.all(
                            files.map((file, index) =>
                              upload(file.name, file, {
                                access: "public",
                                handleUploadUrl: "/api/blob-upload",
                              }).then((blob) => ({
                                blobUrl: blob.url,
                                blobPath: blob.pathname,
                                order: memory.images.length + index,
                              }))
                            )
                          );

                          await Promise.all(
                            uploaded.map((img) =>
                              fetch(`/api/memory/${memory.id}/image`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify(img),
                              })
                            )
                          );

                          toast.success("Images added");
                          setIsOpen(false);
                          router.refresh();
                        } catch {
                          toast.error("Failed to add images, please try again.");
                        }
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 cursor-pointer rounded-full px-3 text-[11px]"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending || isImagePending}
                  >
                    {isImagePending ? "Uploading..." : "+ Add images"}
                  </Button>
                </div>
              </div>

              {memory.images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {memory.images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative h-16 w-24 overflow-hidden rounded-md border bg-muted"
                    >
                      <img
                        src={image.blobUrl}
                        alt=""
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1 cursor-pointer rounded-full bg-black/60 px-1.5 text-[9px] text-white opacity-0 transition group-hover:opacity-100"
                        onClick={() => {
                          startImageTransition(async () => {
                            try {
                              const res = await fetch(
                                `/api/memory-image/${image.id}`,
                                {
                                  method: "DELETE",
                                }
                              );

                              if (!res.ok) {
                                const msg = await res.text();
                                toast.error(
                                  msg || "Failed to delete image"
                                );
                                return;
                              }

                              toast.success("Image removed");
                              setIsOpen(false);
                              router.refresh();
                            } catch {
                              toast.error(
                                "Failed to delete image, please try again."
                              );
                            }
                          });
                        }}
                        disabled={isPending || isImagePending}
                      >
                        ✕
                      </button>
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
                onClick={() => setIsOpen(false)}
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
                {isPending ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </span>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}


