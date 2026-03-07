import { apiUrl } from './base';

export async function fetchRates() {
    try {
        const response = await fetch(apiUrl('rates'));
        if (!response.ok) {
            throw new Error(`Failed to fetch rates: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching rates:', error);
        return null;
    }
}
