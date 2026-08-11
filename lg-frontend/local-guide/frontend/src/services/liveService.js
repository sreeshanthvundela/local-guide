const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getLiveContent(lat, lon, radius = 2000) {
  const response = await fetch(
    `${API_URL}/location/live?lat=${lat}&lon=${lon}&radius=${radius}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch live content");
  }

  return response.json();
}
