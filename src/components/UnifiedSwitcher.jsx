import { useState, useEffect } from "react";
import { Globe, X } from "lucide-react";
import { useCurrency } from "../CurrencyContext";

const LANGUAGES = [
    { code: "hy",    name: "Հայերեն",        region: "Հայաստան" },
    { code: "en",    name: "English",          region: "United States" },
    { code: "en-GB", name: "English",          region: "United Kingdom" },
    { code: "ru",    name: "Русский",          region: "Россия" },
    { code: "id",    name: "Bahasa Indonesia", region: "Indonesia" },
    { code: "zh-CN", name: "中文",             region: "中国大陆" },
    { code: "zh-TW", name: "中文",             region: "台灣" },
    { code: "ja",    name: "日本語",           region: "日本" },
    { code: "ko",    name: "한국어",           region: "대한민국" },
    { code: "fr",    name: "Français",         region: "France" },
    { code: "de",    name: "Deutsch",          region: "Deutschland" },
    { code: "de-AT", name: "Deutsch",          region: "Österreich" },
    { code: "es",    name: "Español",          region: "España" },
    { code: "it",    name: "Italiano",         region: "Italia" },
    { code: "nl",    name: "Nederlands",       region: "Nederland" },
    { code: "pt",    name: "Português",        region: "Brasil" },
    { code: "pt-PT", name: "Português",        region: "Portugal" },
    { code: "pl",    name: "Polski",           region: "Polska" },
    { code: "tr",    name: "Türkçe",           region: "Türkiye" },
    { code: "ar",    name: "العربية",          region: "السعودية" },
    { code: "th",    name: "ภาษาไทย",         region: "ประเทศไทย" },
    { code: "vi",    name: "Tiếng Việt",       region: "Việt Nam" },
    { code: "sv",    name: "Svenska",          region: "Sverige" },
    { code: "da",    name: "Dansk",            region: "Danmark" },
    { code: "fi",    name: "Suomi",            region: "Suomi" },
    { code: "cs",    name: "Čeština",          region: "Česká republika" },
    { code: "uk",    name: "Українська",       region: "Україна" },
    { code: "he",    name: "עברית",            region: "ישראל" },
];

const UnifiedSwitcher = ({ showFloatingButton = true }) => {
    const { rates, selectedCurrency, setSelectedCurrency, currency } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const [visible, setVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("language");
    const [currentLang, setCurrentLang] = useState("en");

    // Animate open: first mount (isOpen→true), then set visible for CSS transition
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleOpenSettings = () => setIsOpen(true);
        window.addEventListener("open-settings", handleOpenSettings);

        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(";").shift();
        };
        const googTrans = getCookie("googtrans");
        if (googTrans) {
            const lang = googTrans.split("/").pop();
            if (lang) setCurrentLang(lang);
        }

        const hideBanner = () => {
            const banner = document.querySelector(".goog-te-banner-frame");
            if (banner) {
                banner.style.display = "none";
                banner.style.visibility = "hidden";
                banner.style.height = "0";
            }
            document.body.style.top = "0";
        };
        const interval = setInterval(hideBanner, 500);
        return () => {
            clearInterval(interval);
            window.removeEventListener("open-settings", handleOpenSettings);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen]);

    const changeLanguage = (langCode) => {
        const code = langCode.split("-")[0];
        const cookieValue = code === "en" ? "" : `/en/${code}`;
        document.cookie = `googtrans=${cookieValue}; path=/`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname}`;
        setCurrentLang(langCode);
        setIsOpen(false);
        window.location.reload();
    };

    const activeLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[1];

    const LangButton = ({ lang }) => {
        const isActive = lang.code === currentLang;
        return (
            <button
                onClick={() => changeLanguage(lang.code)}
                className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
                    isActive
                        ? "border-primary-600 bg-primary-50"
                        : "border-transparent hover:border-neutral-200 hover:bg-neutral-50"
                }`}
            >
                <div className={`text-sm font-semibold leading-tight ${isActive ? "text-primary-700" : "text-secondary-900"}`}>
                    {lang.name}
                </div>
                <div className="text-xs text-secondary-400 leading-tight mt-0.5">{lang.region}</div>
            </button>
        );
    };

    return (
        <>
            <div id="google_translate_element" style={{ display: "none" }} />

            {/* Floating Button */}
            {showFloatingButton && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md border border-neutral-200 shadow-lg rounded-full hover:bg-white hover:shadow-xl transition-all"
                    style={{ animation: "usw-fadein 0.4s ease both" }}
                >
                    <Globe className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-semibold text-secondary-700">
                        {activeLang.name} · {currency?.symbol ?? "$"} {selectedCurrency}
                    </span>
                </button>
            )}

            {/* Backdrop + Modal */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                    style={{
                        backgroundColor: visible ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0)",
                        transition: "background-color 0.25s ease",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="notranslate relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                        translate="no"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? "scale(1) translateY(0)" : "scale(0.97) translateY(12px)",
                            transition: "opacity 0.3s ease, transform 0.3s ease",
                        }}
                    >
                        {/* Tabs + close */}
                        <div className="flex items-center justify-between border-b border-neutral-200 px-6 pt-5 shrink-0">
                            <div className="flex">
                                {[
                                    { id: "language", label: "Language & Region" },
                                    { id: "currency", label: "Currency" },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative mr-8 pb-3 text-sm font-semibold transition-colors ${
                                            activeTab === tab.id
                                                ? "text-secondary-900"
                                                : "text-secondary-400 hover:text-secondary-700"
                                        }`}
                                    >
                                        {tab.label}
                                        <span
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary-900 rounded-full"
                                            style={{
                                                opacity: activeTab === tab.id ? 1 : 0,
                                                transition: "opacity 0.15s ease",
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 -mr-2 mb-3 rounded-full hover:bg-neutral-100 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-secondary-600" />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            {activeTab === "language" ? (
                                <div>
                                    <h3 className="text-sm font-bold text-secondary-900 mb-3">All languages</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {LANGUAGES.map(lang => (
                                            <LangButton key={lang.code} lang={lang} />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-sm font-bold text-secondary-900 mb-3">Choose a currency</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {rates.map((r) => {
                                            const isActive = selectedCurrency === r.code;
                                            return (
                                                <button
                                                    key={r.code}
                                                    onClick={() => { setSelectedCurrency(r.code); setIsOpen(false); }}
                                                    className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
                                                        isActive
                                                            ? "border-primary-600 bg-primary-50"
                                                            : "border-transparent hover:border-neutral-200 hover:bg-neutral-50"
                                                    }`}
                                                >
                                                    <div className={`text-sm font-bold leading-tight ${isActive ? "text-primary-700" : "text-secondary-900"}`}>
                                                        {r.code} — {r.symbol}
                                                    </div>
                                                    <div className="text-xs text-secondary-400 leading-tight mt-0.5">
                                                        {r.name}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes usw-fadein { from { opacity:0; transform: scale(0.9) translateY(12px); } to { opacity:1; transform: scale(1) translateY(0); } }
                iframe.goog-te-banner-frame { display: none !important; }
                html:not(.with-fancybox) body:not([style*="position: fixed"]) { top: 0px !important; }
                .goog-te-menu-frame { display: none !important; }
                .goog-tooltip, .goog-tooltip:hover { display: none !important; }
                .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
                .skiptranslate { display: none !important; }
            `}</style>
        </>
    );
};

export default UnifiedSwitcher;
