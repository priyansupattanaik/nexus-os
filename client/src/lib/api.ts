// If we have a specific URL (Production), use it.
// Otherwise, fall back to the proxy (Localhost).
const API_URL = import.meta.env.VITE_API_URL || "/api";

// --- System & AI ---

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

// --- Tasks Module ---

export const fetchTasks = async (token: string) => {
  const response = await fetch(`${API_URL}/tasks/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return await response.json();
};

export const createTask = async (title: string, token: string) => {
  const response = await fetch(`${API_URL}/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error("Failed to create task");
  return await response.json();
};

export const updateTask = async (id: string, updates: any, token: string) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update task");
  return await response.json();
};

export const deleteTask = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete task");
  return await response.json();
};
