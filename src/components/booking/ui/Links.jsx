import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../../lib/utils";

export function PrimaryLink({ href, children, className, onClick }) {
    return (
        <a
            href={href}
            onClick={onClick}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-[45px] bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]",
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
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[45px] border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-secondary-900 transition hover:bg-neutral-50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]",
                className
            )}
        >
            {children}
        </a>
    );
}
