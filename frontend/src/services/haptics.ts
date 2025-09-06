export async function selectionAsync() {
  try {
    // Dynamic import to avoid webpack resolution issues
    const Haptics = await import('expo-haptics').catch(() => null);
    if (Haptics) {
      await Haptics.selectionAsync();
    }
  } catch {}
}

export async function impactAsync(style: 'light' | 'medium' | 'heavy' = 'medium') {
  try {
    // Dynamic import to avoid webpack resolution issues
    const Haptics = await import('expo-haptics').catch(() => null);
    if (Haptics) {
      const map: any = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      await Haptics.impactAsync(map[style] || map.medium);
    }
  } catch {}
}

