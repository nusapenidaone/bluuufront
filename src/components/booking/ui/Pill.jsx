import React from "react";
import { cn } from "../../../lib/utils";

export default function Pill({ icon: Icon, iconSvg, children, className, iconClassName }) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-secondary-700",
                className
            )}
        >
            {iconSvg ? (
                <span
                    className={cn("h-3.5 w-3.5 shrink-0 [&>svg]:h-full [&>svg]:w-full", iconClassName)}
                    dangerouslySetInnerHTML={{ __html: iconSvg }}
                />
            ) : (
                Icon && <Icon className={cn("h-3.5 w-3.5", iconClassName)} />
            )}
            <span>{children}</span>
        </div>
    );
}
