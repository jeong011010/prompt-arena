"use client";

import { useState } from "react";
import { PracticeView } from "@/features/practice";
import { HistoryView } from "@/features/history";
import { ApiKeyProvider, useApiKey } from "@/lib/ApiKeyContext";
import { PROVIDERS } from "@/lib/providers";

type Tab = "practice" | "history";

export default function Home() {
  return (
    <ApiKeyProvider>
      <App />
    </ApiKeyProvider>
  );
}

function App() {
  const [tab, setTab] = useState<Tab>("practice");
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-zinc-900 dark:text-zinc-100">Prompt Arena</h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              프롬프트 엔지니어링 경진대회 연습
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ApiKeyBadge onOpen={() => setShowSettings(true)} />
            <nav className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden text-sm">
              {(["practice", "history"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 font-medium transition-colors ${
                    tab === t
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {t === "practice" ? "연습" : "기록"}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {tab === "practice" ? <PracticeView /> : <HistoryView />}
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function ApiKeyBadge({ onOpen }: { onOpen: () => void }) {
  const { hasActiveKey, activeProvider } = useApiKey();
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${hasActiveKey ? "bg-emerald-400" : "bg-red-400"}`} />
      {hasActiveKey ? activeProvider.name : "API 키 없음"}
    </button>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { activeProviderId, getKey, setKey, setActiveProvider, deleteAllKeys } = useApiKey();
  const [drafts, setDrafts] = useState<Record<string, string>>(
    () => Object.fromEntries(PROVIDERS.map((p) => [p.id, getKey(p.id)]))
  );
  const [selectedTab, setSelectedTab] = useState(activeProviderId);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    for (const p of PROVIDERS) {
      setKey(p.id, drafts[p.id] ?? "");
    }
    setActiveProvider(selectedTab);
    onClose();
  };

  const handleDeleteAll = () => {
    deleteAllKeys();
    setDrafts(Object.fromEntries(PROVIDERS.map((p) => [p.id, ""])));
  };

  const currentProvider = PROVIDERS.find((p) => p.id === selectedTab)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-4 space-y-4">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">환경설정</h2>

          {/* XSS 보안 경고 */}
          <div className="flex gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>
              API 키는 브라우저 localStorage에 저장됩니다. XSS 공격에 노출될 수 있으므로{" "}
              <strong>사용 후 반드시 삭제</strong>하거나 별도 환경변수로 관리하세요.
            </span>
          </div>

          {/* 프로바이더 탭 */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">AI 프로바이더</p>
            <div className="flex flex-wrap gap-1.5">
              {PROVIDERS.map((p) => {
                const hasKey = (drafts[p.id] ?? "").length > 0;
                const isActive = selectedTab === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedTab(p.id); setShowKey(false); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isActive
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${hasKey ? "bg-emerald-400" : "bg-zinc-300 dark:bg-zinc-600"}`}
                    />
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 키 입력 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {currentProvider.name} API 키
              <span className="ml-1.5 text-zinc-400 dark:text-zinc-600 font-normal">
                (선택 시 이 프로바이더로 활성화)
              </span>
            </label>
            <div className="relative">
              <input
                key={selectedTab}
                type={showKey ? "text" : "password"}
                value={drafts[selectedTab] ?? ""}
                onChange={(e) =>
                  setDrafts((prev) => ({ ...prev, [selectedTab]: e.target.value }))
                }
                placeholder={currentProvider.keyPlaceholder}
                autoFocus
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 pr-10 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 placeholder:text-zinc-400"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors text-xs"
                tabIndex={-1}
              >
                {showKey ? "숨김" : "표시"}
              </button>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              모델: <code className="font-mono">{currentProvider.model}</code>
              &ensp;·&ensp;baseURL: <code className="font-mono text-xs">{currentProvider.baseURL}</code>
            </p>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <button
            onClick={handleDeleteAll}
            className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
          >
            모든 키 삭제
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-sm font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80 transition-opacity"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
