"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PROVIDERS, DEFAULT_PROVIDER_ID, getProvider, ProviderConfig } from "./providers";

const KEY_PREFIX = "prompt-arena-key-";
const ACTIVE_PROVIDER_KEY = "prompt-arena-active-provider";

interface ApiKeyContextValue {
  activeProviderId: string;
  activeProvider: ProviderConfig;
  activeKey: string;
  getKey: (providerId: string) => string;
  setKey: (providerId: string, key: string) => void;
  setActiveProvider: (providerId: string) => void;
  deleteAllKeys: () => void;
  hasActiveKey: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextValue>({
  activeProviderId: DEFAULT_PROVIDER_ID,
  activeProvider: getProvider(DEFAULT_PROVIDER_ID),
  activeKey: "",
  getKey: () => "",
  setKey: () => {},
  setActiveProvider: () => {},
  deleteAllKeys: () => {},
  hasActiveKey: false,
});

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [activeProviderId, setActiveProviderIdState] = useState(DEFAULT_PROVIDER_ID);
  const [keys, setKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedProvider = localStorage.getItem(ACTIVE_PROVIDER_KEY) ?? DEFAULT_PROVIDER_ID;
    setActiveProviderIdState(storedProvider);

    const loaded: Record<string, string> = {};
    for (const p of PROVIDERS) {
      loaded[p.id] = localStorage.getItem(KEY_PREFIX + p.id) ?? "";
    }
    setKeys(loaded);
  }, []);

  const getKey = useCallback((providerId: string) => keys[providerId] ?? "", [keys]);

  const setKey = useCallback((providerId: string, key: string) => {
    const trimmed = key.trim();
    setKeys((prev) => ({ ...prev, [providerId]: trimmed }));
    if (trimmed) {
      localStorage.setItem(KEY_PREFIX + providerId, trimmed);
    } else {
      localStorage.removeItem(KEY_PREFIX + providerId);
    }
  }, []);

  const setActiveProvider = useCallback((providerId: string) => {
    setActiveProviderIdState(providerId);
    localStorage.setItem(ACTIVE_PROVIDER_KEY, providerId);
  }, []);

  const deleteAllKeys = useCallback(() => {
    for (const p of PROVIDERS) {
      localStorage.removeItem(KEY_PREFIX + p.id);
    }
    setKeys({});
  }, []);

  const activeKey = keys[activeProviderId] ?? "";

  return (
    <ApiKeyContext.Provider
      value={{
        activeProviderId,
        activeProvider: getProvider(activeProviderId),
        activeKey,
        getKey,
        setKey,
        setActiveProvider,
        deleteAllKeys,
        hasActiveKey: activeKey.length > 0,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  return useContext(ApiKeyContext);
}
