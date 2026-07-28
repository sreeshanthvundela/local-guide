import SearchBar from "../../components/search/SearchBar";
import CategoryCard from "../../components/category/CategoryCard";
import useLocation from "../../hooks/useLocation";
import { useEffect, useState } from "react";
import { getRecommendations } from "../../services/recommendationService";
function Home() {
  const location = useLocation();
  const [recommendation, setRecommendation] = useState(null);
  useEffect(() => {
      async function loadRecommendations() {
        try {
          const data = await getRecommendations();
          setRecommendation(data);
        } catch (error) {
          console.error(error);
        }
      }

      loadRecommendations();
    }, []);
  return (
    <>
      <section className="hero">
        <span className="location-badge">
          {location
            ? `📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
            : "📍 Detecting Location..."}
        </span>

        <h1>
          Discover Nearby Places &
          <br />
          Services Instantly
        </h1>

        <p>
          Restaurants, Hospitals, Cafes, Hotels and more
          around your location.
        </p>

        <SearchBar />

      </section>

      <section className="categories-section">
        <h2>Popular Categories</h2>

        <div className="category-grid">

  <CategoryCard
    icon="🍽️"
    title="Restaurants"
    count="234"
    color="linear-gradient(135deg,#fff7ed,#ffedd5)"
  />

  <CategoryCard
    icon="☕"
    title="Cafes"
    count="95"
    color="linear-gradient(135deg,#fef2f2,#fee2e2)"
  />

  <CategoryCard
    icon="🏥"
    title="Hospitals"
    count="42"
    color="linear-gradient(135deg,#eff6ff,#dbeafe)"
  />

  <CategoryCard
    icon="💊"
    title="Pharmacy"
    count="78"
    color="linear-gradient(135deg,#ecfdf5,#d1fae5)"
  />

  <CategoryCard
    icon="🏨"
    title="Hotels"
    count="55"
    color="linear-gradient(135deg,#faf5ff,#ede9fe)"
  />

  <CategoryCard
    icon="🚌"
    title="Bus Stops"
    count="143"
    color="linear-gradient(135deg,#fefce8,#fef9c3)"
  />

</div>
      </section>

      <section className="recommendation-section">
        <h2>🔥 Recommended Near You</h2>

        <div className="recommendation-grid">
          {recommendation?.recommended_categories?.map((category) => (
            <div
              key={category}
              className="recommend-card"
            >
              <h3>{category}</h3>
              <p>
                Recommended during the {recommendation.time}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
