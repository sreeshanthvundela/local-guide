const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function responseData(response, fallback) {
  if (response.ok) return response.json();
  const body = await response.json().catch(() => ({}));
  throw new Error(body.detail || fallback);
}

export async function getReviews(businessId) {
  const response = await fetch(`${API_URL}/review/${businessId}`);
  return responseData(response, "Unable to load reviews");
}

export async function getRating(businessId) {
  const response = await fetch(`${API_URL}/review/${businessId}/rating`);
  return responseData(response, "Unable to load rating");
}

export async function createReview({ businessId, userName, rating, comment }) {
  const params = new URLSearchParams({
    business_id: businessId,
    user_name: userName,
    rating: String(rating),
    comment,
  });
  const response = await fetch(`${API_URL}/review/?${params}`, { method: "POST" });
  return responseData(response, "Unable to add your review");
}
