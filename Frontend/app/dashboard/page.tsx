"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { JobInfo } from "../../lib/job-api"; // Create this type if not present

const DashboardPage: React.FC = () => {
  const [weatherData, setWeatherData] = useState<ProcessedWeatherData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [showAllJobs, setShowAllJobs] = React.useState(false);
  const [error, setError] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const { user, logout, isAuthenticated } = useAuthStore();
  const {
    eligibleSchemes,
    fetchEligibleSchemes,
    isLoading: schemesLoading,
    error: schemesError,
  } = useSchemeStore();
  const router = useRouter();

  const [jobListings, setJobListings] = useState<JobInfo[]>([]);
  const [jobsLoading, setJobsLoading] = useState<boolean>(true);
  const [jobApplyLink, setJobApplyLink] = useState<string>("");

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

  // Fetch jobs based on user location and experience
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;
      setJobsLoading(true);
      try {
        const location = encodeURIComponent(user.state || "");
        const experience = encodeURIComponent(
          user.yearsOfExperience?.toString() || "0"
        );
        const apiUrl = `http://127.0.0.1:5003/request?location=${location}&experience=${experience}`;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();

        // If response is an array like [link, jobsArray]
        if (
          Array.isArray(data) &&
          data.length === 2 &&
          Array.isArray(data[1])
        ) {
          setJobListings(data[1]);
          setJobApplyLink(typeof data[0] === "string" ? data[0] : "");
        } else if (data.jobs) {
          setJobListings(data.jobs);
          setJobApplyLink(data.link || "");
        } else {
          setJobListings([]);
          setJobApplyLink("");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch jobs");
      } finally {
        setJobsLoading(false);
      }
    };
    if (user) fetchJobs();
  }, [user]);

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
  const jobListingsDummy = [
    {
      JobTitle: "Customer Relations Officer",
      Location: "Bangalore, Karnataka",
      Organization: "Apna",
      SalaryRange: "₹15,000 - ₹20,000/month",
      SkillRequired: "Communication Skills",
    },
    {
      JobTitle: "Field Worker - Agriculture",
      Location: `${user?.village}, ${user?.district}`,
      Organization: "AgroFarm Pvt Ltd",
      SalaryRange: "₹8,000 - ₹12,000/month",
      SkillRequired: "Field Work",
    },
    {
      JobTitle: "Warehouse Helper",
      Location: `${user?.district}, ${user?.state}`,
      Organization: "Rural Logistics",
      SalaryRange: "₹7,000 - ₹10,000/month",
      SkillRequired: "Manual Labor",
    },
    {
      JobTitle: "Sales Executive",
      Location: "Mysore, Karnataka",
      Organization: "Rural Connect",
      SalaryRange: "₹12,000 - ₹18,000/month",
      SkillRequired: "Sales Experience",
    },
    {
      JobTitle: "Data Entry Operator",
      Location: `${user?.district}, ${user?.state}`,
      Organization: "Digital Services",
      SalaryRange: "₹9,000 - ₹14,000/month",
      SkillRequired: "Computer Skills",
    },
    {
      JobTitle: "Security Guard",
      Location: "Bangalore, Karnataka",
      Organization: "SecureMax",
      SalaryRange: "₹8,500 - ₹11,000/month",
      SkillRequired: "Security Training",
    },
    {
      JobTitle: "Delivery Partner",
      Location: `${user?.village}, ${user?.district}`,
      Organization: "QuickDelivery",
      SalaryRange: "₹10,000 - ₹15,000/month",
      SkillRequired: "Two Wheeler License",
    },
    {
      JobTitle: "Construction Worker",
      Location: `${user?.district}, ${user?.state}`,
      Organization: "BuildRight Construction",
      SalaryRange: "₹8,000 - ₹12,000/month",
      SkillRequired: "Physical Fitness",
    },
    {
      JobTitle: "Kitchen Helper",
      Location: "Ramanagara, Karnataka",
      Organization: "Hotel Sunshine",
      SalaryRange: "₹7,500 - ₹10,000/month",
      SkillRequired: "Food Handling",
    },
    {
      JobTitle: "Farm Supervisor",
      Location: `${user?.village}, ${user?.district}`,
      Organization: "GreenFields Farm",
      SalaryRange: "₹12,000 - ₹16,000/month",
      SkillRequired: "Agriculture Knowledge",
    },
  ];

  // Generate Google Maps URL for nearby services
  const getNearbyServicesUrl = () => {
    const location = `${user?.village || ""} ${user?.district || ""} ${
      user?.state || ""
    }`.trim();
    return `https://www.google.com/maps/search/government+services+hospitals+banks+near+${encodeURIComponent(
      location
    )}`;
  };

  useEffect(() => {
    if (!navOpen) return;
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setNavOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [navOpen]);

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
      {/* Header - Responsive Navbar */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-yellow-200 p-4 shadow-sm relative z-[100]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative">
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

          {/* Desktop nav */}
          <div className="hidden md:flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-0">
            <Link
              href="/"
              className="text-base md:text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
            >
              Home
            </Link>
            <Link
              href="/chat"
              className="text-base md:text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
            >
              Chat
            </Link>
            <Link
              href="/assistant"
              className="text-base md:text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
            >
              Assistant
            </Link>
            <Link
              href="/profile"
              className="text-base md:text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-4 md:px-6 py-2 rounded-full font-semibold text-base md:text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile nav */}
          {navOpen && (
            <div
              ref={navRef}
              className="md:hidden absolute top-4 right-0 w-11/12 max-w-xs bg-white border border-yellow-200 rounded-2xl shadow-lg z-20 p-5 flex flex-col gap-4 animate-fade-in"
            >
              {/* Move the X button inside navRef */}
              <button
                className="absolute right-4 top-4 z-30 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Close navigation"
                onClick={() => setNavOpen(false)}
                type="button"
              >
                <span className="sr-only">Close navigation</span>
                <svg
                  className={`w-7 h-7 text-gray-800 transition-transform duration-200`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <Link
                href="/"
                className="text-base font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300"
                onClick={() => setNavOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/chat"
                className="text-base font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300"
                onClick={() => setNavOpen(false)}
              >
                Chat
              </Link>
              <Link
                href="/assistant"
                className="text-base font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300"
                onClick={() => setNavOpen(false)}
              >
                Assistant
              </Link>
              <Link
                href="/profile"
                className="text-base font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300"
                onClick={() => setNavOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setNavOpen(false);
                }}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-full font-semibold text-base shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}

          {/* Hamburger for mobile (only show when nav is closed) */}
          {!navOpen && (
            <button
              className="md:hidden absolute right-4 top-4 z-30 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Open navigation"
              onClick={() => setNavOpen(true)}
              type="button"
            >
              <span className="sr-only">Open navigation</span>
              <svg
                className="w-7 h-7 text-gray-800 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Hero Section with User Info */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="relative">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-2xl sm:text-3xl">👤</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {user?.name}
                </h2>
                <div className="space-y-1 text-gray-600 text-sm sm:text-base">
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
            <div className="text-right w-full sm:w-auto">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">
                Dashboard
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">
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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-green-200 p-4 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
              <div className="bg-green-100 p-3 sm:p-4 rounded-2xl self-start">
                <Award className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Government Schemes Available
                  </h3>
                  <div className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    {eligibleSchemes.length} schemes
                  </div>
                </div>

                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  You're eligible for government benefits worth up to ₹
                  {Math.max(
                    ...eligibleSchemes.map((s) => s.benefitAmount)
                  ).toLocaleString()}
                  . Apply now to secure your benefits.
                </p>

                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-4 sm:mb-6">
                  {eligibleSchemes.slice(0, 6).map((scheme) => (
                    <div
                      key={scheme._id}
                      className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <h4 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight">
                            {scheme.name}
                          </h4>
                        </div>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <p className="text-green-700 font-semibold text-sm sm:text-base">
                          ₹{scheme.benefitAmount.toLocaleString()}{" "}
                          {scheme.benefitType}
                        </p>
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {eligibleSchemes.length > 6 && (
                  <div className="text-center">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-200 text-sm sm:text-base">
                      View All {eligibleSchemes.length} Schemes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3 mb-6 sm:mb-8">
          {/* Weather Alerts */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 p-3 sm:p-4">
              <h3 className="text-gray-900 font-semibold flex items-center gap-2 text-base sm:text-lg">
                <span className="">🌤️</span>
                Weather Updates
              </h3>
            </div>
            <div className="p-0">
              <WeatherAlert />
            </div>
          </div>

          {/* Market Prices */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-200 to-green-300 p-3 sm:p-4">
              <h3 className="text-gray-900 font-semibold flex items-center gap-2 text-base sm:text-lg">
                <span className="">💰</span>
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
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-yellow-200 p-4 sm:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">⚡</span>
            Quick Actions
          </h3>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Emergency Call - Now with actual link */}
            <a
              href={getEmergencyNumbersUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 p-4 sm:p-6 rounded-xl border border-red-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                <PhoneCall className="w-7 h-7 sm:w-8 sm:h-8 text-red-600 mx-auto" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
              className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-4 sm:p-6 rounded-xl border border-blue-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                <Navigation className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 mx-auto" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Nearby Services
              </p>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                Open in Maps <ExternalLink className="w-3 h-3" />
              </p>
            </a>

            {/* My Applications */}
            <button className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-4 sm:p-6 rounded-xl border border-green-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 mx-auto" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                My Applications
              </p>
              <p className="text-xs text-gray-500">Track your schemes</p>
            </button>

            {/* Settings */}
            <Link
              href="/profile"
              className="group bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 p-4 sm:p-6 rounded-xl border border-yellow-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-600 mx-auto" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Settings
              </p>
              <p className="text-xs text-gray-500">Manage profile</p>
            </Link>
          </div>
        </div>

        {/* Jobs Available in Your Area */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-orange-200 p-4 sm:p-8 mb-6 sm:mb-8 mt-4">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
            <div className="bg-orange-100 p-3 sm:p-4 rounded-2xl self-start">
              <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Jobs Available in Your Area
                </h3>
                <div className="bg-orange-100 text-orange-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  Updated Daily
                </div>
              </div>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Explore job opportunities near you. These listings are updated
                regularly to help you find work in your locality.
              </p>
              {jobsLoading ? (
                <div className="text-center py-8 text-orange-600 font-semibold">
                  Loading jobs...
                </div>
              ) : jobListings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No jobs found for your location and experience.
                </div>
              ) : (
                // ...existing code...
                <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-4 sm:mb-6">
                  {(showAllJobs ? jobListings : jobListings.slice(0, 4)).map(
                    (job, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between min-h-[220px] h-full"
                        style={{ boxShadow: "0 1px 6px 0 rgba(0,0,0,0.04)" }}
                      >
                        <div className="mb-4">
                          <div className="flex items-start gap-3 mb-2">
                            <Gift className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <h4 className="font-semibold text-gray-800 text-base leading-tight">
                              {job.JobTitle}
                            </h4>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 text-xs font-medium">
                                {job.Organization}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                              <span className="truncate">{job.Location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-yellow-700 font-medium">
                              <BarChart3 className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                              {job.SalaryRange}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Skills:</span>
                              <span>{job.SkillRequired}</span>
                            </div>
                          </div>
                        </div>
                        <a
                          href={jobApplyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 text-center block"
                        >
                          Apply Now
                        </a>
                      </div>
                    )
                  )}
                </div>
                // ...existing code...
              )}
              {jobListings.length > 4 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAllJobs(!showAllJobs)}
                    className=" bg-yellow-300 hover:bg-yellow-300/90 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base shadow-sm hover:shadow-md"
                  >
                    {showAllJobs ? "Show Less" : "View All Jobs"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
