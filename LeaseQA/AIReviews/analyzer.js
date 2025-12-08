const MODEL_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

const parseModelJson = (rawText) => {
    try {
        const parsed = JSON.parse(rawText);
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
        return null;
    }
};

const normalizeResponse = (rawText) => {
    const parsed = parseModelJson(rawText);
    if (parsed?.riskLevels && parsed.summary) {
        return parsed;
    }

    return {
        summary: rawText || "No summary returned.",
        riskLevels: {high: [], medium: [], low: []},
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
  "riskLevels": { "high": ["..."], "medium": ["..."], "low": ["..."] },
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
