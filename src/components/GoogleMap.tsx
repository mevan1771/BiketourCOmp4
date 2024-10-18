import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

interface GoogleMapProps {
  selectedActivities: { id: string; name: string; category: string }[];
}

const GoogleMap: React.FC<GoogleMapProps> = ({ selectedActivities }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMaps();
        if (mapRef.current && !mapInstanceRef.current) {
          const mapOptions: google.maps.MapOptions = {
            center: { lat: 7.8731, lng: 80.7718 }, // Center of Sri Lanka
            zoom: 7,
          };
          mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
        }
        updateMarkers();
      } catch (error) {
        console.error('Failed to initialize Google Maps:', error);
        setError('Failed to load Google Maps. Please check your API key and try again.');
      }
    };

    initMap();
  }, [selectedActivities]);

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers for selected activities
    selectedActivities.forEach((activity, index) => {
      const marker = new google.maps.Marker({
        position: getRandomPosition(),
        map: mapInstanceRef.current,
        title: activity.name,
        label: (index + 1).toString(),
      });
      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(marker => bounds.extend(marker.getPosition()!));
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  const getRandomPosition = () => {
    // Generate random coordinates within Sri Lanka's bounds
    const lat = 5.9 + Math.random() * 3.5;
    const lng = 79.5 + Math.random() * 2.5;
    return { lat, lng };
  };

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline"> {error}</span>
    </div>;
  }

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};

export default GoogleMap;