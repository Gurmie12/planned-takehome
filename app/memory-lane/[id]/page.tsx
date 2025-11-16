import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { AuthActions } from "@/components/home/AuthActions";
import { MemoryActions } from "@/modules/memory/components/MemoryActions";
import { Memories } from "@/modules/memory/components/Memories";

type LanePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: LanePageProps
): Promise<Metadata> {
  const { id } = await params;
  const isAdmin = await isAdminAuthenticated();

  const lane = await db.memoryLane.findFirst({
    where: isAdmin ? { id } : { id, isPublic: true },
    select: { title: true, description: true },
  });

  if (!lane) {
    return {
      title: "Memory lane not found",
      description: "The requested memory lane could not be found.",
    };
  }

  return {
    title: lane.title,
    description: lane.description ?? "A curated collection of memories.",
  };
}

export default async function MemoryLanePage({ params }: LanePageProps) {
  const { id } = await params;
  const isAdmin = await isAdminAuthenticated();

  const lane = await db.memoryLane.findFirst({
    where: isAdmin ? { id } : { id, isPublic: true },
    include: {
      memories: {
        orderBy: {
          timestamp: "desc",
        },
        include: {
          images: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });

  if (!lane) {
    return notFound();
  }

  const hasMemories = lane.memories.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted px-6 py-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
            >
              ← Back to lanes
            </Link>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {lane.title}
              </h1>
              {lane.description && (
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  {lane.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MemoryActions memoryLaneId={id} isAdmin={isAdmin} />
            <AuthActions isAdmin={isAdmin} />
          </div>
        </header>

        {!hasMemories ? (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/60 p-10 text-center shadow-sm backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-lg">✧</span>
            </div>
            <p className="text-base font-medium">No memories in this lane yet</p>
            <p className="text-sm text-muted-foreground">
              When you add memories to this lane, they&apos;ll appear here in chronological
              order.
            </p>
            {isAdmin && (
              <p className="text-xs text-muted-foreground">
                Use the editor tools to add your first memory.
              </p>
            )}
          </div>
        ) : (
          <Memories memories={lane.memories} isAdmin={isAdmin} />
        )}
      </section>
    </main>
  );
}