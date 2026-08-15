"use server"

import { db } from "@/lib/db"
import { products, receipts } from "@/lib/db/schema"
import { and, desc, eq, gte, ilike, or, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type ReceiptStatus = "received" | "pending"

export async function getProducts() {
  return db.select().from(products).orderBy(products.name)
}

export async function getReceipts(opts?: { search?: string; status?: string }) {
  const conditions = []
  if (opts?.search) {
    conditions.push(
      or(
        ilike(receipts.productName, `%${opts.search}%`),
        ilike(receipts.sku, `%${opts.search}%`),
        ilike(receipts.supplier, `%${opts.search}%`),
      ),
    )
  }
  if (opts?.status && opts.status !== "all") {
    conditions.push(eq(receipts.status, opts.status))
  }

  const query = db.select().from(receipts).orderBy(desc(receipts.receivedAt))
  if (conditions.length > 0) {
    return query.where(and(...conditions))
  }
  return query
}

export async function getDashboardSummary() {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const [todayRows] = await db
    .select({
      count: sql<number>`count(*)::int`,
      qty: sql<number>`coalesce(sum(${receipts.quantity}), 0)::int`,
    })
    .from(receipts)
    .where(gte(receipts.receivedAt, startOfToday))

  const [pendingRows] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(receipts)
    .where(eq(receipts.status, "pending"))

  const [totalRows] = await db
    .select({
      count: sql<number>`count(*)::int`,
      qty: sql<number>`coalesce(sum(${receipts.quantity}), 0)::int`,
    })
    .from(receipts)

  return {
    todayCount: todayRows?.count ?? 0,
    todayQty: todayRows?.qty ?? 0,
    pendingCount: pendingRows?.count ?? 0,
    totalCount: totalRows?.count ?? 0,
    totalQty: totalRows?.qty ?? 0,
  }
}

export async function getStock() {
  return db
    .select({
      productId: receipts.productId,
      sku: receipts.sku,
      productName: receipts.productName,
      totalQty: sql<number>`coalesce(sum(${receipts.quantity}), 0)::int`,
      receiptCount: sql<number>`count(*)::int`,
      lastReceivedAt: sql<Date>`max(${receipts.receivedAt})`,
    })
    .from(receipts)
    .where(eq(receipts.status, "received"))
    .groupBy(receipts.productId, receipts.sku, receipts.productName)
    .orderBy(desc(sql`sum(${receipts.quantity})`))
}

export async function createReceipt(input: {
  productId: number
  quantity: number
  supplier?: string
  lotNumber?: string
  status?: string
  note?: string
}) {
  if (!input.productId) throw new Error("품목을 선택하세요.")
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error("수량은 1 이상의 정수여야 합니다.")
  }

  const [product] = await db.select().from(products).where(eq(products.id, input.productId))
  if (!product) throw new Error("존재하지 않는 품목입니다.")

  await db.insert(receipts).values({
    productId: product.id,
    sku: product.sku,
    productName: product.name,
    quantity: input.quantity,
    supplier: input.supplier || null,
    lotNumber: input.lotNumber || null,
    status: input.status === "pending" ? "pending" : "received",
    note: input.note || null,
  })

  revalidatePath("/")
}

export async function updateReceiptStatus(id: number, status: ReceiptStatus) {
  await db.update(receipts).set({ status }).where(eq(receipts.id, id))
  revalidatePath("/")
}

export async function findProductBySku(sku: string) {
  const [product] = await db.select().from(products).where(eq(products.sku, sku))
  return product ?? null
}
