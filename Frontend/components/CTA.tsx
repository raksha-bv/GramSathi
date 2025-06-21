"use client";

import React from "react";
import { MessageCircle, Mic, ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 ">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            Experience GramSathi Today
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get instant answers to your questions about farming, health, and
            government schemes. Choose your preferred way to interact with our
            AI assistant.
          </p>
        </div>

        {/* CTA Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Chat AI */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Chat with AI
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Type your questions and get instant, detailed responses. Perfect
                for complex queries and when you need step-by-step guidance.
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                <span>Start Chat</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Voice AI */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
                <Mic className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Voice AI
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Speak naturally in your local language. Ideal for hands-free
                interaction while working in the field or when reading is
                difficult.
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                <span>Try Voice AI</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            No registration required • Free to try • Available in multiple
            Indian languages
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
