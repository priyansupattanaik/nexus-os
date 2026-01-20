// If we have a specific URL (Production), use it.
// Otherwise, fall back to the proxy (Localhost).
const API_URL = import.meta.env.VITE_API_URL || "/api";

export const checkSystemStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) throw new Error("Server Error");
    return await response.json();
  } catch (error) {
    console.error("NEXUS Core Unreachable:", error);
    return { status: "offline" };
  }
};

export const getAIBriefing = async () => {
  try {
    const response = await fetch(`${API_URL}/ai/briefing`);
    if (!response.ok) throw new Error("AI Error");
    return await response.json();
  } catch (error) {
    console.error("AI Failed:", error);
    return { message: "Neural Link Offline." };
  }
};
