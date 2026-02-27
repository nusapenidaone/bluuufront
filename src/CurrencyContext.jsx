import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchRates as apiFetchRates } from "./api/rates";

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

const DEFAULT_RATES = [
    { code: "IDR", name: "Indonesian rupiah", rate: "1.00000000", symbol: "Rp" },
    { code: "USD", name: "United States dollar", rate: "0.00005957", symbol: "$" },
    { code: "AUD", name: "Australian dollar", rate: "0.00008453", symbol: "$" },
    { code: "EUR", name: "Euro", rate: "0.00004978", symbol: "€" },
    { code: "SGD", name: "Singapore dollar", rate: "0.00007530", symbol: "$" },
    { code: "MYR", name: "Malaysian ringgit", rate: "0.00023398", symbol: "RM" },
    { code: "THB", name: "Thai baht", rate: "0.00186149", symbol: "฿" },
    { code: "VND", name: "Vietnamese dong", rate: "1.54637944", symbol: "₫" },
    { code: "CNY", name: "Chinese yuan", rate: "0.00041388", symbol: "¥" },
    { code: "KRW", name: "South Korean won", rate: "0.08526650", symbol: "₩" },
    { code: "JPY", name: "Japanese yen", rate: "0.00912441", symbol: "¥" },
    { code: "INR", name: "Indian rupee", rate: "0.00546727", symbol: "₹" }
];

const SYMBOLS = {
    IDR: "Rp", USD: "$", AUD: "$", EUR: "€", SGD: "$", MYR: "RM",
    THB: "฿", VND: "₫", CNY: "¥", KRW: "₩", JPY: "¥", INR: "₹"
};

export const CurrencyProvider = ({ children }) => {
    const [rates, setRates] = useState(DEFAULT_RATES);
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return localStorage.getItem("selectedCurrency") || "USD";
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const apiData = await apiFetchRates();

                if (apiData && Array.isArray(apiData)) {
                    // 1. Map API data by code for easy lookup
                    const apiRatesMap = {};
                    apiData.forEach(item => {
                        if (item.code) {
                            apiRatesMap[item.code.toUpperCase()] = parseFloat(item.rate);
                        }
                    });

                    // 2. Identify the IDR rate from API (it's usually relative to USD or EUR)
                    // If IDR is missing from API, we'll fall back to default IDR rate or 1.0
                    const idrApiRate = apiRatesMap["IDR"] || 1;

                    // 3. Normalize all rates so IDR = 1.0
                    // Our logic expects: amount_in_currency = amount_in_idr * target_rate
                    // So target_rate (e.g., USD) must be: API_USD_rate / API_IDR_rate
                    setRates(prevRates => prevRates.map(r => {
                        const code = r.code.toUpperCase();
                        if (apiRatesMap[code] !== undefined) {
                            return {
                                ...r,
                                rate: (apiRatesMap[code] / idrApiRate).toString()
                            };
                        }
                        return r;
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch rates, using defaults:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
    }, []);

    useEffect(() => {
        localStorage.setItem("selectedCurrency", selectedCurrency);
    }, [selectedCurrency]);

    const currency = rates.find(r => r.code === selectedCurrency) || rates[0];

    const convert = (amount, fromCurrency = "IDR") => {
        if (!amount) return 0;

        // First convert to IDR
        let amountIdr = amount;
        if (fromCurrency !== "IDR") {
            const fromRate = parseFloat(rates.find(r => r.code === fromCurrency)?.rate || 1);
            amountIdr = amount / fromRate;
        }

        // Then convert to target
        const targetRate = parseFloat(currency.rate);
        return amountIdr * targetRate;
    };

    const formatPrice = (amount, options = {}) => {
        const {
            fromCurrency = "IDR",
            includeSymbol = true,
            decimals = selectedCurrency.toUpperCase() === "IDR" ? 0 : 2,
            short = false
        } = options;

        const value = convert(amount, fromCurrency);

        if (short && selectedCurrency === "IDR" && value >= 1000000) {
            const shortValue = (value / 1000000).toFixed(2).replace(/\.00$/, "");
            return includeSymbol ? `Rp ${shortValue}M` : `${shortValue}M`;
        }

        let formatted = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(value);

        if (includeSymbol) {
            const symbol = currency.symbol;
            return selectedCurrency === "IDR"
                ? `${symbol} ${formatted}`
                : `${symbol}${formatted}`;
        }
        return formatted;
    };



    return (
        <CurrencyContext.Provider value={{
            rates,
            selectedCurrency,
            setSelectedCurrency,
            currency,
            convert,
            formatPrice,
            loading
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};
