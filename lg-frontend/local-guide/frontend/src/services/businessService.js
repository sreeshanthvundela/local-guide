const API_URL = "http://127.0.0.1:8000";

// =============================
// Get all nearby businesses
// =============================
export async function getAllNearbyBusinesses(lat, lon) {
  const response = await fetch(
    `${API_URL}/business/all-nearby?lat=${lat}&lon=${lon}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch nearby businesses");
  }

  return response.json();
}

// =============================
// Get businesses by category
// =============================
export async function getNearbyBusinesses(lat, lon, category) {
  const response = await fetch(
    `${API_URL}/business/nearby?lat=${lat}&lon=${lon}&category=${encodeURIComponent(
      category
    )}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch nearby businesses");
  }

  return response.json();
}

// =============================
// Search businesses
// =============================
export async function searchBusinesses(query) {
  const response = await fetch(
    `${API_URL}/search?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Search failed");
  }

  return response.json();
}

// =============================
// Business Details
// =============================
export async function getBusinessDetails(id) {
  const response = await fetch(`${API_URL}/business/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch business details");
  }

  return response.json();
}

// =============================
// Navigation Route
// =============================
export async function getRoute(
  startLat,
  startLon,
  endLat,
  endLon
) {
  const response = await fetch(
    `${API_URL}/business/route?start_lat=${startLat}&start_lon=${startLon}&end_lat=${endLat}&end_lon=${endLon}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch route");
  }

  return response.json();
}
