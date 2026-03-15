import React from "react";
import { cn } from "../../../lib/utils";

export function PremiumSection({
    id,
    className,
    backgroundClassName = "bg-transparent",
    centered = false,
    children,
    ...props
}) {
    return (
        <section
            id={id}
            className={cn("py-6 md:py-16 lg:py-24", backgroundClassName, centered && "text-center", className)}
            {...props}
        >
            {children}
        </section>
    );
}

export function PremiumContainer({ className, children, ...props }) {
    return (
        <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props}>
            {children}
        </div>
    );
}
