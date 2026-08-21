import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery, updateProfile } from "@/lib/psicohub";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil | PsicoHub" },
      { name: "description", content: "Edite suas informações pessoais e profissionais." },
      { property: "og:title", content: "Meu Perfil | PsicoHub" },
      { property: "og:description", content: "Dados pessoais e profissionais do consultório." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery(profileQuery);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [crp, setCrp] = useState("");
  const [metaHoras, setMetaHoras] = useState("20");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  useEffect(() => {
    if (!profile) return;
    setNome(profile.nome ?? "");
    setCrp(profile.crp ?? "");
    setMetaHoras(String(profile.meta_horas_semanais ?? 20));
  }, [profile]);

  const salvar = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    salvar.mutate({
      nome,
      crp: crp || null,
      meta_horas_semanais: Number(metaHoras) || 0,
    });
  };

  return (
    <AppShell title="Meu Perfil" subtitle="Atualize seus dados pessoais e profissionais.">
      <Panel title="Informações">
        {isLoading ? (
          <p className="p-5 text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <form onSubmit={submit} className="max-w-sm space-y-4 p-5">
            <Field label="E-mail" value={email} onChange={() => {}} disabled />
            <Field label="Nome" value={nome} onChange={setNome} required />
            <Field label="CRP" value={crp} onChange={setCrp} placeholder="06/123456" />
            <Field
              label="Meta de horas semanais"
              type="number"
              value={metaHoras}
              onChange={setMetaHoras}
            />

            <button
              type="submit"
              disabled={salvar.isPending}
              className="rounded bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {salvar.isPending ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        )}
      </Panel>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="label-eyebrow">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}
