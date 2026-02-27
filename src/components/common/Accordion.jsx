import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Accordion component for collapsible content sections.
 */
export function Accordion({ items, className }) {
    return (
        <div className={cn("grid gap-3", className)}>
            {items.map((item, index) => (
                <AccordionItem key={index} {...item} />
            ))}
        </div>
    );
}

export function AccordionItem({ q, a, className }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={cn(
                "w-full text-left transition-all duration-200",
                "rounded-2xl border border-neutral-100 bg-white p-4",
                "shadow-card hover:bg-white",
                className
            )}
        >
            <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-secondary-900">{q}</span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-secondary-500 transition-transform duration-200",
                        isOpen ? "rotate-180" : "rotate-0"
                    )}
                />
            </div>
            {isOpen && (
                <div
                    className="mt-3 text-sm leading-6 text-secondary-600 animate-in fade-in slide-in-from-top-1"
                >
                    {a}
                </div>
            )}
        </button>
    );
}

export default Accordion;
