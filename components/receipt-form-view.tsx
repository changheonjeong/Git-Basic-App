"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { createReceipt, findProductBySku } from "@/app/actions/inbound"
import type { Product } from "@/lib/db/schema"
import { ScanLine, PackagePlus } from "lucide-react"

export function ReceiptFormView({ products }: { products: Product[] }) {
  const router = useRouter()
  const [productId, setProductId] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("")
  const [supplier, setSupplier] = useState("")
  const [lotNumber, setLotNumber] = useState("")
  const [status, setStatus] = useState("received")
  const [note, setNote] = useState("")
  const [scanning, setScanning] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleDetected(value: string) {
    setScanning(false)
    const code = value.trim()
    const match = products.find(
      (p) => p.sku.toLowerCase() === code.toLowerCase(),
    )
    if (match) {
      setProductId(String(match.id))
      toast.success(`품목 인식: ${match.name}`)
    } else {
      // best-effort server lookup for SKUs not in the initial list
      findProductBySku(code).then((p) => {
        if (p) {
          setProductId(String(p.id))
          toast.success(`품목 인식: ${p.name}`)
        } else {
          toast.error(`등록되지 않은 코드입니다: ${code}`)
        }
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const qty = Number(quantity)
    if (!productId) return toast.error("품목을 선택하세요.")
    if (!Number.isInteger(qty) || qty <= 0) return toast.error("수량을 올바르게 입력하세요.")

    setSubmitting(true)
    try {
      await createReceipt({
        productId: Number(productId),
        quantity: qty,
        supplier,
        lotNumber,
        status,
        note,
      })
      toast.success("입고가 등록되었습니다.")
      setProductId("")
      setQuantity("")
      setSupplier("")
      setLotNumber("")
      setStatus("received")
      setNote("")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "등록에 실패했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">입고 등록</h1>
        <p className="text-sm text-muted-foreground">새 입고 내역을 기록합니다</p>
      </div>

      <button
        type="button"
        onClick={() => setScanning(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 py-6 text-primary"
      >
        <ScanLine className="size-6" />
        <span className="font-medium">바코드 / QR 스캔</span>
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="product">품목</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger id="product" className="h-11 w-full">
              <SelectValue placeholder="품목 선택" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name} ({p.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quantity">수량</Label>
          <Input
            id="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="h-11"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="supplier">거래처</Label>
            <Input
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="선택"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lot">LOT 번호</Label>
            <Input
              id="lot"
              value={lotNumber}
              onChange={(e) => setLotNumber(e.target.value)}
              placeholder="선택"
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">상태</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status" className="h-11 w-full">
              <SelectValue>
                {status === "pending" ? "입고대기" : "입고완료"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="received">입고완료</SelectItem>
              <SelectItem value="pending">입고대기</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="note">비고</Label>
          <Input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="선택"
            className="h-11"
          />
        </div>

        <Button type="submit" disabled={submitting} className="h-12 w-full text-base">
          <PackagePlus className="size-5" />
          {submitting ? "등록 중..." : "입고 등록"}
        </Button>
      </form>

      {scanning && (
        <BarcodeScanner onDetected={handleDetected} onClose={() => setScanning(false)} />
      )}
    </div>
  )
}
