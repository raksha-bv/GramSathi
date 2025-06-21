"use client";

import React, { useEffect, useState, useCallback } from "react";
import { fetchMarketPrices } from "../lib/market-api";
import { MarketPrice } from "../types/market";

interface MarketPricesProps {
  cropsGrown?: string[];
  district?: string;
  state?: string;
}

interface CropPriceData {
  crop: string;
  currentPrice: number;
  trend: "up" | "down" | "stable";
  recommendation: "hold" | "sell";
  priceChange: number;
  bestMarket: string;
  lastUpdated: string;
  status: "pending" | "loading" | "success" | "error";
  error?: string;
}

const MarketPrices: React.FC<MarketPricesProps> = ({
  cropsGrown = [],
  district = "Kolar",
  state = "Karnataka",
}) => {
  const [cropPricesData, setCropPricesData] = useState<CropPriceData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const initializeCropData = (crops: string[]): CropPriceData[] => {
    return crops.map((crop) => ({
      crop,
      currentPrice: 0,
      trend: "stable" as const,
      recommendation: "hold" as const,
      priceChange: 0,
      bestMarket: "Waiting...",
      lastUpdated: "",
      status: "pending" as const,
    }));
  };

  const analyzePriceTrend = (
    prices: MarketPrice[]
  ): {
    trend: "up" | "down" | "stable";
    recommendation: "hold" | "sell";
    priceChange: number;
    currentPrice: number;
    bestMarket: string;
    lastUpdated: string;
  } => {
    if (prices.length === 0) {
      return {
        trend: "stable",
        recommendation: "hold",
        priceChange: 0,
        currentPrice: 0,
        bestMarket: "No data",
        lastUpdated: "No data",
      };
    }

    // Sort by date (most recent first)
    const sortedPrices = [...prices].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const currentPrice = sortedPrices[0]?.price || 0;
    const previousPrice = sortedPrices[1]?.price || currentPrice;
    const priceChange =
      previousPrice > 0
        ? ((currentPrice - previousPrice) / previousPrice) * 100
        : 0;

    // Find best market (highest current price)
    const bestMarketPrice = prices.reduce(
      (max, current) => (current.price > max.price ? current : max),
      prices[0]
    );

    // Simple trend analysis
    let trend: "up" | "down" | "stable" = "stable";
    if (priceChange > 3) trend = "up";
    else if (priceChange < -3) trend = "down";

    // Simple recommendation logic
    let recommendation: "hold" | "sell" = "hold";
    if (trend === "down" || currentPrice > 2500) recommendation = "sell";
    else if (trend === "up") recommendation = "hold";

    return {
      trend,
      recommendation,
      priceChange,
      currentPrice,
      bestMarket: bestMarketPrice?.market || "Unknown",
      lastUpdated: sortedPrices[0]?.date || "Unknown",
    };
  };

  const updateCropStatus = (crop: string, updates: Partial<CropPriceData>) => {
    setCropPricesData((prev) =>
      prev.map((item) => (item.crop === crop ? { ...item, ...updates } : item))
    );
  };

  const fetchSingleCropPrice = async (crop: string): Promise<void> => {
    console.log(`Starting to fetch price for ${crop}`);

    // Update status to loading
    updateCropStatus(crop, {
      status: "loading",
      bestMarket: "Fetching...",
    });

    try {
      console.log(`Calling API for ${crop} in ${district}, ${state}`);
      const prices = await fetchMarketPrices(crop, state, district);
      console.log(`Received ${prices.length} prices for ${crop}`);

      if (prices.length === 0) {
        updateCropStatus(crop, {
          status: "error",
          error: "No price data available",
          bestMarket: "No data",
          lastUpdated: "No data available",
        });
        return;
      }

      const analysis = analyzePriceTrend(prices);

      updateCropStatus(crop, {
        status: "success",
        currentPrice: analysis.currentPrice,
        trend: analysis.trend,
        recommendation: analysis.recommendation,
        priceChange: analysis.priceChange,
        bestMarket: analysis.bestMarket,
        lastUpdated: analysis.lastUpdated,
        error: undefined,
      });

      console.log(
        `Successfully updated ${crop} with price: ₹${analysis.currentPrice}`
      );
    } catch (error) {
      console.error(`Error fetching price for ${crop}:`, error);
      updateCropStatus(crop, {
        status: "error",
        error: error instanceof Error ? error.message : "Failed to fetch price",
        bestMarket: "Error",
        lastUpdated: "Failed to load",
      });
    }
  };

  // Process crops one by one
  const processNextCrop = useCallback(async () => {
    if (isProcessing || !cropsGrown || cropsGrown.length === 0 || currentIndex >= cropsGrown.length) {
      return;
    }

    setIsProcessing(true);
    const currentCrop = cropsGrown[currentIndex];
    
    try {
      await fetchSingleCropPrice(currentCrop);
    } finally {
      setIsProcessing(false);
      setCurrentIndex(prev => prev + 1);
    }
  }, [isProcessing, cropsGrown, currentIndex, district, state]);

  // Initialize crops data when cropsGrown changes
  useEffect(() => {
    if (!cropsGrown || cropsGrown.length === 0) {
      setCropPricesData([]);
      setCurrentIndex(0);
      setIsProcessing(false);
      return;
    }

    console.log("Initializing market prices for crops:", cropsGrown);
    
    // Reset everything
    const initialData = initializeCropData(cropsGrown);
    setCropPricesData(initialData);
    setCurrentIndex(0);
    setIsProcessing(false);
  }, [cropsGrown, district, state]);

  // Process crops when currentIndex changes
  useEffect(() => {
    if (currentIndex < cropsGrown.length && !isProcessing) {
      console.log(`Processing crop ${currentIndex + 1}/${cropsGrown.length}: ${cropsGrown[currentIndex]}`);
      processNextCrop();
    } else if (currentIndex >= cropsGrown.length && currentIndex > 0) {
      console.log("Finished processing all crops");
    }
  }, [currentIndex, isProcessing, processNextCrop]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      default:
        return "➡️";
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    return recommendation === "sell"
      ? "text-green-600 bg-green-50"
      : "text-orange-600 bg-orange-50";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "border-green-200";
      case "error":
        return "border-red-200";
      case "loading":
        return "border-blue-200";
      default:
        return "border-gray-200";
    }
  };

  const getCurrentlyProcessing = () => {
    if (currentIndex < cropsGrown.length) {
      return cropsGrown[currentIndex];
    }
    return null;
  };

  if (!cropsGrown || cropsGrown.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-lg">📈</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Market Prices</h2>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm">
            Add crops to your profile to see market prices
          </p>
        </div>
      </div>
    );
  }

  const currentlyProcessing = getCurrentlyProcessing();

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-lg">📈</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Your Crop Prices
        </h2>
        {currentlyProcessing && (
          <div className="text-sm text-blue-600">
            Fetching {currentlyProcessing}... ({currentIndex + 1}/{cropsGrown.length})
          </div>
        )}
      </div>

      <div className="space-y-4">
        {cropPricesData.map((cropData, index) => (
          <div
            key={cropData.crop}
            className={`border rounded-lg p-4 ${getStatusColor(
              cropData.status
            )}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-900">{cropData.crop}</h3>
                <p className="text-sm text-gray-600">
                  Best at: {cropData.bestMarket}
                </p>
              </div>
              <div className="text-right">
                {cropData.status === "pending" && (
                  <div className="text-sm text-gray-500">
                    {index === currentIndex ? "Next" : `Position: ${index + 1}`}
                  </div>
                )}
                {cropData.status === "loading" && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-600">Loading...</span>
                  </div>
                )}
                {cropData.status === "error" && (
                  <div>
                    <p className="text-sm text-red-600">Failed</p>
                    <p className="text-xs text-gray-500">{cropData.error}</p>
                  </div>
                )}
                {cropData.status === "success" && (
                  <div>
                    <p className="font-semibold text-lg">
                      ₹{cropData.currentPrice.toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500">per quintal</p>
                  </div>
                )}
              </div>
            </div>

            {cropData.status === "success" && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <span>{getTrendIcon(cropData.trend)}</span>
                    <span
                      className={`text-sm ${
                        cropData.priceChange > 0
                          ? "text-green-600"
                          : cropData.priceChange < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {cropData.priceChange > 0 ? "+" : ""}
                      {cropData.priceChange.toFixed(1)}%
                    </span>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getRecommendationColor(
                      cropData.recommendation
                    )}`}
                  >
                    {cropData.recommendation === "sell"
                      ? "💰 Sell Now"
                      : "⏳ Hold"}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-2">
                  Last updated: {cropData.lastUpdated}
                </div>

                {cropData.recommendation === "sell" && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-xs text-green-700">
                      💡 Good time to sell! Prices are favorable in{" "}
                      {cropData.bestMarket}
                    </p>
                  </div>
                )}

                {cropData.trend === "up" &&
                  cropData.recommendation === "hold" && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-3">
                      <p className="text-xs text-orange-700">
                        📊 Prices are rising. Consider holding for better rates.
                      </p>
                    </div>
                  )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Data from {state} markets • Prices in ₹ per quintal
      </div>
    </div>
  );
};

export default MarketPrices;
