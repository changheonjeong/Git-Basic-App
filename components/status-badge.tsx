import { cn } from "@/lib/utils"

export function StatusBadge({ status }: { status: string }) {
  const isReceived = status === "received"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        isReceived
          ? "bg-success/12 text-success"
          : "bg-warning/15 text-warning-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isReceived ? "bg-success" : "bg-warning",
        )}
        aria-hidden
      />
      {isReceived ? "입고완료" : "입고대기"}
    </span>
  )
}
