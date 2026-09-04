import "server-only";

import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, normalizeLocale, type Locale } from "@/lib/i18n";

export function getLocale(): Locale {
  return normalizeLocale(cookies().get(LOCALE_COOKIE)?.value);
}

export function getServerDictionary() {
  return getDictionary(getLocale());
}
