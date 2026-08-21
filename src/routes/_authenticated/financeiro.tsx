import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel, Stat, Tag, pagamentoTone } from "@/components/AppShell";
import {
  brl,
  dia,
  hora,
  monthRange,
  sessionsQuery,
  statusPagamento,
  updateSession,
  type Session,
} from "@/lib/psicohub";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro | PsicoHub" },
      { name: "description", content: "Faturamento, inadimplência e conciliação de pagamentos." },
      { property: "og:title", content: "Financeiro | PsicoHub" },
      { property: "og:description", content: "Controle de recebimentos do consultório." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Financeiro,
});

function Financeiro() {
  const qc = useQueryClient();
  const { data: sessions = [] } = useQuery(sessionsQuery);
  const [filtro, setFiltro] = useState<"todos" | Session["pagamento"]>("todos");
  const [mesOffset, setMesOffset] = useState(0);

  const marcar = useMutation({
    mutationFn: ({ id, pagamento }: { id: string; pagamento: Session["pagamento"] }) =>
      updateSession(id, { pagamento }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Pagamento atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const hoje = new Date();
  const mesSelecionado = new Date(hoje.getFullYear(), hoje.getMonth() + mesOffset, 1);
  const rotuloMes = mesSelecionado
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .replace(/^./, (c) => c.toUpperCase());

  const { start, end } = monthRange(mesSelecionado);
  const doMes = sessions.filter((s) => {
    const d = new Date(s.starts_at);
    return d >= start && d < end && s.status !== "cancelada";
  });
  const soma = (p: Session["pagamento"]) =>
    doMes.filter((s) => s.pagamento === p).reduce((acc, s) => acc + Number(s.valor), 0);
  const previsto = doMes.reduce((acc, s) => acc + Number(s.valor), 0);
  const recebido = soma("pago");
  const pendente = soma("pendente");
  const atrasado = soma("atrasado");
  const inadimplencia = previsto > 0 ? Math.round((atrasado / previsto) * 100) : 0;

  const lista = [...sessions]
    .filter((s) => {
      const d = new Date(s.starts_at);
      return d >= start && d < end;
    })
    .filter((s) => (filtro === "todos" ? true : s.pagamento === filtro))
    .sort((a, b) => b.starts_at.localeCompare(a.starts_at))
    .slice(0, 60);

  return (
    <AppShell
      title="Financeiro"
      subtitle="Faturamento do mês selecionado, pendências e conciliação sessão a sessão."
    >
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => setMesOffset((v) => v - 1)}
          className="rounded border border-border bg-surface px-3 py-1.5 text-sm transition-colors hover:bg-muted"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <span className="min-w-[10ch] text-center text-sm font-medium">{rotuloMes}</span>
        <button
          onClick={() => setMesOffset((v) => v + 1)}
          className="rounded border border-border bg-surface px-3 py-1.5 text-sm transition-colors hover:bg-muted"
          aria-label="Próximo mês"
        >
          ›
        </button>
        {mesOffset !== 0 && (
          <button
            onClick={() => setMesOffset(0)}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Voltar para o mês atual
          </button>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat label={`Previsto em ${rotuloMes}`} value={brl(previsto)} hint={`${doMes.length} sessões`} />
        <Stat label="Recebido" value={brl(recebido)} hint="Pagamentos confirmados" />
        <Stat label="A receber" value={brl(pendente)} hint="Aguardando pagamento" />
        <Stat label="Inadimplência" value={`${inadimplencia}%`} hint={brl(atrasado)} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["todos", ...statusPagamento] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded px-3 py-1.5 text-[11px] font-medium transition-colors ${
              filtro === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-secondary-foreground hover:bg-accent"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Panel title={`Lançamentos em ${rotuloMes} (${lista.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="label-eyebrow px-5 py-3">Data</th>
                <th className="label-eyebrow px-5 py-3">Paciente</th>
                <th className="label-eyebrow px-5 py-3">Valor</th>
                <th className="label-eyebrow px-5 py-3">Status</th>
                <th className="label-eyebrow px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-sm text-muted-foreground">
                    Nenhum lançamento neste filtro.
                  </td>
                </tr>
              )}
              {lista.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-5 py-4 text-xs text-muted-foreground">
                    {dia(s.starts_at)} • {hora(s.starts_at)}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium">
                    {s.patients?.nome ?? "Paciente"}
                  </td>
                  <td className="px-5 py-4 text-xs">{brl(Number(s.valor))}</td>
                  <td className="px-5 py-4">
                    <Tag tone={pagamentoTone(s.pagamento)}>{s.pagamento}</Tag>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <select
                      value={s.pagamento}
                      onChange={(e) =>
                        marcar.mutate({
                          id: s.id,
                          pagamento: e.target.value as Session["pagamento"],
                        })
                      }
                      className="rounded border border-border bg-background px-2 py-1 text-[11px]"
                    >
                      {statusPagamento.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
