import React from "react";
import { Globe, ArrowRight } from "lucide-react";
import Button from "./Button";
import { useCurrency } from "../../CurrencyContext";

const Navbar = ({
    links = [],
    cta = { label: "Book availability", href: "#booking" },
    logoUrl = "https://bluuu.tours/themes/bluuu/assets/img/logo.svg",
    brandName = "Bluuu",
    variant = "pill",
}) => {
    const { selectedCurrency } = useCurrency();
    const isFullBar = variant === "fullbar";

    const openSettings = () => {
        window.dispatchEvent(new CustomEvent("open-settings"));
    };

    return (
        <div className={isFullBar ? "sticky top-0 z-50 w-full border-b border-neutral-200 bg-white" : "sticky top-0 z-50 py-4 transition-all duration-300"}>
            <nav className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
                <div
                    className={isFullBar
                        ? "flex items-center justify-between gap-4 py-3"
                        : "flex items-center justify-between gap-4 rounded-full border border-neutral-200 bg-white px-4 py-2 shadow-sm"}
                >

                    {/* Logo */}
                    <div className="flex items-center gap-3 shrink-0">
                        <img
                            src={logoUrl}
                            alt={`${brandName} logo`}
                            className="h-6 w-auto"
                        />
                    </div>

                    {/* Spacer/Links removed */}

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <button
                            onClick={openSettings}
                            className="flex items-center gap-2 rounded-full px-2 py-2 text-sm font-medium text-secondary-600 transition hover:bg-neutral-100 hover:text-secondary-900 sm:px-4"
                        >
                            <Globe className="h-5 w-5 text-primary-600 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">EN | {selectedCurrency?.toUpperCase()}</span>
                        </button>

                        <Button
                            href={cta.href}
                            size="sm"
                            className="hidden xs:inline-flex rounded-full"
                        >
                            {cta.label} <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
