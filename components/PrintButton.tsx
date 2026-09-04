"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function PrintButton() {
  const { dictionary: t } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-dark px-4 py-2.5"
    >
      <span aria-hidden="true">↧</span>
      {t.receipt.print}
    </button>
  );
}
