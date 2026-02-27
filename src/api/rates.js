const API_BASE_URL = 'https://bluuu.tours/api/new';

export async function fetchRates() {
    try {
        const response = await fetch(`${API_BASE_URL}/rates`);
        if (!response.ok) {
            throw new Error(`Failed to fetch rates: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching rates:', error);
        return null;
    }
}
