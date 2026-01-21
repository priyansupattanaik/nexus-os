const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

async function apiRequest(path: string, options: RequestInit) {
  try {
    const res = await fetch(`${API_URL}${path}`, options);
    if (res.status === 401)
      throw new Error("Unauthorized: Please log in again.");
    if (res.status === 405)
      throw new Error("Method Not Allowed: Server Route Error.");
    if (!res.ok) throw new Error("Handshake Failed");
    return res.json();
  } catch (e: any) {
    console.error(`API Error [${path}]:`, e.message);
    throw e;
  }
}

// --- MODULES ---
export const fetchTasks = (token: string) =>
  apiRequest("/api/tasks/", { headers: getHeaders(token) });
export const createTask = (title: string, token: string) =>
  apiRequest("/api/tasks/", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ title }),
  });
export const updateTask = (id: string, updates: any, token: string) =>
  apiRequest(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(updates),
  });
export const deleteTask = (id: string, token: string) =>
  apiRequest(`/api/tasks/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

// --- AI ---
export const getAIBriefing = (token: string) =>
  apiRequest("/api/ai/briefing", { headers: getHeaders(token) });
export const sendVoiceCommand = (command: string, token: string) =>
  apiRequest("/api/ai/command", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ command }),
  });

// --- DEBUG ---
export const runDiagnostics = (token: string) =>
  apiRequest("/api/debug/run_diagnostics", { headers: getHeaders(token) });
