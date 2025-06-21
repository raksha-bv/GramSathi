import { SarvamAIService } from "./sarvam-service";
import {
  fetchCurrentWeather,
  fetchWeatherForecast,
  fetchWeatherAlerts,
} from "./weather-api";
import { fetchCommodityPrice, getLatestPrice } from "./market-api";
import { MarketIntent } from "../types/market";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface WeatherIntent {
  type: "current" | "forecast" | "alerts" | "none";
  location?: string;
  days?: number;
}

interface AppointmentIntent {
  type: "schedule" | "none"; // Remove "collect_info" since it's not used
  appointmentType?: string;
  dateTime?: string;
  phoneNumber?: string;
  missingInfo?: string[];
}

export class ChatbotService {
  private sarvamAI: SarvamAIService;
  private conversationHistory: ChatMessage[] = [];
  private lastMarketQuery: {
    commodity?: string;
    location?: string;
    state?: string;
  } = {}; // Add context storage

  constructor() {
    this.sarvamAI = new SarvamAIService();
    this.initializeSystem();
  }

  private initializeSystem() {
    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are a helpful AI assistant for farmers in India. Provide concise, practical farming advice.`,
      timestamp: new Date(),
    };

    this.conversationHistory.push(systemMessage);
  }

  async processMessage(
    userMessage: string,
    location?: string
  ): Promise<{
    response: string;
    audioUrl?: string;
    weatherData?: any;
    marketData?: any;
    appointmentScheduled?: boolean;
    needsAppointmentInfo?: boolean;
  }> {
    try {
      console.log("Processing message:", userMessage);

      // Add user message to history
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      });

      // Detect intents
      const appointmentIntent = this.detectAppointmentIntent(userMessage);
      console.log("Detected appointment intent:", appointmentIntent);

      let response: string;
      let weatherData: any = null;
      let marketData: any = null;
      let appointmentScheduled = false;
      let needsAppointmentInfo = false;

      // Handle appointment scheduling FIRST and ONLY
      if (appointmentIntent.type === "schedule") {
        const missingInfo = [];

        if (!appointmentIntent.dateTime) {
          missingInfo.push("appointment time");
        }
        if (!appointmentIntent.phoneNumber) {
          missingInfo.push("phone number");
        }

        if (missingInfo.length > 0) {
          needsAppointmentInfo = true;
          response = this.generateAppointmentInfoRequest(
            appointmentIntent,
            missingInfo
          );
        } else {
          // All info available, schedule the appointment
          try {
            console.log("Scheduling appointment with:", appointmentIntent);
            const result = await this.scheduleAppointmentReminder(
              appointmentIntent
            );

            if (result.success) {
              appointmentScheduled = true;
              response = `Perfect! I've scheduled a reminder call for your ${appointmentIntent.appointmentType} appointment. You'll receive a call at ${appointmentIntent.phoneNumber} one hour before your appointment. The reminder is set for ${result.reminder_time}.`;

              // Clear appointment context to prevent interference with new appointments
              setTimeout(() => {
                this.clearAppointmentContext();
              }, 100);
            } else {
              response = `I tried to schedule your appointment reminder, but there was an issue: ${result.error}. Please try again with the correct format.`;
            }
          } catch (error) {
            console.error("Appointment scheduling error:", error);
            response =
              "I understand you want to schedule an appointment reminder, but I'm having trouble connecting to the scheduling system right now. Please try again later.";
          }
        }

        // Return immediately for appointment scheduling - don't process other intents
        return {
          response,
          appointmentScheduled,
          needsAppointmentInfo,
        };
      }

      // Only process other intents if it's NOT an appointment
      const weatherIntent = this.detectWeatherIntent(userMessage);
      const marketIntent = this.detectMarketIntent(userMessage);

      // Handle market queries first
      if (marketIntent.type !== "none") {
        try {
          console.log("Fetching market data...");

          // Use context from previous queries if current query is incomplete
          const effectiveIntent = this.enhanceMarketIntentWithContext(
            marketIntent,
            userMessage
          );
          console.log("Enhanced market intent:", effectiveIntent);

          marketData = await this.fetchMarketData(effectiveIntent);
          console.log(
            "Market data fetched:",
            marketData ? "Success" : "No data"
          );

          // Store this query for future context
          if (effectiveIntent.commodity) {
            this.lastMarketQuery = {
              commodity: effectiveIntent.commodity,
              location: effectiveIntent.location,
              state: effectiveIntent.state,
            };
          }

          response = await this.generateAIMarketResponse(
            userMessage,
            marketData,
            effectiveIntent
          );
        } catch (marketError) {
          console.error("Market API error:", marketError);

          // If missing parameters, ask user to clarify
          if (
            marketError instanceof Error &&
            (marketError.message.includes("Missing query parameters") ||
              marketError.message.includes("Commodity not specified"))
          ) {
            response = this.generateMissingParameterResponse(marketIntent);
          } else {
            response =
              "I'm having trouble getting market price data right now. Please try again later.";
          }
        }
      }
      // Handle weather queries
      else if (weatherIntent.type !== "none") {
        try {
          console.log("Fetching weather data...");
          weatherData = await this.fetchWeatherData(weatherIntent, location);
          console.log(
            "Weather data fetched:",
            weatherData ? "Success" : "No data"
          );

          response = await this.generateAIWeatherResponse(
            userMessage,
            weatherData,
            weatherIntent
          );
        } catch (weatherError) {
          console.error("Weather API error:", weatherError);
          response =
            "I'm having trouble getting weather data right now. Please try again later.";
        }
      }
      // General farming chat
      else {
        try {
          console.log("Generating AI response for general farming question...");
          response = await this.sarvamAI.farmingChat(userMessage);
        } catch (aiError) {
          console.error("AI Chat error:", aiError);
          try {
            response = await this.sarvamAI.simpleChat(userMessage);
          } catch (simpleError) {
            console.error("Simple chat error:", simpleError);
            throw simpleError;
          }
        }
      }

      console.log("Generated response:", response);

      // Add assistant response to history
      this.conversationHistory.push({
        role: "assistant",
        content: response,
        timestamp: new Date(),
      });

      // Keep conversation history manageable
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-8), // Keep last 8 messages
        ];
      }

      return {
        response,
        weatherData,
        marketData,
        appointmentScheduled,
        needsAppointmentInfo,
      };
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  }

  private enhanceMarketIntentWithContext(
    intent: MarketIntent,
    userMessage: string
  ): MarketIntent {
    const enhanced = { ...intent };
    const messageLower = userMessage.toLowerCase();

    // If commodity is missing, try to get from context or ask
    if (!enhanced.commodity && this.lastMarketQuery.commodity) {
      // Check if user is asking about price changes, trends, etc. for the same commodity
      if (
        messageLower.includes("price") ||
        messageLower.includes("increase") ||
        messageLower.includes("decrease") ||
        messageLower.includes("tomorrow") ||
        messageLower.includes("change") ||
        messageLower.includes("trend")
      ) {
        enhanced.commodity = this.lastMarketQuery.commodity;
        console.log(`Using commodity from context: ${enhanced.commodity}`);
      }
    }

    // If location is missing, use context or default
    if (!enhanced.location) {
      if (this.lastMarketQuery.location) {
        enhanced.location = this.lastMarketQuery.location;
        console.log(`Using location from context: ${enhanced.location}`);
      } else {
        enhanced.location = "Kolar"; // Default location
        console.log(`Using default location: ${enhanced.location}`);
      }
    }

    // Ensure state is set
    if (!enhanced.state) {
      enhanced.state = this.lastMarketQuery.state || "Karnataka";
    }

    return enhanced;
  }

  private generateMissingParameterResponse(intent: MarketIntent): string {
    const missing: string[] = [];

    if (!intent.commodity) {
      missing.push("crop/commodity (like potato, tomato, onion)");
    }
    if (!intent.location) {
      missing.push("location (like Kolar, Bangalore, Mysore)");
    }

    if (missing.length > 0) {
      return `I need more information to get market prices. Please specify: ${missing.join(
        " and "
      )}. For example: "What is the price of potato in Kolar?"`;
    }

    return "I couldn't understand your market price request. Please ask like: 'What is the price of potato in Kolar today?'";
  }

  private detectMarketIntent(message: string): MarketIntent {
    const messageLower = message.toLowerCase();

    // Price query keywords
    if (
      messageLower.includes("price") ||
      messageLower.includes("cost") ||
      messageLower.includes("rate") ||
      messageLower.includes("market") ||
      messageLower.includes("selling") ||
      messageLower.includes("buying")
    ) {
      // Extract commodity
      const commodity = this.extractCommodity(message);
      const location = this.extractLocation(message);

      return {
        type: "price",
        commodity,
        location,
        state: "Karnataka", // Default state
      };
    }

    return { type: "none" };
  }

  private extractCommodity(message: string): string | undefined {
    const messageLower = message.toLowerCase();

    // Common commodity mappings with more variations
    const commodityMap: { [key: string]: string } = {
      // Potato variations
      potato: "Potato",
      potatoes: "Potato",
      aloo: "Potato",

      // Tomato variations
      tomato: "Tomato",
      tomatoes: "Tomato",
      tamatar: "Tomato",

      // Onion variations
      onion: "Onion",
      onions: "Onion",
      pyaz: "Onion",

      // Other vegetables
      "lady finger": "Lady Finger",
      ladyfinger: "Lady Finger",
      "ladies finger": "Lady Finger",
      ladiesfinger: "Lady Finger",
      okra: "Lady Finger",
      bhindi: "Lady Finger",

      brinjal: "Brinjal",
      eggplant: "Brinjal",
      baingan: "Brinjal",

      cabbage: "Cabbage",
      cauliflower: "Cauliflower",
      carrot: "Carrot",
      beans: "Beans",
      peas: "Peas",

      // Grains
      rice: "Rice",
      wheat: "Wheat",
      corn: "Maize",
      maize: "Maize",
    };

    // Split message into words and filter out common words that might interfere
    const words = messageLower.split(/\s+/);
    const filteredWords = words.filter(
      (word) =>
        ![
          "price",
          "cost",
          "rate",
          "what",
          "is",
          "the",
          "of",
          "in",
          "today",
          "how",
          "much",
        ].includes(word)
    );

    // Check each filtered word
    for (const word of filteredWords) {
      // Clean the word (remove punctuation)
      const cleanWord = word.replace(/[.,!?;:]/g, "");

      for (const [key, value] of Object.entries(commodityMap)) {
        // Exact match or word contains commodity name (but not vice versa to avoid "rice" in "price")
        if (
          cleanWord === key ||
          (cleanWord.length > 3 && cleanWord.includes(key) && key.length > 3)
        ) {
          console.log(`Found commodity: ${cleanWord} -> ${value}`);
          return value;
        }
      }
    }

    console.log("No commodity found in message:", message);
    return undefined;
  }

  private extractLocation(message: string): string | undefined {
    const messageLower = message.toLowerCase();

    // Karnataka districts as returned by the API
    const districts = [
      "bagalkot",
      "bangalore",
      "belgaum",
      "bellary",
      "bidar",
      "bijapur",
      "chamrajnagar",
      "chikmagalur",
      "chitradurga",
      "davangere",
      "dharwad",
      "gadag",
      "hassan",
      "haveri",
      "kalburgi",
      "karwar",
      "kolar",
      "koppal",
      "madikeri",
      "kodagu",
      "mandya",
      "mangalore",
      "mysore",
      "raichur",
      "ramanagar",
      "shimoga",
      "tumkur",
      "udupi",
      "yadgiri",
    ];

    // City to district mapping for better user experience
    const cityToDistrict: { [key: string]: string } = {
      // Cities in Hassan district
      belur: "Hassan",
      halebidu: "Hassan",
      arsikere: "Hassan",

      // Cities in Bangalore district
      bengaluru: "Bangalore",
      bangalore: "Bangalore",

      // Cities in Mysore district
      mysuru: "Mysore",
      mysore: "Mysore",

      // Cities in other districts
      hubli: "Dharwad",
      belagavi: "Belgaum",
      ballari: "Bellary",
      vijayapura: "Bijapur",
      kalaburagi: "Kalburgi",
      shivamogga: "Shimoga",
      tumakuru: "Tumkur",
      chikkamagaluru: "Chikmagalur",
      "uttara kannada": "Karwar",
      "dakshina kannada": "Mangalore",
      mangaluru: "Mangalore",

      // Additional city mappings
      chintamani: "Kolar",
      malur: "Kolar",
      srinivaspur: "Kolar",
      mulbagal: "Kolar",
      bagepalli: "Kolar",
      gauribidanur: "Kolar",
      sidlaghatta: "Kolar",
    };

    const words = messageLower.split(/\s+/);

    for (const word of words) {
      // Clean the word (remove punctuation)
      const cleanWord = word.replace(/[.,!?;:]/g, "");

      // Skip common words that are not locations
      if (
        [
          "price",
          "of",
          "in",
          "at",
          "the",
          "today",
          "tomorrow",
          "what",
          "is",
          "how",
          "much",
        ].includes(cleanWord)
      ) {
        continue;
      }

      // First check if it's a direct district match
      for (const district of districts) {
        if (
          cleanWord === district ||
          cleanWord.includes(district) ||
          district.includes(cleanWord)
        ) {
          const properDistrict =
            district.charAt(0).toUpperCase() + district.slice(1);
          console.log(`Found district: ${cleanWord} -> ${properDistrict}`);
          return properDistrict;
        }
      }

      // Then check city to district mapping
      for (const [city, district] of Object.entries(cityToDistrict)) {
        if (
          cleanWord === city ||
          cleanWord.includes(city) ||
          city.includes(cleanWord)
        ) {
          console.log(`Found city: ${cleanWord} -> ${city} -> ${district}`);
          return district;
        }
      }
    }

    console.log("No location found in message:", message);
    return undefined;
  }

  private async fetchMarketData(intent: MarketIntent) {
    if (!intent.commodity) {
      throw new Error("Commodity not specified");
    }

    if (!intent.location) {
      intent.location = "Kolar"; // Default location
    }

    if (!intent.state) {
      intent.state = "Karnataka"; // Default state
    }

    try {
      // Try to get specific location price first
      const prices = await fetchCommodityPrice(
        intent.commodity,
        intent.location,
        intent.state
      );

      if (prices && prices.length > 0) {
        return prices;
      }

      // If no specific location data, get latest price
      return await getLatestPrice(
        intent.commodity,
        intent.location,
        intent.state
      );
    } catch (error) {
      console.error("Error in fetchMarketData:", error);
      throw error;
    }
  }

  private async generateAIMarketResponse(
    userMessage: string,
    marketData: any,
    intent: MarketIntent
  ): Promise<string> {
    let marketContext = "";

    if (Array.isArray(marketData) && marketData.length > 0) {
      // Check if this is state-level data (district not found)
      const isStateLevelData = marketData.some((item) => !item.districtFound);

      if (intent.location && isStateLevelData) {
        // Calculate summary for state-level data
        const prices = marketData
          .map((item) => item.price)
          .filter((price) => price > 0);
        const avgPrice =
          prices.length > 0
            ? prices.reduce((a, b) => a + b, 0) / prices.length
            : 0;
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);

        marketContext = `${intent.commodity} prices in ${intent.state} state (${intent.location} district data not available): `;
        marketContext += `Average: ₹${avgPrice.toFixed(0)}/quintal, `;
        marketContext += `Range: ₹${minPrice} - ₹${maxPrice}/quintal. `;

        // Show top 3 markets
        const topMarkets = marketData
          .sort((a: any, b: any) => b.price - a.price)
          .slice(0, 3)
          .map((item: any) => `${item.market}: ₹${item.price}`)
          .join(", ");
        marketContext += `Top markets: ${topMarkets}. `;
      } else {
        // Show specific location data
        const targetLocation = intent.location?.toLowerCase();
        const locationSpecific = targetLocation
          ? marketData.filter((item: any) =>
              item.market.toLowerCase().includes(targetLocation)
            )
          : marketData.slice(0, 5);

        if (locationSpecific.length > 0) {
          const priceInfo = locationSpecific
            .map(
              (price: any) =>
                `${price.market}: ₹${price.price}/quintal (${price.date})`
            )
            .join(", ");
          marketContext = `${intent.commodity} prices: ${priceInfo}. `;
        } else {
          // Fallback to general state data
          const priceInfo = marketData
            .slice(0, 3)
            .map((price: any) => `${price.market}: ₹${price.price}/quintal`)
            .join(", ");
          marketContext = `${intent.commodity} prices in ${intent.state}: ${priceInfo}. `;
        }
      }
    } else if (marketData && !Array.isArray(marketData)) {
      // Single market price
      marketContext = `${intent.commodity} price in ${marketData.market}: ₹${marketData.price}/quintal (${marketData.date}). `;
      if (marketData.minPrice && marketData.maxPrice) {
        marketContext += `Range: ₹${marketData.minPrice} - ₹${marketData.maxPrice}/quintal. `;
      }
    } else {
      marketContext = `No current market price data available for ${
        intent.commodity
      }${intent.location ? ` in ${intent.location}` : ""}. `;
    }

    const prompt = `User asked: "${userMessage}"
    
Market price information: ${marketContext}

Please provide a helpful response about market prices with practical advice for farmers. Include selling recommendations if prices are good, or storage/waiting advice if prices are low. Be concise and actionable. If the requested district data wasn't available, mention that state-level data is provided instead.`;

    return await this.sarvamAI.simpleChat(prompt);
  }

