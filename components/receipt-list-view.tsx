"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/status-badge"
import { updateReceiptStatus } from "@/app/actions/inbound"
import type { Receipt } from "@/lib/db/schema"
import { Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "received", label: "입고완료" },
  { key: "pending", label: "입고대기" },
] as const

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d))
}

export function ReceiptListView({ receipts }: { receipts: Receipt[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [pendingId, setPendingId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return receipts.filter((r) => {
      const matchStatus = filter === "all" || r.status === filter
      const matchSearch =
        !q ||
        r.productName.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        (r.supplier ?? "").toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [receipts, search, filter])

  async function confirm(id: number) {
    setPendingId(id)
    try {
      await updateReceiptStatus(id, "received")
      toast.success("입고완료 처리되었습니다.")
      router.refresh()
    } catch {
      toast.error("처리에 실패했습니다.")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">입고 목록</h1>
        <p className="text-sm text-muted-foreground">전체 입고 내역 조회</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="품목명, SKU, 거래처 검색"
          className="h-11 pl-9"
          inputMode="search"
        />
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors",
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            조건에 맞는 입고 내역이 없습니다.
          </p>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{r.productName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.sku}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">수량</p>
                <p className="font-semibold tabular-nums">{r.quantity.toLocaleString("ko-KR")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">거래처</p>
                <p className="truncate">{r.supplier || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">LOT</p>
                <p className="truncate">{r.lotNumber || "-"}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">{fmtDate(r.receivedAt)}</p>
              {r.status === "pending" && (
                <button
                  onClick={() => confirm(r.id)}
                  disabled={pendingId === r.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-success-foreground disabled:opacity-60"
                >
                  <Check className="size-3.5" />
                  {pendingId === r.id ? "처리중" : "입고완료"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
