import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import "./leafletFix";

import { useEffect, useState } from "react";

import "leaflet/dist/leaflet.css";

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);

  return null;
}

function MapView() {
  const [position, setPosition] = useState([
    17.385,
    78.4867,
  ]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([
          pos.coords.latitude,
          pos.coords.longitude,
        ]);
      },
      (err) => {
        console.log(err);
      }
    );
  }, []);

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{
        height: "100vh",
        width: "100vh",
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position}>
        <Popup>
          📍 You are here
        </Popup>
      </Marker>

      <RecenterMap position={position} />

    </MapContainer>
  );
}

export default MapView;