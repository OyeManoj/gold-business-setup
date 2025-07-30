import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple via-blue to-purple text-white hover:from-purple/90 hover:to-blue/90 hover:shadow-elegant transform hover:scale-105 shadow-lg border-0",
        destructive: "bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white hover:from-red-600 hover:to-pink-600 hover:shadow-lg transform hover:scale-105 shadow-md border-0",
        outline: "border-2 border-purple/40 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-purple/10 hover:to-blue/10 hover:border-purple/60 hover:text-purple shadow-sm hover:shadow-md text-purple/80",
        secondary: "bg-gradient-to-r from-blue via-cyan to-blue text-white hover:from-blue/90 hover:to-cyan/90 hover:shadow-md transform hover:scale-105 shadow-md border-0",
        ghost: "hover:bg-gradient-to-r hover:from-purple/20 hover:to-blue/20 hover:text-purple rounded-xl text-purple/70 border-0",
        link: "text-purple hover:text-blue underline-offset-4 hover:underline transition-colors duration-300",
        success: "bg-gradient-to-r from-green via-emerald-400 to-green text-white hover:from-green/90 hover:to-emerald-500 hover:shadow-lg transform hover:scale-105 shadow-md border-0",
        premium: "bg-gradient-to-r from-orange via-yellow-400 to-gold text-white hover:from-orange/90 hover:to-gold/90 hover:shadow-elegant transform hover:scale-105 shadow-lg border-0",
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
