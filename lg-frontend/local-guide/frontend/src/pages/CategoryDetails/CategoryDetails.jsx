import "./CategoryDetails.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getNearbyBusinesses } from "../../services/businessService";

function CategoryDetails() {
  const { name } = useParams();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [location, setLocation] = useState({
    lat: null,
    lon: null,
  });

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (err) => {
        console.error(err);
        setError("Unable to get your location.");
        setLoading(false);
      }
    );
  }, []);

  // Fetch nearby businesses
  useEffect(() => {
    if (location.lat === null || location.lon === null) return;

    async function fetchBusinesses() {
      try {
        setLoading(true);

        const categoryMap = {
          restaurants: "restaurant",
          cafes: "cafe",
          hospitals: "hospital",
          pharmacy: "pharmacy",
          hotels: "hotel",
          "bus-stops": "bus_station",
          schools: "school",
          gyms: "gym",
        };

        const apiCategory =
          categoryMap[name.toLowerCase()] || name.toLowerCase();

        console.log("Location:", location);
        console.log("Category:", apiCategory);

        const data = await getNearbyBusinesses(
          location.lat,
          location.lon,
          apiCategory
        );

        setBusinesses(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load businesses.");
      } finally {
        setLoading(false);
      }
    }

    fetchBusinesses();
  }, [name, location]);

  if (loading) {
    return <h2>Loading businesses...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="category-details-page">
      <div className="category-header">
        <h1>{name.replace("-", " ").toUpperCase()}</h1>
        <p>Explore nearby places in this category</p>
      </div>

      <div className="business-grid">
        {businesses.length === 0 ? (
          <h3>No businesses found.</h3>
        ) : (
          businesses.map((business) => (
            <div key={business.id} className="business-card">
              <h2>{business.name}</h2>

              <p>📍 {business.category}</p>

              <p>Latitude: {business.lat}</p>

              <p>Longitude: {business.lon}</p>

              <button
                onClick={() => navigate(`/business/${business.id}`)}
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CategoryDetails;
