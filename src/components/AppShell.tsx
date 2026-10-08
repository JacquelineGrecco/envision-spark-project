import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Calendar, FileText, LayoutDashboard, LogOut, Menu, User, Wallet, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/psicohub";

const nav = [
  { to: "/painel", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/agenda", label: "Agenda Clínica", icon: Calendar },
  { to: "/pacientes", label: "Prontuários", icon: FileText },
  { to: "/financeiro", label: "Fluxo de Caixa", icon: Wallet },
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
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!menuAberto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuAberto(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuAberto]);

  const sair = async () => {
    setMenuAberto(false);
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  };

  const iniciais = (profile?.nome || "P").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:px-10">
          <Link to="/painel" className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded bg-primary">
              <div className="size-1.5 rounded-full bg-primary-foreground" />
            </div>
            <span className="font-medium tracking-tight">PsicoHub</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="transition-colors hover:text-foreground"
                activeProps={{ className: "font-medium text-primary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/perfil"
              aria-label="Meu perfil"
              className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-medium text-primary"
            >
              {iniciais}
            </Link>
            <button
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {menuAberto && (
        <div className="fixed inset-0 z-30 flex justify-end">
          <button
            aria-label="Fechar menu"
            onClick={() => setMenuAberto(false)}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
          />
          <div className="relative flex h-full w-full max-w-xs flex-col bg-background p-6 shadow-ring md:max-w-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Menu</h2>
              <button
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <Link
              to="/perfil"
              onClick={() => setMenuAberto(false)}
              className="mt-6 flex items-center gap-3 rounded-xl bg-surface p-4 shadow-ring transition-colors hover:bg-accent/40"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-accent text-sm font-medium text-primary">
                {iniciais}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {profile?.nome || "Meu consultório"}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {profile?.crp ? `CRP ${profile.crp}` : "CRP não informado"}
                </span>
              </div>
            </Link>

            <nav className="mt-6 space-y-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuAberto(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  activeProps={{ className: "bg-accent text-primary font-medium" }}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ))}
              <Link
                to="/perfil"
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-accent text-primary font-medium" }}
              >
                <User className="size-4" />
                Meu perfil
              </Link>
            </nav>

            <button
              onClick={sair}
              className="mt-auto flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" />
              Sair da conta
            </button>
          </div>
        </div>
      )}

      <main>
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-12">
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
