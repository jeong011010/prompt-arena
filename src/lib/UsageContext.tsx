"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface UsageState {
  count: number;
  limit: number;
}

interface UsageContextValue {
  usage: UsageState | null;
  refresh: () => void;
}

const UsageContext = createContext<UsageContextValue>({ usage: null, refresh: () => {} });

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [usage, setUsage] = useState<UsageState | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => {
        if (d.count !== undefined) setUsage({ count: d.count, limit: d.limit });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  return <UsageContext.Provider value={{ usage, refresh }}>{children}</UsageContext.Provider>;
}

export function useUsage() {
  return useContext(UsageContext);
}