  private detectWeatherIntent(message: string): WeatherIntent {
    const messageLower = message.toLowerCase();

    // Current weather keywords
    if (
      messageLower.includes("current weather") ||
      messageLower.includes("weather now") ||
      messageLower.includes("weather today") ||
      messageLower.includes("what is the weather") ||
      messageLower.includes("how is the weather")
    ) {
      return { type: "current" };
    }

    // Forecast keywords
    if (
      messageLower.includes("forecast") ||
      messageLower.includes("weather tomorrow") ||
      messageLower.includes("next week") ||
      messageLower.includes("coming days")
    ) {
      const days = this.extractDays(message);
      return { type: "forecast", days };
    }

    // Alerts keywords
    if (
      messageLower.includes("alerts") ||
      messageLower.includes("warnings") ||
      messageLower.includes("weather alert")
    ) {
      return { type: "alerts" };
    }

    return { type: "none" };
  }

  private extractDays(message: string): number {
    const match = message.match(/(\d+)\s*days?/i);
    if (match) {
      const days = parseInt(match[1]);
      return Math.min(Math.max(days, 1), 7); // Limit between 1-7 days
    }
    return 7; // Default to 7 days
  }

  private async fetchWeatherData(intent: WeatherIntent, location?: string) {
    const targetLocation = location || "Delhi,India";

    switch (intent.type) {
      case "current":
        return await fetchCurrentWeather(targetLocation);
      case "forecast":
        return await fetchWeatherForecast(targetLocation, intent.days || 7);
      case "alerts":
        return await fetchWeatherAlerts(targetLocation);
      default:
        return null;
    }
  }

