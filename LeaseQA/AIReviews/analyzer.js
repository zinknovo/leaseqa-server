// Available models: gemini-1.5-flash (recommended for free tier), gemini-1.5-pro, gemini-1.0-pro
const MODEL_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const parseModelJson = (rawText) => {
    try {
        // Strip markdown code blocks if present (e.g. ```json ... ```)
        const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedText);
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
        return null;
    }
};

const normalizeResponse = (rawText) => {
    const parsed = parseModelJson(rawText);
    if (parsed?.highRisk && parsed.summary) {
        return parsed;
    }

    return {
        summary: rawText || "No summary returned.",
        highRisk: [],
        mediumRisk: [],
        lowRisk: [],
        recommendations: [],
    };
};

export const analyzeContractText = async (text) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error("Missing GOOGLE_API_KEY environment variable. Please add it to your .env file.");
    }

    const prompt = `You are a lease risk analyst. Return JSON in the exact format:
{
  "summary": "one-line summary",
  "highRisk": ["..."],
  "mediumRisk": ["..."],
  "lowRisk": ["..."],
  "recommendations": ["..."]
}
Only output valid JSON. Lease content:
${text.slice(0, 12000)}
`.trim();

    const response = await fetch(`${MODEL_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            contents: [{parts: [{text: prompt}]}],
            generationConfig: {temperature: 0.3, maxOutputTokens: 512},
        }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const message = data?.error?.message || `Gemini request failed: ${response.status}`;
        throw new Error(message);
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return normalizeResponse(rawText);
};
