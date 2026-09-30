"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Group, Vector3 } from "three";
import landDots from "@/data/globe-points.json";
import styles from "./globe-scene.module.css";

const radius = 1.58;
const radians = Math.PI / 180;

type Place = { name: string; coordinates: string; longitude: number; latitude: number; story: string };
const places: Place[] = [
  { name: "New York", coordinates: "40.74°, -73.99°", longitude: -73.99, latitude: 40.74, story: "A campaign starts a customer conversation." },
  { name: "Canada", coordinates: "61.07°, -107.99°", longitude: -107.99, latitude: 61.07, story: "A lead finds the right business." },
  { name: "China", coordinates: "34.54°, 108.92°", longitude: 108.92, latitude: 34.54, story: "A conversation becomes a booking." },
];

function spherePoint(longitude: number, latitude: number, distance = radius) {
  const lat = latitude * radians;
  const lon = longitude * radians;
  return new Vector3(distance * Math.cos(lat) * Math.sin(lon), distance * Math.sin(lat), distance * Math.cos(lat) * Math.cos(lon));
}

function makeLand() {
  const positions = new Float32Array(landDots.length * 3);
  const shades = new Float32Array(landDots.length);
  landDots.forEach(([longitude, latitude], index) => {
    positions.set(spherePoint(longitude, latitude, radius + 0.025).toArray(), index * 3);
    shades[index] = 0.64 + ((index * 127.1) % 97) / 270;
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("shade", new Float32BufferAttribute(shades, 1));
  return geometry;
}

// Layered, broken strands give the ocean glancing, brushed highlights.
function makeOceanHighlights() {
  const positions: number[] = [];
  const shades: number[] = [];
  const patches = [
    { lon: -42, lat: 47, width: 52, height: 23, tilt: -0.38 },
    { lon: 39, lat: 37, width: 32, height: 17, tilt: 0.42 },
    { lon: 3, lat: -28, width: 32, height: 24, tilt: -0.68 },
    { lon: -112, lat: -28, width: 25, height: 18, tilt: 0.27 },
  ];
  let seed = 94712;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  patches.forEach((patch) => {
    for (let strand = 0; strand < 85; strand++) {
      const offset = (random() - 0.5) * patch.height;
      const phase = random() * Math.PI * 2;
      const strength = 0.28 + random() * 0.72;
      for (let step = 0; step < 105; step++) {
        const u = step / 104 * 2 - 1;
        if (random() < 0.16 || (Math.abs(u) > 0.95 && random() < 0.65)) continue;
        const swirl = Math.sin(u * 5.5 + phase) * patch.height * 0.12;
        const longitude = patch.lon + u * patch.width * 0.5 + (random() - 0.5) * 0.9;
        const latitude = patch.lat + offset + u * patch.tilt * patch.height + swirl + (random() - 0.5) * 0.8;
        if (Math.abs(latitude) > 88) continue;
        positions.push(...spherePoint(longitude, latitude, radius + 0.012).toArray());
        const taper = Math.pow(Math.max(0, 1 - u * u), 1.2);
        shades.push(strength * taper * (0.26 + Math.pow(random(), 2) * 0.74));
      }
    }
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("shade", new Float32BufferAttribute(shades, 1));
  return geometry;
}

function makeOrbit(start: number, end: number) {
  const points = Array.from({ length: 65 }, (_, index) => {
    const angle = start + (end - start) * index / 64;
    return new Vector3(1.83 * Math.cos(angle), 0.02 + 1.78 * Math.sin(angle), -0.02 + 0.16 * Math.sin(angle));
  });
  return new CatmullRomCurve3(points);
}

function JourneyCard({ place, selected, onSelect }: { place: Place; selected: boolean; onSelect: () => void }) {
  return <div className={`${styles.locationCard} ${selected ? styles.locationCardSelected : ""}`}>
    <strong>{place.name}</strong>
    <small>{place.coordinates}</small>
    <button type="button" onClick={onSelect} aria-label={`View illustrative journey in ${place.name}`} aria-expanded={selected}>
      <span className={styles.buttonIcon} aria-hidden="true">◎</span> {selected ? "Hide journey" : "View journey"}
    </button>
    {selected && <p>{place.story}<span>Campaign → lead → booking</span></p>}
  </div>;
}

function Globe({ projectMarker }: { projectMarker: (name: string, x: number, y: number, visible: boolean) => void }) {
  const globe = useRef<Group>(null);
  const land = useMemo(() => makeLand(), []);
  const ocean = useMemo(() => makeOceanHighlights(), []);
  const orbit = useMemo(() => [makeOrbit(0.18, 0.82), makeOrbit(0.98, 1.6), makeOrbit(1.8, 2.84)], []);
  const markerPositions = useMemo(() => places.map((place) => ({ name: place.name, position: spherePoint(place.longitude, place.latitude, radius + 0.065) })), []);
  const worldPosition = useMemo(() => new Vector3(), []);
  const projectedPosition = useMemo(() => new Vector3(), []);
  const cameraDirection = useMemo(() => new Vector3(), []);
  useFrame(({ camera, size }) => {
    if (!globe.current) return;
    globe.current.updateWorldMatrix(true, false);
    cameraDirection.copy(camera.position).normalize();
    const projectedMarkers = markerPositions.map(({ name, position }) => {
      worldPosition.copy(position).applyMatrix4(globe.current!.matrixWorld);
      projectedPosition.copy(worldPosition).project(camera);
      const facing = worldPosition.normalize().dot(cameraDirection);
      const margin = Math.min(82, size.width * 0.2);
      const x = Math.max(margin, Math.min(size.width - margin, (projectedPosition.x + 1) * size.width / 2));
      const y = Math.max(120, Math.min(size.height - 12, (1 - projectedPosition.y) * size.height / 2));
      return { name, x, y, facing: projectedPosition.z > -1 && projectedPosition.z < 1 ? facing : -1 };
    });
    const frontmost = projectedMarkers.reduce<(typeof projectedMarkers)[number] | null>((best, marker) => marker.facing > 0.08 && (!best || marker.facing > best.facing) ? marker : best, null);
    projectedMarkers.forEach(({ name, x, y }) => projectMarker(name, x, y, name === frontmost?.name));
  });
  return <group ref={globe} rotation={[0.08, 0.25, 0]}>
    <mesh><sphereGeometry args={[radius - 0.013, 72, 56]} /><meshPhongMaterial color="#010101" emissive="#010101" specular="#202020" shininess={110} /></mesh>
    <points geometry={ocean}><shaderMaterial transparent depthWrite={false} vertexShader={`
      attribute float shade; varying float vShade;
      void main() { vShade = shade; vec4 p = modelViewMatrix * vec4(position, 1.0); gl_PointSize = clamp(10.0 / -p.z, 0.8, 2.7); gl_Position = projectionMatrix * p; }
    `} fragmentShader={`
      varying float vShade;
      void main() { float a = smoothstep(0.52, 0.12, length(gl_PointCoord - vec2(0.5))); gl_FragColor = vec4(vec3(0.96), a * vShade * 0.9); }
    `} /></points>
    <points geometry={land}><shaderMaterial transparent depthWrite={false} vertexShader={`
      attribute float shade; varying float vShade;
      void main() {
        vec3 normal = normalize((modelMatrix * vec4(position, 0.0)).xyz);
        vShade = shade * (0.55 + 0.45 * max(0.0, dot(normal, normalize(vec3(0.35, 0.5, 1.0)))));
        vec4 p = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(23.0 / -p.z, 2.0, 5.7);
        gl_Position = projectionMatrix * p;
      }
    `} fragmentShader={`
      varying float vShade;
      void main() { float a = smoothstep(0.51, 0.36, length(gl_PointCoord - vec2(0.5))); gl_FragColor = vec4(vec3(1.0), a * vShade); }
    `} /></points>
    {orbit.map((curve, index) => <mesh key={index}><tubeGeometry args={[curve, 64, index === 1 ? 0.005 : 0.003, 4, false]} /><meshBasicMaterial color="#f5f5f5" transparent opacity={index === 1 ? 0.62 : 0.24} depthWrite={false} /></mesh>)}
    {places.map((place) => <mesh key={place.name} position={spherePoint(place.longitude, place.latitude, radius + 0.065)}><sphereGeometry args={[0.017, 12, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
  </group>;
}

export function GlobeScene() {
  const reduceMotion = useReducedMotion() ?? false;
  const [selected, setSelected] = useState<string | null>(null);
  const cardElements = useRef<Record<string, HTMLDivElement | null>>({});
  const projectMarker = useCallback((name: string, x: number, y: number, visible: boolean) => {
    const card = cardElements.current[name];
    if (!card) return;
    if (name !== "New York") {
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
    }
    card.style.opacity = visible ? "1" : "0";
    card.style.visibility = visible ? "visible" : "hidden";
    card.style.pointerEvents = visible ? "auto" : "none";
  }, []);
  return <div className={styles.scene}>
    <div ref={(element) => { cardElements.current["New York"] = element; }} className={styles.locationOverlay}>
      <JourneyCard place={places[0]} selected={selected === "New York"} onSelect={() => setSelected(selected === "New York" ? null : "New York")} />
    </div>
    {places.slice(1).map((place) => <div key={place.name} ref={(element) => { cardElements.current[place.name] = element; }} className={styles.projectedOverlay}>
      <JourneyCard place={place} selected={selected === place.name} onSelect={() => setSelected(selected === place.name ? null : place.name)} />
    </div>)}
    <Canvas camera={{ position: [0, 0, 5.55], fov: 42 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }} aria-label="Interactive silver dotted globe. Drag to rotate and view sample journeys by location.">
      <ambientLight intensity={0.7} /><directionalLight position={[3, 2, 5]} intensity={0.7} />
      <Globe projectMarker={projectMarker} />
      <OrbitControls enablePan={false} enableZoom={false} enableDamping dampingFactor={0.06} minPolarAngle={Math.PI * 0.27} maxPolarAngle={Math.PI * 0.73} autoRotate={!reduceMotion} autoRotateSpeed={0.35} />
    </Canvas>
  </div>;
}
