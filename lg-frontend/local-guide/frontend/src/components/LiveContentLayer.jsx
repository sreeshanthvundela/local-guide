import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const eventIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #16a34a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,.3);
    ">
      🎉
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const adIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #2563eb;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,.3);
    ">
      📢
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function LiveContentLayer({ events = [], advertisements = [] }) {
  return (
    <>
      {events.map((event) => (
        <Marker
          key={`event-${event.id}`}
          position={[event.latitude, event.longitude]}
          icon={eventIcon}
        >
          <Popup>
            <div style={{ minWidth: 220 }}>
              <div style={{ fontSize: 13, color: "#16a34a" }}>
                🎉 LIVE EVENT
              </div>

              <h3 style={{ margin: "6px 0" }}>
                {event.title}
              </h3>

              {event.description && (
                <p style={{ margin: "5px 0" }}>
                  {event.description}
                </p>
              )}

              {event.location && (
                <p style={{ margin: "5px 0" }}>
                  📍 {event.location}
                </p>
              )}

              <small>
                {event.distance} m away
              </small>
            </div>
          </Popup>
        </Marker>
      ))}

      {advertisements.map((ad) => (
        <Marker
          key={`ad-${ad.id}`}
          position={[ad.latitude, ad.longitude]}
          icon={adIcon}
        >
          <Popup>
            <div style={{ minWidth: 220 }}>
              <div style={{ fontSize: 13, color: "#2563eb" }}>
                📢 ADVERTISEMENT
              </div>

              <h3 style={{ margin: "6px 0" }}>
                {ad.title}
              </h3>

              {ad.business_name && (
                <strong>{ad.business_name}</strong>
              )}

              {ad.description && (
                <p style={{ margin: "5px 0" }}>
                  {ad.description}
                </p>
              )}

              <small>
                {ad.distance} m away
              </small>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default LiveContentLayer;
