import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Defer to a post-hydration frame so we don't call setState synchronously
    // inside the effect body (avoids cascading renders on first paint).
    const raf = requestAnimationFrame(() => setHasHydrated(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
