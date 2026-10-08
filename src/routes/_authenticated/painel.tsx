import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell, Panel, Stat, Tag, pagamentoTone } from "@/components/AppShell";
import { CalendarView, startOfDay, type ViewMode } from "@/components/CalendarView";
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

function periodoRange(view: ViewMode, cursor: Date) {
  if (view === "mes") return monthRange(cursor);
  if (view === "semana") return weekRange(cursor);
  const end = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
  return { start: cursor, end };
}

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
  const { data: sessions = [] } = useQuery(sessionsQuery);
  const { data: patients = [], isLoading: carregandoPacientes } = useQuery(patientsQuery);
  const [view, setView] = useState<ViewMode>("semana");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));

  const { start, end } = periodoRange(view, cursor);
  const doPeriodo = sessions.filter((s) => {
    const d = new Date(s.starts_at);
    return d >= start && d < end && s.status !== "cancelada";
  });
  const faturado = doPeriodo
    .filter((s) => s.pagamento === "pago")
    .reduce((acc, s) => acc + Number(s.valor), 0);
  const aReceber = doPeriodo
    .filter((s) => s.pagamento === "pendente" || s.pagamento === "atrasado")
    .reduce((acc, s) => acc + Number(s.valor), 0);
  const realizadas = doPeriodo.filter((s) => s.status === "realizada").length;
  const hoje = sessions
    .filter((s) => isSameDay(s.starts_at) && s.status !== "cancelada")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const pendentes = sessions
    .filter((s) => s.pagamento === "atrasado" || s.pagamento === "pendente")
    .filter((s) => new Date(s.starts_at) <= new Date())
    .slice(0, 6);
  const semEvolucao = sessions.filter((s) => s.status === "realizada" && !s.evolucao).length;
  const pacientesAtivos = patients.filter((p) => p.ativo);

  const primeiroNome = (profile?.nome || "").split(" ")[0];
  const horaAtual = new Date().getHours();
  const saudacao = horaAtual < 12 ? "Bom dia" : horaAtual < 18 ? "Boa tarde" : "Boa noite";
  const labelFaturamento =
    view === "mes"
      ? "Faturamento do mês"
      : view === "semana"
        ? "Faturamento da semana"
        : "Faturamento do dia";
  const labelSessoes =
    view === "mes" ? "Sessões do mês" : view === "semana" ? "Sessões da semana" : "Sessões do dia";

  return (
    <AppShell
      title={primeiroNome ? `${saudacao}, ${primeiroNome}.` : "Visão geral do consultório"}
      subtitle={`${diaLongo(new Date().toISOString())}. ${hoje.length} sessão(ões) hoje e ${semEvolucao} evolução(ões) pendente(s).`}
    >
      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat label={labelFaturamento} value={brl(faturado)} hint={`A receber: ${brl(aReceber)}`} />
        <Stat
          label={labelSessoes}
          value={`${realizadas} / ${doPeriodo.length}`}
          hint="Realizadas / agendadas"
        />
        <Stat
          label="Pacientes ativos"
          value={String(pacientesAtivos.length)}
          hint={`${patients.length} no total`}
        />
        <Stat
          label="Evoluções pendentes"
          value={String(semEvolucao)}
          hint="Sessões realizadas sem nota"
        />
      </div>

      <div className="mb-10 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5">
          <Panel
            title="Pacientes em acompanhamento"
            action={
              <Link
                to="/pacientes"
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Ver todos
              </Link>
            }
          >
            <div className="divide-y divide-border">
              {carregandoPacientes && (
                <p className="p-5 text-sm text-muted-foreground">Carregando...</p>
              )}
              {!carregandoPacientes && pacientesAtivos.length === 0 && (
                <p className="p-5 text-sm text-muted-foreground">
                  Nenhum paciente ativo. Comece cadastrando um paciente.
                </p>
              )}
              {pacientesAtivos.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  to="/pacientes/$patientId"
                  params={{ patientId: p.id }}
                  className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <span className="text-sm font-medium">{p.nome}</span>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {p.modalidade === "remoto" ? "Remoto" : "Presencial"} •{" "}
                      {brl(Number(p.valor_sessao))}
                    </div>
                  </div>
                  <Tag tone="success">{p.frequencia}</Tag>
                </Link>
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
        </div>
      </div>

      <CalendarView
        sessions={sessions}
        view={view}
        setView={setView}
        cursor={cursor}
        setCursor={setCursor}
      />
    </AppShell>
  );
}
