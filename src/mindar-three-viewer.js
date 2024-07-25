import React, { useEffect, useRef, useState } from "react";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function ARComponent() {
  const containerRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const actionRef = useRef(null);
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const mindarThree = new MindARThree({
      container: containerRef.current,
      imageTargetSrc:
        "https://cdn.jsdelivr.net/gh/ma22-maker/ARWatch@main/targets.mind",
      filterMinCF: 0.01,
      filterBeta: 50,
      warmupTolerance: 0.1,
      missTolerance: 0.1,
      uiError: "no",
      uiLoading: "no",
      uiScanning: "no",
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

    // Load the GLTF model
    const loader = new GLTFLoader();
    loader.load(
      "https://cdn.jsdelivr.net/gh/ma22-maker/ARWatch@main/omnitrix_ben_10.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.6, 0.6, 0.6);
        model.rotation.x = Math.PI / 2;
        model.rotation.y = Math.PI / 2;
        anchor.group.add(model);
        modelRef.current = model;

        // Animation mixer
        const mixer = new THREE.AnimationMixer(model);
        mixerRef.current = mixer;
        const clips = gltf.animations;
        // console.log(clips);
        if (clips.length > 0) {
          const clip = THREE.AnimationClip.findByName(
            clips,
            "Torus.001|Torus.001Action.003"
          );
          // console.log("clio",clip)
          if (clip) {
            const action = mixer.clipAction(clip);
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
            actionRef.current = action;
            console.log( actionRef.current)
          } else {
            console.error(
              'Animation clip "Torus.001|Torus.001Action.003" not found.'
            );
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
          const scaleChange = event.deltaY * -0.001; // Adjust scaling sensitivity
          const newScale = Math.max(0.1, Math.min(5, prevScale + scaleChange));
          modelRef.current.scale.set(newScale, newScale, newScale);
          return newScale;
        });
      }
    };

    const handleModelClick = () => {
      if (actionRef.current) {
        actionRef.current.reset().play();
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
