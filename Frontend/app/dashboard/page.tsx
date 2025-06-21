"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { useSchemeStore } from "../../store/schemeStore";
import WeatherAlert from "../../components/WeatherAlert";
import MarketPrices from "../../components/MarketPrices";
import { ProcessedWeatherData } from "../../types/weather";
import {
  Bot,
  Phone,
  MapPin,
  BarChart3,
  Settings,
  LogOut,
  Award,
  Gift,
  PhoneCall,
  Navigation,
  Calendar,
  FileText,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const DashboardPage: React.FC = () => {
  const [weatherData, setWeatherData] = useState<ProcessedWeatherData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user, logout, isAuthenticated } = useAuthStore();
  const {
    eligibleSchemes,
    fetchEligibleSchemes,
    isLoading: schemesLoading,
    error: schemesError,
  } = useSchemeStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch("/api/weather");
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  useEffect(() => {
    // Try to get user ID from either id or _id field
    const userId = user?.id || user?._id;

    if (userId) {
      console.log("Fetching schemes for user ID:", userId);
      fetchEligibleSchemes(userId);
    } else {
      console.log("No user ID available, user object:", user);
    }
  }, [user, fetchEligibleSchemes]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Generate emergency numbers URL based on user location
  const getEmergencyNumbersUrl = () => {
    const location = `${user?.village || ""} ${user?.district || ""} ${
      user?.state || ""
    }`.trim();
    return `https://www.google.com/search?q=emergency+helpline+numbers+${encodeURIComponent(
      location
    )}+india`;
  };

  // Generate Google Maps URL for nearby services
  const getNearbyServicesUrl = () => {
    const location = `${user?.village || ""} ${user?.district || ""} ${
      user?.state || ""
    }`.trim();
    return `https://www.google.com/maps/search/government+services+hospitals+banks+near+${encodeURIComponent(
      location
    )}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-yellow-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-sm">
          <p className="text-red-600 font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Header - Consistent with other pages */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-yellow-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-200 p-2 rounded-full">
              <Bot className="w-6 h-6 text-gray-800" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GramSathi</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name}!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
            >
              Home
            </Link>
            <Link
              href="/chat"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
            >
              Chat
            </Link>
            <Link
              href="/assistant"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
            >
              Assistant
            </Link>
            <Link
              href="/profile"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-full font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with User Info */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="h-20 w-20 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-3xl">👤</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user?.name}
                </h2>
                <div className="space-y-1 text-gray-600">
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {user?.phoneNumber}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-sm">💼</span>
                    {user?.occupation}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {user?.village}, {user?.district}, {user?.state}
                  </p>
                  {user?.occupation === "Farmer" &&
                    user?.cropsGrown &&
                    user.cropsGrown.length > 0 && (
                      <p className="flex items-center gap-2">
                        <span className="text-sm">🌾</span>
                        Growing: {user.cropsGrown.join(", ")}
                      </p>
                    )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Dashboard</div>
              <div className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Improved Eligible Schemes Section */}
        {eligibleSchemes.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-green-200 p-8 mb-8">
            <div className="flex items-start gap-6">
              <div className="bg-green-100 p-4 rounded-2xl">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Government Schemes Available
                  </h3>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {eligibleSchemes.length} schemes
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  You're eligible for government benefits worth up to ₹
                  {Math.max(
                    ...eligibleSchemes.map((s) => s.benefitAmount)
                  ).toLocaleString()}
                  . Apply now to secure your benefits.
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                  {eligibleSchemes.slice(0, 6).map((scheme) => (
                    <div
                      key={scheme._id}
                      className="bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                            {scheme.name}
                          </h4>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-green-700 font-semibold">
                          ₹{scheme.benefitAmount.toLocaleString()}{" "}
                          {scheme.benefitType}
                        </p>
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {eligibleSchemes.length > 6 && (
                  <div className="text-center">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
                      View All {eligibleSchemes.length} Schemes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Weather Alerts */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 p-4">
              <h3 className="text-gray-900 font-semibold flex items-center gap-2">
                <span className="text-lg">🌤️</span>
                Weather Updates
              </h3>
            </div>
            <div className="p-0">
              <WeatherAlert />
            </div>
          </div>

          {/* Market Prices */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-200 to-green-300 p-4">
              <h3 className="text-gray-900 font-semibold flex items-center gap-2">
                <span className="text-lg">💰</span>
                Market Prices
              </h3>
            </div>
            <div className="p-0">
              <MarketPrices
                cropsGrown={
                  user?.occupation === "Farmer" ? user?.cropsGrown : []
                }
                district={user?.district}
                state={user?.state}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Quick Actions
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Emergency Call - Now with actual link */}
            <a
              href={getEmergencyNumbersUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 p-6 rounded-xl border border-red-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                <PhoneCall className="w-8 h-8 text-red-600 mx-auto" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Emergency Numbers
              </p>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                Find local helplines <ExternalLink className="w-3 h-3" />
              </p>
            </a>

            {/* Nearby Services - Now with Google Maps link */}
            <a
              href={getNearbyServicesUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-6 rounded-xl border border-blue-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                <Navigation className="w-8 h-8 text-blue-600 mx-auto" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Nearby Services
              </p>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                Open in Maps <ExternalLink className="w-3 h-3" />
              </p>
            </a>

            {/* My Applications */}
            <button className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-6 rounded-xl border border-green-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-green-600 mx-auto" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                My Applications
              </p>
              <p className="text-xs text-gray-500">Track your schemes</p>
            </button>

            {/* Settings */}
            <Link
              href="/profile"
              className="group bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 p-6 rounded-xl border border-yellow-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-8 h-8 text-yellow-600 mx-auto" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Settings
              </p>
              <p className="text-xs text-gray-500">Manage profile</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