  private async generateAIWeatherResponse(
    userMessage: string,
    weatherData: any,
    intent: WeatherIntent
  ): Promise<string> {
    let weatherContext = "";

    switch (intent.type) {
      case "current":
        if (weatherData && weatherData.current) {
          weatherContext = `Current weather: ${weatherData.current.temp_c}°C, ${weatherData.current.condition.text}, humidity ${weatherData.current.humidity}% in ${weatherData.location.name}. `;
        }
        break;

      case "forecast":
        if (
          weatherData &&
          weatherData.forecast &&
          weatherData.forecast.forecastday[0]
        ) {
          const forecast = weatherData.forecast.forecastday[0];
          weatherContext = `Today's forecast: ${forecast.day.condition.text}, high ${forecast.day.maxtemp_c}°C, low ${forecast.day.mintemp_c}°C, rain chance ${forecast.day.daily_chance_of_rain}%. `;
        }
        break;

      case "alerts":
        if (weatherData && weatherData.length > 0) {
          const alertTitles = weatherData
            .slice(0, 2)
            .map((alert: any) => alert.title);
          weatherContext = `Weather alerts: ${alertTitles.join(", ")}. `;
        } else {
          weatherContext = "No weather alerts currently. ";
        }
        break;
    }

    const prompt = `User asked: "${userMessage}"
    
Weather information: ${weatherContext}

Please provide a helpful response about the weather with practical farming advice. Be concise and focus on actionable recommendations for farmers.`;

    return await this.sarvamAI.farmingChat(prompt, weatherData);
  }

