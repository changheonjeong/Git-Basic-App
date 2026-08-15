"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type StockRow = {
  productId: number
  sku: string
  productName: string
  totalQty: number
  receiptCount: number
  lastReceivedAt: Date
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(d))
}

export function StockView({ stock }: { stock: StockRow[] }) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return stock
    return stock.filter(
      (s) => s.productName.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q),
    )
  }, [stock, search])

  const maxQty = Math.max(1, ...stock.map((s) => s.totalQty))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">재고 현황</h1>
        <p className="text-sm text-muted-foreground">입고완료 기준 품목별 재고</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="품목명, SKU 검색"
          className="h-11 pl-9"
          inputMode="search"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            재고 데이터가 없습니다.
          </p>
        )}
        {filtered.map((s) => (
          <div key={s.productId} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{s.productName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.sku}</p>
              </div>
              <p className="shrink-0 text-xl font-semibold tabular-nums">
                {s.totalQty.toLocaleString("ko-KR")}
              </p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(4, (s.totalQty / maxQty) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>입고 {s.receiptCount}건</span>
              <span>최근 {fmtDate(s.lastReceivedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
