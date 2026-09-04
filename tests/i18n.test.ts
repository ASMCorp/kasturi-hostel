import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_LOCALE,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPaymentMethod,
  formatMonth,
  getDictionary,
  normalizeLocale,
} from "../lib/i18n.ts";

test("normalizes supported locale values and falls back to English", () => {
  assert.equal(normalizeLocale("bn"), "bn");
  assert.equal(normalizeLocale("en"), "en");
  assert.equal(normalizeLocale("bn-BD"), "bn");
  assert.equal(normalizeLocale("unknown"), DEFAULT_LOCALE);
  assert.equal(normalizeLocale(undefined), DEFAULT_LOCALE);
});

test("provides Bangladesh Bangla translations", () => {
  const bn = getDictionary("bn");
  assert.equal(bn.languageName, "বাংলা");
  assert.equal(bn.receipt.title, "পেমেন্ট নিশ্চিতকরণ রসিদ");
  assert.equal(bn.receipt.print, "রসিদ প্রিন্ট করুন");
});

test("formats Bangla currency with Bengali numerals", () => {
  assert.equal(formatCurrency(12500.5, "bn"), "৳১২,৫০০.৫");
  assert.equal(formatCurrency(12500.5, "en"), "৳12,500.5");
});

test("formats months in the selected language", () => {
  assert.equal(formatMonth("2026-09-01", "bn"), "সেপ্টেম্বর ২০২৬");
  assert.equal(formatMonth("2026-09-01", "en"), "September 2026");
});

test("formats receipt dates and times using the Bangladesh locale", () => {
  const value = "2026-09-04T10:30:00.000Z";
  assert.match(formatDate(value, "bn"), /২০২৬/);
  assert.match(formatDateTime(value, "bn"), /২০২৬/);
  assert.match(formatDate(value, "en"), /2026/);
});

test("formats payment timestamps in Bangladesh time", () => {
  const value = "2026-09-04T20:30:00.000Z";
  assert.equal(formatDate(value, "en"), "9/5/2026");
  assert.match(formatDateTime(value, "bn"), /৫ .*২০২৬.*২:৩০/);
});

test("translates common payment methods on Bangla receipts", () => {
  assert.equal(formatPaymentMethod("Cash", "bn", "উল্লেখ করা হয়নি"), "নগদ");
  assert.equal(formatPaymentMethod("bKash", "bn", "উল্লেখ করা হয়নি"), "বিকাশ");
  assert.equal(formatPaymentMethod("Custom", "bn", "উল্লেখ করা হয়নি"), "Custom");
  assert.equal(formatPaymentMethod(null, "bn", "উল্লেখ করা হয়নি"), "উল্লেখ করা হয়নি");
});
