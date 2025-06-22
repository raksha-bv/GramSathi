# GramSathi

<div align="center">
  <img src="https://github.com/raksha-bv/GramSathi/blob/main/Showcase/logo_101.png" alt="GramSathi Logo" width="200" height="200">
  <h3>Empowering Rural India with AI</h3>
</div>

---

GramSathi is a modern AI-powered platform designed to assist rural communities, especially farmers, with agricultural advice, weather updates, government schemes, and more. It features a responsive web interface and a robust backend API for agricultural knowledge.

![GramSathi Dashboard](https://github.com/raksha-bv/GramSathi/blob/main/Showcase/Hero.png)

> **About the Project**
>
> This project is an AI agent built on Sarvam AI. The agent can answer queries about weather, crops, farming, pregnancy, government schemes, market prices of crops, and more. Many answers are based on real-time data, which the AI fetches by using provided tools to interact with the real world.

## Features

### 🤖 **Multilingual Chatbot**
Select your preferred language for chatbot responses. The chatbot can act as an agent, fetching real-time data (such as weather, crop prices, and government schemes) and providing actionable advice. Includes speech-to-text functionality for seamless voice-based chatting.

![Chat Interface](https://github.com/raksha-bv/GramSathi/blob/main/Showcase/Chatbot.png)

### 🎙️ **Voice Assistant**
A multilingual, conversational agent that interacts with users via voice, just like a phone call. It can perform actions such as scheduling reminder calls (e.g., pregnancy check-up reminders), fetching real-time crop market data and advising on sales, and providing weather-based farming guidance.

![Voice Assistant](https://github.com/raksha-bv/GramSathi/blob/main/Showcase/Assistant.png)

### 📊 **Personalized Dashboards**
Users receive dashboards tailored to their profile and needs. For example, farmers see crop price trends and receive advice based on their crops, while all users see eligibility and recommendations for relevant government schemes.

![Personalized Dashboard](https://github.com/raksha-bv/GramSathi/blob/main/Showcase/Dashboard.png)

### 📱 **Simple Sign-In**
Easy and accessible sign-in using just a phone number, designed for rural populations with limited technical experience.

### 🛠️ **Agentic Tools**
The AI agent (powered by Sarvam AI) is enhanced with custom tools for real-time data gathering and scheduling phone calls, enabling it to interact with the real world and provide up-to-date, actionable support.

![AI Tools Architecture](https://github.com/raksha-bv/GramSathi/blob/main/Showcase/Features.png)

### 🧠 **Advanced AI Models**
Utilizes Sarvam AI's suite of models, including multilingual text generation (Sarvam M), text-to-speech, and speech-to-text, for a rich and accessible user experience.

### 🎨 **Beautiful Unified Frontend**
A modern, responsive web application that brings all features together in one place, making advanced AI accessible and easy to use for everyone.



## Project Structure


```
GramSathi/
│
├── README.md                # Project documentation and setup instructions
├── LICENSE                  # Project license (MIT)
├── assets/                  # Images, logos, and visual assets
│   ├── logo.png
│   ├── dashboard-preview.png
│   ├── chat-interface.png
│   └── ...
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

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Python, Flask, Pandas, NumPy, CORS
- **AI/ML**: Sarvam AI (Multilingual Models, TTS, STT)
- **Communication**: Twilio (Voice calls, SMS)
- **Deployment**: Vercel
- **Database**: [Add your database technology]

## Screenshots

### Mobile Experience
<div align="center">
  <img src="https://github.com/raksha-bv/GramSathi/blob/main/Showcase/Mobile.png" alt="Mobile Chat" width="300" height="500">
  <img src="https://github.com/raksha-bv/GramSathi/blob/main/Showcase/Mobile_03.png" alt="Mobile Dashboard" width="300" height="500">
</div>


## API Documentation

For detailed API documentation, please refer to the individual backend service README files.


## License

This project is licensed under the MIT License.

---

<div align="center">
  <img src="./assets/footer-banner.png" alt="GramSathi - Empowering Rural India" width="100%">
  
  **GramSathi** — Empowering Rural India with AI

</div>
