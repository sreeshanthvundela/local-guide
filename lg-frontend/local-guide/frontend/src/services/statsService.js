const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getStats() {
  const response = await fetch(`${API_URL}/stats/`);
  if (!response.ok) throw new Error("Unable to load statistics");
  return response.json();
}
