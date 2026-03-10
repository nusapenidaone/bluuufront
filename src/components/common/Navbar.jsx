import { useState, useEffect, useRef } from "react";
import { Globe, ArrowRight, Menu, X, Coins } from "lucide-react";
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
    const [mobileOpen, setMobileOpen] = useState(false);

    const [currentLangCode, setCurrentLangCode] = useState(() => {
        try {
            const value = `; ${document.cookie}`;
            const parts = value.split("; googtrans=");
            if (parts.length === 2) {
                const lang = parts.pop().split(";").shift().split("/").pop();
                if (lang) return lang.toUpperCase();
            }
        } catch {}
        return "EN";
    });
    const [hidden, setHidden] = useState(false);
    const [navHeight, setNavHeight] = useState(0);
    const navRef = useRef(null);
    useEffect(() => {
        if (navRef.current) setNavHeight(navRef.current.offsetHeight);
    }, [mobileOpen]);

    useEffect(() => {
        const getY = () =>
            window.scrollY ??
            document.documentElement.scrollTop ??
            document.body.scrollTop ??
            0;

        let lastScrollY = getY();
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = getY();
                if (y < 80) {
                    setHidden(false);
                } else if (y > lastScrollY + 5) {
                    setHidden(true);
                    setMobileOpen(false);
                } else if (y < lastScrollY - 5) {
                    setHidden(false);
                }
                lastScrollY = y;
                ticking = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        document.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            document.removeEventListener("scroll", onScroll);
        };
    }, []);

    const openSettings = () => {
        window.dispatchEvent(new CustomEvent("open-settings"));
    };

    return (
        <>
            {/* Spacer to prevent content jump under fixed navbar */}
            <div style={{ height: navHeight }} />

            {/* Fixed navbar */}
            <div
                ref={navRef}
                style={{ transform: hidden ? "translateY(-110%)" : "translateY(0)", transition: "transform 0.28s ease" }}
                className={isFullBar
                    ? "fixed top-0 left-0 right-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-sm"
                    : "fixed top-0 left-0 right-0 z-50 py-3"
                }
            >
                <nav className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
                    <div className={isFullBar
                        ? "flex items-center justify-between gap-4 py-3"
                        : "flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white/95 px-3 py-2 shadow-[0_2px_16px_rgba(0,0,0,0.06)] backdrop-blur-sm"
                    }>

                        {/* Logo */}
                        <a href="https://bluuu.tours" className="flex shrink-0 items-center gap-2.5">
                            <img
                                src={logoUrl}
                                alt={`${brandName} logo`}
                                className="h-7 w-auto"
                            />
                        </a>

                        {/* Nav links — desktop */}
                        {links.length > 0 && (
                            <div className="hidden items-center md:flex">
                                {links.map((link) => (
                                    <a
                                        key={link.id ?? link.href ?? link.label}
                                        href={link.href ?? `#${link.id}`}
                                        className="rounded-xl px-3.5 py-2 text-sm font-semibold text-secondary-500 transition hover:bg-neutral-100 hover:text-secondary-900"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-1.5">
                            <button
                                onClick={openSettings}
                                className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-semibold text-secondary-600 transition hover:bg-neutral-100 hover:text-secondary-900"
                            >
                                <Globe className="h-4 w-4 text-primary-600" />
                                <span translate="no" className="notranslate">{currentLangCode}</span>
                                <span className="text-secondary-300">|</span>
                                <Coins className="h-4 w-4 text-primary-600" />
                                <span translate="no" className="notranslate">{selectedCurrency?.toUpperCase()}</span>
                            </button>

                            <Button
                                href={cta.href}
                                size="sm"
                                className="hidden xs:inline-flex rounded-xl"
                            >
                                {cta.label} <ArrowRight className="h-4 w-4" />
                            </Button>

                            {links.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen((v) => !v)}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-secondary-600 transition hover:bg-neutral-100 hover:text-secondary-900 md:hidden"
                                    aria-label="Menu"
                                >
                                    {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {mobileOpen && links.length > 0 && (
                        <div className="mt-2 bg-white border-t border-neutral-100">
                            <div className="flex flex-col">
                                {links.map((link) => (
                                    <a
                                        key={link.id ?? link.href ?? link.label}
                                        href={link.href ?? `#${link.id}`}
                                        onClick={() => setMobileOpen(false)}
                                        className="px-4 py-3 text-sm font-semibold text-secondary-700 transition hover:bg-neutral-50 hover:text-secondary-900 border-b border-neutral-100"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>
            </div>
        </>
    );
};

export default Navbar;

export const SITE_NAV_LINKS = [
  { id: "private", label: "Private tours", href: "/private" },
  { id: "shared", label: "Shared tours", href: "/shared" },
  { id: "faq", label: "FAQ", href: "/faq" },
  { id: "reviews", label: "Reviews", href: "/reviews" },
];
