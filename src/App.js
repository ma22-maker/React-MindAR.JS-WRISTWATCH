import React, { useState } from "react";
import "./App.css";
import ARComponent from "./mindar";

function Home() {
  const [started, setStarted] = useState(null);

  return (
    <>
      <div className="app-background">
        <div className="content">
          {started === null && (
            <div className="text-container">
              <h1>Example Demo marker-based tracking with MindAR.js and React</h1>
              <p>
                Hey there! Ready for a little AR magic? 🎩✨ Here's a tiny demo
                using MindAR with React, but you'll need to do a bit of the legwork.
                It's a marker-based AR experience, so first things first:            
                <a href="https://cdn.jsdelivr.net/gh/ma22-maker/ARWatch@main/wp10826527-ben-10-cartoon-wallpapers.jpg" download> download this image..</a>
                Go on, I dare you. Open it on your mobile—yes, your
                trusty smartphone.
                <br />
                <br />
                Pro tip: Feel free to zoom in or out. Once you tap on the 3D model,
                prepare for some epic sound effects. For the best experience, open
                the URL on your mobile. Enjoy, and may the AR be ever in your favor!
                📲🔊
              </p>
            </div>
          )}
          <div className="control-buttons">
            {started === null && (
              <button onClick={() => setStarted('react')}>Start ThreeJS version</button>
            )}
            {started !== null && (
              <button onClick={() => setStarted(null)}>Stop</button>
            )}
          </div>
        </div>
      </div>
      {started === 'react' && (
        <div className="container">
          <ARComponent />
        </div>
      )}
    </>
  ); 
}

export default Home;
