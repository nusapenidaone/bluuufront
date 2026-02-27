import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, X, Check, Coins, Settings2 } from "lucide-react";
import { useCurrency } from "../CurrencyContext";

const LANGUAGES = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱" },
];

const UnifiedSwitcher = ({ showFloatingButton = true }) => {
    const { rates, selectedCurrency, setSelectedCurrency, currency } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("language"); // "language" or "currency"
    const [currentLang, setCurrentLang] = useState("en");

    useEffect(() => {
        const handleOpenSettings = () => setIsOpen(true);
        window.addEventListener("open-settings", handleOpenSettings);

        // Sync current language from cookie on mount
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };

        const googTrans = getCookie("googtrans");
        if (googTrans) {
            const lang = googTrans.split("/").pop();
            setCurrentLang(lang);
        }

        // Aggressively hide the Google Translate banner
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


    const changeLanguage = (langCode) => {
        const cookieValue = langCode === "en" ? "" : `/en/${langCode}`;
        document.cookie = `googtrans=${cookieValue}; path=/`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname}`;

        setCurrentLang(langCode);
        setIsOpen(false);
        window.location.reload();
    };

    const getActiveTabInfo = () => {
        if (activeTab === "language") {
            const lang = LANGUAGES.find(l => l.code === currentLang);
            return `${lang?.flag} ${lang?.name}`;
        }
        return `${currency?.symbol} ${selectedCurrency}`;
    };

    return (
        <>
            {/* Hidden Google Element */}
            <div id="google_translate_element" style={{ display: 'none' }}></div>

            {/* Floating Toggle Button */}
            {showFloatingButton && (
                <motion.button
                    onClick={() => setIsOpen(true)}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-5 py-3 bg-white/90 backdrop-blur-md border border-neutral-200 shadow-xl rounded-full hover:bg-white hover:shadow-2xl transition-all group"
                >
                    <div className="flex items-center -space-x-1">
                        <Globe className="w-5 h-5 text-primary-500 transition-transform group-hover:rotate-12" />
                        <Coins className="w-5 h-5 text-secondary-500 transition-transform group-hover:-rotate-12 translate-x-0.5" />
                    </div>
                    <div className="h-4 w-[1px] bg-neutral-200 mx-1" />
                    <span className="text-sm font-semibold text-secondary-600">
                        {currency?.symbol} · {LANGUAGES.find(l => l.code === currentLang)?.code.toUpperCase()}
                    </span>
                </motion.button>
            )}

            {/* Custom Unified Panel */}

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10000]"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 40 }}
                            className="fixed bottom-24 right-6 z-[10001] w-[340px] bg-white rounded-[32px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col"
                        >
                            <div className="p-5 flex items-center justify-between bg-neutral-50/50">
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-bold text-secondary-900 leading-tight">Preferences</h3>
                                    <p className="text-base text-secondary-500 font-medium">Personalize your experience</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white shadow-sm border border-transparent hover:border-neutral-200 rounded-full transition-all"
                                >
                                    <X className="w-5 h-5 text-secondary-400" />
                                </button>
                            </div>

                            {/* Tabs Wrapper */}
                            <div className="px-4 py-2">
                                <div className="flex p-1 bg-neutral-100 rounded-2xl relative">
                                    <motion.div
                                        className="absolute inset-y-1 bg-white rounded-xl shadow-sm z-0"
                                        initial={false}
                                        animate={{
                                            left: activeTab === "language" ? "4px" : "calc(50% + 1px)",
                                            right: activeTab === "language" ? "calc(50% + 1px)" : "4px"
                                        }}
                                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                    />
                                    <button
                                        onClick={() => setActiveTab("language")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold relative z-10 transition-colors ${activeTab === "language" ? "text-primary-600" : "text-secondary-500"}`}
                                    >
                                        <Globe className="w-4 h-4" />
                                        Language
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("currency")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold relative z-10 transition-colors ${activeTab === "currency" ? "text-secondary-600" : "text-secondary-500"}`}
                                    >
                                        <Coins className="w-4 h-4" />
                                        Currency
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="max-h-[420px] overflow-y-auto p-3 scrollbar-none min-h-[300px]">
                                <AnimatePresence mode="wait">
                                    {activeTab === "language" ? (
                                        <motion.div
                                            key="lang-list"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="grid grid-cols-1 gap-1"
                                        >
                                            {LANGUAGES.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => changeLanguage(lang.code)}
                                                    className={`flex items-center justify-between w-full p-3.5 rounded-2xl transition-all ${currentLang === lang.code
                                                        ? "bg-primary-50/80 text-primary-700"
                                                        : "hover:bg-neutral-50 text-secondary-600 font-medium"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <span className="text-2xl">{lang.flag}</span>
                                                        <span className="font-bold text-base">{lang.name}</span>
                                                    </div>
                                                    {currentLang === lang.code && (
                                                        <motion.div layoutId="check-l">
                                                            <Check className="w-4 h-4" />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="curr-list"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="grid grid-cols-1 gap-1"
                                        >
                                            {rates.map((r) => (
                                                <button
                                                    key={r.code}
                                                    onClick={() => {
                                                        setSelectedCurrency(r.code);
                                                        setIsOpen(false);
                                                    }}
                                                    className={`flex items-center justify-between w-full p-3.5 rounded-2xl transition-all ${selectedCurrency === r.code
                                                        ? "bg-secondary-50/80 text-secondary-700"
                                                        : "hover:bg-neutral-50 text-secondary-600 font-medium"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black transition-colors ${selectedCurrency === r.code ? "bg-secondary-100 text-secondary-600" : "bg-neutral-100 text-secondary-400"}`}>
                                                            {r.symbol}
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="font-bold text-base leading-tight">{r.code}</div>
                                                            <div className="text-base opacity-60 font-medium">{r.name}</div>
                                                        </div>
                                                    </div>
                                                    {selectedCurrency === r.code && (
                                                        <motion.div layoutId="check-c">
                                                            <Check className="w-4 h-4" />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-neutral-50/80 flex items-center justify-center gap-5 border-t border-neutral-100">
                                <div className="flex items-center gap-1.5 opacity-40">
                                    <Globe className="w-3 h-3" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Translation</span>
                                </div>
                                <div className="w-1 h-1 bg-neutral-300 rounded-full" />
                                <div className="flex items-center gap-1.5 opacity-40">
                                    <Coins className="w-3 h-3" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Rates</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style original="true">{`
        /* Aggressive Google UI Hiding */
        iframe.goog-te-banner-frame { display: none !important; }
        html:not(.with-fancybox) body:not([style*="position: fixed"]) { top: 0px !important; }
        .goog-te-menu-frame { display: none !important; }
        .goog-tooltip { display: none !important; }
        .goog-tooltip:hover { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
        .skiptranslate { display: none !important; }
        
        @media (max-width: 768px) {
          .fixed.bottom-24.right-6 {
            right: 0px;
            bottom: 0px;
            width: 100%;
            border-radius: 32px 32px 0 0;
            max-height: 80vh;
          }
        }
      `}</style>
        </>
    );
};

export default UnifiedSwitcher;
