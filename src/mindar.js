import React, { useEffect, useRef, useState } from "react";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function ARComponent() {
  const containerRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const actionRef = useRef(null);
  const audioRef = useRef(null);
  const [scaleFactor, setScaleFactor] = useState(10);

  useEffect(() => {
    const mindarThree = new MindARThree({
      container: containerRef.current,
      imageTargetSrc: "https://cdn.jsdelivr.net/gh/ma22-maker/ARWatchAssets@main/Benten.mind",
      filterMinCF: 0.01,
      filterBeta: 50,
      warmupTolerance: 0.1,
      missTolerance: 0.1,
      uiError: "no",
      uiLoading: "no",
    });

    const { renderer, scene, camera } = mindarThree;
    const anchor = mindarThree.addAnchor(0);
    anchor.group.castShadow = true;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);

    // Add audio listener to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // Load the audio file
    const audioLoader = new THREE.AudioLoader();
    const sound = new THREE.Audio(listener);
    audioLoader.load("https://cdn.jsdelivr.net/gh/ma22-maker/ARWatchAssets@main/omnitrix.mp3", function(buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(2);
      audioRef.current = sound;
    });

    // Load the GLTF model
    const loader = new GLTFLoader();
    loader.load(
      "https://cdn.jsdelivr.net/gh/ma22-maker/ARWatchAssets@main/classic_omnitrix.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(10, 10, 10);
        model.rotation.x = Math.PI / 2;
        model.rotation.y = Math.PI / 2;
        anchor.group.add(model);
        modelRef.current = model;

        // Animation mixer
        const mixer = new THREE.AnimationMixer(model);
        mixerRef.current = mixer;
        const clips = gltf.animations;
        if (clips.length > 0) {
          const clip = THREE.AnimationClip.findByName(clips, "Animation");
          if (clip) {
            const action = mixer.clipAction(clip);
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
            actionRef.current = action;
          } else {
            console.error('Animation clip "Animation" not found.');
          }
        } else {
          console.error("No animations found in GLTF model.");
        }
      },
      undefined,
      (error) => {
        console.error("An error occurred while loading the model:", error);
      }
    );

    // Event listeners
    const handleTargetFound = () => {
      console.log("Target found");
    };

    const handleTargetLost = () => {
      console.log("Target lost");
    };
    const handleMouseWheel = (event) => {
      event.preventDefault(); // Prevent the default scroll behavior
      if (modelRef.current) {
        setScaleFactor((prevScale) => {
          // Increase sensitivity by changing the multiplier value
          const scaleChange = event.deltaY * -0.02; // Adjusted scaling sensitivity
          // Adjust the scale limits to allow a larger range
          const newScale = Math.max(0.1, Math.min(50, prevScale + scaleChange));
          modelRef.current.scale.set(newScale, newScale, newScale);
          return newScale;
        });
      }
    };

    const handleModelClick = () => {
      if (actionRef.current) {
        actionRef.current.reset().play();
      }
      if (audioRef.current) {
        audioRef.current.play();
      }
    };

    // Add event listeners
    const containerElement = containerRef.current;
    anchor.onTargetFound = handleTargetFound;
    anchor.onTargetLost = handleTargetLost;
    containerElement.addEventListener("wheel", handleMouseWheel);
    containerElement.addEventListener("click", handleModelClick);

    mindarThree.start();

    renderer.setAnimationLoop(() => {
      if (mixerRef.current) {
        mixerRef.current.update(0.01);
      }
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      // Clean up event listeners
      anchor.onTargetLost = null;
      containerElement.removeEventListener("wheel", handleMouseWheel);
      containerElement.removeEventListener("click", handleModelClick);
      mindarThree.stop();
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }} ref={containerRef}></div>
  );
}

export default ARComponent;
