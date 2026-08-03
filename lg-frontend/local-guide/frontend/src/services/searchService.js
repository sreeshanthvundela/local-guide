const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function searchBusinesses(query, lat, lon, radius = 10000) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to search nearby places.");
  }

  const response = await fetch(
    `${API_URL}/search/?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&radius=${radius}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || "Search failed");
  }

  return response.json();
}
