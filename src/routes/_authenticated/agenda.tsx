import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel, Tag, pagamentoTone } from "@/components/AppShell";
import {
  brl,
  dia,
  hora,
  modalidades,
  patientsQuery,
  saveSession,
  sessionsQuery,
  statusPagamento,
  statusSessao,
  toInputDateTime,
  updateSession,
  deleteSession,
  type Session,
} from "@/lib/psicohub";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda clínica | PsicoHub" },
      { name: "description", content: "Agende, confirme e conclua as sessões do consultório." },
      { property: "og:title", content: "Agenda clínica | PsicoHub" },
      { property: "og:description", content: "Sessões recorrentes, confirmações e remarcações." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Agenda,
});

function Agenda() {
  const qc = useQueryClient();
  const { data: sessions = [] } = useQuery(sessionsQuery);
  const { data: patients = [] } = useQuery(patientsQuery);
  const [aberto, setAberto] = useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["sessions"] });
  };

  const criar = useMutation({
    mutationFn: saveSession,
    onSuccess: () => {
      invalidate();
      setAberto(false);
      toast.success("Sessão agendada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const atualizar = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Session> }) => updateSession(id, patch),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      invalidate();
      toast.success("Sessão removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const agora = new Date();
  const futuras = sessions.filter((s) => new Date(s.starts_at) >= agora);
  const passadas = [...sessions]
    .filter((s) => new Date(s.starts_at) < agora)
    .reverse()
    .slice(0, 20);

  return (
    <AppShell
      title="Agenda clínica"
      subtitle="Cada sessão carrega horário, modalidade, valor e status de pagamento."
      actions={
        <button
          onClick={() => setAberto((v) => !v)}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          {aberto ? "Fechar" : "Nova sessão"}
        </button>
      }
    >
      {aberto && (
        <div className="mb-8">
          <SessionForm
            patients={patients}
            onSubmit={(values) => criar.mutate(values)}
            pending={criar.isPending}
          />
        </div>
      )}

      <div className="space-y-6">
        <Panel title={`Próximas sessões (${futuras.length})`}>
          <div className="divide-y divide-border">
            {futuras.length === 0 && (
              <p className="p-5 text-sm text-muted-foreground">
                Nenhuma sessão futura. Cadastre um paciente e agende a primeira.
              </p>
            )}
            {futuras.map((s) => (
              <div key={s.id} className="flex flex-wrap gap-4 p-5 transition-colors hover:bg-muted/40">
                <div className="flex w-16 shrink-0 flex-col">
                  <span className="text-xs font-semibold">{hora(s.starts_at)}</span>
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {dia(s.starts_at)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.patients?.nome ?? "Paciente"}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {s.duracao_min} min • {s.modalidade === "remoto" ? "Remoto" : "Presencial"} •{" "}
                    {brl(Number(s.valor))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Tag tone={s.status === "confirmada" ? "success" : "neutral"}>{s.status}</Tag>
                    <Tag tone={pagamentoTone(s.pagamento)}>{s.pagamento}</Tag>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-start gap-2">
                  {s.status !== "confirmada" && (
                    <SmallButton
                      onClick={() => atualizar.mutate({ id: s.id, patch: { status: "confirmada" } })}
                    >
                      Confirmar
                    </SmallButton>
                  )}
                  <SmallButton
                    onClick={() => atualizar.mutate({ id: s.id, patch: { status: "realizada" } })}
                  >
                    Marcar realizada
                  </SmallButton>
                  <SmallButton
                    onClick={() => atualizar.mutate({ id: s.id, patch: { status: "cancelada" } })}
                  >
                    Cancelar
                  </SmallButton>
                  <SmallButton onClick={() => remover.mutate(s.id)}>Excluir</SmallButton>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Histórico recente">
          <div className="divide-y divide-border">
            {passadas.length === 0 && (
              <p className="p-5 text-sm text-muted-foreground">Nenhuma sessão registrada ainda.</p>
            )}
            {passadas.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="w-24 text-xs text-muted-foreground">
                  {dia(s.starts_at)} • {hora(s.starts_at)}
                </span>
                <span className="flex-1 text-sm font-medium">{s.patients?.nome ?? "Paciente"}</span>
                <Tag>{s.status}</Tag>
                <Tag tone={pagamentoTone(s.pagamento)}>{s.pagamento}</Tag>
                {s.pagamento !== "pago" && (
                  <SmallButton
                    onClick={() => atualizar.mutate({ id: s.id, patch: { pagamento: "pago" } })}
                  >
                    Registrar pagamento
                  </SmallButton>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function SmallButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded bg-accent px-2 py-1 text-[11px] font-medium text-primary transition-opacity hover:opacity-80"
    >
      {children}
    </button>
  );
}

export function SessionForm({
  patients,
  onSubmit,
  pending,
  fixedPatientId,
}: {
  patients: { id: string; nome: string; valor_sessao: number; modalidade: string }[];
  onSubmit: (values: Parameters<typeof saveSession>[0]) => void;
  pending: boolean;
  fixedPatientId?: string;
}) {
  const [patientId, setPatientId] = useState(fixedPatientId ?? patients[0]?.id ?? "");
  const [startsAt, setStartsAt] = useState(toInputDateTime());
  const [duracao, setDuracao] = useState(50);
  const [modalidade, setModalidade] = useState<(typeof modalidades)[number]>("presencial");
  const [status, setStatus] = useState<(typeof statusSessao)[number]>("agendada");
  const [pagamento, setPagamento] = useState<(typeof statusPagamento)[number]>("pendente");
  const selecionado = patients.find((p) => p.id === patientId);
  const [valor, setValor] = useState(Number(selecionado?.valor_sessao ?? 0));

  if (patients.length === 0) {
    return (
      <div className="rounded-xl bg-surface p-5 text-sm text-muted-foreground shadow-ring">
        Cadastre um paciente antes de agendar sessões.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          patient_id: patientId,
          starts_at: new Date(startsAt).toISOString(),
          duracao_min: duracao,
          modalidade,
          status,
          pagamento,
          valor,
        });
      }}
      className="grid grid-cols-1 gap-4 rounded-xl bg-surface p-5 shadow-ring md:grid-cols-3"
    >
      <label className="block">
        <span className="label-eyebrow">Paciente</span>
        <select
          value={patientId}
          onChange={(e) => {
            setPatientId(e.target.value);
            const p = patients.find((x) => x.id === e.target.value);
            if (p) setValor(Number(p.valor_sessao));
          }}
          disabled={Boolean(fixedPatientId)}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label-eyebrow">Data e hora</span>
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="label-eyebrow">Duração (min)</span>
        <input
          type="number"
          min={15}
          step={5}
          value={duracao}
          onChange={(e) => setDuracao(Number(e.target.value))}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="label-eyebrow">Modalidade</span>
        <select
          value={modalidade}
          onChange={(e) => setModalidade(e.target.value as (typeof modalidades)[number])}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        >
          {modalidades.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label-eyebrow">Status da sessão</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof statusSessao)[number])}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        >
          {statusSessao.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label-eyebrow">Pagamento</span>
        <select
          value={pagamento}
          onChange={(e) => setPagamento(e.target.value as (typeof statusPagamento)[number])}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        >
          {statusPagamento.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label-eyebrow">Valor (R$)</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <div className="flex items-end md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Agendar sessão"}
        </button>
      </div>
    </form>
  );
}
