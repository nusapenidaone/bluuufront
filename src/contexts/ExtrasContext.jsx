import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchExtras, fetchExtraCategories, fetchPrivateRoutes, fetchSharedRoutes } from '../api/extras';

const ExtrasContext = createContext();

function getPageNeeds() {
    const path = window.location.pathname;
    const isPrivate = path.includes('/private');
    const isShared = path.includes('/shared');
    return { isPrivate, isShared };
}

export function ExtrasProvider({ children }) {
    const [extras, setExtras] = useState([]);
    const [categories, setCategories] = useState([]);
    const [privateRoutes, setPrivateRoutes] = useState([]);
    const [sharedRoutes, setSharedRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            const { isPrivate, isShared } = getPageNeeds();

            // Only fetch what the current page actually needs
            if (!isPrivate && !isShared) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const tasks = [];
                if (isPrivate) {
                    tasks.push(
                        fetchExtras().then(d => setExtras(d)),
                        fetchExtraCategories().then(d => setCategories(d)),
                        fetchPrivateRoutes().then(d => setPrivateRoutes(d)),
                    );
                }
                if (isShared) {
                    tasks.push(
                        fetchSharedRoutes().then(d => setSharedRoutes(d)),
                    );
                }
                await Promise.all(tasks);
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
