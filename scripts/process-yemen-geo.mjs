/**
 * Builds map GeoJSON assets from geoBoundaries source files.
 * Run: node scripts/process-yemen-geo.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const geoDir = path.join(root, 'public', 'geo');
const citiesDir = path.join(geoDir, 'cities');

const ISO_TO_PCODE = {
  'YE-SN': 'YE23',
  'YE-IB': 'YE11',
  'YE-AB': 'YE12',
  'YE-BA': 'YE14',
  'YE-TA': 'YE15',
  'YE-JA': 'YE16',
  'YE-HJ': 'YE17',
  'YE-HU': 'YE18',
  'YE-HD': 'YE19',
  'YE-DH': 'YE20',
  'YE-SH': 'YE21',
  'YE-SD': 'YE22',
  'YE-AD': 'YE24',
  'YE-LA': 'YE25',
  'YE-MA': 'YE26',
  'YE-MW': 'YE27',
  'YE-MR': 'YE28',
  'YE-AM': 'YE29',
  'YE-RA': 'YE31',
  'YE-SU': 'YE32',
  'YE-DA': 'YE30',
};

const PCODE_TO_NAME = {
  YE23: 'صنعاء',
  YE11: 'إب',
  YE12: 'أبين',
  YE14: 'البيضاء',
  YE15: 'تعز',
  YE16: 'الجوف',
  YE17: 'حجة',
  YE18: 'الحديدة',
  YE19: 'حضرموت',
  YE20: 'ذمار',
  YE21: 'شبوة',
  YE22: 'صعدة',
  YE24: 'عدن',
  YE25: 'لحج',
  YE26: 'مأرب',
  YE27: 'المحويت',
  YE28: 'المهرة',
  YE29: 'عمران',
  YE31: 'ريمة',
  YE32: 'سقطرى',
  YE30: 'الضالع',
};

function ringCentroid(ring) {
  let lat = 0;
  let lng = 0;
  const n = ring.length - 1;
  if (n <= 0) return { lat: 0, lng: 0 };
  for (let i = 0; i < n; i += 1) {
    lng += ring[i][0];
    lat += ring[i][1];
  }
  return { lat: lat / n, lng: lng / n };
}

function getOuterRing(geometry) {
  if (geometry.type === 'Polygon') return geometry.coordinates[0];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates[0][0];
  return null;
}

function pointInRing(point, ring) {
  const x = point.lng;
  const y = point.lat;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInGeometry(point, geometry) {
  if (geometry.type === 'Polygon') {
    return pointInRing(point, geometry.coordinates[0]);
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((poly) => pointInRing(point, poly[0]));
  }
  return false;
}

function enrichCityFeature(feature) {
  const shapeIso = feature.properties?.shapeISO;
  const pcode = ISO_TO_PCODE[shapeIso];
  if (!pcode) return null;

  return {
    type: 'Feature',
    id: pcode,
    properties: {
      kind: 'city',
      pcode,
      name: PCODE_TO_NAME[pcode] ?? feature.properties.shapeName,
      shapeName: feature.properties.shapeName,
      shapeISO: shapeIso,
    },
    geometry: feature.geometry,
  };
}

function main() {
  const adm1Path = path.join(geoDir, 'yemen-governorates-source.geojson');
  const adm2Path = path.join(geoDir, 'yemen-districts-source.geojson');

  const adm1 = JSON.parse(fs.readFileSync(adm1Path, 'utf8'));
  const adm2 = JSON.parse(fs.readFileSync(adm2Path, 'utf8'));

  const cityFeatures = adm1.features.map(enrichCityFeature).filter(Boolean);

  fs.writeFileSync(
    path.join(geoDir, 'yemen-cities.geojson'),
    JSON.stringify({ type: 'FeatureCollection', features: cityFeatures }),
  );

  fs.mkdirSync(citiesDir, { recursive: true });

  const governorateByPcode = new Map(cityFeatures.map((f) => [f.properties.pcode, f]));

  for (const [pcode, govFeature] of governorateByPcode) {
    const districts = adm2.features
      .filter((district) => {
        const ring = getOuterRing(district.geometry);
        if (!ring) return false;
        const centroid = ringCentroid(ring);
        return pointInGeometry(centroid, govFeature.geometry);
      })
      .map((district) => ({
        type: 'Feature',
        id: district.properties.shapeID,
        properties: {
          kind: 'district',
          shapeId: district.properties.shapeID,
          name: district.properties.shapeName,
          cityPcode: pcode,
        },
        geometry: district.geometry,
      }));

    fs.writeFileSync(
      path.join(citiesDir, `${pcode}.geojson`),
      JSON.stringify({ type: 'FeatureCollection', features: districts }),
    );

    console.log(`${pcode}: ${districts.length} districts`);
  }

  console.log(`Wrote ${cityFeatures.length} city boundaries to yemen-cities.geojson`);
}

main();
