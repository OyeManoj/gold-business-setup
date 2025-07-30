import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-elegant transform hover:scale-105 shadow-md",
        destructive: "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:shadow-lg transform hover:scale-105 shadow-md",
        outline: "border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/30 hover:text-primary shadow-sm hover:shadow-md",
        secondary: "bg-gradient-to-r from-secondary to-muted text-secondary-foreground hover:shadow-md transform hover:scale-105",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground rounded-xl",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-gradient-to-r from-success to-success/90 text-success-foreground hover:shadow-lg transform hover:scale-105 shadow-md",
        premium: "bg-gradient-to-r from-gold to-gold-dark text-white hover:shadow-elegant transform hover:scale-105 shadow-lg",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
        transaction: "h-16 px-8 py-4 text-lg min-w-[200px]",
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
