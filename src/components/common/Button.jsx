import React from "react";
import { motion } from "framer-motion";

const Button = ({
    children,
    variant = "primary",
    size = "md",
    className = "",
    href,
    onClick,
    disabled,
    type = "button",
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-none",
        secondary: "bg-neutral-100 text-secondary-900 border border-neutral-200 hover:bg-neutral-200",
        ghost: "bg-transparent text-secondary-600 hover:bg-neutral-50 hover:text-secondary-900",
        outline: "bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50",
        premium: "bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-600 hover:text-white"
    };

    const sizes = {
        sm: "px-4 py-2 text-xs rounded-full",
        md: "px-6 py-3 text-sm rounded-full",
        lg: "px-8 py-4 text-base rounded-full",
        icon: "p-2 rounded-full"
    };

    const content = (
        <>
            {children}
        </>
    );

    if (href) {
        return (
            <a
                href={href}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {content}
            </a>
        );
    }

    return (
        <motion.button
            type={type}
            whileHover={{}}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {content}
        </motion.button>
    );
};

export default Button;
