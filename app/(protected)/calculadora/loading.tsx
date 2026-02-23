export default function CalculadoraLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-40 rounded-lg bg-muted/20" />
        <div className="h-4 w-64 rounded-lg bg-muted/20 mt-2" />
      </div>

      {/* Two column layout skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column - form */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="h-5 w-32 rounded bg-muted/20" />
            <div className="h-10 w-full rounded-lg bg-muted/20" />
            <div className="h-10 w-full rounded-lg bg-muted/20" />
            <div className="h-10 w-full rounded-lg bg-muted/20" />
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="h-5 w-40 rounded bg-muted/20" />
            <div className="h-10 w-full rounded-lg bg-muted/20" />
            <div className="h-10 w-full rounded-lg bg-muted/20" />
          </div>
        </div>

        {/* Right column - results */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="h-5 w-36 rounded bg-muted/20" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-28 rounded bg-muted/20" />
                <div className="h-4 w-20 rounded bg-muted/20" />
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex justify-between">
            <div className="h-6 w-16 rounded bg-muted/20" />
            <div className="h-6 w-24 rounded bg-muted/20" />
          </div>
        </div>
      </div>
    </div>
  )
}
