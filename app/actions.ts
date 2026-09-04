"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { monthToDate } from "@/lib/types";
import { getServerDictionary } from "@/lib/i18n-server";

export type FormActionState = { error: string | null };

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function decimal(value: string) {
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function ageValue(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 120 ? parsed : null;
}

export async function addResident(
  _previousState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  await requireAdmin();
  const t = getServerDictionary();
  const sb = getSupabaseAdmin();
  const name = text(formData, "name");
  const ageRaw = text(formData, "age");
  const feeRaw = text(formData, "monthly_fee");
  const age = ageRaw ? ageValue(ageRaw) : null;
  const monthlyFee = feeRaw ? decimal(feeRaw) : 0;

  if (!name) return { error: t.actions.residentName };
  if (ageRaw && age === null) return { error: t.actions.validAge };
  if (monthlyFee === null || monthlyFee < 0) {
    return { error: t.actions.validFee };
  }

  const { error } = await sb.from("residents").insert({
    name,
    age,
    class: text(formData, "class") || null,
    school: text(formData, "school") || null,
    phone: text(formData, "phone") || null,
    room_number: text(formData, "room_number") || null,
    monthly_fee: monthlyFee,
  });
  if (error) return { error: t.actions.residentAddFailed };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateResident(
  _previousState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  await requireAdmin();
  const t = getServerDictionary();
  const sb = getSupabaseAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const ageRaw = text(formData, "age");
  const feeRaw = text(formData, "monthly_fee");
  const age = ageRaw ? ageValue(ageRaw) : null;
  const monthlyFee = feeRaw ? decimal(feeRaw) : 0;

  if (!id) return { error: t.actions.residentMissing };
  if (!name) return { error: t.actions.residentName };
  if (ageRaw && age === null) return { error: t.actions.validAge };
  if (monthlyFee === null || monthlyFee < 0) {
    return { error: t.actions.validFee };
  }

  const { data, error } = await sb
    .from("residents")
    .update({
      name,
      age,
      class: text(formData, "class") || null,
      school: text(formData, "school") || null,
      phone: text(formData, "phone") || null,
      room_number: text(formData, "room_number") || null,
      monthly_fee: monthlyFee,
      active: formData.get("active") === "on",
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    return { error: t.actions.saveFailed };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/residents/${id}`);
  redirect(`/dashboard/residents/${id}`);
}

export async function deleteResident(
  _previousState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  await requireAdmin();
  const t = getServerDictionary();
  const sb = getSupabaseAdmin();
  const id = text(formData, "id");
  if (!id) return { error: t.actions.residentMissing };

  const { data, error } = await sb
    .from("residents")
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    return { error: t.actions.residentDeleteFailed };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function recordPayment(
  _previousState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const session = await requireAdmin();
  const t = getServerDictionary();
  const sb = getSupabaseAdmin();
  const residentId = text(formData, "resident_id");
  const ym = text(formData, "period_month");
  const amount = decimal(text(formData, "amount"));
  const method = text(formData, "method") || null;
  const note = text(formData, "note") || null;

  if (!residentId || !/^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(ym)) {
    return { error: t.actions.validMonth };
  }
  if (amount === null || amount <= 0) {
    return { error: t.actions.positiveAmount };
  }

  const { error } = await sb.from("payments").insert({
    resident_id: residentId,
    period_month: monthToDate(ym),
    amount,
    method,
    note,
    created_by: session.username,
  });
  if (error) return { error: t.actions.paymentFailed };

  revalidatePath(`/dashboard/residents/${residentId}`);
  redirect(`/dashboard/residents/${residentId}?month=${ym}&paid=1`);
}

export async function deletePayment(
  _previousState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  await requireAdmin();
  const t = getServerDictionary();
  const sb = getSupabaseAdmin();
  const id = text(formData, "id");
  const residentId = text(formData, "resident_id");
  if (!id || !residentId) {
    return { error: t.actions.paymentMissing };
  }

  const { data, error } = await sb
    .from("payments")
    .delete()
    .eq("id", id)
    .eq("resident_id", residentId)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    return { error: t.actions.paymentDeleteFailed };
  }

  revalidatePath(`/dashboard/residents/${residentId}`);
  redirect(`/dashboard/residents/${residentId}`);
}
