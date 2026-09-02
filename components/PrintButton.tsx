"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-brand text-white px-4 py-2 text-sm font-medium hover:bg-brand-dark"
    >
      🖨 Print receipt
    </button>
  );
}
