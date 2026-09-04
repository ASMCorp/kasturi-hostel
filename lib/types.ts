export type Resident = {
  id: string;
  name: string;
  age: number | null;
  class: string | null;
  school: string | null;
  phone: string | null;
  room_number: string | null;
  monthly_fee: number;
  active: boolean;
  deleted_at: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  resident_id: string;
  period_month: string; // YYYY-MM-DD (first of month)
  amount: number;
  method: string | null;
  note: string | null;
  receipt_no: number;
  paid_at: string;
  created_by: string | null;
  created_at: string;
};

// First day of a YYYY-MM string, as YYYY-MM-DD
export function monthToDate(ym: string): string {
  return `${ym}-01`;
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
