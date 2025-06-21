'use client';

import React, { useEffect, useState } from "react";
import WeatherAlert from "../../components/WeatherAlert";
import VoiceInterface from "../../components/VoiceInterface";
import { ProcessedWeatherData } from "../../types/weather";

const DashboardPage: React.FC = () => {
  const [weatherData, setWeatherData] = useState<ProcessedWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch("/api/weather");
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🌾 AI Farmer Assistant Dashboard</h1>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chatbot Section */}
          <div className="lg:col-span-2">
            <VoiceInterface />
          </div>
          
          {/* Weather Alerts */}
          <div className="bg-white rounded-lg shadow-md">
            <WeatherAlert />
          </div>
          
          {/* Placeholder for future components */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📈 Market Prices</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">🏛️ Government Schemes</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
