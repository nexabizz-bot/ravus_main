import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import land from "world-atlas/land-110m.json" with { type: "json" };
import { feature } from "topojson-client";

const output = fileURLToPath(new URL("../src/data/globe-points.json", import.meta.url));
const polygons = feature(land, land.objects.land).features[0].geometry.coordinates;

function inRing(lon, lat, ring) {
  let inside = false;
  // Tiny islands straddling 180° otherwise look like a band across the ocean.
  const wrapsDateline = ring.length < 20 && ring.some(([x], index) => Math.abs(x - ring[(index + 1) % ring.length][0]) > 180);
  const testLon = wrapsDateline && lon < 0 ? lon + 360 : lon;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [rawXi, yi] = ring[i];
    const [rawXj, yj] = ring[j];
    const xi = wrapsDateline && rawXi < 0 ? rawXi + 360 : rawXi;
    const xj = wrapsDateline && rawXj < 0 ? rawXj + 360 : rawXj;
    if ((yi > lat) !== (yj > lat) && testLon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function onLand(lon, lat) {
  return polygons.some(([outer, ...holes]) =>
    inRing(lon, lat, outer) && !holes.some((hole) => inRing(lon, lat, hole)),
  );
}

// Golden-angle sampling makes the dots evenly spaced on the sphere.
const samples = 25000;
const goldenAngle = Math.PI * (3 - Math.sqrt(5));
const points = [];
for (let index = 0; index < samples; index++) {
  const y = 1 - (index / (samples - 1)) * 2;
  const latitude = (Math.asin(y) * 180) / Math.PI;
  const longitude = (((index * goldenAngle * 180) / Math.PI + 180) % 360) - 180;
  if (onLand(longitude, latitude)) points.push([+longitude.toFixed(3), +latitude.toFixed(3)]);
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(points)}\n`);
console.log(`Wrote ${points.length} geographic globe dots to ${output}`);
