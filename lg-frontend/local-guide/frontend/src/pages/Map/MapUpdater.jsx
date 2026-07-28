import { useMap } from "react-leaflet";
import { useEffect } from "react";

function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);

  return null;
}

export default MapUpdater;
