const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

async function apiRequest(path: string, options: RequestInit) {
  try {
    // Robust URL construction to prevent /api/api issues
    let base = API_URL;
    if (base.endsWith('/')) {
        base = base.slice(0, -1);
    }

    let endpoint = path;
    if (endpoint.startsWith('/')) {
        endpoint = endpoint.slice(1);
    }

    // Check for duplication if base ends in /api and endpoint starts with api/
    if (base.endsWith('/api') && endpoint.startsWith('api/')) {
        endpoint = endpoint.substring(4); // Remove 'api/'
    }

    const url = `${base}/${endpoint}`;

    const res = await fetch(url, options);
    if (res.status === 401) throw new Error("Authentication Required");
    if (!res.ok) throw new Error("Link Failure");
    return res.json();
  } catch (e: any) {
    console.error(`API Error [${path}]:`, e.message);
    throw e;
  }
}

// --- MISSION CONTROL (TASKS) ---
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

// --- SETTINGS MODULE ---
export const fetchSettings = (token: string) =>
  apiRequest("/api/settings/", { headers: getHeaders(token) });
export const updateSettings = (updates: any, token: string) =>
  apiRequest("/api/settings/", {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(updates),
  });

// --- NEURAL INTERFACE (AI) ---
export const getAIBriefing = (token: string) =>
  apiRequest("/api/ai/briefing", { headers: getHeaders(token) });
export const sendVoiceCommand = (command: string, token: string) =>
  apiRequest("/api/ai/command", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ command }),
  });

// --- DIAGNOSTICS ---
export const runDiagnostics = (token: string) =>
  apiRequest("/api/debug/run_diagnostics", { headers: getHeaders(token) });

// --- HABITS MODULE ---
export const fetchHabits = (token: string) =>
  apiRequest("/api/habits/", { headers: getHeaders(token) });
export const createHabit = (title: string, token: string) =>
  apiRequest("/api/habits/", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ title }),
  });
export const incrementHabit = (id: string, token: string) =>
  apiRequest(`/api/habits/${id}/increment`, {
    method: "PATCH",
    headers: getHeaders(token),
  });
export const deleteHabit = (id: string, token: string) =>
  apiRequest(`/api/habits/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

// --- FINANCE MODULE ---
export const fetchTransactions = (token: string) =>
  apiRequest("/api/finance/", { headers: getHeaders(token) });
export const addTransaction = (transaction: any, token: string) =>
  apiRequest("/api/finance/", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(transaction),
  });
export const deleteTransaction = (id: string, token: string) =>
  apiRequest(`/api/finance/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

// --- JOURNAL MODULE ---
export const fetchJournal = (token: string) =>
  apiRequest("/api/journal/", { headers: getHeaders(token) });
export const createEntry = (content: string, token: string, mood: string = "neutral") =>
  apiRequest("/api/journal/", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ content, mood }),
  });
export const deleteEntry = (id: string, token: string) =>
  apiRequest(`/api/journal/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

// --- EXPLORER MODULE ---
export const fetchFiles = (parentId: string | null, token: string) => {
    const query = parentId ? `?parent_id=${parentId}` : '';
    return apiRequest(`/api/explorer/${query}`, { headers: getHeaders(token) });
};
export const createFile = (file: any, token: string) =>
  apiRequest("/api/explorer/", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(file),
  });
export const deleteFile = (id: string, token: string) =>
  apiRequest(`/api/explorer/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
