const keywordBuckets = {
    high: ["evict", "eviction", "immediate termination", "rent increase", "penalty"],
    medium: ["late fee", "inspection", "notice", "arbitration"],
    low: ["paint", "appliance", "quiet enjoyment"],
};

const defaultRecommendations = [
    "Document any risky clause in writing and request an addendum.",
    "Ask for clear notice periods and escalation contacts.",
    "Consult a licensed attorney before signing changes to rent or term.",
];

const pickMatches = (text, keywords) =>
    keywords
        .filter((word) => text.toLowerCase().includes(word))
        .map((word) => `Clause references "${word}" without tenant protections.`);

const fallback = (label) => [`No explicit ${label} level issues were detected.`];

export const analyzeContractText = (text) => {
    const high = pickMatches(text, keywordBuckets.high);
    const medium = pickMatches(text, keywordBuckets.medium);
    const low = pickMatches(text, keywordBuckets.low);
    return {
        summary:
            high.length > 0
                ? "Several clauses need immediate review."
                : "No critical blockers detected. Review highlighted clauses.",
        riskLevels: {
            high: high.length ? high : fallback("high"),
            medium: medium.length ? medium : fallback("medium"),
            low: low.length ? low : fallback("low"),
        },
        recommendations: defaultRecommendations,
    };
};
