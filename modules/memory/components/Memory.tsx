import type { Memory, MemoryImage } from "@/app/generated/prisma/client";
import { MemoryDeleteButton } from "@/modules/memory/components/MemoryDeleteButton";
import { MemoryEditButton } from "@/modules/memory/components/MemoryEditButton";

type MemoryWithImages = Memory & {
  images: MemoryImage[];
};

type MemoryProps = {
  memory: MemoryWithImages;
  isAdmin: boolean;
};

export function MemoryItem({ memory, isAdmin }: MemoryProps) {
  const date = new Date(memory.timestamp);
  const day = date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
  const year = date.getFullYear();

  return (
    <article className="flex gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-col items-center pt-1">
        <div className="flex flex-col items-center justify-center rounded-full bg-muted px-3 py-1 text-[10px] font-medium text-muted-foreground">
          <span className="text-xs font-semibold text-foreground">
            {day}
          </span>
          <span>{year}</span>
        </div>
        <div className="mt-2 h-full w-px flex-1 bg-border/60" />
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">{memory.title}</h2>
            <span className="text-xs text-muted-foreground">
              {date.toLocaleString(undefined, {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1">
              <MemoryEditButton memory={memory} />
              <MemoryDeleteButton id={memory.id} />
            </div>
          )}
        </div>
        {memory.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {memory.description}
          </p>
        )}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}


