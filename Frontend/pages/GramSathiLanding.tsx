"use client"

import React, { useState } from "react";
import { Menu, X, Cloud, TrendingUp, Building2 } from "lucide-react";

const GramSathiLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Navbar */}
      <nav className="bg-transparent p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-900">GramSathi</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors"
            >
              Chat
            </a>
            <a
              href="#"
              className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors"
            >
              Voice AI
            </a>
            <a
              href="#"
              className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors"
            >
              Profile
            </a>
            <button className="bg-yellow-200 hover:bg-yellow-300 px-6 py-2 rounded-full text-gray-900 font-medium transition-colors">
              Log in
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-green-50"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white rounded-lg shadow-lg">
              <a
                href="#"
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-green-50 rounded-md"
              >
                Chat
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-green-50 rounded-md"
              >
                Voice AI
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-green-50 rounded-md"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-green-50 rounded-md"
              >
                Profile
              </a>
              <button className="w-full mt-2 bg-yellow-200 hover:bg-yellow-300 px-4 py-2 rounded-full text-gray-900 font-medium">
                Log in
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                AI for Rural Communities
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                GramSathi is an AI-powered digital assistant that provides
                personalized, real-time support on agriculture, health, and
                government schemes for rural users across India.
              </p>
            </div>

            <button className="bg-yellow-200 hover:bg-yellow-300 px-8 py-4 rounded-full text-gray-900 font-semibold text-lg transition-colors shadow-sm">
              Learn more
            </button>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-orange-300 to-yellow-300 rounded-full w-80 h-80 mx-auto relative overflow-hidden">
              {/* Character illustration */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <div className="w-48 h-64 relative">
                  {/* Head */}
                  <div className="w-24 h-24 bg-amber-800 rounded-full mx-auto mb-2 relative">
                    {/* Eyes */}
                    <div className="absolute top-8 left-6 w-2 h-2 bg-gray-900 rounded-full"></div>
                    <div className="absolute top-8 right-6 w-2 h-2 bg-gray-900 rounded-full"></div>
                    {/* Smile */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-6 h-3 border-b-2 border-gray-900 rounded-full"></div>
                  </div>

                  {/* Hair/Headscarf */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-20 bg-yellow-600 rounded-t-full"></div>

                  {/* Body */}
                  <div className="w-32 h-40 bg-orange-400 rounded-t-full mx-auto">
                    {/* Arm */}
                    <div className="absolute right-0 top-20 w-12 h-20 bg-amber-800 rounded-full transform rotate-12 origin-top"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Speech bubble */}
            <div className="absolute top-1/4 right-4 bg-white px-6 py-4 rounded-2xl shadow-lg max-w-xs">
              <p className="text-gray-700 font-medium">
                Hello! How can I assist you today?
              </p>
              <div className="absolute left-4 bottom-0 transform translate-y-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Weather Updates */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Weather Updates
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive weather forecasts tailored to your region
                </p>
              </div>
            </div>
          </div>

          {/* Market Prices */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Market Prices
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Stay informed on current crop prices in local markets
                </p>
              </div>
            </div>
          </div>

          {/* Government Schemes */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-700" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Government Schemes
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Get information on welfare schemes and subsidies
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GramSathiLanding;
