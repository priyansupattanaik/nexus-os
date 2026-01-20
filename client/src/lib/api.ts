const API_URL = import.meta.env.VITE_API_URL || "/api";

// --- System & AI ---
export const checkSystemStatus = async () => {
  try {
    const res = await fetch(`${API_URL}/health`);
    return res.ok ? await res.json() : { status: "offline" };
  } catch {
    return { status: "offline" };
  }
};

export const getAIBriefing = async (token: string) => {
  // <<< UPDATED: Requires Token
  const res = await fetch(`${API_URL}/ai/briefing`, {
    headers: { Authorization: `Bearer ${token}` }, // <<< Sends Token
  });
  return res.json();
};

export const sendVoiceCommand = async (command: string, token: string) => {
  // <<< UPDATED: Requires Token
  const res = await fetch(`${API_URL}/ai/command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ command }),
  });
  return res.json();
};

// --- Tasks ---
export const fetchTasks = async (token: string) => {
  const res = await fetch(`${API_URL}/tasks/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
export const createTask = async (title: string, token: string) => {
  const res = await fetch(`${API_URL}/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });
  return res.json();
};
export const updateTask = async (id: string, updates: any, token: string) => {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
};
export const deleteTask = async (id: string, token: string) => {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// --- Habits ---
export const fetchHabits = async (token: string) => {
  const res = await fetch(`${API_URL}/habits/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
export const createHabit = async (title: string, token: string) => {
  const res = await fetch(`${API_URL}/habits/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });
  return res.json();
};
export const incrementHabit = async (id: string, token: string) => {
  await fetch(`${API_URL}/habits/${id}/increment`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const deleteHabit = async (id: string, token: string) => {
  await fetch(`${API_URL}/habits/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// --- Finance ---
export const fetchTransactions = async (token: string) => {
  const res = await fetch(`${API_URL}/finance/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
export const addTransaction = async (data: any, token: string) => {
  const res = await fetch(`${API_URL}/finance/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const deleteTransaction = async (id: string, token: string) => {
  await fetch(`${API_URL}/finance/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// --- Journal ---
export const fetchJournal = async (token: string) => {
  const res = await fetch(`${API_URL}/journal/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
export const createEntry = async (content: string, token: string) => {
  const res = await fetch(`${API_URL}/journal/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content, mood: "focused" }),
  });
  return res.json();
};
export const deleteEntry = async (id: string, token: string) => {
  await fetch(`${API_URL}/journal/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};
