import "./Home.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../../components/search/SearchBar";
import useLocation from "../../hooks/useLocation";
import { getRecommendations } from "../../services/recommendationService";
import { getStats } from "../../services/statsService";

function Home() {
  const location = useLocation();
  const [recommendation, setRecommendation] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadHomeData() {
      const [recommendationResult, statsResult] = await Promise.allSettled([
        getRecommendations(),
        getStats(),
      ]);

      if (recommendationResult.status === "fulfilled") {
        setRecommendation(recommendationResult.value);
      }

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value);
      }
    }

    loadHomeData();
  }, []);

  return (
    <main>
      <section className="hero">
        <span className="location-badge">
          {location
            ? `Near ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`
            : "Finding your location…"}
        </span>

        <h1>Find useful places around you.</h1>
        <p>
          Search businesses by name or service, explore results up to 20 km away,
          and get directions when you are ready to go.
        </p>

        <SearchBar />

        <div className="hero-actions">
          <Link className="hero-secondary-action" to="/map">Explore the map</Link>
          <Link className="hero-secondary-action" to="/search">Advanced search</Link>
        </div>
      </section>

      <section className="home-section recommendations-home">
        <div className="section-heading">
          <div>
            <p className="section-kicker">RIGHT NOW</p>
            <h2>Suggestions for {recommendation?.time?.toLowerCase() || "today"}</h2>
          </div>
          <Link to="/search">Search all places</Link>
        </div>

        <div className="recommendation-grid">
          {recommendation?.recommended_categories?.map((category) => (
            <Link key={category} className="recommend-card" to={`/search?q=${encodeURIComponent(category)}`}>
              <span>Explore</span>
              <h3>{category}</h3>
              <p>Find nearby {category}s with live map data.</p>
            </Link>
          )) || <p className="home-empty">Suggestions are loading…</p>}
        </div>
      </section>

      {stats && (
        <section className="home-section community-stats" aria-label="Local Guide statistics">
          <div><strong>{stats.total_users}</strong><span>registered users</span></div>
          <div><strong>{stats.total_searches}</strong><span>searches made</span></div>
          <div><strong>{stats.total_businesses}</strong><span>saved local places</span></div>
        </section>
      )}
    </main>
  );
}

export default Home;
