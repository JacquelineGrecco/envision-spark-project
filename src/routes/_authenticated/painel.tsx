import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell, Panel, Stat, Tag, pagamentoTone } from "@/components/AppShell";
import {
  brl,
  dia,
  diaLongo,
  hora,
  isSameDay,
  monthRange,
  patientsQuery,
  profileQuery,
  sessionsQuery,
  weekRange,
} from "@/lib/psicohub";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Visão geral | PsicoHub" },
      { name: "description", content: "Resumo do dia, faturamento e pendências do consultório." },
      { property: "og:title", content: "Visão geral do consultório | PsicoHub" },
      { property: "og:description", content: "Sessões do dia, faturamento do mês e pendências." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

function Painel() {
  const { data: profile } = useQuery(profileQuery);
  const { data: sessions = [], isLoading } = useQuery(sessionsQuery);
  const { data: patients = [] } = useQuery(patientsQuery);
  const [periodo, setPeriodo] = useState<"semana" | "mes">("mes");

  const { start, end } = periodo === "semana" ? weekRange() : monthRange();
  const doMes = sessions.filter((s) => {
    const d = new Date(s.starts_at);
    return d >= start && d < end && s.status !== "cancelada";
  });
  const faturado = doMes
    .filter((s) => s.pagamento === "pago")
    .reduce((acc, s) => acc + Number(s.valor), 0);
  const aReceber = doMes
    .filter((s) => s.pagamento === "pendente" || s.pagamento === "atrasado")
    .reduce((acc, s) => acc + Number(s.valor), 0);
  const realizadas = doMes.filter((s) => s.status === "realizada").length;
  const hoje = sessions
    .filter((s) => isSameDay(s.starts_at) && s.status !== "cancelada")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const proximas = sessions
    .filter((s) => new Date(s.starts_at) >= new Date() && s.status !== "cancelada")
    .slice(0, 5);
  const pendentes = sessions
    .filter((s) => s.pagamento === "atrasado" || s.pagamento === "pendente")
    .filter((s) => new Date(s.starts_at) <= new Date())
    .slice(0, 6);
  const semEvolucao = sessions.filter((s) => s.status === "realizada" && !s.evolucao).length;
  const ativos = patients.filter((p) => p.ativo).length;

  const primeiroNome = (profile?.nome || "").split(" ")[0];

  return (
    <AppShell
      title={primeiroNome ? `Bom dia, ${primeiroNome}.` : "Visão geral do consultório"}
      subtitle={`${diaLongo(new Date().toISOString())}. ${hoje.length} sessão(ões) hoje e ${semEvolucao} evolução(ões) pendente(s).`}
      actions={
        <>
          <Link
            to="/agenda"
            className="rounded bg-muted px-4 py-2 text-sm font-medium text-secondary-foreground shadow-ring transition-colors hover:bg-accent"
          >
            Nova sessão
          </Link>
          <Link
            to="/financeiro"
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Ver financeiro
          </Link>
        </>
      }
    >
      <div className="mb-4 flex gap-1">
        {(["semana", "mes"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`rounded px-3 py-1.5 text-[11px] font-medium transition-colors ${
              periodo === p
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-secondary-foreground hover:bg-accent"
            }`}
          >
            {p === "semana" ? "Esta semana" : "Este mês"}
          </button>
        ))}
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat
          label={periodo === "semana" ? "Faturamento da semana" : "Faturamento do mês"}
          value={brl(faturado)}
          hint={`A receber: ${brl(aReceber)}`}
        />
        <Stat
          label={periodo === "semana" ? "Sessões da semana" : "Sessões do mês"}
          value={`${realizadas} / ${doMes.length}`}
          hint="Realizadas / agendadas"
        />
        <Stat label="Pacientes ativos" value={String(ativos)} hint={`${patients.length} no total`} />
        <Stat
          label="Evoluções pendentes"
          value={String(semEvolucao)}
          hint="Sessões realizadas sem nota"
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5">
          <Panel
            title="Próximos compromissos"
            action={
              <Link to="/agenda" className="text-[11px] font-medium text-primary hover:underline">
                Agenda completa
              </Link>
            }
          >
            <div className="divide-y divide-border">
              {isLoading && <p className="p-5 text-sm text-muted-foreground">Carregando...</p>}
              {!isLoading && proximas.length === 0 && (
                <p className="p-5 text-sm text-muted-foreground">
                  Nenhuma sessão futura agendada. Comece cadastrando um paciente.
                </p>
              )}
              {proximas.map((s) => (
                <div key={s.id} className="flex gap-4 p-5 transition-colors hover:bg-muted/50">
                  <div className="flex shrink-0 flex-col items-center">
                    <span className="text-xs font-semibold">{hora(s.starts_at)}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {s.duracao_min}m
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{s.patients?.nome ?? "Paciente"}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {dia(s.starts_at)}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {s.modalidade === "remoto" ? "Remoto" : "Presencial"} • {brl(Number(s.valor))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Tag tone={s.status === "confirmada" ? "success" : "neutral"}>
                        {s.status === "confirmada" ? "Confirmado" : "Aguardando confirmação"}
                      </Tag>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-7">
          <Panel
            title="Pendências financeiras"
            action={
              <Link
                to="/financeiro"
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Conciliar
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="label-eyebrow px-5 py-3">Paciente</th>
                    <th className="label-eyebrow px-5 py-3">Sessão</th>
                    <th className="label-eyebrow px-5 py-3">Valor</th>
                    <th className="label-eyebrow px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendentes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-6 text-sm text-muted-foreground">
                        Nada em aberto. Seu caixa está conciliado.
                      </td>
                    </tr>
                  )}
                  {pendentes.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-5 py-4 text-sm font-medium">
                        {s.patients?.nome ?? "Paciente"}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {dia(s.starts_at)} • {hora(s.starts_at)}
                      </td>
                      <td className="px-5 py-4 text-xs">{brl(Number(s.valor))}</td>
                      <td className="px-5 py-4 text-right">
                        <Tag tone={pagamentoTone(s.pagamento)}>{s.pagamento}</Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col justify-between rounded-xl bg-primary p-6 text-primary-foreground">
              <div>
                <h3 className="mb-1 text-sm font-medium">Prontuários em aberto</h3>
                <p className="text-xs leading-relaxed opacity-80 text-pretty">
                  {semEvolucao > 0
                    ? `Você tem ${semEvolucao} sessão(ões) realizada(s) sem nota de evolução registrada.`
                    : "Todas as sessões realizadas já possuem nota de evolução."}
                </p>
              </div>
              <Link
                to="/pacientes"
                className="mt-6 rounded bg-background px-4 py-2 text-center text-[11px] font-semibold text-primary"
              >
                Abrir prontuários
              </Link>
            </div>

            <div className="flex flex-col justify-between rounded-xl bg-surface p-6 shadow-ring">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="label-eyebrow">Sessões de hoje</span>
                  <span className="text-[10px] text-muted-foreground">{hoje.length} no dia</span>
                </div>
                <div className="space-y-2">
                  {hoje.length === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhuma sessão hoje.</p>
                  )}
                  {hoje.map((s) => (
                    <div key={s.id} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{hora(s.starts_at)}</span>
                      <span className="font-medium">{s.patients?.nome ?? "Paciente"}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link to="/agenda" className="mt-4 text-left text-[11px] font-medium text-primary hover:underline">
                Ajustar agenda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
