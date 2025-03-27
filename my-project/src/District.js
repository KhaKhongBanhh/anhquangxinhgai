import React, { useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";

const MapComponent = () => {
  const [viewState, setViewState] = useState({
    longitude: 106.7218, // Tọa độ trung tâm Quận 7
    latitude: 10.7325,
    zoom: 12
  });

  return (
    <Map
      {...viewState}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle="https://demotiles.maplibre.org/style.json" // MapLibre style
      onMove={(evt) => setViewState(evt.viewState)}
    >
      {/* Layer raster từ ảnh local */}
      <Source
        id="quan7-raster"
        type="raster"
        tiles={["/img/{z}/{x}/{y}.png"]} // Trỏ đến ảnh trong thư mục public
        tileSize={256}
      >
        <Layer id="quan7-layer" type="raster" source="quan7-raster" />
      </Source>
    </Map>
  );
};

export default MapComponent;
