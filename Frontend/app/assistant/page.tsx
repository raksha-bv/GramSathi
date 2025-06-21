"use client";

import React, { useState, useRef } from "react";
import { Bot, Home, MessageCircle, User, BarChart3 } from "lucide-react";
import Link from "next/link";

const PremiumVoiceAssistant: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setIsListening(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatForSpeech = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/#+\s?/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/[_~]/g, "")
      .replace(/\n/g, ". ");
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const transcript = await speechToText(audioBlob);
      if (transcript && transcript.trim()) {
        await processUserMessage(transcript);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processUserMessage = async (message: string) => {
    try {
      const response = await getChatCompletion(message);
      if (response && response.trim()) {
        await textToSpeech(response);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
    }
  };

  const speechToText = async (audioBlob: Blob): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.wav");

      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.transcript;
      }
    } catch (error) {
      console.error("Speech-to-text failed:", error);
    }
    return null;
  };

  const getChatCompletion = async (message: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/voice-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      }
    } catch (error) {
      console.error("Chat completion failed:", error);
    }
    return null;
  };

  const textToSpeech = async (text: string) => {
    try {
      const plainText = formatForSpeech(text);
      setIsSpeaking(true);

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: plainText }),
      });

      if (response.ok) {
        const data = await response.json();
        const audioData = `data:audio/wav;base64,${data.audio}`;
        const audio = new Audio(audioData);

        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);

        await audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("Error with text-to-speech:", error);
      setIsSpeaking(false);
    }
  };

  const getStatusText = () => {
    if (isListening) return "Listening";
    if (isProcessing) return "Processing";
    if (isSpeaking) return "Responding";
    return "Ready";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex flex-col">
      {/* Navigation Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-200 p-2 rounded-full">
              <Bot className="w-6 h-6 text-gray-800" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GramSathi AI</h1>
              <p className="text-sm text-gray-600">Voice Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
            <Link
              href="/chat"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Chat AI
            </Link>
            <Link
              href="/dashboard"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <User className="w-5 h-5" />
              Profile
            </Link>
            <Link
              href="/login"
              className="bg-yellow-200 hover:bg-yellow-300 px-6 py-2 rounded-full text-gray-900 font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Main Voice Assistant Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        {/* Background animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-2xl w-full">
          {/* Main container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-yellow-200">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-gray-900 mb-4 tracking-wide">
                Voice Assistant
              </h2>
              <div className="h-0.5 w-24 bg-gradient-to-r from-yellow-300 to-green-300 mx-auto rounded-full"></div>
            </div>

            {/* Status Display */}
            <div className="text-center mb-12">
              <div className="relative inline-block">
                <h3 className="text-2xl font-light text-gray-800 mb-6">
                  {getStatusText()}
                </h3>

                {/* Status Animation */}
                {isListening && (
                  <div className="flex justify-center items-center space-x-2 mb-8">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-yellow-400 to-green-400 rounded-full animate-pulse"
                          style={{
                            height: "20px",
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: "1s",
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin"></div>
                    </div>
                  </div>
                )}

                {isSpeaking && (
                  <div className="flex justify-center items-center mb-8">
                    <div className="flex space-x-1">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-green-400 to-yellow-400 rounded-full"
                          style={{
                            height: `${Math.random() * 30 + 10}px`,
                            animation: `pulse 0.${
                              Math.random() * 5 + 5
                            }s ease-in-out infinite alternate`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                {!isListening && !isProcessing && !isSpeaking && (
                  <div className="mb-8">
                    <div className="w-2 h-2 bg-green-400 rounded-full mx-auto animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Voice Control Button */}
            <div className="text-center">
              <div className="relative inline-block">
                {/* Outer ring animation for listening */}
                {(isListening || isRecording) && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-400/50 animate-ping scale-110"></div>
                )}

                {/* Processing ring */}
                {isProcessing && (
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-400/50 animate-pulse scale-110"></div>
                )}

                {/* Speaking ring */}
                {isSpeaking && (
                  <div className="absolute inset-0 rounded-full border-4 border-green-400/50 animate-pulse scale-110"></div>
                )}

                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={isProcessing || isSpeaking}
                  className={`relative w-32 h-32 rounded-full transition-all duration-300 shadow-2xl ${
                    isRecording || isListening
                      ? "bg-gradient-to-br from-red-500 to-red-600 scale-95 shadow-red-500/50"
                      : isProcessing
                      ? "bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-yellow-500/50"
                      : isSpeaking
                      ? "bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/50"
                      : "bg-gradient-to-br from-yellow-300 to-green-400 hover:scale-105 shadow-yellow-500/50"
                  } disabled:opacity-50 disabled:scale-100`}
                >
                  {/* Inner circle */}
                  <div className="absolute inset-4 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <div
                      className={`w-8 h-8 rounded-full transition-all duration-300 ${
                        isRecording || isListening
                          ? "bg-white animate-pulse"
                          : "bg-white/90"
                      }`}
                    ></div>
                  </div>
                </button>
              </div>

              <p className="text-gray-600 text-sm mt-8 font-light">
                {isRecording ? "Release to send" : "Hold to speak"}
              </p>
            </div>

            {/* Instruction text */}
            {!isListening && !isProcessing && !isSpeaking && (
              <div className="text-center mt-12">
                <p className="text-gray-600 text-lg font-light">
                  Press and hold the button to start your conversation
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-700">
                      Ask about farming tips
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-700">Get weather updates</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-700">Learn about schemes</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-700">
                      Health consultations
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.5);
          }
        }
      `}</style>
    </div>
  );
};

export default PremiumVoiceAssistant;
