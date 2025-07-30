import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple to-purple-glow text-primary-foreground hover:shadow-elegant transform hover:scale-105 shadow-md",
        destructive: "bg-gradient-to-r from-destructive to-red-500 text-destructive-foreground hover:shadow-lg transform hover:scale-105 shadow-md",
        outline: "border border-border/50 bg-background/80 backdrop-blur-sm hover:bg-purple/10 hover:border-purple/40 hover:text-purple shadow-sm hover:shadow-md",
        secondary: "bg-gradient-to-r from-blue to-cyan text-white hover:shadow-md transform hover:scale-105",
        ghost: "hover:bg-purple/10 hover:text-purple rounded-xl",
        link: "text-purple underline-offset-4 hover:underline",
        success: "bg-gradient-to-r from-green to-emerald-500 text-success-foreground hover:shadow-lg transform hover:scale-105 shadow-md",
        premium: "bg-gradient-to-r from-orange to-gold text-white hover:shadow-elegant transform hover:scale-105 shadow-lg",
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
