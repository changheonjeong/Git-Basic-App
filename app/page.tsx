import { AppShell } from "@/components/app-shell"
import {
  getDashboardSummary,
  getProducts,
  getReceipts,
  getStock,
} from "@/app/actions/inbound"

export const dynamic = "force-dynamic"

export default async function Page() {
  const [summary, receipts, products, stock] = await Promise.all([
    getDashboardSummary(),
    getReceipts(),
    getProducts(),
    getStock(),
  ])

  return (
    <AppShell
      summary={summary}
      recent={receipts.slice(0, 5)}
      receipts={receipts}
      products={products}
      stock={stock}
    />
  )
}
