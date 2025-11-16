import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { AuthActions } from "@/components/home/AuthActions";
import { MemoryLaneActions } from "@/modules/memory-lane/components/MemoryLaneActions";
import { MemoryLaneCard } from "@/modules/memory-lane/components/MemoryLaneCard";

export default async function Home() {
  const isAdmin = await isAdminAuthenticated();

  const memoryLanes = await db.memoryLane.findMany({
    where: isAdmin ? {} : { isPublic: true },
    orderBy: {
      createdAt: "desc",
    },
  });

  const hasMemoryLanes = memoryLanes.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted px-6 py-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Memory Lane</span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Your stories, in sequence
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Collect life&apos;s moments into curated lanes you can revisit and share with the
                people who matter most.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MemoryLaneActions isAdmin={isAdmin} />
            <AuthActions isAdmin={isAdmin} />
          </div>
        </header>

        {!hasMemoryLanes ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-card/60 p-10 text-center shadow-sm backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-lg">✦</span>
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium">No memory lanes yet</p>
              <p className="text-sm text-muted-foreground">
                Start your first lane to turn scattered photos and notes into a single,
                shareable timeline.
              </p>
            </div>
            {isAdmin && (
              <p className="text-xs text-muted-foreground">
                Once you add a lane from the editor, it will appear here for you to explore and
                share.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {memoryLanes.map((memoryLane) => (
              <MemoryLaneCard
                key={memoryLane.id}
                memoryLane={memoryLane}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
