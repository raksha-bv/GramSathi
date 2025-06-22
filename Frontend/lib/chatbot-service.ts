import { SarvamAIService } from "./sarvam-service";
import {
  fetchCurrentWeather,
  fetchWeatherForecast,
  fetchWeatherAlerts,
} from "./weather-api";
import { fetchCommodityPrice, getLatestPrice } from "./market-api";
import { MarketIntent } from "../types/market";
import { fetchJobs } from "./job-api"; // <-- Add this import

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

interface JobIntent {
  type: "job" | "none";
  location?: string;
  experience?: string;
}

export class ChatbotService {
  private sarvamAI: SarvamAIService;
  private conversationHistory: ChatMessage[] = [];
  private lastMarketQuery: {
    commodity?: string;
    location?: string;
    state?: string;
  } = {};

  private detectedSourceLanguage: string | null = null;

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
    jobData?: any; // <-- Add this
  }> {
    try {
      console.log("Processing message:", userMessage);

      // Add user message to history
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      });

      // NEW: Translate user message to English for intent detection
      let messageForIntentDetection = userMessage;
      try {
        // Only translate if message doesn't appear to be in English
        if (this.isNonEnglishMessage(userMessage)) {
          console.log("Translating message for intent detection...");
          messageForIntentDetection = await this.sarvamAI.translateText(
            userMessage,
            "en-IN"
          );
          console.log("Translated message:", messageForIntentDetection);
        }
      } catch (translationError) {
        console.warn(
          "Translation failed, using original message:",
          translationError
        );
        // Continue with original message if translation fails
      }

      // Detect intents using the translated message
      const appointmentIntent = this.detectAppointmentIntent(
        messageForIntentDetection
      );
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

        return {
          response,
          appointmentScheduled,
          needsAppointmentInfo,
        };
      }

      // Only process other intents if it's NOT an appointment
      const weatherIntent = this.detectWeatherIntent(messageForIntentDetection);
      const marketIntent = this.detectMarketIntent(messageForIntentDetection);

      // Handle market queries first
      if (marketIntent.type !== "none") {
        try {
          console.log("Fetching market data...");

          // Use context from previous queries if current query is incomplete
          const effectiveIntent = this.enhanceMarketIntentWithContext(
            marketIntent,
            messageForIntentDetection
          );
          console.log("Enhanced market intent:", effectiveIntent);

          marketData = await this.fetchMarketData(effectiveIntent);
          console.log(
            "Market data fetched:",
            marketData ? "Success" : "No data"
          );

          if (effectiveIntent.commodity) {
            this.lastMarketQuery = {
              commodity: effectiveIntent.commodity,
              location: effectiveIntent.location,
              state: effectiveIntent.state,
            };
          }

          // Use original user message for AI response (preserves user's language context)
          response = await this.generateAIMarketResponse(
            userMessage,
            marketData,
            effectiveIntent
          );
        } catch (marketError) {
          console.error("Market API error:", marketError);

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

          // Use original user message for AI response
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
      // NEW: Detect job intent
      const jobIntent = this.detectJobIntent(messageForIntentDetection);
      if (jobIntent.type === "job") {
        try {
          const jobData = await fetchJobs(
            jobIntent.location || "Karnataka",
            jobIntent.experience || "1"
          );
          response = this.generateJobResponse(jobData);
        } catch (jobError) {
          console.error("Job API error:", jobError);
          response =
            "I'm having trouble fetching job information right now. Please try again later.";
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
          this.conversationHistory[0],
          ...this.conversationHistory.slice(-8),
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

  // NEW: Helper method to detect if message is likely in a non-English language
  private isNonEnglishMessage(message: string): boolean {
    // First check if message is primarily numbers, dates, or technical terms
    const technicalPattern = /^[\w\s\d\-\+\(\)@.:,]+$/;
    if (technicalPattern.test(message)) {
      // If it's mostly technical/alphanumeric, check for English words
      const englishWords = [
        "set",
        "schedule",
        "appointment",
        "meeting",
        "at",
        "on",
        "am",
        "pm",
        "gynecologist",
        "doctor",
        "dentist",
        "the",
        "and",
        "or",
        "but",
        "is",
        "are",
        "was",
        "were",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "will",
        "would",
        "could",
        "should",
        "what",
        "where",
        "when",
        "how",
        "price",
        "weather",
        "today",
        "tomorrow",
        "june",
        "july",
        "august",
        "january",
        "february",
        "march",
        "april",
        "may",
        "september",
        "october",
        "november",
        "december",
      ];

      const words = message.toLowerCase().split(/\s+/);
      const englishWordCount = words.filter((word) =>
        englishWords.some(
          (englishWord) =>
            word.includes(englishWord) || englishWord.includes(word)
        )
      ).length;

      // If we find English appointment/scheduling words, consider it English
      if (englishWordCount > 0) {
        return false;
      }
    }

    // Check for common English words
    const englishWords = [
      "the",
      "and",
      "or",
      "but",
      "is",
      "are",
      "was",
      "were",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "what",
      "where",
      "when",
      "how",
      "price",
      "weather",
      "today",
      "tomorrow",
      "set",
      "schedule",
      "appointment",
      "meeting",
      "gynecologist",
      "doctor",
    ];

    const words = message.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter((word) =>
      englishWords.includes(word)
    ).length;

    // If more than 30% of words are common English words, consider it English
    const englishRatio = englishWordCount / words.length;

    // Check for non-Latin characters (but be more specific)
    const hasSignificantNonLatinChars =
      /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]{3,}/.test(
        message
      );

    // Only consider non-English if:
    // 1. English ratio is very low AND
    // 2. Has significant non-Latin characters
    return englishRatio < 0.3 && hasSignificantNonLatinChars;
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

    // Enhanced commodity mappings with translations
    const commodityMap: { [key: string]: string } = {
      // English variations
      potato: "Potato",
      potatoes: "Potato",
      tomato: "Tomato",
      tomatoes: "Tomato",
      onion: "Onion",
      onions: "Onion",

      // Hindi/Local language variations (common ones)
      aloo: "Potato",
      आलू: "Potato",
      tamatar: "Tomato",
      टमाटर: "Tomato",
      pyaz: "Onion",
      प्याज: "Onion",
      bhindi: "Lady Finger",
      भिंडी: "Lady Finger",
      baingan: "Brinjal",
      बैंगन: "Brinjal",

      // Add more local language mappings as needed
      "lady finger": "Lady Finger",
      ladyfinger: "Lady Finger",
      okra: "Lady Finger",
      brinjal: "Brinjal",
      eggplant: "Brinjal",
      cabbage: "Cabbage",
      cauliflower: "Cauliflower",
      carrot: "Carrot",
      beans: "Beans",
      peas: "Peas",
      rice: "Rice",
      wheat: "Wheat",
      corn: "Maize",
      maize: "Maize",
    };

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
          "कीमत",
          "दाम",
          "भाव",
          "क्या",
          "है",
          "की",
          "में",
          "आज",
        ].includes(word)
    );

    for (const word of filteredWords) {
      const cleanWord = word.replace(/[.,!?;:]/g, "");

      for (const [key, value] of Object.entries(commodityMap)) {
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
  private extractState(message: string): string | undefined {
    const messageLower = message.toLowerCase();

    // List of Indian states (add more as needed)
    const states = [
      "karnataka",
      "maharashtra",
      "tamil nadu",
      "andhra pradesh",
      "telangana",
      "kerala",
      "gujarat",
      "rajasthan",
      "uttar pradesh",
      "madhya pradesh",
      "punjab",
      "haryana",
      "bihar",
      "west bengal",
      "odisha",
      "chhattisgarh",
      "jharkhand",
      "assam",
      "goa",
      "manipur",
      "meghalaya",
      "mizoram",
      "nagaland",
      "tripura",
      "arunachal pradesh",
      "sikkim",
      "uttarakhand",
      "himachal pradesh",
      "delhi",
      "jammu and kashmir",
      "ladakh",
    ];

    // Local language and alternate spellings
    const stateMap: { [key: string]: string } = {
      // English to proper case
      karnataka: "Karnataka",
      maharashtra: "Maharashtra",
      tamilnadu: "Tamil Nadu",
      "tamil nadu": "Tamil Nadu",
      ap: "Andhra Pradesh",
      andhra: "Andhra Pradesh",
      telangana: "Telangana",
      kerala: "Kerala",
      gujarat: "Gujarat",
      rajasthan: "Rajasthan",
      up: "Uttar Pradesh",
      "uttar pradesh": "Uttar Pradesh",
      mp: "Madhya Pradesh",
      "madhya pradesh": "Madhya Pradesh",
      punjab: "Punjab",
      haryana: "Haryana",
      bihar: "Bihar",
      bengal: "West Bengal",
      "west bengal": "West Bengal",
      odisha: "Odisha",
      orissa: "Odisha",
      chhattisgarh: "Chhattisgarh",
      jharkhand: "Jharkhand",
      assam: "Assam",
      goa: "Goa",
      manipur: "Manipur",
      meghalaya: "Meghalaya",
      mizoram: "Mizoram",
      nagaland: "Nagaland",
      tripura: "Tripura",
      arunachal: "Arunachal Pradesh",
      "arunachal pradesh": "Arunachal Pradesh",
      sikkim: "Sikkim",
      uttarakhand: "Uttarakhand",
      "himachal pradesh": "Himachal Pradesh",
      delhi: "Delhi",
      "jammu and kashmir": "Jammu and Kashmir",
      ladakh: "Ladakh",
      // Hindi/local
      कर्नाटक: "Karnataka",
      महाराष्ट्र: "Maharashtra",
      तमिलनाडु: "Tamil Nadu",
      आंध्र: "Andhra Pradesh",
      तेलंगाना: "Telangana",
      केरल: "Kerala",
      गुजरात: "Gujarat",
      राजस्थान: "Rajasthan",
      उत्तरप्रदेश: "Uttar Pradesh",
      मध्यप्रदेश: "Madhya Pradesh",
      पंजाब: "Punjab",
      हरियाणा: "Haryana",
      बिहार: "Bihar",
      बंगाल: "West Bengal",
      ओडिशा: "Odisha",
      छत्तीसगढ़: "Chhattisgarh",
      झारखंड: "Jharkhand",
      असम: "Assam",
      गोवा: "Goa",
      मणिपुर: "Manipur",
      मेघालय: "Meghalaya",
      मिजोरम: "Mizoram",
      नागालैंड: "Nagaland",
      त्रिपुरा: "Tripura",
      अरुणाचल: "Arunachal Pradesh",
      सिक्किम: "Sikkim",
      उत्तराखंड: "Uttarakhand",
      हिमाचल: "Himachal Pradesh",
      दिल्ली: "Delhi",
      जम्मू: "Jammu and Kashmir",
      लद्दाख: "Ladakh",
    };

    const words = messageLower.split(/\s+/);

    for (const word of words) {
      const cleanWord = word.replace(/[.,!?;:]/g, "");

      // Skip common words
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
          "कीमत",
          "में",
          "पर",
          "आज",
          "कल",
          "क्या",
          "है",
          "कैसे",
          "कितना",
        ].includes(cleanWord)
      ) {
        continue;
      }

      // Check state mappings first
      for (const [key, value] of Object.entries(stateMap)) {
        if (
          cleanWord === key ||
          cleanWord.includes(key) ||
          key.includes(cleanWord)
        ) {
          console.log(`Found state: ${cleanWord} -> ${key} -> ${value}`);
          return value;
        }
      }

      // Then check direct state matches
      for (const state of states) {
        if (
          cleanWord === state ||
          cleanWord.includes(state) ||
          state.includes(cleanWord)
        ) {
          const properState = state
            .split(" ")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ");
          console.log(`Found state: ${cleanWord} -> ${properState}`);
          return properState;
        }
      }
    }

    console.log("No state found in message:", message);
    return undefined;
  }

  private extractLocation(message: string): string | undefined {
    const messageLower = message.toLowerCase();

    // Enhanced location mappings with local language support
    const districts = [
      "bagalkot",
      "bangalore",
      "bengaluru",
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

    // Add Hindi/local language mappings if needed
    const locationMap: { [key: string]: string } = {
      // English to proper case
      bangalore: "Bangalore",
      bengaluru: "Bangalore",
      mysuru: "Mysore",
      mysore: "Mysore",
      hubli: "Dharwad",
      belagavi: "Belgaum",
      ballari: "Bellary",
      // Add local language mappings as needed
      कोलार: "Kolar",
      बैंगलोर: "Bangalore",
      मैसूर: "Mysore",
    };

    const words = messageLower.split(/\s+/);

    for (const word of words) {
      const cleanWord = word.replace(/[.,!?;:]/g, "");

      // Skip common words
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
          "कीमत",
          "में",
          "पर",
          "आज",
          "कल",
          "क्या",
          "है",
          "कैसे",
          "कितना",
        ].includes(cleanWord)
      ) {
        continue;
      }

      // Check location mappings first
      for (const [key, value] of Object.entries(locationMap)) {
        if (
          cleanWord === key ||
          cleanWord.includes(key) ||
          key.includes(cleanWord)
        ) {
          console.log(`Found location: ${cleanWord} -> ${key} -> ${value}`);
          return value;
        }
      }

      // Then check direct district matches
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

    // Enhanced weather keywords - include more variations
    if (
      messageLower.includes("weather") ||
      messageLower.includes("temperature") ||
      messageLower.includes("climate") ||
      messageLower.includes("rain") ||
      messageLower.includes("humidity") ||
      messageLower.includes("wind")
    ) {
      // Check for current weather keywords
      if (
        messageLower.includes("current") ||
        messageLower.includes("now") ||
        messageLower.includes("today") ||
        messageLower.includes("right now") ||
        messageLower.includes("what is the weather") ||
        messageLower.includes("how is the weather")
      ) {
        // Extract location from the message
        const location = this.extractWeatherLocation(message);
        return { type: "current", location };
      }

      // Forecast keywords
      if (
        messageLower.includes("forecast") ||
        messageLower.includes("tomorrow") ||
        messageLower.includes("next week") ||
        messageLower.includes("coming days")
      ) {
        const days = this.extractDays(message);
        const location = this.extractWeatherLocation(message);
        return { type: "forecast", days, location };
      }

      // Alerts keywords
      if (
        messageLower.includes("alerts") ||
        messageLower.includes("warnings") ||
        messageLower.includes("weather alert")
      ) {
        const location = this.extractWeatherLocation(message);
        return { type: "alerts", location };
      }

      // Default to current weather if weather keyword found but no specific type
      const location = this.extractWeatherLocation(message);
      return { type: "current", location };
    }

    return { type: "none" };
  }

  // Add this new method to extract location from weather queries
  private extractWeatherLocation(message: string): string | undefined {
    const messageLower = message.toLowerCase();

    // Common Indian cities/locations
    const locations = [
      "bangalore",
      "bengaluru",
      "delhi",
      "mumbai",
      "chennai",
      "kolkata",
      "hyderabad",
      "pune",
      "kolar",
      "mysore",
      "mangalore",
      "hubli",
      "dharwad",
      "belgaum",
      "gulbarga",
      "bijapur",
      "shimoga",
      "tumkur",
      "hassan",
      "davangere",
      "bellary",
      "raichur",
      "bidar",
      "bagalkot",
    ];

    for (const location of locations) {
      if (messageLower.includes(location)) {
        // Capitalize first letter
        return location.charAt(0).toUpperCase() + location.slice(1);
      }
    }

    return undefined;
  }

  private extractDays(message: string): number | undefined {
    const messageLower = message.toLowerCase();

    // Look for specific number of days
    const dayPattern = /(\d+)\s*days?/i;
    const match = message.match(dayPattern);

    if (match) {
      const days = parseInt(match[1]);
      // Limit to reasonable range (1-14 days)
      return Math.min(Math.max(days, 1), 14);
    }

    // Default mappings for common phrases
    if (messageLower.includes("tomorrow")) {
      return 1;
    } else if (
      messageLower.includes("next week") ||
      messageLower.includes("week")
    ) {
      return 7;
    } else if (
      messageLower.includes("3 days") ||
      messageLower.includes("three days")
    ) {
      return 3;
    } else if (
      messageLower.includes("5 days") ||
      messageLower.includes("five days")
    ) {
      return 5;
    }

    // Default to 7 days for forecast
    return 7;
  }

  private async fetchWeatherData(
    intent: WeatherIntent,
    defaultLocation?: string
  ) {
    // Use the location from intent first, then defaultLocation, then fallback
    const targetLocation = intent.location || defaultLocation || "Delhi,India";

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
          weatherContext = `Current weather in ${weatherData.location.name}: ${weatherData.current.temp_c}°C, ${weatherData.current.condition.text}, humidity ${weatherData.current.humidity}%, wind ${weatherData.current.wind_kph} km/h. `;
        }
        break;

      case "forecast":
        if (
          weatherData &&
          weatherData.forecast &&
          weatherData.forecast.forecastday[0]
        ) {
          const forecast = weatherData.forecast.forecastday[0];
          weatherContext = `Weather forecast for ${weatherData.location.name}: ${forecast.day.condition.text}, high ${forecast.day.maxtemp_c}°C, low ${forecast.day.mintemp_c}°C, rain chance ${forecast.day.daily_chance_of_rain}%, humidity ${forecast.day.avghumidity}%. `;
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

Please provide a helpful response about the weather with practical farming advice. Focus on which crops are suitable for these weather conditions and any farming recommendations. Be concise and actionable for farmers.`;

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
      messageLower.includes("schedule") ||
      messageLower.includes("set") ||
      messageLower.includes("gynecologist") ||
      messageLower.includes("gynacologist") || // Handle typo from translation
      messageLower.includes("doctor") ||
      messageLower.includes("medical") ||
      messageLower.includes("dentist") ||
      messageLower.includes("checkup") ||
      messageLower.includes("meeting") || // Add "meeting" as it appears in translation
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
      messageLower.includes("set") || // Add "set" as it appears in translation
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
      let appointmentType = "gynecologist"; // default
      if (
        messageLower.includes("gynecologist") ||
        messageLower.includes("gynacologist")
      )
        appointmentType = "gynecologist";
      if (messageLower.includes("doctor")) appointmentType = "doctor";
      if (messageLower.includes("medical")) appointmentType = "medical";
      if (messageLower.includes("dentist")) appointmentType = "dentist";
      if (messageLower.includes("cardiologist"))
        appointmentType = "cardiologist";

      // If this is a phone number response, get the appointment type from recent context
      if (hasPhoneNumberPattern && recentAppointmentContext) {
        appointmentType =
          this.getAppointmentTypeFromContext() || "gynecologist";
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
      // /(tomorrow|today)\s+at\s+\d{1,2}:\d{2}\s*(am|pm)/i,
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

  // Fixed extractAppointmentDateTime method with better date handling
  private extractAppointmentDateTime(message: string): string | undefined {
    const messageLower = message.toLowerCase();

    // Pattern for "22nd June at 1:20 AM" or "June 22nd at 1:20 AM" or "22 June 2025 at 5:06 AM"
    const dayMonthTimePattern =
      /(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(?:(\d{4})\s+)?at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)/i;
    const monthDayTimePattern =
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(st|nd|rd|th)?\s*(?:,?\s*(\d{4}))?\s+at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)/i;

    let match = message.match(dayMonthTimePattern);
    if (match) {
      const day = match[1];
      const month = match[3];
      const year = match[4] || new Date().getFullYear().toString();
      const hour = match[5];
      const minute = match[6] || "00"; // Default to 00 if no minutes specified
      const period = match[7];

      const monthNumber = this.getMonthNumber(month);

      // Convert to 24-hour format
      let hour24 = parseInt(hour);
      if (period.toLowerCase() === "pm" && hour24 !== 12) {
        hour24 += 12;
      } else if (period.toLowerCase() === "am" && hour24 === 12) {
        hour24 = 0;
      }

      // Create a proper date object to validate
      const appointmentDate = new Date(
        parseInt(year),
        monthNumber - 1, // Month is 0-indexed in Date constructor
        parseInt(day),
        hour24,
        parseInt(minute)
      );

      // Validate the date
      if (isNaN(appointmentDate.getTime())) {
        console.error("Invalid date created:", {
          year,
          month: monthNumber,
          day,
          hour24,
          minute,
        });
        return undefined;
      }

      // Return ISO format datetime string
      const isoString = `${year}-${monthNumber
        .toString()
        .padStart(2, "0")}-${day.padStart(2, "0")}T${hour24
        .toString()
        .padStart(2, "0")}:${minute.padStart(2, "0")}:00`;

      console.log("Extracted appointment datetime:", isoString);
      console.log(
        "Validation - Created date object:",
        appointmentDate.toISOString()
      );

      return isoString;
    }

    match = message.match(monthDayTimePattern);
    if (match) {
      const month = match[1];
      const day = match[2];
      const year = match[4] || new Date().getFullYear().toString();
      const hour = match[5];
      const minute = match[6] || "00"; // Default to 00 if no minutes specified
      const period = match[7];

      const monthNumber = this.getMonthNumber(month);

      // Convert to 24-hour format
      let hour24 = parseInt(hour);
      if (period.toLowerCase() === "pm" && hour24 !== 12) {
        hour24 += 12;
      } else if (period.toLowerCase() === "am" && hour24 === 12) {
        hour24 = 0;
      }

      // Create a proper date object to validate
      const appointmentDate = new Date(
        parseInt(year),
        monthNumber - 1, // Month is 0-indexed in Date constructor
        parseInt(day),
        hour24,
        parseInt(minute)
      );

      // Validate the date
      if (isNaN(appointmentDate.getTime())) {
        console.error("Invalid date created:", {
          year,
          month: monthNumber,
          day,
          hour24,
          minute,
        });
        return undefined;
      }

      // Return ISO format datetime string
      const isoString = `${year}-${monthNumber
        .toString()
        .padStart(2, "0")}-${day.padStart(2, "0")}T${hour24
        .toString()
        .padStart(2, "0")}:${minute.padStart(2, "0")}:00`;

      console.log("Extracted appointment datetime:", isoString);
      console.log(
        "Validation - Created date object:",
        appointmentDate.toISOString()
      );

      return isoString;
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
      // For time-only patterns, assume today's date
      const today = new Date();
      const hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3] || timeMatch[2]; // Handle both patterns

      let hour24 = hour;
      if (period && period.toLowerCase() === "pm" && hour24 !== 12) {
        hour24 += 12;
      } else if (period && period.toLowerCase() === "am" && hour24 === 12) {
        hour24 = 0;
      }

      const isoString = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today
        .getDate()
        .toString()
        .padStart(2, "0")}T${hour24.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}:00`;

      console.log("Extracted time-only appointment datetime:", isoString);
      return isoString;
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
      // Validate appointment datetime
      if (appointmentIntent.dateTime) {
        const appointmentDate = new Date(appointmentIntent.dateTime);
        if (isNaN(appointmentDate.getTime())) {
          throw new Error("Invalid appointment date/time format");
        }

        // Check if appointment is in the past
        const now = new Date();
        if (appointmentDate <= now) {
          throw new Error("Appointment time cannot be in the past");
        }

        console.log("Appointment validation passed:");
        console.log("- Requested datetime:", appointmentIntent.dateTime);
        console.log("- Parsed date object:", appointmentDate.toISOString());
        console.log("- Local time:", appointmentDate.toLocaleString());
      }

      // Format the appointment data properly
      const appointmentData = {
        phone_number: appointmentIntent.phoneNumber,
        appointment_datetime: appointmentIntent.dateTime,
        appointment_type: appointmentIntent.appointmentType || "gynecologist",
      };

      console.log("Sending appointment data:", appointmentData);

      const response = await fetch(
        "http://localhost:5002/api/schedule-appointment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Appointment scheduling result:", result);

      // Validate that the returned appointment time matches what was requested
      if (result.appointment_time && appointmentIntent.dateTime) {
        const requestedDate = new Date(appointmentIntent.dateTime);
        const returnedDate = new Date(result.appointment_time);

        if (requestedDate.toDateString() !== returnedDate.toDateString()) {
          console.warn(
            "WARNING: Backend returned different date than requested!"
          );
          console.warn("Requested:", requestedDate.toISOString());
          console.warn("Returned:", returnedDate.toISOString());
        }
      }

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
      /(\+91|91)?[\s\-]?([6-9]\d{9})/g, // Indian phone numbers - capture the actual number
      /(\+1)?[\s\-]?\(?([2-9]\d{2})\)?[\s\-]?(\d{3})[\s\-]?(\d{4})/g, // US phone numbers
    ];

    for (const pattern of phonePatterns) {
      const matches = [...message.matchAll(pattern)];
      if (matches.length > 0) {
        const match = matches[0];
        let cleanNumber;

        if (pattern === phonePatterns[0]) {
          // Indian number
          cleanNumber = match[2]; // Get the 10-digit part
          // Validate Indian mobile number (should start with 6-9)
          if (
            cleanNumber &&
            cleanNumber.length === 10 &&
            /^[6-9]/.test(cleanNumber)
          ) {
            const formattedNumber = "+91" + cleanNumber;
            console.log("Extracted phone number:", formattedNumber);
            return formattedNumber;
          }
        } else {
          // US or other formats
          cleanNumber = match[0].replace(/[\s\-\(\)]/g, "");
          if (cleanNumber.length >= 10) {
            console.log("Extracted phone number:", cleanNumber);
            return cleanNumber.startsWith("+")
              ? cleanNumber
              : "+" + cleanNumber;
          }
        }
      }
    }

    return undefined;
  }

  private detectJobIntent(message: string): JobIntent {
    const messageLower = message.toLowerCase();
    // Simple keywords for job search
    if (
      messageLower.includes("job") ||
      messageLower.includes("vacancy") ||
      messageLower.includes("work") ||
      messageLower.includes("employment") ||
      messageLower.includes("opening") ||
      messageLower.includes("jobs")
    ) {
      // Try to extract location and experience
      const location = this.extractState(message);
      // Look for experience in years (e.g., "2 years experience" or "experience 2")
      const expMatch = messageLower.match(
        /(\d+)\s*(years?|yrs?)?\s*experience?/
      );
      const experience = expMatch ? expMatch[1] : "1";
      return { type: "job", location, experience };
    }
    return { type: "none" };
  }

  private generateJobResponse(jobData: { url: string; jobs: any[] }): string {
    if (!jobData || !jobData.jobs || jobData.jobs.length === 0) {
      return "Sorry, I couldn't find any job openings for your query.";
    }
    const topJobs = jobData.jobs.slice(0, 3);
    const jobLines = topJobs
      .map(
        (job, idx) =>
          `${idx + 1}. ${job.JobTitle} at ${job.Organization} (${
            job.Location
          }) - Salary: ${job.SalaryRange}`
      )
      .join("\n");
    // Only mention "Apply" (the frontend will turn the URL into a button)
    return `Here are some job openings for you:\n${jobLines}\n\n[Apply](${jobData.url})`;
  }
}
