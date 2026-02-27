import React from "react";
import { cn } from "../../../lib/utils";

export function PremiumCard({ className, children, variant = "default", ...props }) {
    const variants = {
        default: "bg-white rounded-xl border border-neutral-200 transition-all duration-300",
        hover: "bg-white rounded-xl border border-neutral-200 transition-all duration-300 hover:border-primary-100",
        glass: "bg-white/80 backdrop-blur-md border border-white/20 rounded-xl",
        premium: "bg-gradient-to-br from-white to-neutral-50 border border-neutral-200/80 rounded-xl",
        "qoves-featured": "bg-gradient-to-br from-primary-950 to-primary-900 text-white border border-white/10 rounded-xl backdrop-blur-sm relative overflow-hidden",
        plain: "transition-all duration-300",
    };

    const baseClass = variants[variant] || variants.default;

    return (
        <div className={cn(baseClass, className)} {...props}>
            {children}
        </div>
    );
}
