import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { Swirling } from "@/components/loading-ui/swirling"

export function LoadingSwap({
  isLoading,
  children,
  className,
}: {
  isLoading: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className="grid grid-cols-1 items-center justify-items-center">
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2 w-full",
          isLoading ? "invisible" : "visible",
          className,
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2",
          isLoading ? "visible" : "invisible",
          className,
        )}
      >
        {/* <Loader2Icon className="animate-spin" /> */}
        <Swirling className="size-8" />
      </div>
    </div>
  )
}
