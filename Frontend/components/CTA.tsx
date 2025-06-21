"use client";

import React from "react";
import { MessageCircle, Mic, ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20  relative overflow-hidden">
      {/* Subtle background elements matching your design */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-yellow-200/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-green-200/10 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            Experience GramSathi Today
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-yellow-300 to-green-300 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get instant answers to your questions about farming, health, and
            government schemes. Choose your preferred way to interact with our
            AI assistant.
          </p>
        </div>

        {/* CTA Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Chat AI */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-yellow-200 hover:shadow-md transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-2xl mb-6 shadow-sm">
                <MessageCircle className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Chat with AI
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Type your questions and get instant, detailed responses. Perfect
                for complex queries and when you need step-by-step guidance.
              </p>
              <button className="w-full  bg-yellow-200 hover:bg-[#FFED70]  text-gray-900 font-semibold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md">
                <span>Start Chat</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Voice AI */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-green-200 hover:shadow-md transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-200 to-green-300 rounded-2xl mb-6 shadow-sm">
                <Mic className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Voice AI
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Speak naturally in your local language. Ideal for hands-free
                interaction while working in the field or when reading is
                difficult.
              </p>
              <button className="w-full  bg-green-300  hover:bg-green-300/90 text-gray-900 font-semibold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md">
                <span>Try Voice AI</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-12">
          <div className="inline-block bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-yellow-200">
            <p className="text-gray-600 font-medium">
              No registration required • Free to try • Available in multiple
              Indian languages
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
