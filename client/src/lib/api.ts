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

// --- TASKS ---
export const fetchTasks = (token: string) =>
  apiFetch("/api/tasks/", { headers: getHeaders(token) });

export const createTask = (title: string, token: string) =>
  apiFetch("/api/tasks/", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ title }),
  });

export const updateTask = (id: string, updates: any, token: string) =>
  apiFetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(updates),
  });

export const deleteTask = (id: string, token: string) =>
  apiFetch(`/api/tasks/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

// --- FINANCE ---
export const fetchTransactions = (token: string) =>
  apiFetch("/api/finance/", { headers: getHeaders(token) });

export const addTransaction = (data: any, token: string) =>
  apiFetch("/api/finance/", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

export const deleteTransaction = (id: string, token: string) =>
  apiFetch(`/api/finance/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

// --- HABITS ---
export const fetchHabits = (token: string) =>
  apiFetch("/api/habits/", { headers: getHeaders(token) });

export const createHabit = (title: string, token: string) =>
  apiFetch("/api/habits/", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ title }),
  });

export const incrementHabit = (id: string, token: string) =>
  apiFetch(`/api/habits/${id}/increment`, {
    method: "PATCH",
    headers: getHeaders(token),
  });

export const deleteHabit = (id: string, token: string) =>
  apiFetch(`/api/habits/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

// --- JOURNAL ---
export const fetchJournal = (token: string) =>
  apiFetch("/api/journal/", { headers: getHeaders(token) });

export const createEntry = (content: string, token: string) =>
  apiFetch("/api/journal/", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ content }),
  });

export const deleteEntry = (id: string, token: string) =>
  apiFetch(`/api/journal/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

// --- EXPLORER ---
export const fetchFiles = (parentId: string | null, token: string) => {
  const query = parentId ? `?parent_id=${parentId}` : "";
  return apiFetch(`/api/explorer/${query}`, { headers: getHeaders(token) });
};

export const createFile = (data: any, token: string) =>
  apiFetch("/api/explorer/", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

export const deleteFile = (id: string, token: string) =>
  apiFetch(`/api/explorer/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

// --- SETTINGS ---
export const fetchSettings = (token: string) =>
  apiFetch("/api/settings/", { headers: getHeaders(token) });

export const updateSettings = (updates: any, token: string) =>
  apiFetch("/api/settings/", {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(updates),
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
