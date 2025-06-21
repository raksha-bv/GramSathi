"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  Mic,
  User,
  Bot,
  Sun,
  Cloud,
  Droplets,
  Wind,
  MapPin,
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  weatherData?: any;
  marketData?: any;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [userLocation, setUserLocation] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(
            `${position.coords.latitude},${position.coords.longitude}`
          );
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation("Delhi, India"); // Default location
        }
      );
    } else {
      setUserLocation("Delhi, India"); // Default location
    }

    // Initialize speech recognition for input only
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang =
        selectedLanguage === "hi" ? "hi-IN" : "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend) return;

    setIsLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      // Determine which API to use based on message content
      const isMarketPriceQuery =
        textToSend.toLowerCase().includes("price") ||
        textToSend.toLowerCase().includes("market") ||
        textToSend.toLowerCase().includes("cost") ||
        textToSend.toLowerCase().includes("rate");

      const apiEndpoint = isMarketPriceQuery
        ? "/api/market-prices"
        : "/api/chat";

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          language: selectedLanguage,
          location: userLocation,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: data.timestamp || new Date().toISOString(),
        weatherData: data.weatherData,
        marketData: data.marketData,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "I'm sorry, I encountered a technical issue. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatWeatherData = (weatherData: any) => {
    if (!weatherData || !weatherData.current) return null;

    return (
      <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Cloud className="w-4 h-4" />
          Weather Information
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-500" />
            <span>
              <strong>Temperature:</strong> {weatherData.current.temp_c}°C
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-gray-500" />
            <span>
              <strong>Condition:</strong> {weatherData.current.condition.text}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span>
              <strong>Humidity:</strong> {weatherData.current.humidity}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-gray-400" />
            <span>
              <strong>Wind:</strong> {weatherData.current.wind_kph} km/h
            </span>
          </div>
        </div>
        {weatherData.location && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{weatherData.location.name}</span>
          </div>
        )}
      </div>
    );
  };

  const formatMarketData = (marketData: any) => {
    if (!marketData || !Array.isArray(marketData) || marketData.length === 0)
      return null;

    return (
      <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Market Prices
        </h4>
        <div className="space-y-2">
          {marketData.slice(0, 5).map((item: any, index: number) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 bg-white rounded-lg"
            >
              <span className="font-medium text-gray-800">
                {item.commodity}
              </span>
              <span className="text-green-600 font-semibold">
                ₹{item.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const suggestionButtons = [
    "What's the weather today?",
    "Best crops for this season",
    "Government farming schemes",
    "Crop disease diagnosis",
    "Market prices today",
    "Irrigation tips",
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-200 p-2 rounded-full">
              <Bot className="w-6 h-6 text-gray-800" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GramSathi AI</h1>
              <p className="text-sm text-gray-600">Your Rural Assistant</p>
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
              href="/assistant"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
            >
              Assistant
            </Link>
            <Link
              href="/dashboard"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
            >
              Profile
            </Link>
            <Link
              href="/login"
              className="bg-yellow-200 hover:bg-[#FFED70] px-6 py-2 rounded-full text-gray-900 font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-6xl mx-auto p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-6 pb-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                <div className="space-y-4">
                  <div className="bg-yellow-200 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                    <MessageCircle className="w-10 h-10 text-gray-800" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Welcome to GramSathi!
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    I'm your AI assistant for farming advice, weather updates,
                    and government schemes. Ask me anything about agriculture,
                    health, or rural development.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl w-full">
                  {suggestionButtons.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="p-4 bg-white/80 backdrop-blur-sm border border-yellow-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-yellow-100 hover:border-yellow-300 transition-all duration-200 transform hover:scale-105 shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="bg-yellow-200 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-gray-800" />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl px-6 py-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-white/80 backdrop-blur-sm text-gray-800 border border-yellow-200 rounded-bl-md"
                        : "bg-white/80 backdrop-blur-sm text-gray-800 border border-yellow-200 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    {formatWeatherData(message.weatherData)}
                    {formatMarketData(message.marketData)}
                    <p
                      className={`text-xs mt-2 ${
                        message.role === "user"
                          ? "text-gray-500"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <div className="bg-yellow-200 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-800" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="bg-yellow-200 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-gray-800" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl rounded-bl-md border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-sm border border-yellow-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSendMessage()
                }
                placeholder="Ask me about farming, weather, or government schemes..."
                className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none text-gray-800 placeholder-gray-500"
                disabled={isLoading}
              />

              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
                className="px-6 py-3 bg-yellow-300 text-gray-800 rounded-full hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="font-medium">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
