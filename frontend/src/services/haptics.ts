export async function selectionAsync() {
  try {
    // Dynamic import with fallback to mock
    const Haptics = await import('expo-haptics').catch(() => 
      import('@/mocks/expo-haptics')
    );
    await Haptics.selectionAsync();
  } catch {}
}

export async function impactAsync(style: 'light' | 'medium' | 'heavy' = 'medium') {
  try {
    // Dynamic import with fallback to mock
    const Haptics = await import('expo-haptics').catch(() => 
      import('@/mocks/expo-haptics')
    );
    const map: any = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    await Haptics.impactAsync(map[style] || map.medium);
  } catch {}
}

