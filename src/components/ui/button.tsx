import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-dark text-white hover:bg-dark/90 hover:shadow-xl transition-all duration-200 shadow-lg border-0 font-semibold",
        destructive: "bg-destructive text-white hover:bg-destructive/90 hover:shadow-xl transition-all duration-200 shadow-lg border-0 font-semibold",
        outline: "border-3 border-dark/60 bg-white hover:bg-dark/10 hover:border-dark hover:text-dark shadow-md text-dark font-semibold hover:shadow-lg",
        secondary: "bg-accent-2 text-white hover:bg-accent-2/90 hover:shadow-lg transition-all duration-200 shadow-md font-semibold",
        ghost: "hover:bg-dark/20 hover:text-dark rounded-lg text-dark border-0 font-medium",
        link: "text-dark hover:text-dark/70 underline-offset-4 hover:underline transition-colors duration-200 font-medium",
        success: "bg-accent-3 text-white hover:bg-accent-3/90 hover:shadow-xl transition-all duration-200 shadow-lg border-0 font-semibold",
        premium: "bg-charcoal text-white hover:bg-charcoal/90 hover:shadow-xl transition-all duration-200 shadow-lg border-0 font-semibold",
      },
      size: {
        default: "h-9 px-4 py-1",
        sm: "h-7 px-3 text-xs",
        lg: "h-10 px-6 text-base",
        icon: "h-9 w-9",
        transaction: "h-12 px-6 py-2 text-base min-w-[160px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
