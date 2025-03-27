import React, { useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css"; // Import CSS

function MapComponent() {
  const [viewState, setViewState] = useState({
    latitude: 20.9539496, // Tọa độ Quận 7
    longitude: 105.7136903,
    zoom: 6,
  });

  const [showLayer, setShowLayer] = useState(false); // Toggle layer
  const [opacity, setOpacity] = useState(1); // Độ mờ của layer

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      {/* Bản đồ MapLibre */}
      <div style={{ flex: 1, position: "relative" }}>
        <Map
          {...viewState}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://demotiles.maplibre.org/style.json"
          onMove={(evt) => setViewState(evt.viewState)}
        >
          {/* Nếu showLayer = true, thêm nguồn dữ liệu raster */}
          {showLayer && (
            <Source
              id="quan7-raster"
              type="raster"
              tiles={["/img/{z}/{x}/{y}.png"]}
              tileSize={256}
            >
              <Layer
                id="quan7-layer"
                type="raster"
                source="quan7-raster"
                paint={{ "raster-opacity": opacity }} // Điều chỉnh độ mờ
              />
            </Source>
          )}
        </Map>


        {/* Thanh trượt điều chỉnh độ mờ */}
        {showLayer && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10, // Chuyển sang góc phải
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "5px",
              textAlign: "center",
            }}
          >
            <label><b>Độ mờ của bản đồ</b></label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              style={{ width: "120px" }}
            />
          </div>
        )}
      </div>

      {/* Google Maps */}
      <div style={{ flex: 1 }}>
        <iframe
          title="Google Maps"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.902214062527!2d105.7136903!3d20.9539496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313453d3b3b3b3b3%3A0x3b3b3b3b3b3b3b3b!2sH%C3%A0%20%C4%90%C3%B4ng%2C%20H%C3%A0%20N%E1%BB%99i%2C%20Vi%E1%BB%87t%20Nam!5e0!3m2!1svi!2s!4v1610000000000!5m2!1svi!2s"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

export default MapComponent;