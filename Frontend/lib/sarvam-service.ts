import { SarvamAIClient } from "sarvamai";

interface SarvamMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Translation supported languages
type TranslationLanguageCode =
  | "bn-IN" // Bengali
  | "en-IN" // English
  | "gu-IN" // Gujarati
  | "hi-IN" // Hindi
  | "kn-IN" // Kannada
  | "ml-IN" // Malayalam
  | "mr-IN" // Marathi
  | "od-IN" // Odia (note: od-IN not or-IN)
  | "pa-IN" // Punjabi
  | "ta-IN" // Tamil
  | "te-IN"; // Telugu

// Text-to-Speech supported languages (subset of translation languages)
type TTSLanguageCode =
  | "bn-IN" // Bengali
  | "en-IN" // English
  | "gu-IN" // Gujarati
  | "hi-IN" // Hindi
  | "kn-IN" // Kannada
  | "ml-IN" // Malayalam
  | "mr-IN" // Marathi
  | "pa-IN" // Punjabi
  | "ta-IN" // Tamil
  | "te-IN"; // Telugu

export class SarvamAIService {
  private client: SarvamAIClient;

  constructor() {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      throw new Error("SARVAM_API_KEY is not set in environment variables");
    }

    this.client = new SarvamAIClient({
      apiSubscriptionKey: apiKey,
    });
  }

  // Improved helper method to clean up AI response and remove thinking process
  private cleanAIResponse(response: string): string {
    if (!response) return response;

    console.log("Raw AI response:", response);

    // Remove <think>...</think> blocks (case insensitive, multiline)
    let cleaned = response.replace(/<think>[\s\S]*?<\/think>/gim, "");

    // Remove any remaining thinking patterns
    cleaned = cleaned.replace(/\[thinking\][\s\S]*?\[\/thinking\]/gim, "");
    cleaned = cleaned.replace(/\*thinking\*[\s\S]*?\*\/thinking\*/gim, "");
    cleaned = cleaned.replace(/\*\*thinking\*\*[\s\S]*?\*\*\/thinking\*\*/gim, "");

    // Remove reasoning patterns
    cleaned = cleaned.replace(/\[reasoning\][\s\S]*?\[\/reasoning\]/gim, "");
    cleaned = cleaned.replace(/\*reasoning\*[\s\S]*?\*\/reasoning\*/gim, "");

    // Clean up extra whitespace and newlines
    cleaned = cleaned.trim();
    cleaned = cleaned.replace(/^\s*\n+/gm, ""); // Remove blank lines at start
    cleaned = cleaned.replace(/\n\s*\n+/g, "\n"); // Remove multiple blank lines

    console.log("Cleaned AI response:", cleaned);

    return cleaned;
  }

  // Update the chatCompletion method
  async chatCompletion(messages: SarvamMessage[]): Promise<string> {
    try {
      console.log("Calling Sarvam AI with messages:", messages);

      const response = await this.client.chat.completions({
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.5, // Reduced temperature for more consistent responses
        reasoning_effort: "low", // Fixed: Use "low" instead of "off"
      });

      console.log("Sarvam AI response:", response);

      const rawContent =
        response.choices[0]?.message?.content ||
        "Sorry, I could not generate a response.";

      console.log("Raw content before cleaning:", rawContent);

      // Clean the response to remove thinking process
      let cleanedContent = this.cleanAIResponse(rawContent);

      // If still contains thinking patterns, use aggressive cleaning
      if (
        cleanedContent.includes("<think>") ||
        cleanedContent.includes("thinking") ||
        cleanedContent.includes("Okay, ")
      ) {
        cleanedContent = this.aggressiveCleanResponse(rawContent);
      }

      console.log("Final cleaned content:", cleanedContent);

      // If the cleaned content is empty or too short, provide a fallback
      if (!cleanedContent || cleanedContent.trim().length < 10) {
        return "Hello! I'm here to help you with farming questions. How can I assist you today?";
      }

      return cleanedContent;
    } catch (error) {
      console.error("Error calling Sarvam AI:", error);
      throw error;
    }
  }

  // Add the aggressive cleaning method
  private aggressiveCleanResponse(response: string): string {
    if (!response) return response;

    // Split by common delimiters and find the actual response
    const lines = response.split("\n");
    const cleanLines: string[] = [];
    let inThinkingBlock = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check for start of thinking block
      if (
        trimmedLine.includes("<think>") ||
        trimmedLine.includes("[thinking]") ||
        trimmedLine.includes("*thinking*")
      ) {
        inThinkingBlock = true;
        continue;
      }

      // Check for end of thinking block
      if (
        trimmedLine.includes("</think>") ||
        trimmedLine.includes("[/thinking]") ||
        trimmedLine.includes("*/thinking*")
      ) {
        inThinkingBlock = false;
        continue;
      }

      // Skip lines while in thinking block
      if (inThinkingBlock) {
        continue;
      }

      // Skip empty lines or lines that look like thinking
      if (
        trimmedLine === "" ||
        trimmedLine.toLowerCase().includes("okay, ") ||
        trimmedLine.toLowerCase().includes("alright, ") ||
        trimmedLine.toLowerCase().includes("let me ") ||
        trimmedLine.toLowerCase().includes("i need to ") ||
        trimmedLine.toLowerCase().includes("i should ")
      ) {
        continue;
      }

      cleanLines.push(line);
    }

    const result = cleanLines.join("\n").trim();
    console.log("Aggressively cleaned response:", result);

    return result;
  }

  async simpleChat(message: string): Promise<string> {
    try {
      const response = await this.chatCompletion([
        {
          role: "system",
          content:
            "You are a wise, helpful villager from rural India who supports and guides fellow villagers. You provide practical advice to farmers, pregnant women, elderly, and anyone in the village community. Speak warmly and caringly like a knowledgeable village elder. Give simple, actionable advice based on traditional wisdom and modern knowledge. Keep responses under 100 words. Respond directly without showing any thinking process or reasoning steps.",
        },
        {
          role: "user",
          content: message,
        },
      ]);
      return response;
    } catch (error) {
      console.error("Error in simple chat:", error);
      throw error;
    }
  }

  // Enhanced chat with farming context
  async farmingChat(message: string, weatherData?: any): Promise<string> {
    try {
      let systemContent = "You are a caring village elder and experienced farmer from rural India. You help fellow villagers - farmers, pregnant women, families, and community members with practical advice. For farming: guide on crops, weather impact, soil care, and traditional farming wisdom. For health: provide simple home remedies and when to see a doctor. For community: offer support and practical solutions. Speak warmly like a trusted village guide. Keep responses under 150 words. Respond directly without showing any thinking process or reasoning steps.";

      // Add weather context to the single system message if available
      if (weatherData) {
        let weatherContext = "";
        if (weatherData.current) {
          weatherContext = `Current weather context: Temperature ${weatherData.current.temp_c}°C, ${weatherData.current.condition.text}, Humidity ${weatherData.current.humidity}%. `;
        }
        if (weatherData.forecast && weatherData.forecast.forecastday) {
          const today = weatherData.forecast.forecastday[0];
          weatherContext += `Today's forecast: High ${today.day.maxtemp_c}°C, Low ${today.day.mintemp_c}°C, Rain chance ${today.day.daily_chance_of_rain}%. `;
        }
        
        if (weatherContext) {
          systemContent += ` ${weatherContext}Consider this weather information when giving advice to villagers about farming, health, or daily activities.`;
        }
      }

      const messages: SarvamMessage[] = [
        {
          role: "system",
          content: systemContent,
        },
        {
          role: "user",
          content: message,
        },
      ];

      const response = await this.chatCompletion(messages);
      return response;
    } catch (error) {
      console.error("Error in farming chat:", error);
      throw error;
    }
  }

  // Weather-specific chat
  async weatherChat(message: string, weatherData: any): Promise<string> {
    try {
      let weatherContext = "Current weather information: ";
      
      if (weatherData.current) {
        weatherContext += `Temperature: ${weatherData.current.temp_c}°C, Condition: ${weatherData.current.condition.text}, Humidity: ${weatherData.current.humidity}%, Wind: ${weatherData.current.wind_kph} km/h. `;
      }
      
      if (weatherData.location) {
        weatherContext += `Location: ${weatherData.location.name}, ${weatherData.location.region}. `;
      }

      // Combine system content into one message
      const systemContent = `You are a wise village elder from rural India who helps the community understand weather and its impact. Provide weather information with practical advice for farmers (crop care, irrigation), pregnant women (health precautions), families (daily activities), and the whole village community. Combine traditional weather wisdom with current data. Speak caringly like a trusted village guide. Keep responses concise and actionable. Do not include thinking process in your response. ${weatherContext}`;

      const response = await this.chatCompletion([
        {
          role: "system",
          content: systemContent,
        },
        {
          role: "user",
          content: message,
        },
      ]);

      return response;
    } catch (error) {
      console.error("Error in weather chat:", error);
      throw error;
    }
  }

  // Add a new method specifically for health and community advice
  async communityChat(message: string): Promise<string> {
    try {
      const response = await this.chatCompletion([
        {
          role: "system",
          content:
            "You are a caring village elder from rural India who has years of experience helping the community. You provide guidance to pregnant women about nutrition, care, and traditional practices. You help families with child care, health remedies, and daily life challenges. You support farmers with agricultural advice and market insights. You assist elderly with health and comfort. Speak with warmth and wisdom like a trusted village grandmother/grandfather. Give practical, safe advice rooted in both traditional knowledge and basic health principles. Keep responses under 120 words. Respond directly without showing any thinking process or reasoning steps.",
        },
        {
          role: "user",
          content: message,
        },
      ]);
      return response;
    } catch (error) {
      console.error("Error in community chat:", error);
      throw error;
    }
  }

  // Map common language codes to Sarvam supported codes for translation
  private mapTranslationLanguageCode(
    targetLanguage: string
  ): TranslationLanguageCode {
    const languageMap: { [key: string]: TranslationLanguageCode } = {
      hi: "hi-IN",
      "hi-IN": "hi-IN",
      en: "en-IN",
      "en-IN": "en-IN",
      "en-US": "en-IN",
      bn: "bn-IN",
      "bn-IN": "bn-IN",
      gu: "gu-IN",
      "gu-IN": "gu-IN",
      kn: "kn-IN",
      "kn-IN": "kn-IN",
      ml: "ml-IN",
      "ml-IN": "ml-IN",
      mr: "mr-IN",
      "mr-IN": "mr-IN",
      od: "od-IN",
      "od-IN": "od-IN",
      or: "od-IN", // Map Odia variants
      "or-IN": "od-IN",
      pa: "pa-IN",
      "pa-IN": "pa-IN",
      ta: "ta-IN",
      "ta-IN": "ta-IN",
      te: "te-IN",
      "te-IN": "te-IN",
    };

    return languageMap[targetLanguage] || "hi-IN"; // Default to Hindi
  }

  // Map common language codes to Sarvam supported codes for TTS
  private mapTTSLanguageCode(targetLanguage: string): TTSLanguageCode {
    const languageMap: { [key: string]: TTSLanguageCode } = {
      hi: "hi-IN",
      "hi-IN": "hi-IN",
      en: "en-IN",
      "en-IN": "en-IN",
      "en-US": "en-IN",
      bn: "bn-IN",
      "bn-IN": "bn-IN",
      gu: "gu-IN",
      "gu-IN": "gu-IN",
      kn: "kn-IN",
      "kn-IN": "kn-IN",
      ml: "ml-IN",
      "ml-IN": "ml-IN",
      mr: "mr-IN",
      "mr-IN": "mr-IN",
      pa: "pa-IN",
      "pa-IN": "pa-IN",
      ta: "ta-IN",
      "ta-IN": "ta-IN",
      te: "te-IN",
      "te-IN": "te-IN",
      // Note: Odia (od-IN) might not be supported for TTS, fallback to Hindi
      od: "hi-IN",
      "od-IN": "hi-IN",
      or: "hi-IN",
      "or-IN": "hi-IN",
    };

    return languageMap[targetLanguage] || "hi-IN"; // Default to Hindi
  }

  async translateText(
    text: string,
    targetLanguage: string = "hi-IN"
  ): Promise<string> {
    try {
      // Map the language code to supported format
      const mappedLanguage = this.mapTranslationLanguageCode(targetLanguage);

      console.log(`Translating to ${mappedLanguage}:`, text);

      const response = await this.client.text.translate({
        input: text,
        source_language_code: "auto",
        target_language_code: mappedLanguage,
      });

      console.log("Translation response:", response);
      return response.translated_text || text;
    } catch (error) {
      console.error("Error translating text:", error);
      return text; // Return original text if translation fails
    }
  }

  async textToSpeech(
    text: string,
    language: string = "hi-IN"
  ): Promise<ArrayBuffer> {
    try {
      // Map the language code to supported format for TTS
      const mappedLanguage = this.mapTTSLanguageCode(language);

      console.log(`Converting to speech in ${mappedLanguage}:`, text);

      const response = await this.client.textToSpeech.convert({
        text: text,
        target_language_code: mappedLanguage,
        model: "bulbul:v2",
        speaker: "anushka",
      });

      console.log("TTS response:", response);

      // Simplified audio handling to avoid type issues
      if (response && response.audios && response.audios.length > 0) {
        const audioData = response.audios[0];

        return this.convertToArrayBuffer(audioData);
      }

      throw new Error("No audio data received from TTS service");
    } catch (error) {
      console.error("Error converting text to speech:", error);
      throw error;
    }
  }

  // Simplified conversion method that handles all audio data types
  private convertToArrayBuffer(audioData: any): ArrayBuffer {
    try {
      // Check if it's already an ArrayBuffer (not SharedArrayBuffer)
      if (
        audioData &&
        typeof audioData === "object" &&
        audioData.constructor === ArrayBuffer
      ) {
        return audioData as ArrayBuffer;
      }

      // Handle string (base64)
      if (typeof audioData === "string") {
        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      }

      // Handle Buffer (Node.js)
      if (
        typeof Buffer !== "undefined" &&
        Buffer.isBuffer &&
        Buffer.isBuffer(audioData)
      ) {
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; ++i) {
          view[i] = audioData[i];
        }
        return arrayBuffer;
      }

      // Handle Uint8Array or other TypedArrays
      if (audioData && typeof audioData === "object" && audioData.buffer) {
        // Convert any TypedArray to ArrayBuffer
        const typedArray = audioData as Uint8Array;
        const newBuffer = new ArrayBuffer(typedArray.length);
        const newView = new Uint8Array(newBuffer);
        newView.set(typedArray);
        return newBuffer;
      }

      // Handle SharedArrayBuffer by converting to ArrayBuffer
      if (
        audioData &&
        typeof audioData === "object" &&
        audioData.constructor &&
        audioData.constructor.name === "SharedArrayBuffer"
      ) {
        const sharedBuffer = audioData as any;
        const arrayBuffer = new ArrayBuffer(sharedBuffer.byteLength);
        const sourceView = new Uint8Array(sharedBuffer);
        const targetView = new Uint8Array(arrayBuffer);
        targetView.set(sourceView);
        return arrayBuffer;
      }

      throw new Error("Unsupported audio data format");
    } catch (error) {
      console.error("Error converting audio data:", error);
      // Return empty ArrayBuffer as fallback
      return new ArrayBuffer(0);
    }
  }

  // Speech to text functionality (for future use)
  async speechToText(audioFile: File): Promise<string> {
    try {
      const response = await this.client.speechToText.translate(audioFile, {
        model: "saaras:v2.5" as any, // Type assertion until SDK types are updated
      });

      console.log("STT response:", response);
      return response.transcript || "";
    } catch (error) {
      console.error("Error converting speech to text:", error);
      throw error;
    }
  }

  // Get available languages for translation
  getSupportedTranslationLanguages(): {
    code: TranslationLanguageCode;
    name: string;
  }[] {
    return [
      { code: "hi-IN", name: "Hindi" },
      { code: "en-IN", name: "English" },
      { code: "bn-IN", name: "Bengali" },
      { code: "gu-IN", name: "Gujarati" },
      { code: "kn-IN", name: "Kannada" },
      { code: "ml-IN", name: "Malayalam" },
      { code: "mr-IN", name: "Marathi" },
      { code: "od-IN", name: "Odia" },
      { code: "pa-IN", name: "Punjabi" },
      { code: "ta-IN", name: "Tamil" },
      { code: "te-IN", name: "Telugu" },
    ];
  }

  // Get available languages for TTS
  getSupportedTTSLanguages(): { code: TTSLanguageCode; name: string }[] {
    return [
      { code: "hi-IN", name: "Hindi" },
      { code: "en-IN", name: "English" },
      { code: "bn-IN", name: "Bengali" },
      { code: "gu-IN", name: "Gujarati" },
      { code: "kn-IN", name: "Kannada" },
      { code: "ml-IN", name: "Malayalam" },
      { code: "mr-IN", name: "Marathi" },
      { code: "pa-IN", name: "Punjabi" },
      { code: "ta-IN", name: "Tamil" },
      { code: "te-IN", name: "Telugu" },
    ];
  }
}
