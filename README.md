# GramSathi

GramSathi is a modern AI-powered platform designed to assist rural communities, especially farmers, with agricultural advice, weather updates, government schemes, and more. It features a responsive web interface and a robust backend API for agricultural knowledge.

> **About the Project**
>
> This project is an AI agent built on Sarvam AI. The agent can answer queries about weather, crops, farming, pregnancy, government schemes, market prices of crops, and more. Many answers are based on real-time data, which the AI fetches by using provided tools to interact with the real world.

## Features

- **AI Chatbot**: Get instant answers to farming, weather, and government scheme queries in multiple Indian languages.
- **Voice Input**: Use speech-to-text for hands-free interaction.
- **Weather & Market Data**: Real-time weather and market price information.
- **Personalized Profile**: User profiles with eligibility, occupation, and location details.
- **Agricultural Knowledge API**: Backend API for crop advice, trends, calendars, and more.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

## Project Structure

```
GramSathi/
│
├── README.md                # Project documentation and setup instructions
├── LICENSE                  # Project license (MIT)
│
├── Backend/
│   ├── AgricultureKnowlegde/
│   │   ├── api/
│   │   │   └── gsak.py      # Flask API for agricultural knowledge, crop advice, trends, and more
│   │   ├── data/
│   │   │   └── ICRISAT-District Level Data.csv  # District-level agricultural data
│   │   ├── requirements.txt # Python dependencies for the backend API
│   │   ├── vercel.json      # Vercel deployment configuration
│   │   └── districts_output.txt # Output or processed data about districts
│   │   # Gives insights based on historic data about the crops
│   │
│   ├── MarketAPI/
│   │   └── ...              # Web scraping tools for AI to fetch real-time crop prices
│   │   # Enables the AI to get real-time prices of crops in the market, helping it make informed decisions and advise people whether to sell, stock, or where to sell.
│   │
│   ├── Twilio/
│   │   └── ...              # Tool for AI to trigger calls (e.g., reminders)
│   │   # Gives the AI the power to trigger calls, which can act as reminders for users.
│   │
│   ├── BackendDB/
│   │   └── ...              # Database logic and scripts
│   │   # Used for storing the data from the frontend about user info
│
├── Frontend/
│   ├── app/
│   │   ├── chat/
│   │   │   └── page.tsx     # Responsive AI chat interface for user queries
│   │   ├── profile/
│   │   │   └── page.tsx     # User profile page
│   │   └── ...              # Other Next.js pages and routes
│   ├── store/
│   │   └── authStore.ts     # State management for user authentication
│   ├── tsconfig.json        # TypeScript configuration for the frontend
│   └── ...                  # Other config, assets, and utility files
│
└── ... (other root-level files, configs, or documentation)
```

## Getting Started

To run the GramSathi project locally, you will need to start each backend service individually and then run the frontend. Follow the steps below for a smooth setup:

### Running Each Backend Service

Each backend module (AgricultureKnowlegde, MarketAPI, Twilio, BackendDB) is a separate service. Navigate into each directory under `Backend/` and follow the instructions provided in the respective `README.md` file to install dependencies and run the server for that service.

> **Note:** Each backend directory contains its own `README.md` with detailed setup and run instructions. Please refer to those files for the most accurate and up-to-date steps for each service.

### Frontend Setup (Next.js)

1. **Install dependencies:**
   ```sh
   cd Frontend
   npm install
   ```
2. **Run the development server:**
   ```sh
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

You can now test and use the full GramSathi platform locally. Make sure all backend services are running before using the frontend for complete functionality.

## Deployment

- **Backend**: Deploy the `AgricultureKnowlegde` folder to Vercel using the provided `vercel.json`.
- **Frontend**: Deploy the Next.js app to Vercel or your preferred platform.

## API Endpoints

- `GET /api/health` — Health check
- `GET /api/crops` — List supported crops
- `GET /api/districts` — List available districts
- `POST /api/advice` — Get agricultural advice
- `POST /api/trends` — Get crop trends
- `POST /api/calendar` — Get crop calendar
- `POST /api/similar-districts` — Find similar districts
- `GET /api/best-practices/<crop>` — Get best practices
- `GET /api/pest-control/<crop>` — Get pest control info
- `GET /api/dataset-info` — Get dataset information

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Python, Flask, Pandas, NumPy, CORS
- **Deployment**: Vercel

## License

This project is licensed under the MIT License.

---

**GramSathi** — Empowering Rural India with AI