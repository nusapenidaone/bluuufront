import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchExtras, fetchExtraCategories, fetchRoutes } from '../api/extras';

const ExtrasContext = createContext();

export function ExtrasProvider({ children }) {
    const [extras, setExtras] = useState([]);
    const [categories, setCategories] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [extrasData, categoriesData, routesData] = await Promise.all([
                    fetchExtras(),
                    fetchExtraCategories(),
                    fetchRoutes()
                ]);
                setExtras(extrasData);
                setCategories(categoriesData);
                setRoutes(routesData);
                setError(null);
            } catch (err) {
                console.error('Error loading extras data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const value = {
        extras,
        categories,
        routes,
        loading,
        error,
    };

    return (
        <ExtrasContext.Provider value={value}>
            {children}
        </ExtrasContext.Provider>
    );
}

export function useExtras() {
    const context = useContext(ExtrasContext);
    if (!context) {
        throw new Error('useExtras must be used within an ExtrasProvider');
    }
    return context;
}
