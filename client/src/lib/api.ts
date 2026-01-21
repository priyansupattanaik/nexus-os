const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// Generic Fetch Wrapper for Error Handling
async function apiFetch(path: string, options: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server Error: ${res.status}`);
  }
  return res.json();
}

// --- CORE SYSTEM ---
export const fetchTasks = (token: string) =>
  apiFetch("/api/tasks/", { headers: getHeaders(token) });
export const createTask = (title: string, token: string) =>
  apiFetch("/api/tasks/", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ title }),
  });
export const deleteTask = (id: string, token: string) =>
  apiFetch(`/api/tasks/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

export const fetchJournal = (token: string) =>
  apiFetch("/api/journal/", { headers: getHeaders(token) });
export const createEntry = (content: string, token: string) =>
  apiFetch("/api/journal/", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ content }),
  });

// --- AI & DEBUG ---
export const getAIBriefing = (token: string) =>
  apiFetch("/api/ai/briefing", { headers: getHeaders(token) });
export const sendVoiceCommand = (command: string, token: string) =>
  apiFetch("/api/ai/command", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ command }),
  });

export const runDiagnostics = (token: string) =>
  apiFetch("/api/debug/run_diagnostics", { headers: getHeaders(token) });
