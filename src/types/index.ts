export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  createdAt: string;
}

export interface SafetyReport {
  id: string;
  userId?: string;
  lat: number;
  lng: number;
  type: "poorly-lit" | "theft" | "harassment" | "obstruction" | "other";
  description: string;
  createdAt: string;
}

export interface SafeHaven {
  id: string;
  name: string;
  type: "police_station" | "fire_station" | "open_shop" | "medical_center";
  lat: number;
  lng: number;
  address: string;
  phone?: string;
}

export interface RouteDetail {
  id: string;
  points: [number, number][]; // coordinates
  safetyScore: number;
  distanceMeter: number;
  durationSecond: number;
  confidenceScore: number;
  explanations: string[];
}