  async translateResponse(
    text: string,
    targetLanguage: string
  ): Promise<string> {
    try {
      return await this.sarvamAI.translateText(text, targetLanguage);
    } catch (error) {
      console.error("Translation error:", error);
      return text; // Return original text if translation fails
    }
  }

  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory.filter((msg) => msg.role !== "system");
  }

  clearHistory() {
    this.conversationHistory = this.conversationHistory.slice(0, 1); // Keep only system message
  }

  private detectAppointmentIntent(message: string): AppointmentIntent {
    const messageLower = message.toLowerCase();

    // Check for appointment keywords OR date/time patterns that could be appointments
    const hasAppointmentKeywords =
      messageLower.includes("appointment") ||
      messageLower.includes("scheduled") ||
      messageLower.includes("gynacologist") ||
      messageLower.includes("doctor") ||
      messageLower.includes("medical") ||
      messageLower.includes("dentist") ||
      messageLower.includes("checkup") ||
      messageLower.includes("visit");

    // Check if this looks like a date/time response (for follow-up appointment scheduling)
    const hasDateTimePattern = this.looksLikeDateTimeResponse(message);

    // Check if this looks like a phone number response
    const hasPhoneNumberPattern = this.looksLikePhoneNumberResponse(message);

    // Check if we're in the middle of an appointment conversation
    const recentAppointmentContext = this.hasRecentAppointmentContext();

    // Check if this is a NEW appointment request (contains "schedule" or "want to")
    const isNewAppointmentRequest =
      messageLower.includes("schedule") ||
      messageLower.includes("want to") ||
      messageLower.includes("need to") ||
      messageLower.includes("book") ||
      messageLower.includes("set up");

    if (
      hasAppointmentKeywords ||
      (hasDateTimePattern && recentAppointmentContext) ||
      (hasPhoneNumberPattern && recentAppointmentContext)
    ) {
      // Extract appointment type
      let appointmentType = "gynacologist"; // default
      if (messageLower.includes("gynacologist"))
        appointmentType = "gynacologist";
      if (messageLower.includes("doctor")) appointmentType = "doctor";
      if (messageLower.includes("medical")) appointmentType = "medical";
      if (messageLower.includes("dentist")) appointmentType = "dentist";
      if (messageLower.includes("cardiologist"))
        appointmentType = "cardiologist";

      // If this is a phone number response, get the appointment type from recent context
      if (hasPhoneNumberPattern && recentAppointmentContext) {
        appointmentType =
          this.getAppointmentTypeFromContext() || "gynacologist";
      }

      // Extract date and time
      let dateTime = this.extractAppointmentDateTime(message);

      // Only use context datetime if:
      // 1. It's NOT a new appointment request, AND
      // 2. Current message doesn't have datetime, AND
      // 3. It's a phone number follow-up
      if (
        !dateTime &&
        !isNewAppointmentRequest &&
        hasPhoneNumberPattern &&
        recentAppointmentContext
      ) {
        dateTime = this.getDateTimeFromContext();
      }

      const phoneNumber = this.extractPhoneNumber(message);

      return {
        type: "schedule",
        appointmentType,
        dateTime,
        phoneNumber,
      };
    }

    return { type: "none" };
  }

  private looksLikeDateTimeResponse(message: string): boolean {
    const messageLower = message.toLowerCase();

    // Check for date/time patterns
    const dateTimePatterns = [
      // Month day at time patterns
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}\s+at\s+\d{1,2}:\d{2}\s*(am|pm)/i,
      // Tomorrow/today at time
      /(tomorrow|today)\s+at\s+\d{1,2}:\d{2}\s*(am|pm)/i,
      // Just time patterns
      /\d{1,2}:\d{2}\s*(am|pm)/i,
      // Date patterns
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/,
      // Month day patterns
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
    ];

    return dateTimePatterns.some((pattern) => pattern.test(message));
  }

  private looksLikePhoneNumberResponse(message: string): boolean {
    // Check if the message is primarily a phone number
    const cleanMessage = message.replace(/[\s\-\(\)]/g, "");

    // Phone number patterns
    const phonePatterns = [
      /^(\+91|91)?[6-9]\d{9}$/, // Indian phone numbers
      /^(\+1)?[2-9]\d{9}$/, // US phone numbers
      /^(\+\d{1,3})?\d{10,15}$/, // General international format
    ];

    return phonePatterns.some((pattern) => pattern.test(cleanMessage));
  }

  private getAppointmentTypeFromContext(): string | undefined {
    // Look for appointment type in recent messages
    const recentMessages = this.conversationHistory.slice(-4);

    for (const message of recentMessages) {
      const content = message.content.toLowerCase();
      if (content.includes("gynacologist")) return "gynacologist";
      if (content.includes("doctor")) return "doctor";
      if (content.includes("medical")) return "medical";
      if (content.includes("dentist")) return "dentist";
      if (content.includes("cardiologist")) return "cardiologist";
    }

    return "gynacologist"; // default
  }

  private getDateTimeFromContext(): string | undefined {
    // Look for date/time in recent messages
    const recentMessages = this.conversationHistory.slice(-4);

    for (const message of recentMessages) {
      const dateTime = this.extractAppointmentDateTime(message.content);
      if (dateTime) {
        return dateTime;
      }
    }

    return undefined;
  }

  private hasRecentAppointmentContext(): boolean {
    // Check if the last few messages in conversation history contain appointment-related content
    const recentMessages = this.conversationHistory.slice(-3); // Reduce to last 3 messages for more recent context

    // Don't consider context if the most recent message was an appointment completion
    const lastMessage = recentMessages[recentMessages.length - 1];
    if (
      lastMessage &&
      lastMessage.content.toLowerCase().includes("reminder is set for")
    ) {
      return false; // Previous appointment was completed, start fresh
    }

    return recentMessages.some((message) => {
      const content = message.content.toLowerCase();
      return (
        content.includes("what time") ||
        content.includes("phone number") ||
        content.includes("call for the reminder") ||
        (content.includes("appointment") &&
          !content.includes("reminder is set"))
      );
    });
  }

  // Clear appointment context after successful scheduling
  private clearAppointmentContext(): void {
    // Remove appointment-related messages from recent history to prevent context bleeding
    const recentCount = 3;
    if (this.conversationHistory.length > recentCount) {
      const systemMessage = this.conversationHistory[0];
      const nonAppointmentMessages = this.conversationHistory
        .slice(1)
        .filter(
          (msg) =>
            !msg.content.toLowerCase().includes("appointment") &&
            !msg.content.toLowerCase().includes("reminder") &&
            !msg.content.toLowerCase().includes("schedule")
        );

      this.conversationHistory = [
        systemMessage,
        ...nonAppointmentMessages.slice(-recentCount),
      ];
    }
  }

  private extractAppointmentDateTime(message: string): string | undefined {
    const messageLower = message.toLowerCase();

    // Pattern for "20 June at 11:06 PM" or "June 20 at 11:06 PM"
    const dayMonthTimePattern =
      /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+at\s+(\d{1,2}):(\d{2})\s*(am|pm)/i;
    const monthDayTimePattern =
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\s+at\s+(\d{1,2}):(\d{2})\s*(am|pm)/i;

    let match = message.match(dayMonthTimePattern);
    if (match) {
      const day = match[1];
      const month = match[2];
      const hour = match[3];
      const minute = match[4];
      const period = match[5];

      const currentYear = new Date().getFullYear();
      const monthNumber = this.getMonthNumber(month);

      // Convert to 24-hour format
      let hour24 = parseInt(hour);
      if (period.toLowerCase() === "pm" && hour24 !== 12) {
        hour24 += 12;
      } else if (period.toLowerCase() === "am" && hour24 === 12) {
        hour24 = 0;
      }

      return `${currentYear}-${monthNumber
        .toString()
        .padStart(2, "0")}-${day.padStart(2, "0")} ${hour24
        .toString()
        .padStart(2, "0")}:${minute}`;
    }

    // Try the original pattern "june 20 at 10:40 PM"
    match = message.match(monthDayTimePattern);
    if (match) {
      const month = match[1];
      const day = match[2];
      const hour = match[3];
      const minute = match[4];
      const period = match[5];

      const currentYear = new Date().getFullYear();
      const monthNumber = this.getMonthNumber(month);

      // Convert to 24-hour format
      let hour24 = parseInt(hour);
      if (period.toLowerCase() === "pm" && hour24 !== 12) {
        hour24 += 12;
      } else if (period.toLowerCase() === "am" && hour24 === 12) {
        hour24 = 0;
      }

      return `${currentYear}-${monthNumber
        .toString()
        .padStart(2, "0")}-${day.padStart(2, "0")} ${hour24
        .toString()
        .padStart(2, "0")}:${minute}`;
    }

    // Fallback to existing logic for other patterns
    const timePatterns = [
      /at (\d{1,2}):(\d{2})\s*(am|pm)/i,
      /at (\d{1,2})\s*(am|pm)/i,
      /(\d{1,2}):(\d{2})\s*(am|pm)/i,
      /(\d{1,2})\s*(am|pm)/i,
    ];

    let timeMatch = null;
    for (const pattern of timePatterns) {
      timeMatch = message.match(pattern);
      if (timeMatch) break;
    }

    if (timeMatch) {
      return `tomorrow ${timeMatch[0]}`;
    }

    return undefined;
  }

  private getMonthNumber(monthName: string): number {
    const months: { [key: string]: number } = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
    };
    return months[monthName.toLowerCase()] || 6; // Default to June
  }

  // Update the scheduleAppointmentReminder method
  private async scheduleAppointmentReminder(
    appointmentIntent: AppointmentIntent
  ): Promise<any> {
    try {
      // Format the appointment data properly
      const appointmentData = {
        phone_number: appointmentIntent.phoneNumber,
        appointment_datetime: appointmentIntent.dateTime,
        appointment_type: appointmentIntent.appointmentType || "gynacologist",
      };

      console.log("Sending appointment data:", appointmentData);

      const response = await fetch(
        "http://localhost:5000/api/schedule-appointment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Appointment scheduling result:", result);
      return result;
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      throw error;
    }
  }

  private generateAppointmentInfoRequest(
    appointmentIntent: AppointmentIntent,
    missingInfo: string[]
  ): string {
    const appointmentType = appointmentIntent.appointmentType || "appointment";

    if (
      missingInfo.includes("appointment time") &&
      missingInfo.includes("phone number")
    ) {
      return `I'd be happy to help you set up a reminder for your ${appointmentType}! I need a bit more information:

1. What time is your appointment? (e.g., "tomorrow at 3 PM" or "June 25 at 10:30 AM")
2. What phone number should I call for the reminder?

Please provide both details so I can schedule your reminder call.`;
    } else if (missingInfo.includes("appointment time")) {
      return `Got it! I can set up a reminder call for your ${appointmentType}. What time is your appointment? Please include the date and time (e.g., "tomorrow at 3 PM" or "June 25 at 10:30 AM").`;
    } else if (missingInfo.includes("phone number")) {
      return `Perfect! I can schedule a reminder for your ${appointmentType} appointment. What phone number should I call for the reminder?`;
    }

    return `I can help you set up an appointment reminder. Please provide the appointment time and phone number.`;
  }

  private extractPhoneNumber(message: string): string | undefined {
    // Look for phone number patterns
    const phonePatterns = [
      /(\+91|91)?[\s\-]?[6-9]\d{9}/g, // Indian phone numbers
      /(\+1)?[\s\-]?\(?([2-9]\d{2})\)?[\s\-]?(\d{3})[\s\-]?(\d{4})/g, // US phone numbers
      /(\+\d{1,3})?[\s\-]?\d{10,15}/g, // General international format
    ];

    for (const pattern of phonePatterns) {
      const match = message.match(pattern);
      if (match) {
        let cleanNumber = match[0].replace(/[\s\-\(\)]/g, ""); // Clean up the number

        // Add +91 prefix for Indian numbers if not present
        if (cleanNumber.length === 10 && cleanNumber.startsWith("7")) {
          cleanNumber = "+91" + cleanNumber;
        } else if (cleanNumber.length === 10 && !cleanNumber.startsWith("+")) {
          cleanNumber = "+91" + cleanNumber;
        }

        return cleanNumber;
      }
    }

    return undefined;
  }
}
