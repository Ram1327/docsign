export function DocumentCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="skeleton w-9 h-9 rounded-lg" />
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="skeleton h-3.5 w-3/4 rounded" />
          <div className="skeleton h-2.5 w-1/2 rounded" />
        </div>
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="skeleton h-2.5 w-12 rounded" />
        <div className="skeleton h-2.5 w-20 rounded" />
      </div>
    </div>
  );
}

export function DocumentListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <DocumentCardSkeleton key={i} />
      ))}
    </div>
  );
}
