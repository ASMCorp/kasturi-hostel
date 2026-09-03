"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-dark px-4 py-2.5"
    >
      <span aria-hidden="true">↧</span>
      Print receipt
    </button>
  );
}
