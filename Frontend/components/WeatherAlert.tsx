import React, { useEffect, useState } from "react";
import { WeatherAlertType } from "../types/weather";

const WeatherAlert: React.FC = () => {
  const [alerts, setAlerts] = useState<WeatherAlertType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getWeatherAlerts = async () => {
      try {
        const response = await fetch("/api/weather?type=alerts");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Failed to fetch weather alerts");
        }
        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch weather alerts"
        );
      } finally {
        setLoading(false);
      }
    };

    getWeatherAlerts();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "temperature":
        return "🌡️";
      case "rainfall":
        return "🌧️";
      case "wind":
        return "💨";
      case "humidity":
        return "💧";
      default:
        return "⚠️";
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">Loading weather alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        🌾 Farming Weather Alerts
      </h2>
      {alerts.length === 0 ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">
            ✅ No weather alerts for today. Perfect farming conditions!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border rounded-lg ${getSeverityColor(
                alert.severity
              )}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{alert.title}</h3>
                    <p className="mt-1">{alert.description}</p>
                    {alert.instruction && (
                      <p className="mt-2 text-sm font-medium">
                        💡 <strong>Recommendation:</strong> {alert.instruction}
                      </p>
                    )}
                    {alert.expires && (
                      <p className="mt-1 text-xs opacity-75">
                        Expires: {new Date(alert.expires).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.severity === "high"
                      ? "bg-red-100 text-red-800"
                      : alert.severity === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default WeatherAlert;
