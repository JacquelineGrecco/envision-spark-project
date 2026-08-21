import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/psicohub";

const nav = [
  { to: "/painel", label: "Visão Geral" },
  { to: "/agenda", label: "Agenda Clínica" },
  { to: "/pacientes", label: "Prontuários" },
  { to: "/financeiro", label: "Fluxo de Caixa" },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const { data: profile } = useQuery(profileQuery);

  const sair = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 z-20 hidden h-full w-64 border-r border-border bg-background lg:block">
        <div className="flex h-full flex-col">
          <div className="p-6">
            <div className="mb-10 flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded bg-primary">
                <div className="size-1.5 rounded-full bg-primary-foreground" />
              </div>
              <span className="font-medium tracking-tight">PsicoHub</span>
            </div>

            <nav className="space-y-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  activeProps={{ className: "bg-accent text-primary font-medium" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-border p-4">
            <Link
              to="/perfil"
              className="flex items-center gap-3 rounded-lg bg-muted p-2 transition-colors hover:bg-accent"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-medium text-primary">
                {(profile?.nome || "P").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-xs font-medium">
                  {profile?.nome || "Meu consultório"}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {profile?.crp ? `CRP ${profile.crp}` : "CRP não informado"}
                </span>
              </div>
            </Link>
            <button
              onClick={sair}
              className="mt-3 w-full rounded-md px-3 py-2 text-left text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Sair da conta
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-12">
          <nav className="mb-8 flex gap-1 overflow-x-auto lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="shrink-0 rounded-md px-3 py-2 text-xs text-muted-foreground"
                activeProps={{ className: "bg-accent text-primary font-medium" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <header className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="mb-1 text-2xl font-medium text-balance">{title}</h1>
              {subtitle && <p className="max-w-[56ch] text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex gap-3">{actions}</div>}
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl bg-surface shadow-ring">
      <div className="flex items-center justify-between border-b border-border bg-surface-muted px-5 py-4">
        <h2 className="text-sm font-medium">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  badge,
}: {
  label: string;
  value: string;
  hint?: string;
  badge?: string;
}) {
  return (
    <div className="rounded-xl bg-surface p-5 shadow-ring">
      <div className="flex items-start justify-between">
        <span className="label-eyebrow">{label}</span>
        {badge && (
          <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-primary">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-3">
        <span className="text-xl font-semibold tracking-tight">{value}</span>
        {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

const tones = {
  neutral: "bg-muted text-muted-foreground",
  brand: "bg-accent text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/10 text-destructive",
} as const;

export function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function pagamentoTone(status: string): keyof typeof tones {
  if (status === "pago") return "success";
  if (status === "pendente") return "warning";
  if (status === "atrasado") return "danger";
  return "neutral";
}
