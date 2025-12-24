import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, onChange, onValueChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange?.(e)
            onValueChange?.(e.target.value)
        }

        return (
            <div className="relative">
                <select
                    className={cn(
                        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:border-2 focus:border-primary focus:px-[11px] focus:py-[7px] disabled:cursor-not-allowed disabled:opacity-50 appearance-none shadow-sm hover:border-2 hover:border-primary hover:px-[11px] hover:py-[7px]",
                        className
                    )}
                    ref={ref}
                    onChange={handleChange}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
        )
    }
)
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={className} {...props}>
            {children}
        </div>
    )
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
    ({ className, ...props }, ref) => (
        <span ref={ref} className={className} {...props} />
    )
)
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={className} {...props}>
            {children}
        </div>
    )
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
    ({ className, children, ...props }, ref) => (
        <option ref={ref} className={className} {...props}>
            {children}
        </option>
    )
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
