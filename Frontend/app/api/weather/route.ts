import { NextRequest, NextResponse } from "next/server";
import {
  getWeatherData,
  fetchWeatherForecast,
  fetchCurrentWeather,
  fetchWeatherAlerts,
} from "@/lib/weather-api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const location = searchParams.get("location") || process.env.DEFAULT_LOCATION;
  const days = parseInt(searchParams.get("days") || "7");

  try {
    switch (type) {
      case "forecast":
        const forecast = await fetchWeatherForecast(location, days);
        return NextResponse.json(forecast);

      case "current":
        const current = await fetchCurrentWeather(location);
        return NextResponse.json(current);

      case "alerts":
        const alerts = await fetchWeatherAlerts(location);
        return NextResponse.json(alerts);

      case "all":
      default:
        const weatherData = await getWeatherData(location);
        return NextResponse.json(weatherData);
    }
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
