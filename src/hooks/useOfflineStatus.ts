import { useEffect, useState } from 'react';

export function useOfflineStatus(): { online: boolean; installed: boolean } {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    setOnline(navigator.onLine);
    setInstalled(window.matchMedia('(display-mode: standalone)').matches);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return { online, installed };
}
