import { useState, useRef, useLayoutEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

const DropdownContext = createContext<{
    triggerRef: React.RefObject<HTMLButtonElement | null>;
}>({
    triggerRef: { current: null }
});

export function DropdownMenu({ children }: { children: React.ReactNode }) {
    const triggerRef = useRef<HTMLButtonElement>(null);
    return (
        <DropdownContext.Provider value={{ triggerRef }}>
            <div className="relative inline-block">{children}</div>
        </DropdownContext.Provider>
    );
}

export function DropdownTrigger({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
    const { triggerRef } = useContext(DropdownContext);
    return (
        <button ref={triggerRef} onClick={onClick} className="inline-flex items-center" data-dropdown-trigger>
            {children}
        </button>
    );
}

export function DropdownContent({
    open,
    onClose,
    children,
    align = 'right'
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    align?: 'left' | 'right';
}) {
    const { triggerRef } = useContext(DropdownContext);
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const updatePosition = () => {
        const trigger = triggerRef.current;
        const content = ref.current;
        if (trigger && content && open) {
            const rect = trigger.getBoundingClientRect();
            const contentRect = content.getBoundingClientRect();

            let left = align === 'right'
                ? rect.right - contentRect.width
                : rect.left;

            // Prevent overflowing screen boundaries
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (left + contentRect.width > viewportWidth - 8) {
                left = viewportWidth - contentRect.width - 8;
            }
            if (left < 8) {
                left = 8;
            }

            let top = rect.bottom + 8;
            // If it would overflow the bottom, show it above the trigger
            if (top + contentRect.height > viewportHeight - 8 && rect.top > contentRect.height + 8) {
                top = rect.top - contentRect.height - 8;
            }

            setPosition({ top, left });
        }
    };

    useLayoutEffect(() => {
        if (!open) return;

        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
                onClose();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        // Using capture: true for scroll allows us to catch scrolls in nested containers (like Dialogs)
        window.addEventListener('scroll', updatePosition, { capture: true });
        window.addEventListener('resize', updatePosition);

        // Track trigger movement/resizing
        const resizeObserver = new ResizeObserver(updatePosition);
        if (triggerRef.current) resizeObserver.observe(triggerRef.current);
        if (ref.current) resizeObserver.observe(ref.current);

        // Initial position
        updatePosition();

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', updatePosition, { capture: true });
            window.removeEventListener('resize', updatePosition);
            resizeObserver.disconnect();
        };
    }, [open, onClose, align, triggerRef]);

    if (!open) return null;

    return createPortal(
        <div
            ref={ref}
            style={{
                position: 'fixed',
                top: `${position.top}px`,
                left: `${position.left}px`,
                zIndex: 9999,
                // Ensure initial render doesn't flicker before the first updatePosition
                visibility: position.top === 0 ? 'hidden' : 'visible'
            }}
            className="rounded-md border border-gray-200 bg-white shadow-xl min-w-max"
        >
            <div className="py-1">{children}</div>
        </div>,
        document.body
    );
}

export function DropdownItem({
    onClick,
    className = '',
    children,
    icon: Icon
}: {
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
                className
            )}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </button>
    );
}