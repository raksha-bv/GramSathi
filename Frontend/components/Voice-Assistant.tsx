"use client";

import React, { useState, useRef } from "react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      {/* Background animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Main container */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-light text-white mb-4 tracking-wide">
              Voice Assistant
            </h1>
            <div className="h-0.5 w-24 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto rounded-full"></div>
          </div>

          {/* Status Display */}
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <h2 className="text-2xl font-light text-white/90 mb-6">
                {getStatusText()}
              </h2>

              {/* Status Animation */}
              {isListening && (
                <div className="flex justify-center items-center space-x-2 mb-8">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-purple-400 to-blue-400 rounded-full animate-pulse"
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
                    <div className="w-12 h-12 border-4 border-white/20 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"></div>
                  </div>
                </div>
              )}

              {isSpeaking && (
                <div className="flex justify-center items-center mb-8">
                  <div className="flex space-x-1">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-green-400 to-blue-400 rounded-full"
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
                    ? "bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-yellow-500/50"
                    : isSpeaking
                    ? "bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/50"
                    : "bg-gradient-to-br from-purple-500 to-blue-600 hover:scale-105 shadow-purple-500/50"
                } disabled:opacity-50 disabled:scale-100`}
              >
                {/* Inner circle */}
                <div className="absolute inset-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div
                    className={`w-8 h-8 rounded-full transition-all duration-300 ${
                      isRecording || isListening
                        ? "bg-white animate-pulse"
                        : "bg-white/80"
                    }`}
                  ></div>
                </div>
              </button>
            </div>

            <p className="text-white/70 text-sm mt-8 font-light">
              {isRecording ? "Release to send" : "Hold to speak"}
            </p>
          </div>

          {/* Instruction text */}
          {!isListening && !isProcessing && !isSpeaking && (
            <div className="text-center mt-12">
              <p className="text-white/60 text-lg font-light">
                Press and hold the button to start your conversation
              </p>
            </div>
          )}
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
