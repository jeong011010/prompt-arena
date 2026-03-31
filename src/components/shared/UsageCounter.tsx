"use client";

import { useUsage } from "@/lib/UsageContext";

export function UsageCounter() {
  const { usage } = useUsage();
  if (!usage) return null;

  const isAlmostOut = usage.count >= usage.limit - 2;
  return (
    <span
      className={`text-xs px-2 py-1 rounded-md border ${
        isAlmostOut
          ? "border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
          : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
      }`}
    >
      오늘 {usage.count} / {usage.limit}회
    </span>
  );
}
