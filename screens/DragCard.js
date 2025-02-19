import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "react-three-fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { View, Text, StyleSheet } from "react-native";

const MIN_RADIUS = 7.5;
const MAX_RADIUS = 15;
const DEPTH = 2;
const LEFT_COLOR = "6366f1";
const RIGHT_COLOR = "8b5cf6";
const NUM_POINTS = 2500;

const getGradientStop = (ratio) => {
  ratio = ratio > 1 ? 1 : ratio < 0 ? 0 : ratio;

  const c0 = LEFT_COLOR.match(/.{1,2}/g).map(
    (oct) => parseInt(oct, 16) * (1 - ratio)
  );
  const c1 = RIGHT_COLOR.match(/.{1,2}/g).map(
    (oct) => parseInt(oct, 16) * ratio
  );
  const ci = [0, 1, 2].map((i) => Math.min(Math.round(c0[i] + c1[i]), 255));
  const color = ci
    .reduce((a, v) => (a << 8) + v, 0)
    .toString(16)
    .padStart(6, "0");

  return `#${color}`;
};

const calculateColor = (x) => {
  const maxDiff = MAX_RADIUS * 2;
  const distance = x + MAX_RADIUS;

  const ratio = distance / maxDiff;

  const stop = getGradientStop(ratio);
  return stop;
};

const randomFromInterval = (min, max) => {
  return Math.random() * (max - min) + min;
};

const pointsInner = Array.from({ length: NUM_POINTS }, (v, k) => k + 1).map(
  (num) => {
    const randomRadius = randomFromInterval(MIN_RADIUS, MAX_RADIUS);
    const randomAngle = Math.random() * Math.PI * 2;

    const x = Math.cos(randomAngle) * randomRadius;
    const y = Math.sin(randomAngle) * randomRadius;
    const z = randomFromInterval(-DEPTH, DEPTH);

    const color = calculateColor(x);

    return {
      idx: num,
      position: [x, y, z],
      color,
    };
  }
);

const pointsOuter = Array.from({ length: NUM_POINTS / 4 }, (v, k) => k + 1).map(
  (num) => {
    const randomRadius = randomFromInterval(MIN_RADIUS / 2, MAX_RADIUS * 2);
    const angle = Math.random() * Math.PI * 2;

    const x = Math.cos(angle) * randomRadius;
    const y = Math.sin(angle) * randomRadius;
    const z = randomFromInterval(-DEPTH * 10, DEPTH * 10);

    const color = calculateColor(x);

    return {
      idx: num,
      position: [x, y, z],
      color,
    };
  }
);

const DragCard = () => {
  return (
    <View style={styles.container}>
      <GLView
        style={styles.canvas}
        onContextCreate={async (gl) => {
          const renderer = new Renderer({ gl });
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(
            75,
            gl.drawingBufferWidth / gl.drawingBufferHeight,
            0.1,
            1000
          );
          camera.position.set(10, -7.5, -5);

          const controls = new OrbitControls(camera, renderer.domElement);
          controls.maxDistance = 20;
          controls.minDistance = 10;

          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
          scene.add(directionalLight);

          const pointLight = new THREE.PointLight(0xffffff, 10.0);
          pointLight.position.set(-30, 0, -30);
          scene.add(pointLight);

          const pointCircle = new PointCircle();
          scene.add(pointCircle);

          const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
            gl.endFrameEXP();
          };

          animate();
        }}
      />
      <Text style={styles.text}>Drag & Zoom</Text>
    </View>
  );
};

const PointCircle = () => {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {pointsInner.map((point) => (
        <Point key={point.idx} position={point.position} color={point.color} />
      ))}
      {pointsOuter.map((point) => (
        <Point key={point.idx} position={point.position} color={point.color} />
      ))}
    </group>
  );
};

const Point = ({ position, color }) => {
  return (
    <Sphere position={position} args={[0.1, 10, 10]}>
      <meshStandardMaterial
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.5}
        color={color}
      />
    </Sphere>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  canvas: {
    width: "100%",
    height: "100%",
  },
  text: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: "500",
    pointerEvents: "none",
  },
});

export default DragCard;
