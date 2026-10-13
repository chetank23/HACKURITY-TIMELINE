import { useEffect, useState, useCallback } from "react";
import { defaultEvent, readEvent, STORAGE_KEY, type EventState } from "./event";
export function useEvent() {
  const [event, setEvent] = useState<EventState>(defaultEvent);
  const [now, setNow] = useState(0);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    let restored: EventState | null = null;
    try {
      restored = readEvent(localStorage.getItem(STORAGE_KEY));
    } catch {
      setStorageError(true);
    }
    const current = Date.now();
    setEvent(restored ?? defaultEvent());
    setNow(current);
    setReady(true);
    const tick = () => setNow(Date.now());
    const interval = window.setInterval(tick, 250);
    const sync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const value = readEvent(e.newValue);
        if (value) setEvent(value);
        tick();
      }
    };
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    window.addEventListener("storage", sync);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
      window.removeEventListener("storage", sync);
    };
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(event));
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
  }, [event, ready]);
  const update = useCallback(
    (change: Partial<EventState> | ((previous: EventState) => EventState)) =>
      setEvent((p) => (typeof change === "function" ? change(p) : { ...p, ...change })),
    [],
  );
  return { event, now, update, ready, storageError };
}
