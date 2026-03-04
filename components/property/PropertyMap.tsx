"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Props {
  lat: number;
  lng: number;
  address: string;
}

export function PropertyMap({ lat, lng, address }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (mapRef.current || !containerRef.current || !token) return;

    mapboxgl.accessToken = token;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 15,
    });

    new mapboxgl.Marker({ color: "#2563eb" })
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(address))
      .addTo(mapRef.current);

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, address, token]);

  if (!token) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN not set
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full rounded-lg" />;
}
