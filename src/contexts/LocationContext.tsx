'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { reverseGeocodingService } from '@/services/reverseGeocoding';

export type LocationStatus = 'idle' | 'detecting' | 'success' | 'denied' | 'timeout' | 'unavailable' | 'unsupported';

export interface LocationData {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  location: LocationData | null;
  status: LocationStatus;
  error: string | null;
  refreshLocation: () => void;
  locationName: string | null;
  locationNameStatus: 'idle' | 'loading' | 'success' | 'error';
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locationNameStatus, setLocationNameStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const fetchLocation = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    if (!navigator.geolocation) {
      setStatus('unsupported');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('detecting');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus('success');
      },
      (geoError) => {
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setStatus('denied');
            setError('Location access was denied.');
            break;
          case geoError.POSITION_UNAVAILABLE:
            setStatus('unavailable');
            setError('Location information is unavailable.');
            break;
          case geoError.TIMEOUT:
            setStatus('timeout');
            setError('The request to get user location timed out.');
            break;
          default:
            setStatus('unavailable');
            setError('An unknown error occurred getting location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Fetch location on mount
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // Handle Reverse Geocoding with cache & debounce
  useEffect(() => {
    if (!location) {
      setLocationName(null);
      setLocationNameStatus('idle');
      return;
    }

    // Check cache immediately for instant resolution
    const cached = reverseGeocodingService.getCachedAddress(location.latitude, location.longitude);
    if (cached) {
      setLocationName(cached);
      setLocationNameStatus('success');
      return;
    }

    setLocationNameStatus('loading');

    // Debounce to respect OpenStreetMap usage policy (max 1 request/second) and handle rapid changes
    const timer = setTimeout(async () => {
      try {
        const name = await reverseGeocodingService.reverseGeocode(location.latitude, location.longitude);
        setLocationName(name);
        setLocationNameStatus('success');
      } catch (err) {
        console.error("Failed to reverse geocode:", err);
        setLocationNameStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <LocationContext.Provider value={{ 
      location, 
      status, 
      error, 
      refreshLocation: fetchLocation,
      locationName,
      locationNameStatus
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
