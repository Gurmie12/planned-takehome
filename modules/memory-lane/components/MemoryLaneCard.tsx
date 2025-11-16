import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { MemoryLaneDeleteButton } from "@/modules/memory-lane/components/MemoryLaneDeleteButton";
import { MemoryLane, Prisma } from "@/app/generated/prisma/client";

type MemoryLaneCardProps = {
  memoryLane: MemoryLane
  isAdmin: boolean;
};

export function MemoryLaneCard({ memoryLane, isAdmin }: MemoryLaneCardProps) {
  return (
    <Link href={`/memory-lane/${memoryLane.id}`} className="block">
      <Card className="h-full cursor-pointer border-border/70 bg-card/80 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{memoryLane.title}</CardTitle>
            {memoryLane.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {memoryLane.description}
              </CardDescription>
            )}
          </div>
          {isAdmin && <MemoryLaneDeleteButton id={memoryLane.id} />}
        </CardHeader>
        <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Created {new Date(memoryLane.createdAt).toLocaleDateString()}
          </span>
          {!memoryLane.isPublic && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">
              Private
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}


