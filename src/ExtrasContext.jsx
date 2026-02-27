import React, { createContext, useContext, useState, useEffect } from "react";

const ExtrasContext = createContext();

export const useExtras = () => useContext(ExtrasContext);

export const ExtrasProvider = ({ children }) => {
    const [extras, setExtras] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 1000) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if (retries > 0 && (response.status >= 500 || response.status === 429)) {
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (err) {
            if (retries > 0) {
                await new Promise(r => setTimeout(r, backoff));
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            throw err;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch for all endpoints using retry helper
                const [extrasRes, transfersRes, categoriesRes, routesRes] = await Promise.allSettled([
                    fetchWithRetry("https://bluuu.tours/api/new/extras"),
                    fetchWithRetry("https://bluuu.tours/api/new/transfers"),
                    fetchWithRetry("https://bluuu.tours/api/new/extras-categories"),
                    fetchWithRetry("https://bluuu.tours/api/new/routes")
                ]);

                // Handle Extras
                if (extrasRes.status === "fulfilled" && extrasRes.value.ok) {
                    const extrasData = await extrasRes.value.json();
                    const uniqueExtras = Array.from(new Map(extrasData.map(item => [String(item.id), item])).values());
                    setExtras(uniqueExtras);
                } else {
                    console.warn("Failed to fetch extras:", extrasRes.reason || extrasRes.value?.statusText);
                }

                // Handle Transfers
                if (transfersRes.status === "fulfilled" && transfersRes.value.ok) {
                    const transfersData = await transfersRes.value.json();
                    setTransfers(transfersData);
                } else {
                    console.warn("Failed to fetch transfers:", transfersRes.reason || transfersRes.value?.statusText);
                }

                // Handle Categories
                if (categoriesRes.status === "fulfilled" && categoriesRes.value.ok) {
                    const categoriesData = await categoriesRes.value.json();
                    setCategories(categoriesData);
                } else {
                    console.warn("Failed to fetch categories:", categoriesRes.reason || categoriesRes.value?.statusText);
                }

                // Handle Routes
                if (routesRes.status === "fulfilled" && routesRes.value.ok) {
                    const routesData = await routesRes.value.json();
                    setRoutes(routesData);
                } else {
                    console.warn("Failed to fetch routes:", routesRes.reason || routesRes.value?.statusText);
                }

            } catch (err) {
                console.error("Error fetching extras/transfers/categories:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper to get logic by ID if needed
    const getExtrasByCategoryId = (categoryId) => {
        if (!categoryId) return [];
        // Assuming the API returns items with a 'category_id' or similar. 
        // If the structure is strictly categories, this might need adjustment.
        // For now, returning all or filtering if property exists.
        return extras.filter(e => e.category_id === Number(categoryId) || e.additional_id === Number(categoryId));
    };

    const getTransfersByMeetingId = (meetingId) => {
        if (!meetingId) return [];
        return transfers.filter(t => t.meeting_id === Number(meetingId) || t.area_id === Number(meetingId));
    };

    return (
        <ExtrasContext.Provider value={{
            extras,
            transfers,
            categories,
            routes,
            loading,
            error,
            getExtrasByCategoryId,
            getTransfersByMeetingId
        }}>
            {children}
        </ExtrasContext.Provider>
    );
};
