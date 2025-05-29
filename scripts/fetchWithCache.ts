import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export const fetchRatesWithCache = async (base: string, apiKey: string) => {
    const cacheKey = `rates_${base}`;
    const now = Date.now();

    try {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
            const { timestamp, data } = JSON.parse(cachedData);

            if (now - timestamp < CACHE_TTL) {
                return data;
            }
        }

        const response = await fetch(
            `https://api.fxratesapi.com/latest?api_key=${apiKey}&base=${base}`
        );
        const json = await response.json();

        await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify({ timestamp: now, data: json })
        );

        return json;
        
    } catch (error) {
        console.error('Ошибка при загрузке курсов:', error);

        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
            const { data } = JSON.parse(cachedData);
            return data;
        } else { 
            throw error; 
        }
    }
};
