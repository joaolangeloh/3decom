export default function HistoricoLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-32 rounded-lg bg-muted/20" />
        <div className="h-4 w-64 rounded-lg bg-muted/20 mt-2" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-border">
          <div className="h-4 w-32 rounded bg-muted/20" />
          <div className="h-4 w-24 rounded bg-muted/20" />
          <div className="h-4 w-24 rounded bg-muted/20 ml-auto" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-b-0">
            <div className="h-4 w-40 rounded bg-muted/20" />
            <div className="h-4 w-20 rounded bg-muted/20" />
            <div className="h-4 w-24 rounded bg-muted/20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
