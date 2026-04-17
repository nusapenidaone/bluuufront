import React, { useState, useEffect } from "react";
import { Globe, Coins, Check, ArrowRight } from "lucide-react";
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

const STORAGE_KEY = "bluuu_prefs_set";

const WelcomeModal = () => {
    const { rates, selectedCurrency, setSelectedCurrency } = useCurrency();
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(1);
    const [lang, setLang] = useState("en");
    const [pendingReload, setPendingReload] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            setVisible(true);
        }
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(";").shift();
        };
        const googTrans = getCookie("googtrans");
        if (googTrans) {
            const l = googTrans.split("/").pop();
            if (l) setLang(l);
        }
    }, []);

    const applyLanguage = (code) => {
        const cookieValue = code === "en" ? "" : `/en/${code}`;
        document.cookie = `googtrans=${cookieValue}; path=/`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname}`;
        setLang(code);
        if (code !== "en") setPendingReload(true);
    };

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, "1");
        setVisible(false);
        if (pendingReload) window.location.reload();
    };

    if (!visible) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10010] anim-fade-in" />

            {/* Modal */}
            <div className="fixed inset-0 z-[10011] flex items-center justify-center p-4 anim-slide-up">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <img
                                src="https://bluuu.tours/themes/bluuu/assets/img/logo.svg"
                                alt="Bluuu"
                                className="h-6 w-auto"
                            />
                        </div>
                        <h2 className="text-xl font-bold text-secondary-900 leading-tight">
                            {step === 1 ? "Choose your language" : "Choose your currency"}
                        </h2>
                        <p className="mt-1 text-sm text-secondary-400">
                            {step === 1
                                ? "We'll translate the site for you automatically."
                                : "Prices will be shown in your selected currency."}
                        </p>

                        {/* Step indicator */}
                        <div className="flex items-center gap-2 mt-4">
                            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-primary-500" : "bg-neutral-200"}`} />
                            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-primary-500" : "bg-neutral-200"}`} />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-none">
                        {step === 1 ? (
                            <div className="grid grid-cols-1 gap-1">
                                {LANGUAGES.map((l) => (
                                    <button
                                        key={l.code}
                                        onClick={() => applyLanguage(l.code)}
                                        className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl transition-all text-left ${lang === l.code
                                            ? "bg-primary-50 text-primary-700"
                                            : "hover:bg-neutral-50 text-secondary-700"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{l.flag}</span>
                                            <span className="font-semibold text-sm">{l.name}</span>
                                        </div>
                                        {lang === l.code && <Check className="w-4 h-4 text-primary-500" />}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-1">
                                {rates.map((r) => (
                                    <button
                                        key={r.code}
                                        onClick={() => setSelectedCurrency(r.code)}
                                        className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl transition-all text-left ${selectedCurrency === r.code
                                            ? "bg-primary-50 text-primary-700"
                                            : "hover:bg-neutral-50 text-secondary-700"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold ${selectedCurrency === r.code ? "bg-primary-100 text-primary-600" : "bg-neutral-100 text-secondary-400"}`}>
                                                {r.symbol}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm leading-tight">{r.code}</div>
                                                <div className="text-xs text-secondary-400">{r.name}</div>
                                            </div>
                                        </div>
                                        {selectedCurrency === r.code && <Check className="w-4 h-4 text-primary-500" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-4 border-t border-neutral-100 bg-neutral-50/60">
                        {step === 1 ? (
                            <button
                                onClick={() => setStep(2)}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-secondary-900 text-white text-sm font-bold rounded-2xl hover:bg-secondary-800 transition-colors"
                            >
                                Next: Currency <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-none px-4 py-3 text-sm font-semibold text-secondary-500 hover:text-secondary-700 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 text-white text-sm font-bold rounded-2xl"
                                >
                                    <Check className="w-4 h-4" /> Save preferences
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default WelcomeModal;
