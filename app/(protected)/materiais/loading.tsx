export default function MateriaisLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton with button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-36 rounded-lg bg-muted/20" />
          <div className="h-4 w-56 rounded-lg bg-muted/20 mt-2" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-muted/20" />
      </div>

      {/* 3-card grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 rounded bg-muted/20" />
              <div className="h-5 w-8 rounded bg-muted/20" />
            </div>
            <div className="h-4 w-full rounded bg-muted/20" />
            <div className="h-4 w-3/4 rounded bg-muted/20" />
            <div className="h-4 w-1/2 rounded bg-muted/20" />
          </div>
        ))}
      </div>
    </div>
  )
}
