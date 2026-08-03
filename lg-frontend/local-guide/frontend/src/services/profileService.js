const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getProfile() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/profile/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || "Unable to load your profile");
  }

  return response.json();
}
