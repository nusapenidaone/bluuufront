import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Globe,
    ArrowRight,
    Menu,
    X,
    Coins,
    Instagram,
    Mail,
    MessageCircle,
    Phone,
    Youtube,
} from "lucide-react";
import Button from "./Button";
import { useCurrency } from "../../CurrencyContext";
import { useSiteContacts } from "../../hooks/useSiteContacts";
import {
    COMPANY_LINKS,
    POLICY_LINKS,
    SOCIAL_LINKS,
    resolveSocialHref,
} from "./siteNavigation";

function MenuSection({ title, links, onNavigate, columnsClassName = "" }) {
    if (!links.length) return null;

    return (
        <div>
            <div className="text-xs font-black uppercase tracking-[0.24em] text-secondary-400">
                {title}
            </div>
            <div className={`mt-3 grid gap-1.5 ${columnsClassName}`}>
                {links.map((link) => (
                    <a
                        key={link.label}
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noreferrer" : undefined}
                        onClick={onNavigate}
                        className="group flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-semibold text-secondary-700 transition hover:bg-neutral-100 hover:text-secondary-900"
                    >
                        <span>{link.label}</span>
                        <ArrowRight className="h-4 w-4 text-secondary-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
                    </a>
                ))}
            </div>
        </div>
    );
}


