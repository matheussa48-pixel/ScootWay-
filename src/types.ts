export interface ScooterConfig {
  pilotWeightKg: number;
  hasPassenger: boolean;
  passengerWeightKg: number;
  hasOver1000W: boolean;
  motorPowerW: number;
  scooterModel: string;
  scooterWeightKg: number;
  batteryVoltageV: number;
  batteryCapacityAh: number;
  maxSpeedKmh: number;
  manufacturerRangeKm: number;
  maxTorqueNm: number;
}

export type PlaceType = "casa" | "trabalho" | "faculdade" | "academia" | "mercado" | "outro";

export interface SavedPlace {
  id: string;
  type: PlaceType;
  label: string;
  address: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface TripHistoryEntry {
  id: string;
  dateISO: string;
  dateFormatted: string;
  originName: string;
  originLat: number;
  originLng: number;
  destinationName: string;
  destLat: number;
  destLng: number;
  distanceKm: number;
  timeMin: number;
  batteryUsedPercent: number;
  maxGradientPercent: number;
  mode: "eco" | "performance";
  pilotWeightKg: number;
  passengerWeightKg: number;
  totalWeightKg: number;
  motorPowerW: number;
  scooterModel: string;
  notes?: string;
}

export interface Warning {
  km: number;
  message: string;
  type: string;
}

export interface PathPoint {
  km: number;
  altitudeM: number;
  gradientPercent: number;
  recommendedSpeedKmh: number;
  description: string;
}

export interface Route {
  name: string;
  distanceKm: number;
  timeMin: number;
  elevationGainM: number;
  elevationLossM: number;
  maxGradientPercent: number;
  batteryWastePercent: number;
  batteryAhConsumed?: number;
  motorEffortLevel?: string;
  warnings: Warning[];
  pathProfile: PathPoint[];
}

export interface NavigationData {
  ecoRoute: Route;
  performanceRoute: Route;
  generalExplanation: string;
}

export interface SearchSuggestion {
  displayName: string;
  name: string;
  cleanLabel: string;
  bairro: string;
  city?: string;
  distancia: string;
  lat: number;
  lng: number;
  isPlaceholder?: boolean;
  rawAddress: string;
}
