🚀 Run the Currency Converter App with Your Own API Key

1. 📦 Install Dependencies
If you haven't already installed node, yarn, or expo, start by installing Expo CLI:

```npm install --global expo-cli```

Then, install the project dependencies:

```yarn install```

or

```npm install```

2. 🔑 Provide Your API Key
   
This app requires an API key to fetch exchange rates. Here's how to use your own:

Step 1: Create a .env file in the root directory

```FX_API_KEY=your_api_key_here```

Replace your_api_key_here with your actual key (for example, from fxratesapi.com).

Step 2: Configure app.config.js (or app.json)
If you're using app.config.js, make sure it exports the API key via extra:
```
import 'dotenv/config';

export default {
  expo: {
    name: "CurrencyConverter",
    slug: "currency-converter",
    extra: {
      FX_API_KEY: process.env.FX_API_KEY,
    },
  },
};
```
Make sure to install the dotenv package:

```npm install dotenv```

3. ▶️ Start the App

```npx expo start```

Expo DevTools will open in your browser, and you can run the app on a simulator or a physical device using the QR code.

📌 Notes
The app remembers the last used currencies and amounts.

It supports offline mode, using the last successfully fetched rates if there's no network connection.

You don’t need to re-enter the API key after setup — it stays in .env.

