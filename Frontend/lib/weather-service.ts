import type {
  WeatherAPICurrentResponse,
  WeatherAPIForecastResponse,
  WeatherAlertType,
} from "../types/weather";

export class WeatherService {
  private baseURL =
    process.env.WEATHER_API_BASE_URL || "http://api.weatherapi.com/v1";
  private apiKey = process.env.WEATHER_API_KEY!;

  async getCurrentWeather(
    location?: string
  ): Promise<WeatherAPICurrentResponse> {
    const query = location || process.env.DEFAULT_LOCATION || "Delhi,India";
    const url = `${this.baseURL}/current.json?key=${
      this.apiKey
    }&q=${encodeURIComponent(query)}&aqi=no`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch current weather: ${response.statusText}`
      );
    }
    return response.json();
  }

  async getWeatherForecast(
    location?: string,
    days: number = 7
  ): Promise<WeatherAPIForecastResponse> {
    const query = location || process.env.DEFAULT_LOCATION || "Delhi,India";
    const url = `${this.baseURL}/forecast.json?key=${
      this.apiKey
    }&q=${encodeURIComponent(query)}&days=${days}&aqi=no&alerts=yes`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch weather forecast: ${response.statusText}`
      );
    }
    return response.json();
  }

  async getWeatherAlerts(location?: string): Promise<WeatherAlertType[]> {
    const query = location || process.env.DEFAULT_LOCATION || "Delhi,India";
    const url = `${this.baseURL}/alerts.json?key=${
      this.apiKey
    }&q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch weather alerts: ${response.statusText}`
        );
      }
      const data = await response.json();
      return this.processAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }
  }

  private processAlerts(data: any): WeatherAlertType[] {
    const alerts: WeatherAlertType[] = [];

    if (data.alerts && data.alerts.alert && Array.isArray(data.alerts.alert)) {
      data.alerts.alert.forEach((alert: any, index: number) => {
        alerts.push({
          id: `alert-${index}`,
          title: alert.headline || alert.event || "Weather Alert",
          description: alert.desc || alert.note || "No description available",
          severity: this.mapSeverity(alert.severity),
          type: this.mapAlertType(alert.category || alert.event),
          expires: alert.expires,
          instruction: alert.instruction,
        });
      });
    }

    return alerts;
  }

  generateFarmingAlerts(
    forecast: WeatherAPIForecastResponse
  ): WeatherAlertType[] {
    const alerts: WeatherAlertType[] = [];
    const current = forecast.current;
    const todayForecast = forecast.forecast.forecastday[0];

    // High temperature alert
    if (current.temp_c > 40) {
      alerts.push({
        id: "high-temp",
        title: "Extreme Heat Warning",
        description: `Current temperature is ${current.temp_c}°C. Avoid field work during peak hours (11 AM - 4 PM).`,
        severity: "high",
        type: "temperature",
      });
    }

    // Heavy rainfall alert
    if (todayForecast.day.totalprecip_mm > 50) {
      alerts.push({
        id: "heavy-rain",
        title: "Heavy Rainfall Expected",
        description: `Expected rainfall: ${todayForecast.day.totalprecip_mm}mm. Check drainage systems and postpone spraying.`,
        severity: "high",
        type: "rainfall",
      });
    }

    // High wind alert
    if (current.wind_kph > 50) {
      alerts.push({
        id: "high-wind",
        title: "Strong Wind Warning",
        description: `Wind speed: ${current.wind_kph} km/h. Secure loose structures and avoid aerial spraying.`,
        severity: "high",
        type: "wind",
      });
    }

    // Low humidity alert
    if (current.humidity < 30) {
      alerts.push({
        id: "low-humidity",
        title: "Low Humidity Alert",
        description: `Humidity: ${current.humidity}%. Increase irrigation frequency and consider mulching.`,
        severity: "medium",
        type: "humidity",
      });
    }

    // Frost warning
    if (todayForecast.day.mintemp_c < 2) {
      alerts.push({
        id: "frost-warning",
        title: "Frost Warning",
        description: `Minimum temperature expected: ${todayForecast.day.mintemp_c}°C. Protect sensitive crops.`,
        severity: "high",
        type: "temperature",
      });
    }

    return alerts;
  }

  private mapSeverity(severity?: string): "low" | "medium" | "high" {
    if (!severity) return "medium";

    const severityLower = severity.toLowerCase();
    if (severityLower.includes("severe") || severityLower.includes("extreme")) {
      return "high";
    } else if (severityLower.includes("moderate")) {
      return "medium";
    } else {
      return "low";
    }
  }

  private mapAlertType(
    category?: string
  ): "temperature" | "rainfall" | "wind" | "humidity" | "general" {
    if (!category) return "general";

    const categoryLower = category.toLowerCase();
    if (
      categoryLower.includes("temp") ||
      categoryLower.includes("heat") ||
      categoryLower.includes("cold")
    ) {
      return "temperature";
    } else if (
      categoryLower.includes("rain") ||
      categoryLower.includes("flood") ||
      categoryLower.includes("storm")
    ) {
      return "rainfall";
    } else if (categoryLower.includes("wind")) {
      return "wind";
    } else {
      return "general";
    }
  }
}
