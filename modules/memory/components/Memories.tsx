import type { Memory, MemoryImage } from "@/app/generated/prisma/client";
import { MemoryItem } from "@/modules/memory/components/Memory";

type MemoryWithImages = Memory & {
  images: MemoryImage[];
};

type MemoriesProps = {
  memories: MemoryWithImages[];
  isAdmin: boolean;
};

export function Memories({ memories, isAdmin }: MemoriesProps) {
  if (!memories.length) {
    return null;
  }

  return (
    <div className="mt-6 space-y-6">
      {memories.map((memory) => (
        <MemoryItem key={memory.id} memory={memory} isAdmin={isAdmin} />
      ))}
    </div>
  );
}


