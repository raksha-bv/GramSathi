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
  LogOut,
  Languages,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

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
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [userLocation, setUserLocation] = useState<string>("");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Authentication
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Language options
  const languageOptions = [
    { code: "en-IN", name: "English" },
    { code: "hi-IN", name: "Hindi" },
    { code: "bn-IN", name: "Bengali" },
    { code: "gu-IN", name: "Gujarati" },
    { code: "kn-IN", name: "Kannada" },
    { code: "ml-IN", name: "Malayalam" },
    { code: "mr-IN", name: "Marathi" },
    { code: "od-IN", name: "Odia" },
    { code: "pa-IN", name: "Punjabi" },
    { code: "ta-IN", name: "Tamil" },
    { code: "te-IN", name: "Telugu" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setIsLanguageDropdownOpen(false);

    // Update speech recognition language
    if (recognitionRef.current) {
      recognitionRef.current.lang = languageCode;
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = selectedLanguage;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        // Auto-send voice messages
        handleSendMessage(transcript);
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

  // Function to format message content
  const formatMessageContent = (content: string) => {
    // Remove asterisks and format bold text
    let formattedContent = content.replace(
      /\*{2,}([^*]+)\*{2,}/g,
      "<strong>$1</strong>"
    );

    // Handle numbered lists (1. 2. 3. etc.)
    formattedContent = formattedContent.replace(
      /(\d+)\.\s\*\*([^*]+)\*\*:/g,
      '<div class="mt-3 mb-2"><strong>$1. $2:</strong></div>'
    );

    // Handle bullet points and general formatting
    formattedContent = formattedContent.replace(
      /(\d+)\.\s([^.]+):/g,
      '<div class="mt-3 mb-2"><strong>$1. $2:</strong></div>'
    );

    // Handle line breaks and create paragraphs
    const lines = formattedContent.split("\n").filter((line) => line.trim());
    const formattedLines = lines.map((line) => {
      line = line.trim();
      if (!line) return "";

      // If line starts with number, it's already formatted above
      if (line.match(/^\d+\./)) {
        return line;
      }

      // Format remaining asterisks as bold
      line = line.replace(/\*+([^*]+)\*+/g, "<strong>$1</strong>");

      return `<div class="mb-2">${line}</div>`;
    });

    return formattedLines.join("");
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
      // Single API call - let the backend handle routing
      const response = await fetch("/api/chat", {
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
      <div className="mt-4 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Cloud className="w-4 h-4" />
          Weather Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Sun className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
            <span>
              <strong>Temperature:</strong> {weatherData.current.temp_c}°C
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
            <span>
              <strong>Condition:</strong> {weatherData.current.condition.text}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
            <span>
              <strong>Humidity:</strong> {weatherData.current.humidity}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span>
              <strong>Wind:</strong> {weatherData.current.wind_kph} km/h
            </span>
          </div>
        </div>
        {weatherData.location && (
          <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>{weatherData.location.name}</span>
          </div>
        )}
      </div>
    );
  };

  const formatMarketData = (marketData: any) => {
    // Remove the market data display entirely - just return null
    // The text response already contains the market information
    return null;
  };

  const suggestionButtons = [
    "What's the weather today?",
    "Best crops for this season",
    "Government farming schemes",
    "Crop disease diagnosis",
    "Market prices today",
    "Irrigation tips",
  ];

  const getCurrentLanguageName = () => {
    return (
      languageOptions.find((lang) => lang.code === selectedLanguage)?.name ||
      "English"
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200 p-3 sm:p-4 shadow-sm relative z-[100]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-yellow-200 p-1.5 sm:p-2 rounded-full">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                GramSathi AI
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Your Rural Assistant
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
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
            {isAuthenticated && (
              <Link
                href="/profile"
                className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105"
              >
                Profile
              </Link>
            )}

            {/* Language Selector */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() =>
                  setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                }
                className="flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-gray-800 px-3 py-2 rounded-full font-medium text-sm shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 border border-yellow-200"
                title="Select Language"
              >
                <Languages className="w-4 h-4" />
                <span>{getCurrentLanguageName()}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isLanguageDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm border border-yellow-200 rounded-xl shadow-lg z-[9999] max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 px-3 py-2 font-medium uppercase tracking-wide">
                      Select Language
                    </div>
                    {languageOptions.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center justify-between ${
                          selectedLanguage === language.code
                            ? "bg-yellow-100 text-yellow-800 font-medium"
                            : "text-gray-700 hover:bg-yellow-50"
                        }`}
                      >
                        <span>{language.name}</span>
                        {selectedLanguage === language.code && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-full font-semibold text-sm shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-yellow-200 hover:bg-[#FFED70] px-4 py-2 rounded-full text-gray-900 font-semibold text-sm shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300"
              >
                Log in
              </Link>
            )}
          </div>

          {/* Mobile Menu Button and Language Selector */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile Language Selector */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() =>
                  setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                }
                className="flex items-center gap-1 bg-yellow-100 hover:bg-yellow-200 text-gray-800 px-2 py-1.5 rounded-full font-medium text-xs shadow-sm transition-all duration-300 border border-yellow-200 min-w-0"
                title="Select Language"
              >
                <Languages className="w-3 h-3 flex-shrink-0" />
                <span className="hidden xs:inline text-xs">
                  {getCurrentLanguageName()}
                </span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${
                    isLanguageDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white/95 backdrop-blur-sm border border-yellow-200 rounded-xl shadow-lg z-[9999] max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 px-3 py-2 font-medium uppercase tracking-wide">
                      Language
                    </div>
                    {languageOptions.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center justify-between ${
                          selectedLanguage === language.code
                            ? "bg-yellow-100 text-yellow-800 font-medium"
                            : "text-gray-700 hover:bg-yellow-50"
                        }`}
                      >
                        <span>{language.name}</span>
                        {selectedLanguage === language.code && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-yellow-100 rounded-full transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-yellow-200 shadow-lg z-[90]">
            <div className="p-4 space-y-3">
              <Link
                href="/"
                className="block text-lg font-semibold text-gray-900 hover:text-gray-700 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/assistant"
                className="block text-lg font-semibold text-gray-900 hover:text-gray-700 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Assistant
              </Link>
              <Link
                href="/dashboard"
                className="block text-lg font-semibold text-gray-900 hover:text-gray-700 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              {isAuthenticated && (
                <Link
                  href="/profile"
                  className="block text-lg font-semibold text-gray-900 hover:text-gray-700 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              )}
              <div className="pt-2 border-t border-yellow-200">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-4 py-3 rounded-full font-semibold text-lg shadow-sm flex items-center gap-2 justify-center"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full bg-yellow-200 hover:bg-[#FFED70] px-4 py-3 rounded-full text-gray-900 font-semibold text-lg shadow-sm text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-6xl mx-auto p-2 sm:p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pb-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 px-4">
                <div className="space-y-4">
                  <div className="bg-yellow-200 p-3 sm:p-4 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto">
                    <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-800" />
                  </div>
                  <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
                    Welcome to GramSathi!
                  </h2>
                  <p className="text-sm sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
                    I'm your AI assistant for farming advice, weather updates,
                    and government schemes. Ask me anything about agriculture,
                    health, or rural development. You can type or use voice!
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500 bg-yellow-50 px-3 sm:px-4 py-2 rounded-full border border-yellow-200">
                    <Languages className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-center">
                      Currently responding in:{" "}
                      <strong>{getCurrentLanguageName()}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-w-4xl w-full">
                  {suggestionButtons.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border border-yellow-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:bg-yellow-100 hover:border-yellow-300 transition-all duration-200 transform hover:scale-105 shadow-sm min-h-[3rem] sm:min-h-[4rem] flex items-center justify-center text-center"
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
                  className={`flex gap-2 sm:gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="bg-yellow-200 p-1.5 sm:p-2 rounded-full h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-2xl px-3 sm:px-6 py-3 sm:py-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-white/80 backdrop-blur-sm text-gray-800 border border-yellow-200 rounded-bl-md"
                        : "bg-white/80 backdrop-blur-sm text-gray-800 border border-yellow-200 rounded-bl-md"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div
                        className="text-xs sm:text-sm leading-relaxed formatted-content"
                        dangerouslySetInnerHTML={{
                          __html: formatMessageContent(message.content),
                        }}
                      />
                    ) : (
                      <p className="text-xs sm:text-sm leading-relaxed">
                        {message.content}
                      </p>
                    )}
                    {formatWeatherData(message.weatherData)}
                    {formatMarketData(message.marketData)}
                    <p className="text-xs mt-2 text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <div className="bg-yellow-200 p-1.5 sm:p-2 rounded-full h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-2 sm:gap-3 justify-start">
                <div className="bg-yellow-200 p-1.5 sm:p-2 rounded-full h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm px-3 sm:px-6 py-3 sm:py-4 rounded-2xl rounded-bl-md border border-yellow-200">
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
                    <span className="text-xs sm:text-sm text-gray-600">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-sm border border-yellow-200 rounded-2xl p-2 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSendMessage()
                }
                placeholder={`Ask me about farming, weather, or government schemes... (${getCurrentLanguageName()})`}
                className="flex-1 px-2 sm:px-4 py-2 sm:py-3 bg-transparent border-none focus:outline-none text-gray-800 placeholder-gray-500 text-sm sm:text-base min-w-0"
                disabled={isLoading}
              />

              <button
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center justify-center p-2 sm:p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
                title={isListening ? "Stop listening" : "Start voice input"}
                style={{ minWidth: 40, minHeight: 40 }} // Ensures a perfect circle on small screens
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
                className="px-3 sm:px-6 py-2 sm:py-3 bg-yellow-300 text-gray-800 rounded-full hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center gap-1 sm:gap-2 flex-shrink-0"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium text-sm sm:text-base">Send</span>
              </button>
            </div>

            {/* Voice indicator */}
            {isListening && (
              <div className="mt-2 text-center">
                <span className="text-xs sm:text-sm text-red-600 animate-pulse">
                  🎤 Listening... Speak now in {getCurrentLanguageName()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add custom CSS for formatted content */}
      <style jsx global>{`
        .formatted-content strong {
          font-weight: 600;
          color: #374151;
        }

        .formatted-content div {
          line-height: 1.6;
        }

        .formatted-content div:not(:last-child) {
          margin-bottom: 0.5rem;
        }

        /* Custom breakpoint for extra small screens */
        @media (min-width: 375px) {
          .xs\:inline {
            display: inline;
          }
        }

        /* Ensure proper scrolling on mobile */
        @media (max-width: 640px) {
          .overflow-y-auto {
            -webkit-overflow-scrolling: touch;
          }
        }

        /* Fix input focus on mobile */
        @media (max-width: 640px) {
          input:focus {
            transform: none;
            zoom: 1;
          }
        }

        /* Improve touch targets on mobile */
        @media (max-width: 640px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }

          button:not(.rounded-full) {
            min-height: 48px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
