import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </header>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <Skeleton className="mb-2 h-5 w-3/4" />
              <Skeleton className="mb-1 h-4 w-full" />
              <Skeleton className="mb-1 h-4 w-5/6" />
              <Skeleton className="mt-4 h-3 w-1/3" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}