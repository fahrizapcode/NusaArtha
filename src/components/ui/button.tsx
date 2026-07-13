import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Using simple tailwind classes instead of cva for simplicity
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
      destructive: "bg-red-500 text-white hover:bg-red-500/90 shadow-sm",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    }
    
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-12 rounded-xl px-8 text-base",
      icon: "h-10 w-10",
    }
    
    // We'll define these mapped colors in globals.css or use literal classes if not present
    const variantClass = variant === "default" ? "bg-green-600 text-white hover:bg-green-700 shadow-sm" 
      : variant === "outline" ? "border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 shadow-sm"
      : variant === "secondary" ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
      : variant === "ghost" ? "hover:bg-gray-100 text-gray-700"
      : ""
      
    return (
      <Comp
        className={cn(baseClasses, variantClass, sizeClasses[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
