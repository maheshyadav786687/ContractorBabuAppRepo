import * as React from "react"
import { cn } from "@/lib/utils"

const Dialog = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { open?: boolean; onOpenChange?: (open: boolean) => void }
>(({ className, open, onOpenChange, children, ...props }, ref) => {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange?.(false)}
            />
            <div
                ref={ref}
                className={cn(
                    "relative z-50 w-full max-w-3xl rounded-xl border bg-white p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-xl",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </div>
    )
})
Dialog.displayName = "Dialog"

const DialogHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props}
    />
))
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("mt-4", className)}
        {...props}
    />
))
DialogContent.displayName = "DialogContent"

const DialogFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("mt-6 flex justify-end gap-2", className)}
        {...props}
    />
))
DialogFooter.displayName = "DialogFooter"

export { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter }
