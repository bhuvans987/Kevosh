export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] flex flex-col font-sans animate-pulse">
      {/* Header Skeleton */}
      <div className="border-b border-zinc-200 bg-white px-6 py-3.5 flex items-center justify-between">
        <div className="h-6 w-36 bg-zinc-200 rounded-md" />
        <div className="flex items-center gap-3">
          <div className="h-6 w-28 bg-zinc-200 rounded-md" />
          <div className="h-8 w-8 rounded-full bg-zinc-200" />
        </div>
      </div>

      {/* Content Skeleton */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        <div className="h-20 bg-white rounded-xl border border-zinc-200" />
        <div className="h-32 bg-white rounded-xl border border-zinc-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 bg-white rounded-xl border border-zinc-200" />
          <div className="h-24 bg-white rounded-xl border border-zinc-200" />
          <div className="h-24 bg-white rounded-xl border border-zinc-200" />
          <div className="h-24 bg-white rounded-xl border border-zinc-200" />
        </div>
        <div className="h-64 bg-white rounded-xl border border-zinc-200" />
      </main>
    </div>
  );
}

