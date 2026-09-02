"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { monthToDate } from "@/lib/types";

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function addResident(formData: FormData) {
  await requireAdmin();
  const sb = getSupabaseAdmin();
  const ageRaw = formData.get("age") as string;
  const feeRaw = formData.get("monthly_fee") as string;

  const { error } = await sb.from("residents").insert({
    name: (formData.get("name") as string)?.trim(),
    age: ageRaw ? parseInt(ageRaw, 10) : null,
    class: (formData.get("class") as string)?.trim() || null,
    school: (formData.get("school") as string)?.trim() || null,
    phone: (formData.get("phone") as string)?.trim() || null,
    room_number: (formData.get("room_number") as string)?.trim() || null,
    monthly_fee: feeRaw ? parseFloat(feeRaw) : 0,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateResident(formData: FormData) {
  await requireAdmin();
  const sb = getSupabaseAdmin();
  const id = formData.get("id") as string;
  const ageRaw = formData.get("age") as string;
  const feeRaw = formData.get("monthly_fee") as string;

  const { error } = await sb
    .from("residents")
    .update({
      name: (formData.get("name") as string)?.trim(),
      age: ageRaw ? parseInt(ageRaw, 10) : null,
      class: (formData.get("class") as string)?.trim() || null,
      school: (formData.get("school") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      room_number: (formData.get("room_number") as string)?.trim() || null,
      monthly_fee: feeRaw ? parseFloat(feeRaw) : 0,
      active: formData.get("active") === "on",
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  redirect(`/dashboard/residents/${id}`);
}

export async function deleteResident(formData: FormData) {
  await requireAdmin();
  const sb = getSupabaseAdmin();
  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing resident id");

  // Remove the resident's payments first, then the resident.
  const { error: payErr } = await sb
    .from("payments")
    .delete()
    .eq("resident_id", id);
  if (payErr) throw new Error(payErr.message);

  const { error } = await sb.from("residents").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function recordPayment(formData: FormData) {
  const session = await requireAdmin();
  const sb = getSupabaseAdmin();
  const residentId = formData.get("resident_id") as string;
  const ym = formData.get("period_month") as string; // YYYY-MM
  const amount = parseFloat(formData.get("amount") as string);
  const method = (formData.get("method") as string)?.trim() || null;
  const note = (formData.get("note") as string)?.trim() || null;

  if (!residentId || !ym || !amount || amount <= 0) {
    throw new Error("Missing or invalid payment details");
  }

  const { data, error } = await sb
    .from("payments")
    .insert({
      resident_id: residentId,
      period_month: monthToDate(ym),
      amount,
      method,
      note,
      created_by: session.username,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/residents/${residentId}`);
  redirect(`/dashboard/receipt/${data.id}`);
}

export async function deletePayment(formData: FormData) {
  await requireAdmin();
  const sb = getSupabaseAdmin();
  const id = formData.get("id") as string;
  const residentId = formData.get("resident_id") as string;
  const { error } = await sb.from("payments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/residents/${residentId}`);
  redirect(`/dashboard/residents/${residentId}`);
}
