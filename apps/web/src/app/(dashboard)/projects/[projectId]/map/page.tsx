'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapPage() {
  const { projectId } = useParams();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap contributors',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
        center: [2.0, 46.0],
        zoom: 5,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  if (error) {
    return <p className="text-danger">Erreur carte : {error}</p>;
  }

  return (
    <div className="h-full">
      <h1 className="mb-4 text-2xl font-bold">Carte interactive</h1>
      <div ref={mapContainer} className="h-[calc(100vh-12rem)] w-full rounded-lg border border-border" />
    </div>
  );
}
