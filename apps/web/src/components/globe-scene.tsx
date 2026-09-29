"use client";

import { Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  CatmullRomCurve3,
  Float32BufferAttribute,
  Group,
  Vector3,
} from "three";
import landDots from "@/data/globe-points.json";

const globeRadius = 1.6;
const degree = Math.PI / 180;

function onGlobe(longitude: number, latitude: number, radius = globeRadius) {
  const lat = latitude * degree;
  const lon = longitude * degree;
  return new Vector3(
    radius * Math.cos(lat) * Math.sin(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lon),
  );
}

const locations = [
  { name: "San Francisco", longitude: -122.4, latitude: 37.8 },
  { name: "New York", longitude: -74, latitude: 40.7 },
  { name: "São Paulo", longitude: -46.6, latitude: -23.5 },
  { name: "London", longitude: -0.1, latitude: 51.5 },
  { name: "Mumbai", longitude: 72.9, latitude: 19.1 },
];

function connection(from: (typeof locations)[number], to: (typeof locations)[number]) {
  const start = onGlobe(from.longitude, from.latitude, 1);
  const end = onGlobe(to.longitude, to.latitude, 1);
  const points = Array.from({ length: 25 }, (_, index) => {
    const progress = index / 24;
    return new Vector3()
      .lerpVectors(start, end, progress)
      .normalize()
      .multiplyScalar(globeRadius + 0.035 + Math.sin(progress * Math.PI) * 0.22);
  });
  return new CatmullRomCurve3(points);
}

function Globe({ reduceMotion }: { reduceMotion: boolean }) {
  const globe = useRef<Group>(null);
  const pulse = useRef<Group>(null);
  const signal = useRef<Group>(null);
  const landGeometry = useMemo(() => {
    const positions = new Float32Array(landDots.length * 3);
    landDots.forEach(([longitude, latitude], index) => {
      const point = onGlobe(longitude, latitude, globeRadius + 0.019);
      positions.set(point.toArray(), index * 3);
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geometry;
  }, []);
  const routes = useMemo(
    () => [
      connection(locations[0], locations[1]),
      connection(locations[1], locations[2]),
      connection(locations[1], locations[3]),
    ],
    [],
  );

  useFrame((state, delta) => {
    if (globe.current && !reduceMotion) globe.current.rotation.y += delta * 0.075;
    if (pulse.current && !reduceMotion) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.12;
      pulse.current.scale.setScalar(scale);
    }
    if (signal.current && !reduceMotion) {
      signal.current.position.copy(routes[1].getPointAt((state.clock.elapsedTime * 0.1) % 1));
    }
  });

  return (
    <group ref={globe} rotation={[0.11, 1.62, 0]}>
      <mesh>
        <sphereGeometry args={[globeRadius - 0.026, 64, 48]} />
        <meshBasicMaterial color="#0B0B0B" />
      </mesh>

      <points geometry={landGeometry}>
        <shaderMaterial
          transparent
          depthWrite={false}
          vertexShader={`
            void main() {
              vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = clamp(17.0 / -viewPosition.z, 1.5, 4.1);
              gl_Position = projectionMatrix * viewPosition;
            }
          `}
          fragmentShader={`
            void main() {
              float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
              float alpha = smoothstep(0.5, 0.27, distanceFromCenter);
              gl_FragColor = vec4(0.92, 0.92, 0.92, alpha * 0.94);
            }
          `}
        />
      </points>

      <mesh>
        <sphereGeometry args={[globeRadius + 0.055, 64, 48]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          depthTest={false}
          blending={AdditiveBlending}
          vertexShader={`
            varying vec3 viewNormal;
            void main() {
              viewNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 viewNormal;
            void main() {
              float rim = pow(1.0 - abs(normalize(viewNormal).z), 5.0);
              gl_FragColor = vec4(0.78, 0.78, 0.78, rim * 0.55);
            }
          `}
        />
      </mesh>

      {routes.map((route, index) => (
        <mesh key={index}>
          <tubeGeometry args={[route, 72, 0.004, 4, false]} />
          <meshBasicMaterial color="#D8D8D8" transparent opacity={index === 2 ? 0.24 : 0.4} depthWrite={false} />
        </mesh>
      ))}

      {locations.map((location, index) => {
        const position = onGlobe(location.longitude, location.latitude, globeRadius + 0.045);
        return (
          <group key={location.name} position={position}>
            <mesh>
              <sphereGeometry args={[index === 1 ? 0.047 : 0.032, 12, 12]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <group ref={index === 1 ? pulse : undefined}>
              <mesh>
                <sphereGeometry args={[index === 1 ? 0.12 : 0.078, 12, 12]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={0.2} depthWrite={false} />
              </mesh>
            </group>
          </group>
        );
      })}

      <group ref={signal} position={routes[1].getPointAt(0)}>
        <mesh>
          <sphereGeometry args={[0.033, 12, 12]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
    </group>
  );
}

export function GlobeScene() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <Canvas
      camera={{ position: [0, 0, 5.6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      aria-label="Slowly rotating globe with illuminated land and customer locations"
    >
      <Sparkles count={20} scale={5} size={1.8} speed={reduceMotion ? 0 : 0.22} color="#C8C8C8" />
      <Globe reduceMotion={reduceMotion} />
      <mesh rotation={[0.83, 0.08, -0.36]}>
        <torusGeometry args={[1.92, 0.004, 3, 180]} />
        <meshBasicMaterial color="#E7E7E7" transparent opacity={0.26} depthWrite={false} />
      </mesh>
    </Canvas>
  );
}
