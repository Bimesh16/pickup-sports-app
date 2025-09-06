export type Coords = { latitude: number; longitude: number };

export async function getCurrentCoords(fallback: Coords = { latitude: 27.7172, longitude: 85.3240 }): Promise<Coords> {
  try {
    // Dynamic import to avoid webpack resolution issues
    const Location = await import('expo-location').catch(() => null);
    if (!Location) return fallback;
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return fallback;
    const pos = await Location.getCurrentPositionAsync({});
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return fallback;
  }
}

