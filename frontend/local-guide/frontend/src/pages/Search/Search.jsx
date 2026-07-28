import "./Search.css";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchBusinesses } from "../../services/searchService";

function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    async function fetchResults() {
      try {
        setLoading(true);

        const data = await searchBusinesses(query);

        setResults(data);
      } catch (err) {
        console.error(err);
        setError("Failed to search businesses.");
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  return (
    <div className="search-page">

      <div className="search-header">
        <h1>Search Results</h1>

        <h3>
          Results for: <span>{query}</span>
        </h3>
      </div>

      {loading && <h2>Searching...</h2>}

      {error && <h2>{error}</h2>}

      {!loading && !error && (
        <div className="results">

          {results.length === 0 ? (
            <h3>No businesses found.</h3>
          ) : (
            results.map((business) => (
              <div
                className="business-card"
                key={business.id}
              >
                <h3>{business.name}</h3>

                <p>📍 {business.category}</p>

                <p>
                  📍 {business.lat.toFixed(5)}, {business.lon.toFixed(5)}
                </p>

                <button
                  onClick={() =>
                    navigate(`/business/${business.id}`)
                  }
                >
                  View Details
                </button>
              </div>
            ))
          )}

        </div>
      )}

    </div>
  );
}

export default Search;
