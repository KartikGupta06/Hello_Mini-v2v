/**
 * Production Route Intelligence Cache Service.
 * Implements route response caching, concurrent request de-duplication,
 * and active controller abortion to cancel stale requests when coordinates change.
 */

import { RouteIntelligenceResponse, RouteIntelligencePayload } from "../types";
import { SafetyService } from "./safety";
import { FetchOptions } from "../lib/api";

class RouteCacheService {
  private cache = new Map<string, { response: RouteIntelligenceResponse; timestamp: number }>();
  private activeControllers = new Map<string, AbortController>();
  private CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes cache TTL

  /**
   * Generates a unique key based on source and destination coordinates rounded to 4 decimal places (~11m grid).
   */
  private getCacheKey(payload: RouteIntelligencePayload): string {
    const sLat = payload.source_lat.toFixed(4);
    const sLng = payload.source_lng.toFixed(4);
    const dLat = payload.dest_lat.toFixed(4);
    const dLng = payload.dest_lng.toFixed(4);
    return `${sLat},${sLng}->${dLat},${dLng}`;
  }

  /**
   * Fetches route intelligence, managing cache, de-duplication, and request cancellation.
   */
  public async getRouteIntelligence(
    payload: RouteIntelligencePayload,
    callerSignal?: AbortSignal
  ): Promise<RouteIntelligenceResponse> {
    const key = this.getCacheKey(payload);

    // 1. Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY_MS) {
      return cached.response;
    }

    // 2. Abort all stale route requests before firing a new one
    this.cancelAllPending();

    const controller = new AbortController();
    this.activeControllers.set(key, controller);

    // Link caller signal if provided
    if (callerSignal) {
      if (callerSignal.aborted) {
        controller.abort();
      } else {
        callerSignal.addEventListener("abort", () => {
          controller.abort();
        });
      }
    }

    try {
      const response = await SafetyService.getRouteIntelligence(payload, {
        signal: controller.signal,
      } as FetchOptions);

      // Save to cache
      this.cache.set(key, {
        response,
        timestamp: Date.now(),
      });

      return response;
    } finally {
      this.activeControllers.delete(key);
    }
  }

  /**
   * Cancels all currently running route intelligence request processes.
   */
  public cancelAllPending(): void {
    for (const [key, controller] of this.activeControllers.entries()) {
      controller.abort();
      this.activeControllers.delete(key);
    }
  }

  /**
   * Clears the route cache memory.
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export const routeCacheService = new RouteCacheService();
