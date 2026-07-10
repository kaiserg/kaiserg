"use client";

import dynamic from "next/dynamic";

const Board = dynamic(() => import("@/components/Board").then((m) => m.Board), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
      <p className="text-gray-text">Loading board...</p>
    </div>
  ),
});

export default function Home() {
  return <Board />;
}
