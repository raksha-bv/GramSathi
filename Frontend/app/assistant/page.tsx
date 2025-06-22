"use client";

import React, { useState, useRef } from "react";
import {
  Bot,
  Home,
  MessageCircle,
  User,
  BarChart3,
  Mic,
  MicOff,
} from "lucide-react";

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
      const response = await fetch("/api/chat", {
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
      {/* Navigation Header - Consistent with chat page */}
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
            <a
              href="/"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              Home
            </a>
            <a
              href="/chat"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              Chat
            </a>
            <a
              href="/dashboard"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              Dashboard
            </a>
            <a
              href="/profile"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              Profile
            </a>
            <a
              href="/login"
              className="bg-yellow-200 hover:bg-yellow-300 px-6 py-2 rounded-full text-gray-900 font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300"
            >
              Log in
            </a>
          </div>
        </div>
      </div>

      {/* Main Voice Assistant Content */}
      <div className="flex-1 overflow-hidden mt-10">
        <div className="h-full max-w-6xl mx-auto p-4 flex flex-col items-center justify-center">
          {/* Subtle background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-yellow-200/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-200/10 rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10 max-w-2xl w-full">
            {/* Main container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-yellow-200">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Voice Assistant
                </h2>
                <div className="h-px w-20 bg-gradient-to-r from-yellow-300 to-green-300 mx-auto"></div>
              </div>

              {/* Status Display */}
              <div className="text-center mb-12">
                <h3 className="text-xl font-medium text-gray-800 mb-8">
                  {getStatusText()}
                </h3>

                {/* Enhanced Status Animations */}
                <div className="flex justify-center items-center mb-8 h-16">
                  {isListening && (
                    <div className="flex items-center space-x-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-8 bg-gradient-to-t from-red-400 to-red-500 rounded-full transform-gpu"
                          style={{
                            animation: `waveform 1.5s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {isProcessing && !isSpeaking && (
                    <div className="relative">
                      <div className="w-12 h-12 border-3 border-yellow-200 rounded-full"></div>
                      <div className="absolute inset-0 w-12 h-12 border-3 border-transparent border-t-yellow-400 rounded-full animate-spin"></div>
                      <div
                        className="absolute inset-2 w-8 h-8 border-2 border-transparent border-t-yellow-300 rounded-full animate-spin animate-reverse"
                        style={{ animationDuration: "0.8s" }}
                      ></div>
                    </div>
                  )}

                  {isSpeaking && !isProcessing && (
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-gradient-to-t from-green-400 to-green-500 rounded-full transform-gpu"
                          style={{
                            height: `${
                              20 + Math.sin(Date.now() / 200 + i) * 10
                            }px`,
                            animation: `speaking 0.6s ease-in-out infinite`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {!isListening && !isProcessing && !isSpeaking && (
                    <div className="flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Control Button */}
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  {/* Ripple effect for active states */}
                  {(isListening || isRecording) && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping scale-110"></div>
                      <div
                        className="absolute inset-0 rounded-full bg-red-400/10 animate-ping scale-125"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                    </>
                  )}

                  {isProcessing && (
                    <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-pulse scale-110"></div>
                  )}

                  {isSpeaking && (
                    <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse scale-110"></div>
                  )}

                  <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    disabled={isProcessing || isSpeaking}
                    className={`relative w-28 h-28 rounded-full transition-all duration-300 shadow-lg transform ${
                      isRecording || isListening
                        ? "bg-gradient-to-br from-red-500 to-red-600 scale-95 shadow-red-500/30"
                        : isProcessing
                        ? "bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-yellow-500/30"
                        : isSpeaking
                        ? "bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/30"
                        : "bg-gradient-to-br from-yellow-300 to-green-400 hover:scale-105 shadow-yellow-500/30 hover:shadow-lg"
                    } disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed`}
                  >
                    {/* Button content */}
                    <div className="absolute inset-3 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      {isRecording || isListening ? (
                        <MicOff className="w-8 h-8 text-white" />
                      ) : (
                        <Mic className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </button>
                </div>

                <p className="text-gray-600 text-sm font-medium">
                  {isRecording ? "Release to send" : "Hold to speak"}
                </p>
              </div>

              {/* Instruction section */}
              {!isListening && !isProcessing && !isSpeaking && (
                <div className="text-center mt-8">
                  <p className="text-gray-600 text-base mb-6">
                    Press and hold the button to start your conversation
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 text-center">
                      <p className="text-sm text-gray-700 font-medium">
                        Ask about farming tips
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 text-center">
                      <p className="text-sm text-gray-700 font-medium">
                        Get weather updates
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 text-center">
                      <p className="text-sm text-gray-700 font-medium">
                        Learn about schemes
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 text-center">
                      <p className="text-sm text-gray-700 font-medium">
                        Health consultations
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes waveform {
          0%,
          100% {
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1.5);
          }
        }

        @keyframes speaking {
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.8);
          }
        }

        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
};

export default PremiumVoiceAssistant;
