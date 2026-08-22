import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { geocodeAddress } from "../../services/locationService";
import { getRoute } from "../../services/businessService";
import RouteLayer from "../../components/RouteLayer";

import "./DistanceCalculator.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapUpdater({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);

  return null;
}

function DistanceCalculator() {
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapCenter, setMapCenter] = useState([17.385, 78.486]);
  const [mapZoom, setMapZoom] = useState(13);
  const [mode, setMode] = useState("address");

  async function calculateRoute(start, end) {
    try {
      setLoading(true);
      setError("");

      const data = await getRoute(
        start[0],
        start[1],
        end[0],
        end[1]
      );

      setRoute(data.geometry);
      setDistance((data.distance / 1000).toFixed(2));
      setDuration(Math.ceil(data.duration / 60));
    } catch (err) {
      console.error(err);
      setError("Failed to calculate route. Try different locations.");
      setRoute(null);
      setDistance(null);
      setDuration(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (startCoords && endCoords) {
      // Schedule the request after React has committed the new points.
      void Promise.resolve().then(() =>
        calculateRoute(startCoords, endCoords)
      );
    }
  }, [startCoords, endCoords]);

  async function handleGeocodeAddress(address, type) {
    if (!address.trim()) return;

    try {
      const data = await geocodeAddress(address);

      const coords = [data.lat, data.lon];

      if (type === "start") {
        setStartCoords(coords);
        setStartAddress(address);
      } else {
        setEndCoords(coords);
        setEndAddress(address);
      }

      setMapCenter(coords);
      setMapZoom(13);
    } catch (err) {
      console.error(err);
      setError(`Could not find location: "${address}"`);
    }
  }

  function handleMapClick(e) {
    const { lat, lng } = e.latlng;
    const coords = [lat, lng];

    if (!startCoords) {
      setStartCoords(coords);
      setStartAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      setMapCenter(coords);
    } else if (!endCoords) {
      setEndCoords(coords);
      setEndAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  }

  function clearRoute() {
    setStartCoords(null);
    setEndCoords(null);
    setStartAddress("");
    setEndAddress("");
    setRoute(null);
    setDistance(null);
    setDuration(null);
    setError("");
  }

  function swapPoints() {
    const tempAddr = startAddress;
    const tempCoords = startCoords;

    setStartAddress(endAddress);
    setStartCoords(endCoords);
    setEndAddress(tempAddr);
    setEndCoords(tempCoords);

    if (endCoords) {
      setMapCenter(endCoords);
    }
  }

  return (
    <div className="distance-page">
      <div className="distance-panel">
        <h1>Distance Calculator</h1>

        <div className="mode-toggle">
          <button
            className={mode === "address" ? "active" : ""}
            onClick={() => setMode("address")}
          >
            Address
          </button>
          <button
            className={mode === "map" ? "active" : ""}
            onClick={() => setMode("map")}
          >
            Click Map
          </button>
        </div>

        {mode === "address" ? (
          <div className="address-form">
            <div className="input-group">
              <label>Start Point</label>
              <div className="input-row">
                <input
                  type="text"
                  placeholder="Enter start address..."
                  value={startAddress}
                  onChange={(e) => setStartAddress(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleGeocodeAddress(startAddress, "start");
                    }
                  }}
                />
                <button
                  onClick={() => handleGeocodeAddress(startAddress, "start")}
                  className="btn-small"
                >
                  Set
                </button>
              </div>
            </div>

            <button className="swap-btn" onClick={swapPoints}>
              &#8597; Swap
            </button>

            <div className="input-group">
              <label>End Point</label>
              <div className="input-row">
                <input
                  type="text"
                  placeholder="Enter end address..."
                  value={endAddress}
                  onChange={(e) => setEndAddress(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleGeocodeAddress(endAddress, "end");
                    }
                  }}
                />
                <button
                  onClick={() => handleGeocodeAddress(endAddress, "end")}
                  className="btn-small"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="map-instructions">
            <p>
              <strong>Start:</strong> {startCoords ? `${startCoords[0].toFixed(4)}, ${startCoords[1].toFixed(4)}` : "Not set"}
            </p>
            <p>
              <strong>End:</strong> {endCoords ? `${endCoords[0].toFixed(4)}, ${endCoords[1].toFixed(4)}` : "Not set"}
            </p>
            <p className="hint">Click on the map to set start and end points</p>
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        {distance && (
          <div className="result-card">
            <h2>Route Result</h2>
            <div className="result-grid">
              <div className="result-item">
                <span className="label">Distance</span>
                <span className="value">{distance} km</span>
              </div>
              <div className="result-item">
                <span className="label">Duration</span>
                <span className="value">{duration} min</span>
              </div>
            </div>
            <div className="result-actions">
              <button onClick={clearRoute} className="btn-clear">
                Clear Route
              </button>
            </div>
          </div>
        )}

        {loading && <div className="loading">Calculating route...</div>}
      </div>

      <div className="distance-map">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: "100%", height: "100%" }}
          onClick={mode === "map" ? handleMapClick : undefined}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater center={mapCenter} zoom={mapZoom} />

          {route && <RouteLayer geometry={route} />}

          {startCoords && (
            <Marker position={startCoords}>
              <Popup>
                <strong>Start</strong>
                <br />
                {startAddress}
              </Popup>
            </Marker>
          )}

          {endCoords && (
            <Marker position={endCoords}>
              <Popup>
                <strong>End</strong>
                <br />
                {endAddress}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default DistanceCalculator;
