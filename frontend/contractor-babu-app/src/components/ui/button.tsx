import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                default: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white shadow-sm hover:shadow-md hover:border-primary",
                destructive:
                    "border-2 border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-white shadow-sm hover:shadow-md hover:border-destructive",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                ghostPrimary: "border-2 border-transparent bg-transparent text-primary hover:border-primary hover:bg-primary hover:text-white shadow-none hover:shadow-sm",
                ghostDestructive: "border-2 border-transparent bg-transparent text-destructive hover:border-destructive hover:bg-destructive hover:text-white shadow-none hover:shadow-sm",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-5 py-2.5",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
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
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
