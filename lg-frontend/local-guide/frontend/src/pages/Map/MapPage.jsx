import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../components/maps/leafletFix";
import RouteLayer from "../../components/RouteLayer";

import "./MapPage.css";

import {
  getAllNearbyBusinesses,
  getNearbyBusinesses,
  getRoute,
} from "../../services/businessService";

import { searchBusinesses } from "../../services/searchService";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


/* =========================================================
   MAP CLICK HANDLER
   ========================================================= */

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      onLocationSelect(lat, lng, "Selected location");
    },
  });

  return null;
}


/* =========================================================
   MAP RECENTER HANDLER
   ========================================================= */

function MapController({ center }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (center && map) {
      map.setView(center, 13, {
        animate: true,
      });
    }
  }, [center, map]);

  return null;
}


/* =========================================================
   MAIN COMPONENT
   ========================================================= */

function MapPage() {
  const routeLocation = useLocation();
  const incomingSearch = routeLocation.state || {};
  const incomingSearchLocation = incomingSearch.searchLocation;
  const initialSearchLocation =
    Number.isFinite(incomingSearchLocation?.lat) &&
    Number.isFinite(incomingSearchLocation?.lon)
      ? [incomingSearchLocation.lat, incomingSearchLocation.lon]
      : null;
  /* ---------------------------------------------------------
     GPS LOCATION
     This is the user's REAL physical location.
     We do NOT overwrite this when searching for Delhi.
     --------------------------------------------------------- */

  const [userLocation, setUserLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);


  /* ---------------------------------------------------------
     SELECTED / EXPLORE LOCATION

     This is the location currently being explored.

     Examples:
     - Delhi
     - Hyderabad
     - A clicked map location
     --------------------------------------------------------- */

  const [selectedLocation, setSelectedLocation] = useState(initialSearchLocation);

  const [selectedLocationName, setSelectedLocationName] = useState(() =>
    initialSearchLocation
      ? `Search area for “${incomingSearch.searchQuery || "places"}”`
      : ""
  );


  /* ---------------------------------------------------------
     LOCATION SEARCH
     --------------------------------------------------------- */

  const [locationQuery, setLocationQuery] = useState("");
  const [locationSearching, setLocationSearching] =
    useState(false);

  const [locationError, setLocationError] = useState(() =>
    navigator.geolocation
      ? ""
      : "Location is unavailable in this browser. Choose a location to explore places."
  );


  /* ---------------------------------------------------------
     BUSINESS DATA
     --------------------------------------------------------- */

  const [businesses, setBusinesses] = useState(() =>
    Array.isArray(incomingSearch.searchResults)
      ? incomingSearch.searchResults
      : []
  );
  const [resultsTitle, setResultsTitle] = useState(() =>
    incomingSearch.searchQuery
      ? `Results for “${incomingSearch.searchQuery}”`
      : "Nearby places"
  );
  const [loading, setLoading] = useState(false);


  /* ---------------------------------------------------------
     BUSINESS SEARCH
     Keep this separate from Explore Location search.
     --------------------------------------------------------- */

  const [search, setSearch] = useState(incomingSearch.searchQuery || "");
  const [searchError, setSearchError] = useState("");


  /* ---------------------------------------------------------
     CATEGORY
     --------------------------------------------------------- */

  const [selectedCategory, setSelectedCategory] =
    useState("");


  /* ---------------------------------------------------------
     LIVE CONTENT
     --------------------------------------------------------- */

  const [liveEvents, setLiveEvents] = useState([]);
  const [liveAds, setLiveAds] = useState([]);


  /* ---------------------------------------------------------
     NAVIGATION
     --------------------------------------------------------- */

  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);


  /* ---------------------------------------------------------
     INITIAL MAP CENTER
     Bengaluru is only a fallback.
     It will NOT replace a searched location.
     --------------------------------------------------------- */

  const defaultCenter = [12.9716, 77.5946];

  /* =========================================================
     LOAD NEARBY BUSINESSES
     ========================================================= */

  async function loadNearby(lat, lon) {
    try {
      setLoading(true);

      const data = await getAllNearbyBusinesses(lat, lon, 5000);

      setBusinesses(Array.isArray(data) ? data : []);
      setResultsTitle("Nearby places (within 5 km)");
    } catch (error) {
      console.error("Failed to load nearby businesses:", error);

      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }


  /* =========================================================
     LOAD CATEGORY BUSINESSES
     ========================================================= */

  async function loadCategoryBusinesses(lat, lon, category) {
    try {
      setLoading(true);

      const data = await getNearbyBusinesses(
        lat,
        lon,
        category
      );

      setBusinesses(Array.isArray(data) ? data : []);
      setResultsTitle(`Nearby ${category.replaceAll("_", " ")}`);
    } catch (error) {
      console.error(
        "Failed to load category businesses:",
        error
      );

      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }


  /* =========================================================
     LOAD LIVE EVENTS + ADS
     ========================================================= */

  async function loadLiveContent(lat, lon) {
    try {
      const response = await fetch(
        `${API_URL}/location/live?lat=${lat}&lon=${lon}&radius=10000`
      );

      if (!response.ok) {
        console.warn(
          "Live content endpoint unavailable:",
          response.status
        );

        setLiveEvents([]);
        setLiveAds([]);
        return;
      }

      const data = await response.json();

      setLiveEvents(data.events || []);
      setLiveAds(data.ads || []);
    } catch (error) {
      console.error(
        "Failed to load live content:",
        error
      );

      setLiveEvents([]);
      setLiveAds([]);
    }
  }


  /* =========================================================
     SELECT A LOCATION

     This is the MAIN function used by:
     1. Delhi search
     2. Clicking on the map
     3. Initial good GPS location
     ========================================================= */

  async function selectExploreLocation(
    lat,
    lon,
    name = "Selected location"
  ) {
    setSelectedLocation([lat, lon]);
    setSelectedLocationName(name);

    setDestination(null);
    setRoute(null);
    setSelectedCategory("");
    setSearch("");
    setSearchError("");

    await loadNearby(lat, lon);

    await loadLiveContent(lat, lon);
  }


  /* =========================================================
     HANDLE MAP CLICK
     ========================================================= */

  function handleMapLocationSelect(lat, lon, name) {
    setLocationQuery("");

    selectExploreLocation(lat, lon, name);
  }

  function useCurrentLocation() {
    if (!userLocation) {
      setLocationError("Your current location is still being detected.");
      return;
    }

    setLocationQuery("");
    setLocationError("");
    void selectExploreLocation(
      userLocation[0],
      userLocation[1],
      "Your current location"
    );
  }


  /* =========================================================
     GEOCODE A CITY / LOCATION
     ========================================================= */

  async function searchExploreLocation() {
    const query = locationQuery.trim();

    if (!query) {
      return;
    }

    try {
      setLocationSearching(true);
      setLocationError("");

      /*
       Uses OpenStreetMap Nominatim for location search.
       Example:
       Delhi -> coordinates of Delhi
      */

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error("Location search failed");
      }

      const results = await response.json();

      if (!results || results.length === 0) {
        setLocationError(
          `Could not find "${query}". Try another city or place.`
        );

        return;
      }

      const place = results[0];

      const lat = Number(place.lat);
      const lon = Number(place.lon);

      await selectExploreLocation(
        lat,
        lon,
        place.display_name
      );
    } catch (error) {
      console.error("Location search failed:", error);

      setLocationError(
        "Could not search for that location."
      );
    } finally {
      setLocationSearching(false);
    }
  }


  /* =========================================================
     HANDLE LOCATION SEARCH ENTER KEY
     ========================================================= */

  function handleLocationKeyDown(e) {
    if (e.key === "Enter") {
      searchExploreLocation();
    }
  }  /* =========================================================
     GET ACTUAL GPS LOCATION

     IMPORTANT:
     This only updates userLocation.

     It does NOT continuously overwrite selectedLocation.

     So:
     GPS = Bengaluru
     Explore Location = Delhi

     Delhi remains selected.
     ========================================================= */

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported.");

      return;
    }

    let firstLocation = true;

    const watchId =
      navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const accuracy =
            position.coords.accuracy;

          console.log("GPS:", {
            latitude: lat,
            longitude: lon,
            accuracy,
          });

          /*
           Save actual physical location.
          */

          setUserLocation([lat, lon]);
          setLocationAccuracy(accuracy);


          /*
           Only use GPS as the initial Explore Location
           if the location is reasonably accurate.

           If your laptop reports ±25,000m,
           it will NOT override the map.
          */

          if (firstLocation) {
            firstLocation = false;

            if (!initialSearchLocation) {
              await selectExploreLocation(
                lat,
                lon,
                "Your current location"
              );
            }
          }
        },

        (error) => {
          console.warn(
            "GPS location error:",
            error.message
          );

          if (!initialSearchLocation && firstLocation) {
            firstLocation = false;
            setLocationError(
              "We could not access your location. Choose a location to explore places."
            );
          }
        },

        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000,
        }
      );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);


  /* =========================================================
     BUSINESS SEARCH
     ========================================================= */

  async function handleBusinessSearch() {
    const query = search.trim();
    const searchCenter = selectedLocation || userLocation;

    if (!query) {
      return;
    }

    if (!searchCenter) {
      setSearchError("Choose a location before searching for places.");
      return;
    }

    try {
      setLoading(true);
      setSearchError("");

      const data = await searchBusinesses(
        query,
        searchCenter[0],
        searchCenter[1]
      );

      setBusinesses(
        Array.isArray(data) ? data : []
      );
      setSelectedCategory("");
      setResultsTitle(`Results for “${query}”`);
    } catch (error) {
      console.error(
        "Business search failed:",
        error
      );

      setSearchError(error.message || "Unable to search places right now.");
    } finally {
      setLoading(false);
    }
  }


  function handleSearchKeyDown(e) {
    if (e.key === "Enter") {
      handleBusinessSearch();
    }
  }

  async function showNearbyPlaces() {
    const center = selectedLocation || userLocation;

    if (!center) {
      setSearchError("Choose a location before viewing nearby places.");
      return;
    }

    setSearch("");
    setSearchError("");
    setSelectedCategory("");
    await loadNearby(center[0], center[1]);
  }


  /* =========================================================
     CATEGORY SELECTION
     ========================================================= */

  async function handleCategorySelect(category) {
    if (!selectedLocation) {
      return;
    }

    /*
       Clicking same category again resets results.
    */

    if (selectedCategory === category) {
      setSelectedCategory("");

      await loadNearby(
        selectedLocation[0],
        selectedLocation[1]
      );

      return;
    }

    setSelectedCategory(category);

    await loadCategoryBusinesses(
      selectedLocation[0],
      selectedLocation[1],
      category
    );
  }


  /* =========================================================
     RESET CATEGORY
     ========================================================= */

  async function resetCategory() {
    if (!selectedLocation) {
      return;
    }

    setSelectedCategory("");

    await loadNearby(
      selectedLocation[0],
      selectedLocation[1]
    );
  }


  /* =========================================================
     SELECT BUSINESS AS DESTINATION
     ========================================================= */

  function selectBusiness(business) {
    const lat = Number(
      business.latitude ?? business.lat
    );

    const lon = Number(
      business.longitude ?? business.lon
    );

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lon)
    ) {
      console.error(
        "Business does not have valid coordinates:",
        business
      );

      return;
    }

    setDestination([lat, lon]);
  }


  /* =========================================================
     LOAD ROUTE

     Route starts from REAL GPS location.

     If GPS is unavailable, selected/explore location
     becomes the route start.
     ========================================================= */

  useEffect(() => {
    if (!destination) {
      return;
    }

    async function refreshRoute() {
      try {
        const start =
          userLocation || selectedLocation;

        if (!start) {
          return;
        }

        const data = await getRoute(
          start[0],
          start[1],
          destination[0],
          destination[1]
        );

        setRoute(data);
      } catch (error) {
        console.error(
          "Failed to load route:",
          error
        );

        setRoute(null);
      }
    }

    refreshRoute();
  }, [
    destination,
    userLocation,
    selectedLocation,
  ]);


  /* =========================================================
     CATEGORY LIST
     Change these names if your existing backend uses
     different category values.
     ========================================================= */

  const categories = [
    "restaurant",
    "cafe",
    "hospital",
    "pharmacy",
    "hotel",
    "bank",
    "atm",
    "supermarket",
    "park",
    "gym",
    "fuel",
  ];


  /* =========================================================
     MAP CENTER

     Priority:
     1. Selected explore location
     2. GPS location
     3. Bengaluru fallback
     ========================================================= */

  const mapCenter =
    selectedLocation ||
    userLocation ||
    defaultCenter;


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="map-page">
      <div className="map-sidebar">

        {/* ================================================
            EXPLORE LOCATION SEARCH
            ================================================ */}

        <div className="location-search-section">
          <h3>📍 Explore Location</h3>

          <div className="location-search-row">
            <input
              type="text"
              placeholder="Try Delhi, Hyderabad, Mumbai..."
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setLocationError("");
              }}
              onKeyDown={handleLocationKeyDown}
            />

            <button
              onClick={searchExploreLocation}
              disabled={locationSearching}
            >
              {locationSearching ? "..." : "Search"}
            </button>
          </div>

          {locationError && (
            <div className="location-error">
              {locationError}
            </div>
          )}

          {selectedLocation && (
            <div className="selected-location-box">
              <strong>
                Currently exploring:
              </strong>

              <div>
                📍 {selectedLocationName}
              </div>

              <small>
                {selectedLocation[0].toFixed(5)},
                {" "}
                {selectedLocation[1].toFixed(5)}
              </small>
            </div>
          )}

          <button
            type="button"
            className="use-current-location"
            onClick={useCurrentLocation}
            disabled={!userLocation}
          >
            Use my current location
          </button>
        </div>


        {/* ================================================
            GPS ACCURACY
            ================================================ */}

        {locationAccuracy !== null && (
          <div
            className={`location-accuracy ${
              locationAccuracy <= 50
                ? "accuracy-good"
                : locationAccuracy <= 500
                ? "accuracy-medium"
                : "accuracy-poor"
            }`}
          >
            📡 GPS accuracy:
            {" "}
            <strong>
              ±{Math.round(locationAccuracy)} m
            </strong>

            {locationAccuracy > 500 && (
              <small>
                GPS is inaccurate. You can search for
                a city or click the map to explore an area.
              </small>
            )}
          </div>
        )}


        {/* ================================================
            BUSINESS SEARCH
            ================================================ */}

        <div className="business-search-section">
          <h3>🔎 Search Places</h3>

          <input
            type="text"
            placeholder="Search restaurants, shops..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onKeyDown={handleSearchKeyDown}
          />

          <button
            onClick={handleBusinessSearch}
          >
            Search Places
          </button>

          <button
            type="button"
            className="show-nearby-button"
            onClick={showNearbyPlaces}
          >
            Show all nearby places
          </button>

          {searchError && (
            <p className="location-error">{searchError}</p>
          )}
        </div>


        {/* ================================================
            CATEGORIES
            ================================================ */}

        <div className="category-section">
          <div className="category-header">
            <h3>Categories</h3>

            {selectedCategory && (
              <button
                onClick={resetCategory}
              >
                Clear
              </button>
            )}
          </div>

          <div className="category-list">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  handleCategorySelect(category)
                }
                className={
                  selectedCategory === category
                    ? "active-category"
                    : ""
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>        {/* ================================================
            LIVE EVENTS
            ================================================ */}

        {liveEvents.length > 0 && (
          <div className="live-events-section">
            <h3>🎉 Current Events</h3>

            {liveEvents.map((event, index) => (
              <div
                className="live-event-card"
                key={event.id || index}
              >
                <strong>
                  {event.title ||
                    event.name ||
                    "Live Event"}
                </strong>

                {event.description && (
                  <p>
                    {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}


        {/* ================================================
            LIVE ADVERTISEMENTS
            ================================================ */}

        {liveAds.length > 0 && (
          <div className="live-ads-section">
            <h3>📢 Sponsored Nearby</h3>

            {liveAds.map((ad, index) => (
              <div
                className="live-ad-card"
                key={ad.id || index}
              >
                <strong>
                  {ad.title ||
                    ad.business_name ||
                    ad.name ||
                    "Sponsored"}
                </strong>

                {ad.description && (
                  <p>
                    {ad.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}


        {/* ================================================
            LOADING
            ================================================ */}

        {loading && (
          <div className="map-loading">
            Loading places...
          </div>
        )}


        {/* ================================================
            BUSINESS RESULTS
            ================================================ */}

        <div className="business-list">
          <h3>
            🏪 {resultsTitle}
          </h3>

          {!loading &&
            businesses.length === 0 && (
              <p>
                No places found for this location.
              </p>
            )}

          {businesses.map(
            (business, index) => (
              <div
                className="business-card"
                key={
                  business.id ||
                  business.osm_id ||
                  index
                }
                onClick={() =>
                  selectBusiness(business)
                }
              >
                <strong>
                  {business.name ||
                    "Unnamed Place"}
                </strong>

                {business.category && (
                  <p>
                    {business.category}
                  </p>
                )}

                {business.address && (
                  <small>
                    {business.address}
                  </small>
                )}

                <button>
                  Navigate
                </button>
              </div>
            )
          )}
        </div>
      </div>


      {/* ===================================================
          MAP
          =================================================== */}

      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {route?.geometry && <RouteLayer geometry={route.geometry} />}


          {/* -----------------------------------------------
              RECENTER MAP WHEN DELHI / OTHER LOCATION
              IS SELECTED
              ----------------------------------------------- */}

          <MapController
            center={mapCenter}
          />


          {/* -----------------------------------------------
              CLICK MAP TO EXPLORE THAT LOCATION
              ----------------------------------------------- */}

          <MapClickHandler
            onLocationSelect={
              handleMapLocationSelect
            }
          />


          {/* -----------------------------------------------
              ACTUAL GPS MARKER
              ----------------------------------------------- */}

          {userLocation && (
            <Marker
              position={userLocation}
            >
              <Popup>
                <strong>
                  Your GPS location
                </strong>

                <br />

                Accuracy:
                {" "}
                ±
                {Math.round(
                  locationAccuracy || 0
                )}
                m
              </Popup>
            </Marker>
          )}


          {/* -----------------------------------------------
              EXPLORE LOCATION MARKER
              ----------------------------------------------- */}

          {selectedLocation && (
            <Marker
              position={selectedLocation}
            >
              <Popup>
                <strong>
                  Exploring:
                </strong>

                <br />

                {selectedLocationName}
              </Popup>
            </Marker>
          )}


          {/* -----------------------------------------------
              BUSINESS MARKERS
              ----------------------------------------------- */}

          {businesses.map(
            (business, index) => {
              const lat = Number(
                business.latitude ??
                  business.lat
              );

              const lon = Number(
                business.longitude ??
                  business.lon
              );

              if (
                Number.isNaN(lat) ||
                Number.isNaN(lon)
              ) {
                return null;
              }

              return (
                <Marker
                  key={
                    business.id ||
                    business.osm_id ||
                    `business-${index}`
                  }
                  position={[lat, lon]}
                >
                  <Popup>
                    <strong>
                      {business.name ||
                        "Unnamed Place"}
                    </strong>

                    {business.category && (
                      <>
                        <br />
                        {business.category}
                      </>
                    )}

                    <br />

                    <button
                      onClick={() =>
                        selectBusiness(
                          business
                        )
                      }
                    >
                      Navigate here
                    </button>
                  </Popup>
                </Marker>
              );
            }
          )}


          {/* -----------------------------------------------
              EVENT MARKERS

              These only appear if the backend returns
              latitude/longitude for events.
              ----------------------------------------------- */}

          {liveEvents.map(
            (event, index) => {
              const lat = Number(
                event.latitude ??
                  event.lat
              );

              const lon = Number(
                event.longitude ??
                  event.lon
              );

              if (
                Number.isNaN(lat) ||
                Number.isNaN(lon)
              ) {
                return null;
              }

              return (
                <Marker
                  key={
                    event.id ||
                    `event-${index}`
                  }
                  position={[lat, lon]}
                >
                  <Popup>
                    🎉
                    {" "}
                    <strong>
                      {event.title ||
                        event.name ||
                        "Live Event"}
                    </strong>

                    {event.description && (
                      <>
                        <br />
                        {event.description}
                      </>
                    )}
                  </Popup>
                </Marker>
              );
            }
          )}


          {/* -----------------------------------------------
              AD MARKERS

              These only appear if the backend returns
              latitude/longitude for ads.
              ----------------------------------------------- */}

          {liveAds.map(
            (ad, index) => {
              const lat = Number(
                ad.latitude ??
                  ad.lat
              );

              const lon = Number(
                ad.longitude ??
                  ad.lon
              );

              if (
                Number.isNaN(lat) ||
                Number.isNaN(lon)
              ) {
                return null;
              }

              return (
                <Marker
                  key={
                    ad.id ||
                    `ad-${index}`
                  }
                  position={[lat, lon]}
                >
                  <Popup>
                    📢
                    {" "}
                    <strong>
                      {ad.title ||
                        ad.business_name ||
                        ad.name ||
                        "Sponsored"}
                    </strong>

                    {ad.description && (
                      <>
                        <br />
                        {ad.description}
                      </>
                    )}
                  </Popup>
                </Marker>
              );
            }
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapPage;
