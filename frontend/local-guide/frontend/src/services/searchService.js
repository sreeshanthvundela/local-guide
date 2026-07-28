const API_URL = "http://127.0.0.1:8000";

export async function searchBusinesses(query) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Search failed");
  }

  return response.json();
}
