import { WeatherService } from "./weather-service";
import {
  WeatherAPICurrentResponse,
  WeatherAPIForecastResponse,
  WeatherAlertType,
  ProcessedWeatherData,
} from "../types/weather";

const weatherService = new WeatherService();

export async function fetchCurrentWeather(
  location?: string
): Promise<WeatherAPICurrentResponse> {
  try {
    return await weatherService.getCurrentWeather(location);
  } catch (error) {
    console.error("Error fetching current weather:", error);
    throw error;
  }
}

export async function fetchWeatherForecast(
  location?: string,
  days: number = 7
): Promise<WeatherAPIForecastResponse> {
  try {
    return await weatherService.getWeatherForecast(location, days);
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    throw error;
  }
}

export async function fetchWeatherAlerts(
  location?: string
): Promise<WeatherAlertType[]> {
  try {
    // Get both official alerts and farming-specific alerts
    const [officialAlerts, forecast] = await Promise.all([
      weatherService.getWeatherAlerts(location),
      weatherService.getWeatherForecast(location, 1),
    ]);

    const farmingAlerts = weatherService.generateFarmingAlerts(forecast);

    return [...officialAlerts, ...farmingAlerts];
  } catch (error) {
    console.error("Error generating weather alerts:", error);
    return [];
  }
}

export async function getWeatherData(
  location?: string
): Promise<ProcessedWeatherData> {
  try {
    const [current, forecast] = await Promise.all([
      weatherService.getCurrentWeather(location),
      weatherService.getWeatherForecast(location, 7),
    ]);

    // Generate comprehensive alerts
    const officialAlerts = await weatherService.getWeatherAlerts(location);
    const farmingAlerts = weatherService.generateFarmingAlerts(forecast);
    const alerts = [...officialAlerts, ...farmingAlerts];

    return {
      current,
      forecast,
      alerts,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}
