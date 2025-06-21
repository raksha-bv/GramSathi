import { detect } from 'langdetect';

export const detectLanguage = (text: string): string => {
    const result = detect(text);
    return result.length > 0 ? result[0].language : 'unknown';
};