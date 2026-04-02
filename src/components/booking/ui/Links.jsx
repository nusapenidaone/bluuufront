import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../../lib/utils";

export function PrimaryLink({ href, children, className, onClick }) {
    return (
        <a
            href={href}
            onClick={onClick}
            className={cn(
                "btn-primary inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]",
                className
            )}
        >
            {children}
            <ArrowRight className="h-4 w-4" />
        </a>
    );
}

export function SecondaryLink({ href, children, className, targetBlank = false }) {
    return (
        <a
            href={href}
            target={targetBlank ? "_blank" : undefined}
            rel={targetBlank ? "noreferrer" : undefined}
            className={cn(
                "btn-outline inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-secondary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]",
                className
            )}
        >
            {children}
        </a>
    );
}
