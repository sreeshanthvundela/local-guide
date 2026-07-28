import { Polyline, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

function decodePolyline(encoded) {
  let points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

export default function RouteLayer({ geometry }) {
  const map = useMap();

  if (!geometry) return null;

  const positions = decodePolyline(geometry);

  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(L.latLngBounds(positions), {
        padding: [40, 40],
      });
    }
  }, [geometry]);

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: "#2563eb",
        weight: 6,
      }}
    />
  );
}
