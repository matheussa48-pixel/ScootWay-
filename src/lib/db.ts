import { ScooterConfig, SavedPlace, TripHistoryEntry } from "../types";

const DB_NAME = "ScootWayDB_v2";
const STORE_CONFIG = "scooter_config";
const STORE_PLACES = "saved_places";
const STORE_HISTORY = "trip_history";

export const DEFAULT_SCOOTER_CONFIG: ScooterConfig = {
  pilotWeightKg: 80,
  hasPassenger: false,
  passengerWeightKg: 65,
  hasOver1000W: true,
  motorPowerW: 1500,
  scooterModel: "ScootWay Pro 1500W Ultra",
  scooterWeightKg: 38,
  batteryVoltageV: 60,
  batteryCapacityAh: 25,
  maxSpeedKmh: 55,
  manufacturerRangeKm: 50,
  maxTorqueNm: 85,
};

export const DEFAULT_SAVED_PLACES: SavedPlace[] = [
  {
    id: "place_casa_default",
    type: "casa",
    label: "Casa",
    address: "Avenida Afonso Pena, Centro, Belo Horizonte - MG",
    lat: -19.9221,
    lng: -43.9382,
    createdAt: new Date().toISOString(),
  },
  {
    id: "place_trabalho_default",
    type: "trabalho",
    label: "Trabalho",
    address: "Savassi, Belo Horizonte - MG",
    lat: -19.9388,
    lng: -43.9328,
    createdAt: new Date().toISOString(),
  },
];

// LocalStorage key fallbacks for instant synchronous access
const STORAGE_KEY_CONFIG = "scootway_config_v2";
const STORAGE_KEY_PLACES = "scootway_places_v2";
const STORAGE_KEY_HISTORY = "scootway_history_v2";

// Helper for IndexedDB initialization
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, 2);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_CONFIG)) {
        db.createObjectStore(STORE_CONFIG, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_PLACES)) {
        db.createObjectStore(STORE_PLACES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        db.createObjectStore(STORE_HISTORY, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ================= SCOOTER CONFIG CRUD =================
export function loadScooterConfigSync(): ScooterConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SCOOTER_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn("Failed to read scooter config from localStorage:", err);
  }
  return DEFAULT_SCOOTER_CONFIG;
}

export async function saveScooterConfig(config: ScooterConfig): Promise<ScooterConfig> {
  // Sync to LocalStorage
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error("LocalStorage save error", e);
  }

  // Sync to IndexedDB
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_CONFIG, "readwrite");
    const store = tx.objectStore(STORE_CONFIG);
    store.put({ id: "main_config", ...config });
  } catch (err) {
    console.warn("IndexedDB sync error for config:", err);
  }

  return config;
}

// ================= SAVED PLACES CRUD =================
export function loadSavedPlacesSync(): SavedPlace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLACES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read saved places from localStorage:", err);
  }
  // Initialize with default Casa & Trabalho
  try {
    localStorage.setItem(STORAGE_KEY_PLACES, JSON.stringify(DEFAULT_SAVED_PLACES));
  } catch (e) {
    /* ignore */
  }
  return DEFAULT_SAVED_PLACES;
}

export async function savePlace(place: Omit<SavedPlace, "id" | "createdAt"> & { id?: string }): Promise<SavedPlace[]> {
  const current = loadSavedPlacesSync();
  const existingIndex = place.id ? current.findIndex((p) => p.id === place.id) : -1;
  const sameTypeIndex = place.type === "casa" || place.type === "trabalho"
    ? current.findIndex((p) => p.type === place.type)
    : -1;

  let newPlaces: SavedPlace[] = [...current];

  const placeItem: SavedPlace = {
    id: place.id || `place_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: place.type,
    label: place.label,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    createdAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    newPlaces[existingIndex] = placeItem;
  } else if (sameTypeIndex >= 0) {
    // Replace Casa or Trabalho if re-saved
    newPlaces[sameTypeIndex] = placeItem;
  } else {
    newPlaces.unshift(placeItem);
  }

  try {
    localStorage.setItem(STORAGE_KEY_PLACES, JSON.stringify(newPlaces));
  } catch (e) {
    console.error("LocalStorage save places error", e);
  }

  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_PLACES, "readwrite");
    const store = tx.objectStore(STORE_PLACES);
    store.put(placeItem);
  } catch (err) {
    console.warn("IndexedDB save place error:", err);
  }

  return newPlaces;
}

export async function deletePlace(id: string): Promise<SavedPlace[]> {
  const current = loadSavedPlacesSync();
  const updated = current.filter((p) => p.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY_PLACES, JSON.stringify(updated));
  } catch (e) {
    console.error("LocalStorage delete place error", e);
  }

  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_PLACES, "readwrite");
    const store = tx.objectStore(STORE_PLACES);
    store.delete(id);
  } catch (err) {
    console.warn("IndexedDB delete place error:", err);
  }

  return updated;
}

// ================= TRIP HISTORY CRUD =================
export function loadTripHistorySync(): TripHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read trip history from localStorage:", err);
  }
  return [];
}

export async function addTripHistory(trip: Omit<TripHistoryEntry, "id" | "dateISO" | "dateFormatted">): Promise<TripHistoryEntry[]> {
  const current = loadTripHistorySync();
  const now = new Date();
  
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  const newEntry: TripHistoryEntry = {
    ...trip,
    id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    dateISO: now.toISOString(),
    dateFormatted: formattedDate,
  };

  const updated = [newEntry, ...current];

  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error("LocalStorage save history error", e);
  }

  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_HISTORY, "readwrite");
    const store = tx.objectStore(STORE_HISTORY);
    store.put(newEntry);
  } catch (err) {
    console.warn("IndexedDB add trip history error:", err);
  }

  return updated;
}

export async function deleteTripHistory(id: string): Promise<TripHistoryEntry[]> {
  const current = loadTripHistorySync();
  const updated = current.filter((t) => t.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error("LocalStorage delete history error", e);
  }

  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_HISTORY, "readwrite");
    const store = tx.objectStore(STORE_HISTORY);
    store.delete(id);
  } catch (err) {
    console.warn("IndexedDB delete trip history error:", err);
  }

  return updated;
}

export async function clearTripHistory(): Promise<TripHistoryEntry[]> {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch (e) {
    /* ignore */
  }

  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_HISTORY, "readwrite");
    const store = tx.objectStore(STORE_HISTORY);
    store.clear();
  } catch (err) {
    console.warn("IndexedDB clear history error:", err);
  }

  return [];
}
