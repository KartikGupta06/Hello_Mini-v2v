// Safety score classification thresholds
export const SAFETY_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
};

// Default map configurations (for placeholders)
export const DEFAULT_MAP_CENTER: [number, number] = [40.7128, -74.0060]; // New York City
export const DEFAULT_MAP_ZOOM = 13;

// Safety Incident Types constants
export const INCIDENT_TYPES = [
  { value: "poorly-lit", label: "Poorly Lit Area" },
  { value: "theft", label: "Theft / Robbery Alert" },
  { value: "harassment", label: "Harassment / Verbal Abuse" },
  { value: "obstruction", label: "Pathway Blocked / Construction" },
  { value: "other", label: "Other Hazard / Suspicious activity" }
];
