const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// --- CORE SYSTEM ---
export async function checkSystemStatus() {
  try {
    const res = await fetch(`${API_URL}/`);
    return res.ok ? { status: "healthy" } : { status: "error" };
  } catch {
    return { status: "offline" };
  }
}

// --- TASKS ---
export async function fetchTasks(token: string) {
  const res = await fetch(`${API_URL}/api/tasks/`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}
export async function createTask(title: string, token: string) {
  const res = await fetch(`${API_URL}/api/tasks/`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ title }),
  });
  return res.json();
}
export async function updateTask(id: string, updates: any, token: string) {
  await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(updates),
  });
}
export async function deleteTask(id: string, token: string) {
  await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
}

// --- FINANCE ---
export async function fetchTransactions(token: string) {
  const res = await fetch(`${API_URL}/api/finance/`, {
    headers: getHeaders(token),
  });
  return res.ok ? res.json() : [];
}
export async function addTransaction(data: any, token: string) {
  const res = await fetch(`${API_URL}/api/finance/`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function deleteTransaction(id: string, token: string) {
  await fetch(`${API_URL}/api/finance/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
}

// --- HABITS ---
export async function fetchHabits(token: string) {
  const res = await fetch(`${API_URL}/api/habits/`, {
    headers: getHeaders(token),
  });
  return res.ok ? res.json() : [];
}
export async function createHabit(title: string, token: string) {
  const res = await fetch(`${API_URL}/api/habits/`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ title }),
  });
  return res.json();
}
export async function incrementHabit(id: string, token: string) {
  await fetch(`${API_URL}/api/habits/${id}/increment`, {
    method: "PATCH",
    headers: getHeaders(token),
  });
}
export async function deleteHabit(id: string, token: string) {
  await fetch(`${API_URL}/api/habits/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
}

// --- JOURNAL ---
export async function fetchJournal(token: string) {
  const res = await fetch(`${API_URL}/api/journal/`, {
    headers: getHeaders(token),
  });
  return res.ok ? res.json() : [];
}
export async function createEntry(content: string, token: string) {
  const res = await fetch(`${API_URL}/api/journal/`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ content }),
  });
  return res.json();
}
export async function deleteEntry(id: string, token: string) {
  await fetch(`${API_URL}/api/journal/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
}

// --- EXPLORER ---
export async function fetchFiles(parentId: string | null, token: string) {
  const url = parentId
    ? `${API_URL}/api/explorer/?parent_id=${parentId}`
    : `${API_URL}/api/explorer/`;
  const res = await fetch(url, { headers: getHeaders(token) });
  return res.ok ? res.json() : [];
}
export async function createFile(data: any, token: string) {
  const res = await fetch(`${API_URL}/api/explorer/`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function deleteFile(id: string, token: string) {
  await fetch(`${API_URL}/api/explorer/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
}

// --- SETTINGS ---
export async function fetchSettings(token: string) {
  const res = await fetch(`${API_URL}/api/settings/`, {
    headers: getHeaders(token),
  });
  return res.ok ? res.json() : {};
}
export async function updateSettings(updates: any, token: string) {
  const res = await fetch(`${API_URL}/api/settings/`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(updates),
  });
  return res.json();
}

// --- AI (RE-WIRED) ---
export async function getAIBriefing(token: string) {
  const res = await fetch(`${API_URL}/api/ai/briefing`, {
    headers: getHeaders(token),
  });
  return res.ok ? res.json() : { message: "Neural Link Offline." };
}
export async function sendVoiceCommand(command: string, token: string) {
  const res = await fetch(`${API_URL}/api/ai/command`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ command }),
  });
  if (!res.ok) return { response: "Uplink Failure. Check AI Module." };
  return res.json();
}
