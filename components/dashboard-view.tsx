import { StatusBadge } from "@/components/status-badge"
import { PackageCheck, Clock, Boxes, TrendingUp } from "lucide-react"
import type { Receipt } from "@/lib/db/schema"

type Summary = {
  todayCount: number
  todayQty: number
  pendingCount: number
  totalCount: number
  totalQty: number
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR")
}

function relTime(d: Date) {
  const date = new Date(d)
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function DashboardView({
  summary,
  recent,
}: {
  summary: Summary
  recent: Receipt[]
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">입고 현황</h1>
        <p className="text-sm text-muted-foreground">오늘의 입고 활동 요약</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
          <PackageCheck className="size-5 opacity-80" />
          <p className="mt-3 text-3xl font-semibold tabular-nums">{fmt(summary.todayCount)}</p>
          <p className="mt-0.5 text-sm opacity-80">오늘 입고 건수</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <TrendingUp className="size-5 text-primary" />
          <p className="mt-3 text-3xl font-semibold tabular-nums">{fmt(summary.todayQty)}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">오늘 입고 수량</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <Clock className="size-5 text-warning" />
          <p className="mt-3 text-3xl font-semibold tabular-nums">{fmt(summary.pendingCount)}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">입고 대기 건</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <Boxes className="size-5 text-primary" />
          <p className="mt-3 text-3xl font-semibold tabular-nums">{fmt(summary.totalQty)}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">누적 입고 수량</p>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">최근 입고</h2>
        <div className="space-y-2">
          {recent.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              아직 입고 기록이 없습니다.
            </p>
          )}
          {recent.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{r.productName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {r.sku} · {relTime(r.receivedAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-base font-semibold tabular-nums">+{fmt(r.quantity)}</span>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
