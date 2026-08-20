import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type SessionWithPatient = Session & { patients: Pick<Patient, "id" | "nome"> | null };

export const frequencias = ["semanal", "quinzenal", "mensal", "pontual"] as const;
export const modalidades = ["presencial", "remoto"] as const;
export const statusSessao = ["agendada", "confirmada", "realizada", "cancelada"] as const;
export const statusPagamento = ["pendente", "pago", "atrasado", "isento"] as const;

export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);

export const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export const dia = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

export const diaLongo = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

export function toInputDateTime(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Sessão expirada");
  return data.user.id;
}

export const profileQuery = {
  queryKey: ["profile"],
  queryFn: async (): Promise<Profile | null> => {
    const uid = await currentUserId();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (error) throw error;
    return data;
  },
};

export const patientsQuery = {
  queryKey: ["patients"],
  queryFn: async (): Promise<Patient[]> => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("ativo", { ascending: false })
      .order("nome");
    if (error) throw error;
    return data ?? [];
  },
};

export const sessionsQuery = {
  queryKey: ["sessions"],
  queryFn: async (): Promise<SessionWithPatient[]> => {
    const { data, error } = await supabase
      .from("sessions")
      .select("*, patients(id, nome)")
      .order("starts_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as SessionWithPatient[];
  },
};

export function patientSessionsQuery(patientId: string) {
  return {
    queryKey: ["sessions", "patient", patientId],
    queryFn: async (): Promise<Session[]> => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("patient_id", patientId)
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  };
}

export function patientQuery(patientId: string) {
  return {
    queryKey: ["patients", patientId],
    queryFn: async (): Promise<Patient | null> => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  };
}

export async function savePatient(input: {
  id?: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  frequencia: Patient["frequencia"];
  modalidade: Patient["modalidade"];
  valor_sessao: number;
  ativo: boolean;
  observacoes: string | null;
}) {
  const uid = await currentUserId();
  if (input.id) {
    const { id, ...rest } = input;
    const { error } = await supabase.from("patients").update(rest).eq("id", id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("patients").insert({ ...input, user_id: uid });
  if (error) throw error;
}

export async function saveSession(input: {
  id?: string;
  patient_id: string;
  starts_at: string;
  duracao_min: number;
  modalidade: Session["modalidade"];
  status: Session["status"];
  pagamento: Session["pagamento"];
  valor: number;
}) {
  const uid = await currentUserId();
  if (input.id) {
    const { id, ...rest } = input;
    const { error } = await supabase.from("sessions").update(rest).eq("id", id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("sessions").insert({ ...input, user_id: uid });
  if (error) throw error;
}

export async function updateSession(id: string, patch: Partial<Session>) {
  const { error } = await supabase.from("sessions").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteSession(id: string) {
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) throw error;
}

export function monthRange(base = new Date()) {
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 1);
  return { start, end };
}

export function isSameDay(iso: string, day = new Date()) {
  const d = new Date(iso);
  return (
    d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
  );
}
