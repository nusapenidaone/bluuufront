import React from "react";

const Card = ({
    children,
    className = "",
    variant = "default",
    padding = "md",
    ...props
}) => {
    const variants = {
        default: "bg-white border border-neutral-200 shadow-card",
        glass: "bg-white/70 backdrop-blur border border-neutral-100 shadow-card",
        muted: "bg-neutral-100 border border-neutral-100",
        premium: "bg-primary-50 border border-primary-200 shadow-card",
        outline: "bg-transparent border border-neutral-200"
    };

    const paddings = {
        none: "p-0",
        sm: "p-3 sm:p-4",
        md: "p-5 sm:p-6",
        lg: "p-6 sm:p-8"
    };

    return (
        <div
            className={`rounded-2xl ${variants[variant]} ${paddings[padding]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
