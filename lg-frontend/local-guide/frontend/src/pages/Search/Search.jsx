import "./Search.css";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { searchBusinesses } from "../../services/searchService";

const SEARCH_RANGES = [
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "20 km", value: 20000 },
];

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [input, setInput] = useState(query);
  const [radius, setRadius] = useState(10000);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(() => (
    navigator.geolocation ? "" : "Location is unavailable in this browser."
  ));
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => setLocationError("Allow location access to search places near you."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    if (!query || !location) return;

    let cancelled = false;

    async function fetchResults() {
      setLoading(true);
      setError("");

      try {
        const data = await searchBusinesses(
          query,
          location.lat,
          location.lon,
          radius
        );

        if (!cancelled) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to search places right now.");
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchResults();

    return () => {
      cancelled = true;
    };
  }, [query, location, radius]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedQuery = input.trim();

    if (trimmedQuery) {
      setSearchParams({ q: trimmedQuery });
    }
  }

  function formatCategory(category) {
    return category.replaceAll("_", " ");
  }

  return (
    <main className="search-page">
      <section className="search-hero">
        <p className="search-eyebrow">DISCOVER NEARBY</p>
        <h1>Find the right place, farther from home.</h1>
        <p>Search services and businesses within up to 20 km of your location.</p>

        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Try restaurants, pharmacy, gym, or a business name"
            aria-label="Search places"
          />
          <button type="submit">Search</button>
        </form>

        <div className="search-ranges" aria-label="Search range">
          {SEARCH_RANGES.map((range) => (
            <button
              type="button"
              key={range.value}
              className={radius === range.value ? "active" : ""}
              onClick={() => setRadius(range.value)}
            >
              Within {range.label}
            </button>
          ))}
        </div>
      </section>

      <section className="search-results" aria-live="polite">
        {locationError && <p className="search-message error">{locationError}</p>}
        {!location && !locationError && <p className="search-message">Getting your location…</p>}

        {query && location && !loading && !error && (
          <div className="results-summary">
            <div>
              <p className="search-eyebrow">RESULTS</p>
              <h2>{results.length} places for “{query}”</h2>
            </div>
            <span>Within {radius / 1000} km</span>
          </div>
        )}

        {loading && <p className="search-message">Searching nearby places…</p>}
        {error && (
          <p className="search-message error">
            {error} {error.includes("log in") && <Link to="/login">Log in</Link>}
          </p>
        )}

        {!query && <p className="search-message">Enter a service, category, or business name to start searching.</p>}

        {!loading && query && location && !error && results.length === 0 && (
          <p className="search-message">No matches found. Try a broader range or a different search term.</p>
        )}

        <div className="results-grid">
          {results.map((business) => (
            <article className="search-result-card" key={business.id}>
              <span className="result-category">{formatCategory(business.category)}</span>
              <h3>{business.name}</h3>
              <p>{business.address || "Address unavailable"}</p>
              <button onClick={() => navigate(`/business/${business.id}`)}>
                View details
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Search;
