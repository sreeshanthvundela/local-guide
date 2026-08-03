import "./BusinessDetails.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { getBusinessDetails } from "../../services/businessService";
import { createReview, getRating, getReviews } from "../../services/reviewService";

function BusinessDetails() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState({ rating: 0, total_reviews: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    async function loadBusiness() {
      try {
        const data = await getBusinessDetails(id);
        setBusiness(data);
        const [reviewResult, ratingResult] = await Promise.allSettled([getReviews(id), getRating(id)]);
        if (reviewResult.status === "fulfilled") setReviews(reviewResult.value);
        if (ratingResult.status === "fulfilled") setRating(ratingResult.value);
      } catch (err) {
        setError(err.message || "Failed to load business");
      } finally {
        setLoading(false);
      }
    }
    loadBusiness();
  }, [id]);

  async function handleReviewSubmit(event) {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      setReviewMessage("Log in to leave a review.");
      return;
    }

    try {
      await createReview({ businessId: id, userName: user.name, rating: reviewForm.rating, comment: reviewForm.comment.trim() });
      setReviewForm({ rating: 5, comment: "" });
      setReviews(await getReviews(id));
      setRating(await getRating(id));
      setReviewMessage("Thanks — your review was added.");
    } catch (err) {
      setReviewMessage(err.message);
    }
  }

  if (loading) return <main className="business-page"><p className="business-message">Loading place details…</p></main>;
  if (error || !business) return <main className="business-page"><p className="business-message">{error || "Business not found"}</p></main>;

  const tags = business.tags || {};
  const latitude = Number(business.lat);
  const longitude = Number(business.lon);

  return (
    <main className="business-page">
      <div className="business-banner"><img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4" alt={business.name} /></div>
      <section className="business-info">
        <span className="business-category">{business.category}</span>
        <h1>{business.name}</h1>
        <p className="business-rating">★ {Number(rating.rating).toFixed(1)} <span>({rating.total_reviews} reviews)</span></p>
        <div className="business-meta"><p>📍 {latitude.toFixed(5)}, {longitude.toFixed(5)}</p><p>📞 {tags.phone || "Phone not available"}</p><p>🌐 {tags.website || "Website not available"}</p><p>🕒 {tags.opening_hours || "Hours not available"}</p></div>
      </section>

      <section className="about-section"><h2>About</h2><p>{tags.description || "No description is available for this place yet."}</p></section>

      <section className="review-section">
        <div className="section-title-row"><h2>Reviews</h2><span>{rating.total_reviews} total</span></div>
        {reviews.length ? reviews.map((review) => <article className="review-card" key={review.id}><div className="review-card-header"><strong>{review.user_name}</strong><span>★ {review.rating}/5</span></div><p>{review.comment}</p></article>) : <p className="muted-copy">No reviews yet. Be the first to share what you found.</p>}
        <form className="review-form" onSubmit={handleReviewSubmit}><h3>Share your experience</h3><select value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: Number(event.target.value) })} aria-label="Rating">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select><textarea required minLength="3" value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} placeholder="What should other visitors know?" /><button type="submit">Post review</button>{reviewMessage && <p className="review-message">{reviewMessage}</p>}</form>
      </section>

      <section className="map-section"><h2>Location</h2><MapContainer center={[latitude, longitude]} zoom={16} style={{ height: "400px", width: "100%" }}><TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Marker position={[latitude, longitude]}><Popup>{business.name}</Popup></Marker></MapContainer></section>
    </main>
  );
}

export default BusinessDetails;
