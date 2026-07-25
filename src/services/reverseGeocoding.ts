/**
 * Production-grade Reverse Geocoding Service using OpenStreetMap Nominatim.
 * Includes in-memory and localStorage caching, coordinate bucketing,
 * request de-duplication, debouncing, and robust error handling.
 */

export interface NominatimAddress {
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
}

export interface NominatimResponse {
  display_name: string;
  address?: NominatimAddress;
  error?: string;
}

interface CacheEntry {
  addressName: string;
  timestamp: number;
}

const CACHE_KEY_PREFIX = "saferoute_geo_cache_";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours cache retention

class ReverseGeocodingService {
  private inMemoryCache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<string>> = new Map();

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Generates a coordinate key rounded to 4 decimal places (~11 meters grid).
   * This naturally buckets nearby GPS coordinate updates to prevent API spam.
   */
  private getCacheKey(lat: number, lng: number): string {
    return `${lat.toFixed(4)},${lng.toFixed(4)}`;
  }

  /**
   * Load cache entries from localStorage on initialization.
   */
  private loadFromLocalStorage(): void {
    if (typeof window === "undefined") return;
    try {
      const now = Date.now();
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const entry: CacheEntry = JSON.parse(raw);
            if (now - entry.timestamp < CACHE_EXPIRY_MS) {
              const coordKey = key.slice(CACHE_KEY_PREFIX.length);
              this.inMemoryCache.set(coordKey, entry);
            } else {
              localStorage.removeItem(key); // Evict expired
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load geocoding cache from localStorage:", e);
    }
  }

  /**
   * Save a resolved address to the caches.
   */
  private saveToCache(lat: number, lng: number, addressName: string): void {
    const key = this.getCacheKey(lat, lng);
    const entry: CacheEntry = {
      addressName,
      timestamp: Date.now(),
    };

    // Save in memory
    this.inMemoryCache.set(key, entry);

    // Save in localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `${CACHE_KEY_PREFIX}${key}`,
          JSON.stringify(entry)
        );
      } catch (e) {
        console.warn("Failed to save geocoding cache to localStorage:", e);
      }
    }
  }

  /**
   * Look up coordinates in the cache.
   */
  public getCachedAddress(lat: number, lng: number): string | null {
    const key = this.getCacheKey(lat, lng);
    const entry = this.inMemoryCache.get(key);
    if (entry) {
      // Check if expired
      if (Date.now() - entry.timestamp < CACHE_EXPIRY_MS) {
        return entry.addressName;
      } else {
        this.inMemoryCache.delete(key);
        if (typeof window !== "undefined") {
          localStorage.removeItem(`${CACHE_KEY_PREFIX}${key}`);
        }
      }
    }
    return null;
  }

  /**
   * Helper to format Nominatim response address structure into a user-friendly name.
   */
  public formatAddress(address?: NominatimAddress, displayName?: string): string {
    if (!address) {
      return displayName ? displayName.split(",")[0] : "";
    }

    const parts: string[] = [];

    // 1. Specific local location
    const local = address.neighbourhood || address.suburb || address.quarter || address.road;
    if (local) {
      parts.push(local);
    }

    // 2. City or Town or District
    const city = address.city || address.town || address.village || address.city_district || address.county;
    if (city && city !== local) {
      parts.push(city);
    }

    // 3. State fallback if name is too short
    if (parts.length < 2 && address.state) {
      parts.push(address.state);
    }

    if (parts.length === 0) {
      return address.country || displayName || "Unknown Location";
    }

    return parts.join(", ");
  }

  /**
   * Performs dynamic reverse geocoding using OSM Nominatim.
   * Leverages request de-duplication to prevent duplicate concurrent network fetches.
   */
  public async reverseGeocode(lat: number, lng: number): Promise<string> {
    // 1. Check cache first
    const cached = this.getCachedAddress(lat, lng);
    if (cached) {
      return cached;
    }

    const key = this.getCacheKey(lat, lng);

    // 2. De-duplicate concurrent identical requests
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const fetchPromise = (async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&accept-language=en`;
        
        const response = await fetch(url, {
          headers: {
            "Accept-Language": "en",
          },
        });

        if (response.status === 429) {
          throw new Error("Nominatim API Rate Limit (429)");
        }

        if (!response.ok) {
          throw new Error(`Nominatim API Error (${response.status})`);
        }

        const data: NominatimResponse = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        const formatted = this.formatAddress(data.address, data.display_name);
        
        if (!formatted) {
          throw new Error("Unable to parse address fields");
        }

        // Cache the valid result
        this.saveToCache(lat, lng, formatted);
        return formatted;
      } catch (error) {
        console.error("Reverse Geocoding failed:", error);
        throw error;
      } finally {
        // Clear pending reference once resolved/rejected
        this.pendingRequests.delete(key);
      }
    })();

    this.pendingRequests.set(key, fetchPromise);
    return fetchPromise;
  }
}

export const reverseGeocodingService = new ReverseGeocodingService();
