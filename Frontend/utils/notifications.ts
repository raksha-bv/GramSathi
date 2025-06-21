import { SarvamAIClient } from "sarvamai";

const API_KEY = process.env.SARVAM_API_KEY;

const client = new SarvamAIClient({ apiSubscriptionKey: API_KEY });

export const sendWeatherAlert = async (farmerContact: string, weatherData: string, languageCode: string) => {
    const message = `Daily Weather Alert: ${weatherData}`;
    await client.textToSpeech.convert({
        text: message,
        targetLanguageCode: languageCode,
    });
    // Logic to send the audio message to the farmer's contact
};

export const sendMarketPriceUpdate = async (farmerContact: string, marketData: string, languageCode: string) => {
    const message = `Market Price Update: ${marketData}`;
    await client.textToSpeech.convert({
        text: message,
        targetLanguageCode: languageCode,
    });
    // Logic to send the audio message to the farmer's contact
};

export const sendGovernmentSchemeInfo = async (farmerContact: string, schemeInfo: string, languageCode: string) => {
    const message = `Government Scheme Information: ${schemeInfo}`;
    await client.textToSpeech.convert({
        text: message,
        targetLanguageCode: languageCode,
    });
    // Logic to send the audio message to the farmer's contact
};