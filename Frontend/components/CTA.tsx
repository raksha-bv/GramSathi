"use client";

import React from "react";
import { MessageCircle, Mic, ArrowRight } from "lucide-react";
import Link from "next/link";

const CTASection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-48 sm:w-72 h-48 sm:h-72 bg-yellow-200/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/6 w-64 sm:w-96 h-64 sm:h-96 bg-green-200/10 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Try GramSathi Now
          </h2>
          <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-yellow-300 to-green-300 mx-auto mb-3 sm:mb-6"></div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Get instant help with farming, health, and government schemes
          </p>
        </div>

        {/* CTA Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* Chat AI */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-sm border border-yellow-200 hover:shadow-md transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-2xl mb-4 sm:mb-6 shadow-sm">
                <MessageCircle className="w-6 sm:w-8 h-6 sm:h-8 text-gray-800" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Text Chat
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Type your questions and get detailed answers. Great for
                step-by-step guidance.
              </p>
              <Link
                href="/chat"
                className="w-full bg-yellow-200 hover:bg-[#FFED70] text-gray-900 font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md text-sm sm:text-base"
              >
                <span>Start Chat</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
              </Link>
            </div>
          </div>

          {/* Voice AI */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-sm border border-green-200 hover:shadow-md transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-green-200 to-green-300 rounded-2xl mb-4 sm:mb-6 shadow-sm">
                <Mic className="w-6 sm:w-8 h-6 sm:h-8 text-gray-800" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Voice Chat
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Speak in your language. Perfect for hands-free use while
                working.
              </p>
              <Link
                href="/assistant"
                className="w-full bg-green-300 hover:bg-green-300/90 text-gray-900 font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md text-sm sm:text-base"
              >
                <span>Try Voice</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-8 sm:mt-12">
          <div className="inline-block bg-white/60 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-yellow-200">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              Free • No signup needed • Multiple languages
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
