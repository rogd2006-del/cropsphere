import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

export async function askGemini(prompt: string, context: string = ''): Promise<string> {
  if (!GEMINI_API_KEY) {
    return 'Gemini API key is not configured. Please check your environment variables.';
  }

  const systemInstruction = `You are CropSphere AI (FarmDirect Cloud's Smart Assistant).
You are an expert in sustainable agriculture, local produce, seasonal harvesting, farm-to-table cooking, and helping consumers find fresh local crops from family farms.
Keep your answers engaging, practical, helpful, and concise (under 200 words unless asked for a detailed recipe or plan).
Use bullet points and formatting where appropriate. Context about current marketplace products or farms: ${context}`;

  const fullPrompt = `${systemInstruction}\n\nUser Question: ${prompt}`;

  // Try gemini-2.5-flash first, fallback to gemini-1.5-flash
  const models = ['gemini-3.5-flash-lite'];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000,
        }
      );

      const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate) {
        return candidate;
      }
    } catch (err: any) {
      console.warn(`Gemini model ${model} request failed:`, err?.response?.data || err.message);
      // try next model
    }
  }

  return 'I am currently unable to reach the Gemini service. Here is a quick tip: Buy seasonally and store root vegetables in a cool, dark place to maintain peak freshness!';
}
