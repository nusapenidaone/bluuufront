// API client for extras and categories

import { apiUrl } from './base';

/**
 * Fetch all extras with categories and images
 * @returns {Promise<Array>} Array of extras with ecategories and images
 */
export async function fetchExtras() {
    try {
        const response = await fetch(apiUrl('extras'));
        if (!response.ok) {
            throw new Error(`Failed to fetch extras: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching extras:', error);
        return [];
    }
}

/**
 * Fetch all extra categories
 * @returns {Promise<Array>} Array of extra categories
 */
export async function fetchExtraCategories() {
    try {
        const response = await fetch(apiUrl('extras-categories'));
        if (!response.ok) {
            throw new Error(`Failed to fetch extra categories: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching extra categories:', error);
        return [];
    }
}

/**
 * Fetch restaurant by ID
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export async function fetchRestaurants() {
    try {
        const response = await fetch(apiUrl('restaurants'));
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return [];
    }
}

export async function fetchRestaurant(id) {
    try {
        const response = await fetch(apiUrl(`restaurants/${id}`));
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        return null;
    }
}

/**
 * Fetch all routes with their associated categories
 * @returns {Promise<Array>} Array of routes with ecategories
 */
export async function fetchRoutes() {
    try {
        const response = await fetch(apiUrl('routes'));
        if (!response.ok) {
            throw new Error(`Failed to fetch routes: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching routes:', error);
        return [];
    }
}

export async function fetchPrivateRoutes() {
    try {
        const response = await fetch(apiUrl('routes/private'));
        if (!response.ok) {
            throw new Error(`Failed to fetch private routes: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching private routes:', error);
        return [];
    }
}

export async function fetchSharedRoutes() {
    try {
        const response = await fetch(apiUrl('routes/shared'));
        if (!response.ok) {
            throw new Error(`Failed to fetch shared routes: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching shared routes:', error);
        return [];
    }
}
