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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-yellow-200 text-center">
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
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-sm">
          <p className="text-red-600 font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Header - Consistent with other pages */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200 p-4 shadow-sm">
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="h-20 w-20 bg-gradient-to-br from-yellow-200 to-green-200 rounded-full flex items-center justify-center shadow-sm">
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

        {/* Eligible Schemes Alert */}
        {eligibleSchemes.length > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Award className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">
                  🎉 Great News! You're eligible for {eligibleSchemes.length}{" "}
                  government scheme
                  {eligibleSchemes.length > 1 ? "s" : ""}!
                </h3>
                <p className="text-green-100 mb-4">
                  You can apply for these schemes and receive benefits up to ₹
                  {Math.max(
                    ...eligibleSchemes.map((s) => s.benefitAmount)
                  ).toLocaleString()}
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {eligibleSchemes.slice(0, 3).map((scheme) => (
                    <div
                      key={scheme._id}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                    >
                      <h4 className="font-semibold text-white mb-1">
                        {scheme.name}
                      </h4>
                      <p className="text-green-100 text-sm mb-2">
                        ₹{scheme.benefitAmount.toLocaleString()}{" "}
                        {scheme.benefitType}
                      </p>
                      <button className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>
                {eligibleSchemes.length > 3 && (
                  <p className="text-green-100 text-sm mt-3">
                    + {eligibleSchemes.length - 3} more schemes available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Weather Alerts */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="text-lg">🌤️</span>
                Weather Updates
              </h3>
            </div>
            <div className="p-0">
              <WeatherAlert />
            </div>
          </div>

          {/* Market Prices */}
          <div
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden ${
              user?.occupation === "Farmer" &&
              user?.cropsGrown &&
              user.cropsGrown.length > 0
                ? "md:col-span-2"
                : ""
            }`}
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
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

          {/* Government Schemes */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="text-lg">🏛️</span>
                Govt. Schemes
              </h3>
            </div>
            <div className="p-6">
              {schemesLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-600 text-sm mt-2">
                    Loading schemes...
                  </p>
                </div>
              ) : schemesError ? (
                <div className="text-center">
                  <p className="text-red-600 text-sm">{schemesError}</p>
                </div>
              ) : eligibleSchemes.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-orange-800">
                      {eligibleSchemes.length} schemes available
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {eligibleSchemes.slice(0, 2).map((scheme) => (
                      <div
                        key={scheme._id}
                        className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                      >
                        <h4 className="font-medium text-orange-900 text-sm">
                          {scheme.name}
                        </h4>
                        <p className="text-orange-700 text-xs">
                          ₹{scheme.benefitAmount.toLocaleString()}{" "}
                          {scheme.benefitType}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                    View All Schemes
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <p className="text-orange-800 text-sm font-medium">
                    📋 No schemes available
                  </p>
                  <p className="text-orange-600 text-xs mt-1">
                    Check back later for updates
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Community */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="text-lg">👥</span>
                Community
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4">
                Connect with fellow villagers and farmers
              </p>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <p className="text-purple-800 text-sm font-medium">
                  🚀 Coming soon...
                </p>
                <p className="text-purple-600 text-xs mt-1">
                  Build your network
                </p>
              </div>
            </div>
          </div>

          {/* Agricultural Tips */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="text-lg">💡</span>
                Farming Tips
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4">
                Get expert agricultural advice and tips
              </p>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <p className="text-green-800 text-sm font-medium">
                  🚀 Coming soon...
                </p>
                <p className="text-green-600 text-xs mt-1">Expert guidance</p>
              </div>
            </div>
          </div>

          {/* Disease Alert */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                Disease Alerts
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4">
                Early warning system for crop diseases
              </p>
              <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                <p className="text-red-800 text-sm font-medium">
                  🚀 Coming soon...
                </p>
                <p className="text-red-600 text-xs mt-1">Stay protected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Quick Actions
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="group bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 p-6 rounded-xl border border-yellow-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                📞
              </div>
              <p className="text-sm font-semibold text-gray-700">
                Emergency Call
              </p>
              <p className="text-xs text-gray-500 mt-1">24/7 helpline</p>
            </button>
            <button className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-6 rounded-xl border border-green-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                📍
              </div>
              <p className="text-sm font-semibold text-gray-700">
                Nearby Services
              </p>
              <p className="text-xs text-gray-500 mt-1">Find local help</p>
            </button>
            <button className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-6 rounded-xl border border-blue-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                📊
              </div>
              <p className="text-sm font-semibold text-gray-700">My Reports</p>
              <p className="text-xs text-gray-500 mt-1">View analytics</p>
            </button>
            <button className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-6 rounded-xl border border-purple-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                ⚙️
              </div>
              <p className="text-sm font-semibold text-gray-700">Settings</p>
              <p className="text-xs text-gray-500 mt-1">Customize app</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
