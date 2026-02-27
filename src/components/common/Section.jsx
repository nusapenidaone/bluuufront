import React from "react";

const Section = ({
    children,
    className = "",
    containerClassName = "",
    size = "md",
    id,
    backgroundClassName = "",
    title,
    subtitle,
    kicker,
    titleAddon,
    titleClassName = "",
    subtitleClassName = "",
    centered = false, // New prop
    ...props
}) => {
    const verticalPadding = {
        none: "py-0",
        sm: "py-8 sm:py-12",
        md: "py-12 sm:py-16",
        lg: "py-16 sm:py-24"
    };

    return (
        <section
            id={id}
            className={`${verticalPadding[size]} ${backgroundClassName} ${className}`}
            {...props}
        >
            <div className={`mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
                {(title || kicker || subtitle) && (
                    <div className={`mb-8 flex flex-col sm:mb-10 ${centered ? "items-center text-center" : "items-start text-left"}`}>
                        {kicker && (
                            <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">
                                {kicker}
                            </div>
                        )}
                        <div className={`flex w-full flex-wrap gap-4 ${centered ? "justify-center" : "items-end justify-between"}`}>
                            <div className={`w-full ${centered ? "max-w-[880px]" : "max-w-[880px] flex-1"}`}>
                                {title && (
                                    <h2 className={`text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl ${titleClassName}`}>
                                        {title}
                                    </h2>
                                )}
                                {subtitle && (
                                    <p className={`mt-2 text-lg text-secondary-600 ${centered ? "mx-auto" : ""} ${subtitleClassName}`}>
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                            {!centered && titleAddon && (
                                <div className="ml-auto">
                                    {titleAddon}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {children}
            </div>
        </section>
    );
};

export default Section;
