import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
    fetchSharedTours as apiFetchSharedTours,
    fetchTransfers as apiFetchTransfers,
    fetchCovers as apiFetchCovers
} from "./api/shared";
import {
    fetchPrivateTours as apiFetchPrivateTours,
    fetchTourDetail as apiFetchTourDetail
} from "./api/private";

const ToursContext = createContext();

export const useTours = () => useContext(ToursContext);

export const ToursProvider = ({ children }) => {
    const [tours, setTours] = useState([]);
    const [sharedTours, setSharedTours] = useState([]);
    const [privateTours, setPrivateTours] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [covers, setCovers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                let privateFromTours = [];
                // Fetch shared tours (generic endpoint) and private tours (dedicated endpoint) in parallel
                const [toursRes, privateRes, transfersRes, coversRes] = await Promise.allSettled([
                    apiFetchSharedTours(),
                    apiFetchPrivateTours(),
                    apiFetchTransfers(),
                    apiFetchCovers(),
                ]);

                // Handle generic tours (for shared)
                if (toursRes.status === "fulfilled") {
                    const data = toursRes.value;
                    const uniqueData = Array.from(new Map(data.map(item => [String(item.id), item])).values());
                    setTours(uniqueData);

                    const shared = uniqueData.filter(t => Number(t.classes_id) === 9);
                    console.log("Shared boats (classes_id=9):", shared.length, shared);
                    setSharedTours(shared);
                    privateFromTours = uniqueData.filter(t => Number(t.classes_id) === 8);
                } else {
                    console.warn("Failed to fetch tours:", toursRes.reason);
                }

                // Handle private tours
                if (privateRes.status === "fulfilled") {
                    const privateData = privateRes.value;
                    const uniquePrivate = Array.from(new Map(privateData.map(item => [String(item.id), item])).values());
                    const mergedPrivate = uniquePrivate.map((item) => {
                        const fromTours = privateFromTours.find((tour) => String(tour.id) === String(item.id));
                        if (!fromTours) return item;
                        return {
                            ...fromTours,
                            ...item,
                            list: fromTours.list ?? item.list ?? null,
                            json: fromTours.json ?? item.json ?? null,
                            route: fromTours.route ?? item.route ?? null,
                        };
                    });
                    setPrivateTours(mergedPrivate);
                } else {
                    console.warn("Failed to fetch private tours:", privateRes.reason);
                    if (privateFromTours.length) {
                        setPrivateTours(privateFromTours);
                    }
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
            tours,
            sharedTours,
            privateTours,
            transfers,
            covers,
            loading,
            error,
            fetchTourDetail,
        }}>
            {children}
        </ToursContext.Provider>
    );
};
