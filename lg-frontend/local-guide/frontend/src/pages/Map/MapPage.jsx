import { useEffect, useState } from "react";
import MapUpdater from "./MapUpdater";
import RouteLayer from "../../components/RouteLayer";
import LiveContentLayer from "../../components/LiveContentLayer";
import { getLiveContent } from "../../services/liveService";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import {
  getAllNearbyBusinesses,
  getNearbyBusinesses,
  searchBusinesses,
  getRoute,
} from "../../services/businessService";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const categories = [
  "restaurant",
  "cafe",
  "hospital",
  "hotel",
  "pharmacy",
  "atm",
];

function MapPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveEvents, setLiveEvents] = useState([]);
  const [liveAdvertisements, setLiveAdvertisements] = useState([]);
  const [search, setSearch] = useState("");

  const [userLocation, setUserLocation] = useState([
    17.385,
    78.486,
  ]);

  const [route, setRoute] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const [destination, setDestination] = useState(null);
  async function loadLiveContent(lat, lon) {
    try {
      console.log("Loading live content:", {
        lat,
        lon,
      });

      const data = await getLiveContent(lat, lon, 10000);

      console.log("LIVE CONTENT RESPONSE:", data);

      setLiveEvents(
        Array.isArray(data.events)
          ? data.events
          : []
      );

      setLiveAdvertisements(
        Array.isArray(data.advertisements)
          ? data.advertisements
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load live content:",
        error
      );

      setLiveEvents([]);
      setLiveAdvertisements([]);
    }
  }
  useEffect(() => {
    let firstLoad = true;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setUserLocation([lat, lon]);

        if (firstLoad) {
          loadNearby(lat, lon);
          firstLoad = false;
        }loadLiveContent(lat, lon);
      },
      console.error,
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  useEffect(() => {
    if (!destination) return;

    async function refreshRoute() {
      try {
        const data = await getRoute(
          userLocation[0],
          userLocation[1],
          destination[0],
          destination[1]
        );

        setRoute(data.geometry);
        setDistance((data.distance / 1000).toFixed(2));
        setDuration(Math.ceil(data.duration / 60));

        if (data.segments?.length) {
          setSteps(data.segments[0].steps);
        }
      } catch (err) {
        console.error(err);
      }
    }
    refreshRoute();
  }, [userLocation, destination]);
  async function loadNearby(lat, lon) {
    try {
      setLoading(true);

      const data = await getAllNearbyBusinesses(lat, lon);

      setBusinesses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!steps.length) return;

    speak(steps[currentStep].instruction);
  }, [currentStep, steps]);
  async function handleCategory(category) {
    try {
      setLoading(true);

      const data = await getNearbyBusinesses(
        userLocation[0],
        userLocation[1],
        category
      );

      setBusinesses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    if (e.key !== "Enter") return;

    try {
      setLoading(true);

      const data = await searchBusinesses(search);

      setBusinesses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDirections(business) {
    try {
      const data = await getRoute(
        userLocation[0],
        userLocation[1],
        Number(business.lat),
        Number(business.lon)
      );
      setDestination([
        Number(business.lat),
        Number(business.lon),
      ]);
      setRoute(data.geometry);
      setDistance((data.distance / 1000).toFixed(2));
      setDuration(Math.ceil(data.duration / 60));

      if (data.segments && data.segments.length > 0) {
        setSteps(data.segments[0].steps);
        setCurrentStep(0);
      } else {
        setSteps([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to calculate route.");
    }
  }
  function speak(text) {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 1;

    window.speechSynthesis.speak(speech);
  }
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
      }}
    >
      <div
        style={{
          width: 360,
          padding: 20,
          overflowY: "auto",
          borderRight: "1px solid #ddd",
        }}
      >
        <input
          placeholder="Search places..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 15,
          }}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 15,
          }}
        >
          <button
            onClick={() =>
              loadNearby(userLocation[0], userLocation[1])
            }
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <h2>Nearby Places</h2>

        {distance && (
          <div
            style={{
              marginBottom: 20,
              padding: 12,
              background: "#eef5ff",
              borderRadius: 10,
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              Navigation
            </h3>

            <strong>Distance:</strong> {distance} km

            <br />

            <strong>ETA:</strong> {duration} min

            <hr />

            <h4>Turn-by-Turn Directions</h4>

            <div
              style={{
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              {steps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    padding: 10,
                    marginBottom: 8,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background:
                      index === currentStep
                        ? "#dbeafe"
                        : "#fff",
                    fontWeight:
                      index === currentStep
                        ? "bold"
                        : "normal",
                  }}
                >
                  <div>{step.instruction}</div>

                  <small>
                    {step.distance.toFixed(0)} m
                  </small>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 15,
              }}
            >
              <button
                onClick={() =>
                  setCurrentStep((prev) =>
                    Math.max(prev - 1, 0)
                  )
                }
              >
                ◀ Previous
              </button>

              <button
                onClick={() =>
                  setCurrentStep((prev) =>
                    Math.min(
                      prev + 1,
                      steps.length - 1
                    )
                  )
                }
              >
                Next ▶
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <p>{businesses.length} places found</p>
        )}

        {businesses.map((business) => (
          <div
            key={business.id}
            onClick={() =>
              setUserLocation([
                Number(business.lat),
                Number(business.lon),
              ])
            }
            style={{
              cursor: "pointer",
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <h3>{business.name}</h3>

            <p>{business.category}</p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDirections(business);
              }}
            >
              🧭 Directions
            </button>
          </div>
        ))}
      </div>      <div style={{ flex: 1 }}>
        <MapContainer
          center={userLocation}
          zoom={15}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <MapUpdater center={userLocation} />

          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          /><LiveContentLayer
            events={liveEvents}
            advertisements={liveAdvertisements}
          />

          {route && (
            <RouteLayer geometry={route} />
          )}

          <Marker position={userLocation}>
            <Popup>
              <strong>Your Location</strong>
            </Popup>
          </Marker>

          {businesses.map((business) => (
            <Marker
              key={business.id}
              position={[
                Number(business.lat),
                Number(business.lon),
              ]}
            >
              <Popup>
                <strong>{business.name}</strong>

                <br />

                {business.category}

                <br />
                <br />

                <button
                  onClick={() =>
                    handleDirections(business)
                  }
                >
                  🧭 Navigate
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapPage;
