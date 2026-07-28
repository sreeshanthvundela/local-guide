const API_URL = "http://127.0.0.1:8000";

export async function getRecommendations() {
  const response = await fetch(
    `${API_URL}/recommendation`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recommendations");
  }

  return response.json();
}
