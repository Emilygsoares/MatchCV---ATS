import { useEffect, useRef, useState } from "react";

const PREFIX = "matchcv:";

/** State mirrored to localStorage. Reads after hydration to avoid SSR mismatches. */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const initialRef = useRef(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupted storage */
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      if (value === initialRef.current || value == null) window.localStorage.removeItem(PREFIX + key);
      else window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable */
    }
  }, [key, value, loaded]);

  return [value, setValue, loaded] as const;
}

export function clearLocalState() {
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => window.localStorage.removeItem(k));
}
