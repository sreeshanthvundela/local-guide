const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function geocodeAddress(query) {
  const response = await fetch(
    `${API_URL}/location/geocode?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Geocoding failed");
  }

  return response.json();
}