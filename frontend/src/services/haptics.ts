export async function selectionAsync() {
  try {
    // Use mock implementation for now
    const Haptics = await import('@/mocks/expo-haptics');
    await Haptics.selectionAsync();
  } catch {}
}

export async function impactAsync(style: 'light' | 'medium' | 'heavy' = 'medium') {
  try {
    // Use mock implementation for now
    const Haptics = await import('@/mocks/expo-haptics');
    const map: any = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    await Haptics.impactAsync(map[style] || map.medium);
  } catch {}
}

