'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import WeatherAlert from "../../components/WeatherAlert";
import MarketPrices from "../../components/MarketPrices";
import { ProcessedWeatherData } from "../../types/weather";

const DashboardPage: React.FC = () => {
  const [weatherData, setWeatherData] = useState<ProcessedWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🌾</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GramSathi</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">📱 {user?.phoneNumber}</p>
              <p className="text-gray-600">💼 {user?.occupation}</p>
              <p className="text-gray-600">🏘️ {user?.village}, {user?.district}, {user?.state}</p>
              {user?.occupation === 'Farmer' && user?.cropsGrown && user.cropsGrown.length > 0 && (
                <p className="text-gray-600">🌾 Growing: {user.cropsGrown.join(', ')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Weather Alerts */}
          <div className="bg-white rounded-lg shadow-lg">
            <WeatherAlert />
          </div>
          
          {/* Market Prices - Show for farmers or span full width if only weather + market */}
          <div className={`bg-white rounded-lg shadow-lg ${
            user?.occupation === 'Farmer' && user?.cropsGrown && user.cropsGrown.length > 0 
              ? 'md:col-span-2' 
              : ''
          }`}>
            <MarketPrices 
              cropsGrown={user?.occupation === 'Farmer' ? user?.cropsGrown : []}
              district={user?.district}
              state={user?.state}
            />
          </div>

          {/* Government Schemes */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🏛️</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Govt. Schemes</h2>
            </div>
            <p className="text-gray-600 text-sm">Explore available government benefits</p>
            <div className="mt-4 p-4 bg-orange-50 rounded-lg">
              <p className="text-orange-800 text-sm">Coming soon...</p>
            </div>
          </div>

          {/* Community */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Community</h2>
            </div>
            <p className="text-gray-600 text-sm">Connect with fellow villagers</p>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-purple-800 text-sm">Coming soon...</p>
            </div>
          </div>

          {/* Agricultural Tips */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-lg">💡</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Farming Tips</h2>
            </div>
            <p className="text-gray-600 text-sm">Get expert agricultural advice</p>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 text-sm">Coming soon...</p>
            </div>
          </div>

          {/* Disease Alert */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-lg">⚠️</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Disease Alerts</h2>
            </div>
            <p className="text-gray-600 text-sm">Early warning for crop diseases</p>
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-red-800 text-sm">Coming soon...</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="bg-white p-4 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-2xl mb-2">📞</div>
              <p className="text-sm font-medium text-gray-700">Emergency Call</p>
            </button>
            <button className="bg-white p-4 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-2xl mb-2">📍</div>
              <p className="text-sm font-medium text-gray-700">Nearby Services</p>
            </button>
            <button className="bg-white p-4 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-medium text-gray-700">My Reports</p>
            </button>
            <button className="bg-white p-4 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-2xl mb-2">⚙️</div>
              <p className="text-sm font-medium text-gray-700">Settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
