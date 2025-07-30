import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gold text-white hover:bg-gold-dark hover:shadow-md transition-all duration-200 shadow-sm border-0",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md transition-all duration-200 shadow-sm border-0",
        outline: "border border-border bg-white hover:bg-muted hover:text-foreground shadow-sm text-muted-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm transition-all duration-200",
        ghost: "hover:bg-muted hover:text-foreground rounded-lg text-muted-foreground border-0",
        link: "text-gold hover:text-gold-dark underline-offset-4 hover:underline transition-colors duration-200",
        success: "bg-success text-white hover:bg-success/90 hover:shadow-md transition-all duration-200 shadow-sm border-0",
        premium: "bg-bronze text-white hover:bg-bronze/90 hover:shadow-md transition-all duration-200 shadow-sm border-0",
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
