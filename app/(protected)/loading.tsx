export default function ProtectedLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page header skeleton */}
      <div>
        <div className="h-8 w-48 rounded-lg bg-muted/20" />
        <div className="h-4 w-72 rounded-lg bg-muted/20 mt-2" />
      </div>

      {/* Content grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6">
            <div className="h-5 w-24 rounded bg-muted/20" />
            <div className="h-4 w-full rounded bg-muted/20 mt-4" />
            <div className="h-4 w-2/3 rounded bg-muted/20 mt-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
