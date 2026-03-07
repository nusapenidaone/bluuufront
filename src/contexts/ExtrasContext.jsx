import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchExtras, fetchExtraCategories, fetchPrivateRoutes, fetchSharedRoutes } from '../api/extras';

const ExtrasContext = createContext();

export function ExtrasProvider({ children }) {
    const [extras, setExtras] = useState([]);
    const [categories, setCategories] = useState([]);
    const [privateRoutes, setPrivateRoutes] = useState([]);
    const [sharedRoutes, setSharedRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [extrasData, categoriesData, privateRoutesData, sharedRoutesData] = await Promise.all([
                    fetchExtras(),
                    fetchExtraCategories(),
                    fetchPrivateRoutes(),
                    fetchSharedRoutes(),
                ]);
                setExtras(extrasData);
                setCategories(categoriesData);
                setPrivateRoutes(privateRoutesData);
                setSharedRoutes(sharedRoutesData);
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
        privateRoutes,
        sharedRoutes,
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
