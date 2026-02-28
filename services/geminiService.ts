import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";
import { Medication } from "../types";

export interface AIInsightResponse {
  insight: string;
  interactions?: string;
  proactiveAdvice?: string;
  suggestedChange?: {
    medicationId: string;
    medicationName: string;
    oldTime: string;
    newTime: string;
    reason: string;
  };
}

export const getHealthInsights = async (meds: Medication[], adherence: number, retries = 3): Promise<AIInsightResponse> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });
    
    const medList = meds.map(m => {
      let info = `${m.name} (${m.dosage}) at ${m.time} - Status: ${m.status}`;
      if (m.lastTakenTime) {
        info += ` (Last taken at: ${new Date(m.lastTakenTime).toLocaleTimeString()})`;
      }
      return info;
    }).join('\n');
    
    const prompt = `Act as a professional medical assistant and clinical pharmacist. 
    Analyze the following medication schedule and adherence data for potential issues.
    
    Current Medications:
    ${medList}
    
    Today's Overall Adherence Rate: ${adherence}%
    
    Your task:
    1. **Drug Interactions**: Identify any potential drug-drug interactions between the listed medications. If none are obvious, provide general safety advice for this combination.
    2. **Pattern Analysis**: Look for timing patterns. Specifically, if a user is consistently taking a medication approximately 10 minutes (or more) later than the scheduled time (e.g., scheduled for 8:00 AM but taken at 8:10 AM), suggest updating the scheduled time to match their actual habit.
    3. **Proactive Health Advice**: Provide actionable advice to improve adherence or health outcomes based on the medications (e.g., "Take Metformin with food to reduce stomach upset").
    4. **Concise Insight**: A brief, encouraging summary of their current status.
    
    Return your response as a JSON object matching the provided schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: {
              type: Type.STRING,
              description: "Brief encouraging summary.",
            },
            interactions: {
              type: Type.STRING,
              description: "Analysis of potential drug interactions.",
            },
            proactiveAdvice: {
              type: Type.STRING,
              description: "Actionable health advice based on the meds.",
            },
            suggestedChange: {
              type: Type.OBJECT,
              properties: {
                medicationId: { type: Type.STRING },
                medicationName: { type: Type.STRING },
                oldTime: { type: Type.STRING },
                newTime: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ["medicationId", "medicationName", "oldTime", "newTime", "reason"],
            }
          },
          required: ["insight", "interactions", "proactiveAdvice"],
        },
      },
    });

    return JSON.parse(response.text || '{"insight": "You are doing great!"}');
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    if (retries > 0) {
      const delay = (4 - retries) * 1500; // Progressive backoff
      console.log(`Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return getHealthInsights(meds, adherence, retries - 1);
    }
    return { 
      insight: "You're doing great! Keep following your schedule to maintain optimal health.",
      interactions: "No critical interactions detected at this time. Always consult your doctor before changing your regimen.",
      proactiveAdvice: "Stay hydrated and try to take your medications at the same time every day for the best results."
    };
  }
};

export const generateInsightSpeech = async (text: string, retries = 2): Promise<string | undefined> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return undefined;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this health insight warmly and clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return generateInsightSpeech(text, retries - 1);
    }
    return undefined;
  }
};