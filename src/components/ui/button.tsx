import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary shadow-md hover:shadow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-2 border-destructive shadow-md hover:shadow-lg",
        outline: "border-2 border-border bg-card hover:bg-muted hover:border-primary text-foreground shadow-sm hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 border-secondary shadow-sm hover:shadow-md",
        ghost: "hover:bg-muted text-foreground border-2 border-transparent hover:border-border",
        link: "text-primary hover:text-primary/80 underline-offset-4 hover:underline border-2 border-transparent",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 border-2 border-accent shadow-md hover:shadow-lg",
        success: "bg-success text-success-foreground hover:bg-success/90 border-2 border-success shadow-md hover:shadow-lg",
      },
      size: {
        default: "h-12 px-6 py-3 min-w-[48px] touch-target",
        sm: "h-10 px-4 text-sm min-w-[40px] touch-target", 
        lg: "h-14 px-8 text-base min-w-[56px] touch-target",
        icon: "h-12 w-12 touch-target",
        transaction: "h-16 px-8 py-4 text-base min-w-[200px] touch-target",
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
