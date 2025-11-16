import { Skeleton } from "@/components/ui/skeleton";

export default function MemoryLaneLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted px-6 py-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64 md:w-80" />
              <Skeleton className="h-4 w-80 md:w-[28rem]" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </header>

        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border bg-card/70 p-5 shadow-sm"
            >
              <div className="flex items-baseline justify-between gap-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}


