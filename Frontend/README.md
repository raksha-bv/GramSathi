# AI Farmer Assistant

## Overview
The AI Farmer Assistant is a voice-first AI application designed to provide farmers with essential information in their local language. The assistant proactively communicates daily weather alerts, market price updates, and government scheme information using various free APIs.

## Features
- **Daily Weather Alerts**: Fetches real-time weather data from the Indian Meteorological Department (IMD) API.
- **Market Price Updates**: Retrieves current market prices from the AGMARKNET API.
- **Government Scheme Information**: Provides information on government schemes using the National Portal API.
- **Voice Interaction**: Allows farmers to interact with the assistant using voice commands.
- **Local Language Support**: Translates information into the local language of the user.

## APIs Used
- **Weather**: IMD (Indian Meteorological Department) - Free public API for weather data.
- **Market Prices**: AGMARKNET - Free agricultural price data.
- **Government Schemes**: National Portal API - Free access to government scheme information.
- **Agriculture Knowledge**: KVK, ICAR databases - Free agricultural knowledge resources.
- **Health Data**: NRHM APIs - Free maternal and child health data.

## Setup Instructions

1. **Create an API Key**: 
   - Visit the Sarvam AI dashboard and create a new API key. Keep this key secure as it will be needed for authentication.

2. **Set Up Your Environment**:
   - Export your API key as an environment variable:
     - For macOS / Linux:
       ```
       export SARVAM_API_KEY="your_api_key_here"
       ```
     - For Windows:
       ```
       set SARVAM_API_KEY="your_api_key_here"
       ```

3. **Install the SDK**:
   - Choose your preferred language and install the Sarvam SDK:
     - For Python:
       ```
       pip install sarvamai
       ```
     - For JavaScript:
       ```
       npm install sarvamai
       ```

4. **Make Your First API Call**:
   - Example in Python:
     ```python
     from sarvamai import SarvamAI
     client = SarvamAI(api_subscription_key="YOUR_API_KEY")
     response = client.text.translate(input="Hi, My Name is Vinayak.", source_language_code="auto", target_language_code="gu-IN", speaker_gender="Male")
     print(response)
     ```
   - Example in JavaScript:
     ```javascript
     import { SarvamAIClient } from "sarvamai";
     const API_KEY = "YOUR_API_KEY";
     const client = new SarvamAIClient({ apiSubscriptionKey: API_KEY });
     const response = await client.text.translate({ input: "Hello, how are you?", target_language_code: "hi-IN" });
     console.log(response);
     ```

## Directory Structure
```
ai-farmer-assistant
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── weather
│   │   │   │   └── route.ts
│   │   │   ├── market-prices
│   │   │   │   └── route.ts
│   │   │   ├── schemes
│   │   │   │   └── route.ts
│   │   │   ├── sarvam
│   │   │   │   ├── translate
│   │   │   │   │   └── route.ts
│   │   │   │   ├── text-to-speech
│   │   │   │   │   └── route.ts
│   │   │   │   └── speech-to-text
│   │   │   │       └── route.ts
│   │   │   └── notifications
│   │   │       └── route.ts
│   │   ├── dashboard
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── VoiceInterface.tsx
│   │   ├── WeatherAlert.tsx
│   │   ├── MarketPrices.tsx
│   │   └── SchemeInfo.tsx
│   ├── lib
│   │   ├── sarvam-client.ts
│   │   ├── weather-api.ts
│   │   ├── market-api.ts
│   │   └── schemes-api.ts
│   ├── types
│   │   ├── weather.ts
│   │   ├── market.ts
│   │   └── schemes.ts
│   └── utils
│       ├── notifications.ts
│       └── language-detection.ts
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── .env.local
└── README.md
```

## Usage
To run the application, use the following command:
```
npm run dev
```
This will start the development server, and you can access the application at `http://localhost:3000`.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.