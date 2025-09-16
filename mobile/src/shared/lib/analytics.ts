// Lightweight analytics shim. Swap console.log with a real provider later.

type Props = Record<string, any> | undefined;

export function logEvent(name: string, props?: Props) {
  try {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${name}`, props || {});
  } catch {}
}

