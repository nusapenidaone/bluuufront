import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
    fetchSharedTours as apiFetchSharedTours,
    fetchTransfers as apiFetchTransfers,
    fetchCovers as apiFetchCovers,
    fetchFaq as apiFetchFaq,
    fetchGallery as apiFetchGallery,
} from "./api/shared";
import {
    fetchPrivateTours as apiFetchPrivateTours,
    fetchTourDetail as apiFetchTourDetail
} from "./api/private";

const ToursContext = createContext();

export const useTours = () => useContext(ToursContext);

export const ToursProvider = ({ children }) => {
    const [sharedTours, setSharedTours] = useState([]);
    const [privateTours, setPrivateTours] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [covers, setCovers] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [sharedRes, privateRes, transfersRes, coversRes, faqRes, galleryRes] = await Promise.allSettled([
                    apiFetchSharedTours(),
                    apiFetchPrivateTours(),
                    apiFetchTransfers(),
                    apiFetchCovers(),
                    apiFetchFaq(),
                    apiFetchGallery(),
                ]);

                // Handle shared tours (classes_id=9)
                if (sharedRes.status === "fulfilled") {
                    const data = sharedRes.value;
                    const unique = Array.from(new Map(data.map(item => [String(item.id), item])).values());
                    setSharedTours(unique);
                } else {
                    console.warn("Failed to fetch shared tours:", sharedRes.reason);
                }

                // Handle private tours (classes_id=8)
                if (privateRes.status === "fulfilled") {
                    const data = privateRes.value;
                    const unique = Array.from(new Map(data.map(item => [String(item.id), item])).values());
                    setPrivateTours(unique);
                } else {
                    console.warn("Failed to fetch private tours:", privateRes.reason);
                }

                // Handle transfers
                if (transfersRes.status === "fulfilled") {
                    setTransfers(transfersRes.value);
                } else {
                    console.warn("Failed to fetch transfers:", transfersRes.reason);
                }

                // Handle covers
                if (coversRes.status === "fulfilled") {
                    setCovers(coversRes.value);
                } else {
                    console.warn("Failed to fetch covers:", coversRes.reason);
                }

                // Handle FAQs
                if (faqRes.status === "fulfilled") {
                    setFaqs(faqRes.value);
                } else {
                    console.warn("Failed to fetch FAQs:", faqRes.reason);
                }

                // Handle Gallery
                if (galleryRes.status === "fulfilled") {
                    setGallery(galleryRes.value);
                } else {
                    console.warn("Failed to fetch gallery:", galleryRes.reason);
                }

            } catch (err) {
                console.error("Error fetching tours:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
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
            transfers,
            covers,
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