const Navbar = ({
    links = [],
    cta = { label: "Book availability", href: "#booking" },
    logoUrl = "https://bluuu.tours/themes/bluuu/assets/img/logo.svg",
    brandName = "Bluuu",
    variant = "pill",
}) => {
    const { selectedCurrency } = useCurrency();
    const contacts = useSiteContacts();
    const isFullBar = variant === "fullbar";
    const [menuOpen, setMenuOpen] = useState(false);

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
    }, [menuOpen]);

    useEffect(() => {
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;

        if (menuOpen) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
            setHidden(false);
        }

        return () => {
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
        };
    }, [menuOpen]);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    useEffect(() => {
        const getY = () =>
            window.scrollY ??
            document.documentElement.scrollTop ??
            document.body.scrollTop ??
            0;

        let lastScrollY = getY();
        let ticking = false;

        const onScroll = () => {
            if (menuOpen) {
                setHidden(false);
                return;
            }

            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = getY();
                if (y < 80) {
                    setHidden(false);
                } else if (y > lastScrollY + 5) {
                    setHidden(true);
                    setMenuOpen(false);
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
    }, [menuOpen]);

    const openSettings = () => {
        window.dispatchEvent(new CustomEvent("open-settings"));
    };

    const closeMenu = () => setMenuOpen(false);

    const socialMenuLinks = SOCIAL_LINKS.map((item) => ({
        label: item.label,
        href: resolveSocialHref(contacts, item.key),
        external: true,
    })).filter((item) => item.href && item.href !== "#");

    const contactActions = [
        {
            label: "WhatsApp",
            value: contacts.whatsapp?.number || "Chat with our team",
            href: contacts.whatsapp?.link || "",
            icon: MessageCircle,
            external: true,
        },
        {
            label: "Email",
            value: contacts.email || "",
            href: contacts.email ? `mailto:${contacts.email}` : "",
            icon: Mail,
            external: false,
        },
        {
            label: "Phone",
            value: contacts.phone?.number || "",
            href: contacts.phone?.link || "",
            icon: Phone,
            external: false,
        },
    ].filter((item) => item.value && item.href);

    const socialIconLinks = [
        {
            label: "Instagram",
            href: contacts.instagram || "",
            icon: Instagram,
        },
        {
            label: "WhatsApp",
            href: contacts.whatsapp?.link || "",
            icon: MessageCircle,
        },
        {
            label: "YouTube",
            href: contacts.youtube || "",
            icon: Youtube,
        },
    ].filter((item) => item.href);

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
                        <a href="/" className="flex shrink-0 items-center gap-2.5">
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
                                className="flex items-center gap-1.5 rounded-xl  px-3 text-sm font-semibold text-secondary-600 transition  hover:text-secondary-900"
                            >
                                <Globe className="h-4 w-4" />
                                <span translate="no" className="notranslate">{currentLangCode}</span>
                                <span className="text-secondary-300">|</span>
                                <Coins className="h-4 w-4" />
                                <span translate="no" className="notranslate">{selectedCurrency?.toUpperCase()}</span>
                            </button>

                            <Button
                                href={cta.href}
                                size="sm"
                                className="hidden xs:inline-flex rounded-xl"
                            >
                                {cta.label} <ArrowRight className="h-4 w-4" />
                            </Button>

                            <button
                                type="button"
                                onClick={() => setMenuOpen((value) => !value)}
                                className="flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-semibold text-secondary-700 transition hover:bg-neutral-100 hover:text-secondary-900"
                                aria-expanded={menuOpen}
                                aria-label={menuOpen ? "Close menu" : "Open menu"}
                            >
                                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                                <span className="hidden sm:inline">{menuOpen ? "Close" : "Menu"}</span>
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMenu}
                        className="fixed inset-0 z-[10000] bg-black/40 p-4"
                    >
                        <div className="flex h-full items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.97, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97, y: 12 }}
                                transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                                onClick={(event) => event.stopPropagation()}
                                className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
                            >
                                <div className="flex items-center justify-between border-b border-neutral-200 px-6 pt-5 shrink-0">
                                    <div className="pb-3 text-sm font-semibold text-secondary-900">
                                        Menu
                                    </div>
                                    <button
                                        type="button"
                                        onClick={closeMenu}
                                        className="-mr-2 mb-3 rounded-full p-2 transition-colors hover:bg-neutral-100"
                                        aria-label="Close"
                                    >
                                        <X className="h-5 w-5 text-secondary-600" />
                                    </button>
                                </div>

                                <div
                                    className="flex-1 overflow-y-auto bg-white px-6 py-5"
                                    style={{
                                        WebkitOverflowScrolling: "touch",
                                        overscrollBehavior: "contain",
                                        touchAction: "pan-y",
                                    }}
                                >
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        <MenuSection
                                            title="Explore"
                                            links={COMPANY_LINKS}
                                            onNavigate={closeMenu}
                                            columnsClassName=""
                                        />

                                        <MenuSection
                                            title="Policies"
                                            links={POLICY_LINKS}
                                            onNavigate={closeMenu}
                                            columnsClassName=""
                                        />

                                        {(contactActions.length > 0 || socialIconLinks.length > 0 || socialMenuLinks.length > 0) && (
                                            <div>
                                                <div className="text-xs font-black uppercase tracking-[0.24em] text-secondary-400">
                                                    Contact
                                                </div>

                                                {contactActions.length > 0 && (
                                                    <div className="mt-3 space-y-1.5">
                                                        {contactActions.map((item) => {
                                                            const Icon = item.icon;
                                                            return (
                                                                <a
                                                                    key={item.label}
                                                                    href={item.href}
                                                                    target={item.external ? "_blank" : undefined}
                                                                    rel={item.external ? "noreferrer" : undefined}
                                                                    onClick={closeMenu}
                                                                    className="group flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-semibold text-secondary-700 transition hover:bg-neutral-100 hover:text-secondary-900"
                                                                >
                                                                    <span className="flex min-w-0 items-center gap-3">
                                                                        <Icon className="h-4 w-4 shrink-0 text-primary-600" />
                                                                        <span className="truncate">{item.value}</span>
                                                                    </span>
                                                                    <ArrowRight className="h-4 w-4 shrink-0 text-secondary-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {socialMenuLinks.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {socialMenuLinks.map((link) => (
                                                            <a
                                                                key={link.label}
                                                                href={link.href}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                onClick={closeMenu}
                                                                className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-secondary-500 transition hover:bg-primary-50/70 hover:text-primary-600"
                                                            >
                                                                {link.label}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}

                                                {socialIconLinks.length > 0 && (
                                                    <div className="mt-4 flex items-center gap-2 text-secondary-400">
                                                        {socialIconLinks.map((item) => {
                                                            const Icon = item.icon;
                                                            return (
                                                                <a
                                                                    key={item.label}
                                                                    href={item.href}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={closeMenu}
                                                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 transition hover:bg-primary-50 hover:text-primary-600"
                                                                    aria-label={item.label}
                                                                >
                                                                    <Icon className="h-4 w-4" />
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
export { SITE_NAV_LINKS } from "./siteNavigation";
