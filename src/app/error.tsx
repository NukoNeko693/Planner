"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">画面を表示できませんでした</h2>
        <button
          className="mt-4 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white"
          onClick={reset}
          type="button"
        >
          もう一度試す
        </button>
      </div>
    </main>
  );
}
