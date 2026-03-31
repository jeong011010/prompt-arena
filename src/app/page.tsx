"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { PracticeView } from "@/features/practice";
import { HistoryView } from "@/features/history";
import { LoginGate } from "@/components/shared/LoginGate";
import { UsageCounter } from "@/components/shared/UsageCounter";
import { UsageProvider } from "@/lib/UsageContext";

type Tab = "practice" | "history";

export default function Home() {
  return (
    <LoginGate>
      <UsageProvider>
        <App />
      </UsageProvider>
    </LoginGate>
  );
}

function App() {
  const [tab, setTab] = useState<Tab>("practice");
  const { data: session } = useSession();

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
            <UsageCounter />
            <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:block">
              {session?.user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              로그아웃
            </button>
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
        <div className={tab === "practice" ? undefined : "hidden"}><PracticeView /></div>
        <div className={tab === "history" ? undefined : "hidden"}><HistoryView /></div>
      </main>
    </div>
  );
}
