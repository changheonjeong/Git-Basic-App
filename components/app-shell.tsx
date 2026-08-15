"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, PackagePlus, ListChecks, Boxes } from "lucide-react"
import { DashboardView } from "@/components/dashboard-view"
import { ReceiptFormView } from "@/components/receipt-form-view"
import { ReceiptListView } from "@/components/receipt-list-view"
import { StockView } from "@/components/stock-view"
import type { Product, Receipt } from "@/lib/db/schema"

type Tab = "home" | "add" | "list" | "stock"

type StockRow = {
  productId: number
  sku: string
  productName: string
  totalQty: number
  receiptCount: number
  lastReceivedAt: Date
}

const NAV: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "home", label: "현황", icon: LayoutDashboard },
  { key: "add", label: "입고등록", icon: PackagePlus },
  { key: "list", label: "입고목록", icon: ListChecks },
  { key: "stock", label: "재고", icon: Boxes },
]

export function AppShell({
  summary,
  recent,
  receipts,
  products,
  stock,
}: {
  summary: {
    todayCount: number
    todayQty: number
    pendingCount: number
    totalCount: number
    totalQty: number
  }
  recent: Receipt[]
  receipts: Receipt[]
  products: Product[]
  stock: StockRow[]
}) {
  const [tab, setTab] = useState<Tab>("home")

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
      <main className="flex-1 px-4 pb-28 pt-6">
        {tab === "home" && <DashboardView summary={summary} recent={recent} />}
        {tab === "add" && <ReceiptFormView products={products} />}
        {tab === "list" && <ReceiptListView receipts={receipts} />}
        {tab === "stock" && <StockView stock={stock} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-card/95 backdrop-blur">
        <div className="grid grid-cols-4">
          {NAV.map(({ key, label, icon: Icon }) => {
            const active = tab === key
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("size-5", active && "stroke-[2.5]")} />
                {label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
