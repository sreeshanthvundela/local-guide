import "./BusinessDetails.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import { getBusinessDetails } from "../../services/businessService";

function BusinessDetails() {
  const { id } = useParams();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBusiness() {
      try {
        const data = await getBusinessDetails(id);
        console.log(data);
        setBusiness(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load business");
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, [id]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!business) {
    return <h2>Business not found</h2>;
  }

  const tags = business.tags || {};

  return (
    <div className="business-page">
      <div className="business-banner">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
          alt={business.name}
        />
      </div>

      <div className="business-info">
        <h1>{business.name}</h1>

        <p>🍽 {business.category}</p>

        <p>
          📍 {business.lat}, {business.lon}
        </p>

        <p>
          📞 {tags.phone || "Not Available"}
        </p>

        <p>
          🌐 {tags.website || "Not Available"}
        </p>

        <p>
          🕒 {tags.opening_hours || "Not Available"}
        </p>
      </div>

      <section className="about-section">
        <h2>About</h2>

        <p>
          {tags.description ||
            "No description available."}
        </p>
      </section>

      <section className="map-section">
        <h2>Location</h2>

        <MapContainer
          center={[business.lat, business.lon]}
          zoom={16}
          style={{
            height: "400px",
            width: "100%",
            borderRadius: "15px",
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            position={[
              business.lat,
              business.lon,
            ]}
          >
            <Popup>{business.name}</Popup>
          </Marker>
        </MapContainer>
      </section>
    </div>
  );
}

export default BusinessDetails;
