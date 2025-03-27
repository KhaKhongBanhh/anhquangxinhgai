import React, { useState } from 'react';
import './App.css';
import MapComponent from './MapComponent';
import District from './District';

function App() {
  const [showMap, setShowMap] = useState(false);
  const [showDistrict, setShowDistrict] = useState(false);

  return (
    <div className="App">
        <MapComponent/>
    </div>
  );
}

export default App;