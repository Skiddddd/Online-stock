
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");

export const getMarketSentiment = async () => {
  const response = await fetch(`${API_BASE}/api/ai/market-sentiment`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return String(payload.text || "");
};

export const getInvestmentAdvice = async (balance: number, planName: string) => {
  const response = await fetch(`${API_BASE}/api/ai/investment-advice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ balance, planName })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return String(payload.text || "");
};
