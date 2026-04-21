import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
    fetchSharedTours as apiFetchSharedTours,
    fetchPrivateTransfers as apiFetchPrivateTransfers,
    fetchSharedTransfers as apiFetchSharedTransfers,
    fetchPrivateCovers as apiFetchPrivateCovers,
    fetchSharedCovers as apiFetchSharedCovers,
    fetchFaq as apiFetchFaq,
    fetchGallery as apiFetchGallery,
} from "./api/shared";
import {
    fetchPrivateTours as apiFetchPrivateTours,
    fetchTourDetail as apiFetchTourDetail
} from "./api/private";

const ToursContext = createContext();

export const useTours = () => useContext(ToursContext);

// Detect which data is needed for the current page
function getPageNeeds() {
    const path = typeof window !== "undefined" ? window.location.pathname.replace(/\/+$/, "") || "/" : "/";
    const isHome = path === "/";
    const isPrivate = path === "/private-tour-to-nusa-penida";
    const isShared = path === "/shared-tour-to-nusa-penida";
    const isFaq = path === "/faq";
    const isGallery = path === "/gallery";
    return {
        sharedTours:      isHome || isShared,
        privateTours:     isHome || isPrivate || isGallery,
        privateTransfers: isPrivate,
        sharedTransfers:  isShared,
        privateCovers:    isPrivate,
        sharedCovers:     isShared,
        faqs:             isHome || isPrivate || isShared || isFaq,
        gallery:          isHome || isGallery,
    };
}

export const ToursProvider = ({ children }) => {
    const [sharedTours, setSharedTours] = useState([]);
    const [privateTours, setPrivateTours] = useState([]);
    const [privateTransfers, setPrivateTransfers] = useState([]);
    const [sharedTransfers, setSharedTransfers] = useState([]);
    const [privateCovers, setPrivateCovers] = useState([]);
    const [sharedCovers, setSharedCovers] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const needs = getPageNeeds();

        // Build fetch list — only what this page actually needs
        const tasks = [];
        if (needs.sharedTours)      tasks.push({ key: "sharedTours",      fn: apiFetchSharedTours });
        if (needs.privateTours)     tasks.push({ key: "privateTours",     fn: apiFetchPrivateTours });
        if (needs.privateTransfers) tasks.push({ key: "privateTransfers", fn: apiFetchPrivateTransfers });
        if (needs.sharedTransfers)  tasks.push({ key: "sharedTransfers",  fn: apiFetchSharedTransfers });
        if (needs.privateCovers)    tasks.push({ key: "privateCovers",    fn: apiFetchPrivateCovers });
        if (needs.sharedCovers)     tasks.push({ key: "sharedCovers",     fn: apiFetchSharedCovers });
        if (needs.faqs)             tasks.push({ key: "faqs",             fn: apiFetchFaq });
        if (needs.gallery)          tasks.push({ key: "gallery",          fn: apiFetchGallery });

        if (tasks.length === 0) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const results = await Promise.allSettled(tasks.map(t => t.fn()));
                results.forEach((res, i) => {
                    const key = tasks[i].key;
                    if (res.status !== "fulfilled") {
                        console.warn(`Failed to fetch ${key}:`, res.reason);
                        return;
                    }
                    const data = res.value;
                    if (key === "sharedTours") {
                        setSharedTours(Array.from(new Map(data.map(item => [String(item.id), item])).values()));
                    } else if (key === "privateTours") {
                        setPrivateTours(Array.from(new Map(data.map(item => [String(item.id), item])).values()));
                    } else if (key === "privateTransfers") {
                        setPrivateTransfers(data);
                    } else if (key === "sharedTransfers") {
                        setSharedTransfers(data);
                    } else if (key === "privateCovers") {
                        setPrivateCovers(data);
                    } else if (key === "sharedCovers") {
                        setSharedCovers(data);
                    } else if (key === "faqs") {
                        setFaqs(data);
                    } else if (key === "gallery") {
                        setGallery(data);
                    }
                });
            } catch (err) {
                console.error("Error fetching tours:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch tour detail with pricing
    const fetchTourDetail = useCallback(async (tourSlug) => {
        try {
            return await apiFetchTourDetail(tourSlug);
        } catch (err) {
            console.error("Error fetching tour detail:", err);
            return null;
        }
    }, []);

    return (
        <ToursContext.Provider value={{
            sharedTours,
            privateTours,
            privateTransfers,
            sharedTransfers,
            privateCovers,
            sharedCovers,
            faqs,
            gallery,
            loading,
            error,
            fetchTourDetail,
        }}>
            {children}
        </ToursContext.Provider>
    );
};
