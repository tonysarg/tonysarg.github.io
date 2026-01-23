import { onValue, set, Unsubscribe } from "firebase/database";
import { configRef, isFirebaseConfigured } from "./firebase";
import type { Day } from "@/store/useStore";

// Global config data structure (synced via Firebase)
export type GlobalConfig = {
  plan: Day[];
  restOverrides: Record<string, Record<string, number>>;
  muted: boolean;
  colors: Record<string, string>;
};

// Default config values
const defaultConfig: GlobalConfig = {
  plan: [],
  restOverrides: {},
  muted: false,
  colors: {},
};

// Load config from Firebase (one-time fetch)
export async function loadFromFirebase(): Promise<GlobalConfig | null> {
  if (!isFirebaseConfigured() || !configRef) {
    console.log("Firebase not configured, using local storage only");
    return null;
  }

  return new Promise((resolve) => {
    const unsubscribe = onValue(
      configRef,
      (snapshot) => {
        unsubscribe();
        const data = snapshot.val();
        if (data) {
          resolve({
            ...defaultConfig,
            ...data,
          });
        } else {
          resolve(null);
        }
      },
      (error) => {
        console.error("Error loading from Firebase:", error);
        resolve(null);
      }
    );
  });
}

// Save config to Firebase
export async function saveToFirebase(data: Partial<GlobalConfig>): Promise<boolean> {
  if (!isFirebaseConfigured() || !configRef) {
    return false;
  }

  try {
    // Merge with existing data
    const current = await loadFromFirebase();
    const merged = {
      ...defaultConfig,
      ...current,
      ...data,
    };
    await set(configRef, merged);
    return true;
  } catch (err) {
    console.error("Error saving to Firebase:", err);
    return false;
  }
}

// Subscribe to real-time updates from Firebase
export function subscribeToFirebase(
  callback: (data: GlobalConfig) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured() || !configRef) {
    return null;
  }

  return onValue(
    configRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback({
          ...defaultConfig,
          ...data,
        });
      }
    },
    (error) => {
      console.error("Firebase subscription error:", error);
    }
  );
}

// Save just plan to Firebase
export async function savePlanToFirebase(plan: Day[]): Promise<boolean> {
  return saveToFirebase({ plan });
}

// Save just restOverrides to Firebase
export async function saveRestOverridesToFirebase(
  restOverrides: Record<string, Record<string, number>>
): Promise<boolean> {
  return saveToFirebase({ restOverrides });
}

// Save just muted state to Firebase
export async function saveMutedToFirebase(muted: boolean): Promise<boolean> {
  return saveToFirebase({ muted });
}

// Save just colors to Firebase
export async function saveColorsToFirebase(
  colors: Record<string, string>
): Promise<boolean> {
  return saveToFirebase({ colors });
}
