import type { ReactNode } from 'react'

interface SummaryCardProps {
  label: string
  value: string | number
  icon: ReactNode
  accent?: 'blue' | 'amber' | 'red'
}

const accents = {
  blue: 'bg-blue-50 text-blue-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
}

export function SummaryCard({ label, value, icon, accent = 'blue' }: SummaryCardProps) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-600">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p></div><span className={`grid h-10 w-10 place-items-center rounded-lg ${accents[accent]}`}>{icon}</span></div></article>
}
