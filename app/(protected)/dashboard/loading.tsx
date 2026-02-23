export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome header skeleton */}
      <div>
        <div className="h-8 w-48 rounded-lg bg-muted/20" />
        <div className="h-4 w-64 rounded-lg bg-muted/20 mt-2" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 flex items-start gap-4">
            <div className="size-11 rounded-lg bg-muted/20 shrink-0" />
            <div>
              <div className="h-8 w-12 rounded bg-muted/20" />
              <div className="h-4 w-28 rounded bg-muted/20 mt-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div>
        <div className="h-6 w-32 rounded bg-muted/20 mb-4" />
        <div className="flex gap-3">
          <div className="h-10 w-40 rounded-lg bg-muted/20" />
          <div className="h-10 w-40 rounded-lg bg-muted/20" />
          <div className="h-10 w-40 rounded-lg bg-muted/20" />
        </div>
      </div>

      {/* Recent calculations skeleton */}
      <div>
        <div className="h-6 w-40 rounded bg-muted/20 mb-4" />
        <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="h-4 w-36 rounded bg-muted/20" />
                <div className="h-3 w-20 rounded bg-muted/20 mt-2" />
              </div>
              <div className="h-5 w-20 rounded bg-muted/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
