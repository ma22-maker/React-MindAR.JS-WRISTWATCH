import React, { useState } from 'react';
import './App.css';
import ARComponent from './mindar-three-viewer';

function App() {
  const [started, setStarted] = useState(null);

  return (
    <div className="App">
      <h1>Example Demo marker based tracking with MindAR and Reach</h1>

      <div className="control-buttons">
        {started === null && <button onClick={() => {setStarted('three')}}>Start ThreeJS version</button>}
        {started !== null && <button onClick={() => {setStarted(null)}}>Stop</button>}
      </div>

      {started === 'three' && (
        <div className="container">
          <ARComponent />
        </div>
      )}
    </div>
  );
}

export default App;
