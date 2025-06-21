"use client";

import React, { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore"; // Adjust path as needed

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-transparent p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img
            src={"/logo.png"}
            className="w-16 h-16 rounded-2xl object-cover"
          />
          <span className="text-2xl font-bold text-gray-900">GramSathi</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/chat"
            className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
          >
            Chat
          </Link>
          <Link
            href="/assistant"
            className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
          >
            Assistant
          </Link>
          <Link
            href="/dashboard"
            className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
          >
            Dashboard
          </Link>

          {/* Show Profile only if user is logged in */}
          {isAuthenticated && (
            <Link
              href="/profile"
              className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
            >
              Profile
            </Link>
          )}

          {/* Show Login or Logout based on authentication status */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-full font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-yellow-200 hover:bg-[#FFED70] px-8 py-3 rounded-full text-gray-900 font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300"
            >
              Log in
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
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
            <Link
              href="/chat"
              className="block px-4 py-3 text-lg font-semibold text-gray-900 hover:bg-gray-50 hover:text-gray-700 rounded-md transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Chat
            </Link>
            <Link
              href="/assistant"
              className="block px-4 py-3 text-lg font-semibold text-gray-900 hover:bg-gray-50 hover:text-gray-700 rounded-md transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Assistant
            </Link>
            <Link
              href="/dashboard"
              className="block px-4 py-3 text-lg font-semibold text-gray-900 hover:bg-gray-50 hover:text-gray-700 rounded-md transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>

            {/* Show Profile only if user is logged in */}
            {isAuthenticated && (
              <Link
                href="/profile"
                className="block px-4 py-3 text-lg font-semibold text-gray-900 hover:bg-gray-50 hover:text-gray-700 rounded-md transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
            )}

            {/* Show Login or Logout based on authentication status */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-full font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="block w-full mt-2 bg-yellow-200 hover:bg-[#FFED70] px-6 py-3 rounded-full text-gray-900 font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
