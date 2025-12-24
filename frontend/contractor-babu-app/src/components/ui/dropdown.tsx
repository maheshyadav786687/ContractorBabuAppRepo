import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

const DropdownContext = createContext<{
    triggerRef: React.RefObject<HTMLButtonElement>;
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

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
                onClose();
            }
        }

        function updatePosition() {
            const trigger = triggerRef.current;
            if (trigger && open) {
                const rect = trigger.getBoundingClientRect();
                const offsetLeft = align === 'right' ? rect.right - 150 : rect.left;
                
                setPosition({
                    top: rect.bottom + 8,
                    left: offsetLeft
                });
            }
        }

        if (open) {
            updatePosition();
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                window.removeEventListener('scroll', updatePosition);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [open, onClose, align, triggerRef]);

    if (!open) return null;

    return createPortal(
        <div
            ref={ref}
            style={{
                position: 'fixed',
                top: `${position.top}px`,
                left: `${position.left}px`,
                zIndex: 9999
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
