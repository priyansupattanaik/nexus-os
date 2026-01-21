const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

async function apiRequest(path: string, options: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error("Connection Failure");
  return res.json();
}

export const fetchTasks = (token: string) =>
  apiRequest("/api/tasks/", { headers: getHeaders(token) });
export const createTask = (title: string, token: string) =>
  apiRequest("/api/tasks/", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ title }),
  });

export const getAIBriefing = (token: string) =>
  apiRequest("/api/ai/briefing", { headers: getHeaders(token) });
export const sendVoiceCommand = (command: string, token: string) =>
  apiRequest("/api/ai/command", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ command }),
  });

export const runDiagnostics = (token: string) =>
  apiRequest("/api/debug/run_diagnostics", { headers: getHeaders(token) });
