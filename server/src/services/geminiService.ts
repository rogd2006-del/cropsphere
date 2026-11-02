import axios from 'axios';
import { logger } from '../config/logger';

const GEMINI_MODEL = 'gemini-3.5-flash-lite';

interface GeminiInteractionResponse {
  steps?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

export async function askGemini(prompt: string, context = ''): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    logger.error('Gemini API key is not configured');
    throw new Error('The AI assistant is not configured. Please contact the administrator.');
  }

  const fullPrompt = `You are CropSphere AI (FarmDirect Cloud's Smart Assistant).
You are an expert in sustainable agriculture, local produce, seasonal harvesting, farm-to-table cooking, and helping consumers find fresh local crops from family farms.
Keep your answers engaging, practical, helpful, and concise (under 200 words unless asked for a detailed recipe or plan).
Use bullet points and formatting where appropriate.
Context about current marketplace products or farms: ${context}

User Question: ${prompt}`;

  try {
    const response = await axios.post<GeminiInteractionResponse>(
      'https://generativelanguage.googleapis.com/v1beta/interactions',
      {
        model: GEMINI_MODEL,
        input: fullPrompt,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        timeout: 60000,
      }
    );

    const answer = response.data.steps
      ?.filter((step) => step.type === 'model_output')
      .flatMap((step) => step.content || [])
      .filter((content) => content.type === 'text' && typeof content.text === 'string')
      .map((content) => content.text)
      .join('\n')
      .trim();

    if (answer) return answer;

    logger.warn(`Gemini Interactions API returned no text for ${GEMINI_MODEL}`);
  } catch (error) {
    const details = axios.isAxiosError(error)
      ? error.response?.data?.error?.message || error.message
      : error instanceof Error ? error.message : String(error);
    const status = axios.isAxiosError(error) ? ` (HTTP ${error.response?.status || 'network error'})` : '';
    logger.error(`Gemini ${GEMINI_MODEL} request failed${status}: ${details}`);
  }

  throw new Error('The AI assistant is temporarily unavailable. Please try again later.');
}
