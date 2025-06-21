"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";

const HeroSection = () => {
  const greetings = [
    { text: "Hello! How can I assist you today?", lang: "English" },
    { text: "नमस्ते! आज मैं आपकी कैसे सहायता कर सकता हूं?", lang: "Hindi" },
    {
      text: "வணக்கம்! இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      lang: "Tamil",
    },
    { text: "ನಮಸ್ಕಾರ! ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?", lang: "Kannada" },
    {
      text: "নমস্কার! আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
      lang: "Bengali",
    },
    { text: "नमस्कार! आज मी तुमची कशी मदत करू शकतो?", lang: "Marathi" },
    { text: "ଆଦାବ! ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?", lang: "Odia" },
    {
      text: "സത്കാരം! ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?",
      lang: "Malayalam",
    },
    { text: "నమస్కారం! ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?", lang: "Telugu" },
    { text: "નમસ્તે! આજે હું તમારી કેવી રીતે મદદ કરી શકું?", lang: "Gujarati" },
    {
      text: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
      lang: "Punjabi",
    },
  ];

  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);

      setTimeout(() => {
        setCurrentGreetingIndex(
          (prevIndex) => (prevIndex + 1) % greetings.length
        );
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [greetings.length]);

  return (
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

          <button className="bg-yellow-200 hover:bg-[#FFED70] px-8 py-4 rounded-full text-gray-900 font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-500">
            Learn more
          </button>
        </div>

        {/* Right Illustration */}
        <div className="relative">
          <img
            src="/Farmer.jpg"
            alt="Farmer"
            className="w-full h-full object-cover rounded-2xl shadow-lg"
          />

          {/* Animated Speech bubble */}
          <div className="absolute -top-14 right-4 bg-white px-6 py-4 rounded-2xl shadow-lg max-w-xs border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <MessageCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-500 font-medium">
                {greetings[currentGreetingIndex].lang}
              </span>
            </div>
            <p
              className={`text-gray-700 font-medium transition-all duration-300 min-h-[3rem] flex items-center ${
                isAnimating
                  ? "opacity-0 transform translate-y-2"
                  : "opacity-100 transform translate-y-0"
              }`}
            >
              {greetings[currentGreetingIndex].text}
            </p>
            <div className="absolute left-4 bottom-0 transform translate-y-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>

            {/* Typing indicator dots */}
            <div className="flex space-x-1 mt-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
