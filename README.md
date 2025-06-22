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
Backend/
  AgricultureKnowlegde/
    api/
      gsak.py                # Flask API for agricultural knowledge
    data/
      ICRISAT-District Level Data.csv
    requirements.txt         # Python dependencies
    vercel.json              # Vercel deployment config
    districts_output.txt
Frontend/
  app/
    chat/
      page.tsx               # Responsive AI chat interface
    profile/
      page.tsx               # User profile page
    ...
  store/
    authStore.ts             # Authentication state management
  tsconfig.json              # TypeScript config
```

## Getting Started

### Backend (AgricultureKnowlegde)

1. **Create a virtual environment:**
   ```sh
   python -m venv venv
   ```
2. **Activate the environment:**
   - Windows:
     ```sh
     .\venv\Scripts\activate
     ```
   - macOS/Linux:
     ```sh
     source venv/bin/activate
     ```
3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
4. **Run the API locally:**
   ```sh
   cd Backend/AgricultureKnowlegde/api
   python gsak.py
   ```
   The API will be available at `http://localhost:5000`.

### Frontend (Next.js)

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