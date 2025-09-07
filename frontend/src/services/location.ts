export type Coords = { latitude: number; longitude: number };

export async function getCurrentCoords(fallback: Coords = { latitude: 27.7172, longitude: 85.3240 }): Promise<Coords> {
  try {
    // Return fallback for now
    return fallback;
  } catch {
    return fallback;
  }
}

