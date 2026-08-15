"use client"

import { useEffect, useRef, useState } from "react"
import { X, ScanLine, CameraOff } from "lucide-react"

export function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (value: string) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    let stream: MediaStream | null = null
    let raf = 0
    let stopped = false

    async function start() {
      const BarcodeDetectorCtor = (globalThis as any).BarcodeDetector
      if (!BarcodeDetectorCtor) {
        setSupported(false)
        return
      }
      try {
        const detector = new BarcodeDetectorCtor({
          formats: ["qr_code", "ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e"],
        })
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        const scan = async () => {
          if (stopped || !videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes.length > 0 && codes[0].rawValue) {
              onDetected(codes[0].rawValue)
              return
            }
          } catch {
            // ignore per-frame errors
          }
          raf = requestAnimationFrame(scan)
        }
        raf = requestAnimationFrame(scan)
      } catch {
        setError("카메라에 접근할 수 없습니다. 권한을 확인하세요.")
      }
    }

    start()

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 text-white">
        <p className="font-medium">바코드 / QR 스캔</p>
        <button onClick={onClose} aria-label="닫기" className="rounded-full p-1">
          <X className="size-6" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />

        {supported && !error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-56 w-56 rounded-2xl border-2 border-white/70">
              <ScanLine className="absolute inset-x-0 top-1/2 mx-auto size-40 -translate-y-1/2 text-primary/80" />
            </div>
          </div>
        )}

        {(!supported || error) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center text-white">
            <CameraOff className="size-10 opacity-70" />
            <p className="text-sm text-white/80">
              {error ?? "이 브라우저는 바코드 스캔을 지원하지 않습니다. SKU를 직접 입력해 주세요."}
            </p>
          </div>
        )}
      </div>

      <p className="p-4 text-center text-sm text-white/70">
        바코드를 사각형 안에 맞추면 자동으로 인식됩니다.
      </p>
    </div>
  )
}
