import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel, Stat, Tag, pagamentoTone } from "@/components/AppShell";
import {
  brl,
  dia,
  hora,
  patientQuery,
  patientSessionsQuery,
  savePatient,
  updateSession,
} from "@/lib/psicohub";
import { PatientForm } from "./pacientes";

export const Route = createFileRoute("/_authenticated/pacientes_/$patientId")({
  head: () => ({
    meta: [
      { title: "Prontuário do paciente | PsicoHub" },
      { name: "description", content: "Histórico de sessões e notas de evolução do paciente." },
      { property: "og:title", content: "Prontuário do paciente | PsicoHub" },
      { property: "og:description", content: "Evolução clínica sessão a sessão." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Prontuario,
});

function Prontuario() {
  const { patientId } = Route.useParams();
  const qc = useQueryClient();
  const { data: patient, isLoading } = useQuery(patientQuery(patientId));
  const { data: sessions = [] } = useQuery(patientSessionsQuery(patientId));
  const [editando, setEditando] = useState(false);

  const salvar = useMutation({
    mutationFn: savePatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      setEditando(false);
      toast.success("Ficha atualizada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const salvarEvolucao = useMutation({
    mutationFn: ({ id, evolucao }: { id: string; evolucao: string }) =>
      updateSession(id, { evolucao }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Evolução registrada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <AppShell title="Prontuário">
        <p className="text-sm text-muted-foreground">Carregando ficha...</p>
      </AppShell>
    );
  }

  if (!patient) {
    return (
      <AppShell title="Paciente não encontrado">
        <Link to="/pacientes" className="text-sm text-primary hover:underline">
          Voltar para pacientes
        </Link>
      </AppShell>
    );
  }

  const realizadas = sessions.filter((s) => s.status === "realizada");
  const recebido = sessions
    .filter((s) => s.pagamento === "pago")
    .reduce((acc, s) => acc + Number(s.valor), 0);
  const aberto = sessions
    .filter((s) => s.pagamento === "pendente" || s.pagamento === "atrasado")
    .reduce((acc, s) => acc + Number(s.valor), 0);

  return (
    <AppShell
      title={patient.nome}
      subtitle={`${patient.frequencia} • ${patient.modalidade} • ${brl(Number(patient.valor_sessao))} por sessão`}
      actions={
        <>
          <Link
            to="/pacientes"
            className="rounded bg-muted px-4 py-2 text-sm font-medium text-secondary-foreground shadow-ring transition-colors hover:bg-accent"
          >
            Voltar
          </Link>
          <button
            onClick={() => setEditando((v) => !v)}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            {editando ? "Fechar edição" : "Editar ficha"}
          </button>
        </>
      }
    >
      {editando && (
        <div className="mb-8">
          <PatientForm
            initial={patient}
            pending={salvar.isPending}
            onSubmit={(v) => salvar.mutate(v)}
          />
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label="Sessões realizadas" value={String(realizadas.length)} hint={`${sessions.length} no histórico`} />
        <Stat label="Recebido" value={brl(recebido)} hint="Somatório de sessões pagas" />
        <Stat label="Em aberto" value={brl(aberto)} hint="Pendente ou atrasado" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4">
          <Panel title="Dados do paciente">
            <dl className="space-y-4 p-5 text-sm">
              <Campo rotulo="E-mail" valor={patient.email || "—"} />
              <Campo rotulo="Telefone" valor={patient.telefone || "—"} />
              <Campo rotulo="Situação" valor={patient.ativo ? "Ativo" : "Inativo"} />
              <div>
                <dt className="label-eyebrow">Observações</dt>
                <dd className="mt-1 text-sm leading-relaxed text-pretty">
                  {patient.observacoes || "Sem observações registradas."}
                </dd>
              </div>
            </dl>
          </Panel>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <Panel title="Evolução por sessão">
            <div className="divide-y divide-border">
              {sessions.length === 0 && (
                <p className="p-5 text-sm text-muted-foreground">
                  Nenhuma sessão registrada para este paciente.
                </p>
              )}
              {sessions.map((s) => (
                <EvolucaoItem
                  key={s.id}
                  id={s.id}
                  data={`${dia(s.starts_at)} • ${hora(s.starts_at)}`}
                  status={s.status}
                  pagamento={s.pagamento}
                  evolucao={s.evolucao ?? ""}
                  pending={salvarEvolucao.isPending}
                  onSave={(evolucao) => salvarEvolucao.mutate({ id: s.id, evolucao })}
                />
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="label-eyebrow">{rotulo}</dt>
      <dd className="mt-1 text-sm">{valor}</dd>
    </div>
  );
}

function EvolucaoItem({
  data,
  status,
  pagamento,
  evolucao,
  onSave,
  pending,
}: {
  id: string;
  data: string;
  status: string;
  pagamento: string;
  evolucao: string;
  onSave: (evolucao: string) => void;
  pending: boolean;
}) {
  const [texto, setTexto] = useState(evolucao);
  const alterado = texto !== evolucao;

  return (
    <div className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold">{data}</span>
        <Tag>{status}</Tag>
        <Tag tone={pagamentoTone(pagamento)}>{pagamento}</Tag>
      </div>
      <textarea
        rows={3}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Registre a nota de evolução desta sessão"
        className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
      />
      {alterado && (
        <button
          onClick={() => onSave(texto)}
          disabled={pending}
          className="mt-3 rounded bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground disabled:opacity-60"
        >
          Salvar evolução
        </button>
      )}
    </div>
  );
}
