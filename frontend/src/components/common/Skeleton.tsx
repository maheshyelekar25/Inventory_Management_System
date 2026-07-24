interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-md bg-slate-200 ${className}`} />
}

export function TableSkeleton({ columns, rows = 4 }: { columns: number; rows?: number }) {
  return <>{Array.from({ length: rows }, (_, rowIndex) => <tr key={rowIndex}><td colSpan={columns} className="px-5 py-4"><div className="flex items-center gap-4"><Skeleton className="h-9 w-9 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-2/5" /><Skeleton className="h-3 w-1/4" /></div><Skeleton className="hidden h-3 w-20 sm:block" /><Skeleton className="hidden h-3 w-16 md:block" /></div></td></tr>)}</>
}
