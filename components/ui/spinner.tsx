import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Swirling } from "@/components/loading-ui/swirling"

const spinnerVariants = cva("shrink-0", {
  variants: {
    size: {
      xs: "size-6",
      sm: "size-7",
      default: "size-8",
      md: "size-10",
      lg: "size-12",
      xl: "size-14",
      "2xl": "size-20",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface SpinnerProps
  extends React.ComponentProps<"svg">,
  VariantProps<typeof spinnerVariants> { }

function Spinner({ className, size, ...props }: SpinnerProps) {
  return (
    <Swirling
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size, className }))}
      {...props}
    />
  )
}

export { Spinner, spinnerVariants }


