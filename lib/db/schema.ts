import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  category: text("category"),
  unit: text("unit").default("EA"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  sku: text("sku").notNull(),
  productName: text("productName").notNull(),
  quantity: integer("quantity").notNull(),
  supplier: text("supplier"),
  lotNumber: text("lotNumber"),
  status: text("status").notNull().default("received"),
  note: text("note"),
  receivedAt: timestamp("receivedAt").notNull().defaultNow(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export type Product = typeof products.$inferSelect
export type Receipt = typeof receipts.$inferSelect
