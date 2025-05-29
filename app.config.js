import 'dotenv/config';

export default {
    expo: {
        name: 'CurrencyConverter',
        slug: 'currency-converter',
        version: '1.0.0',
        extra: {
            FX_API_KEY: process.env.FX_API_KEY,
        },
    },
};
