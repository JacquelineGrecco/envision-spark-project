import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel, Tag } from "@/components/AppShell";
import {
  brl,
  frequencias,
  modalidades,
  patientsQuery,
  savePatient,
  sessionsQuery,
  type Patient,
} from "@/lib/psicohub";

export const Route = createFileRoute("/_authenticated/pacientes")({
  head: () => ({
    meta: [
      { title: "Pacientes | PsicoHub" },
      { name: "description", content: "Cadastro de pacientes, frequência, valores e prontuários." },
      { property: "og:title", content: "Pacientes | PsicoHub" },
      { property: "og:description", content: "Cadastro clínico e prontuário eletrônico." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pacientes,
});

function Pacientes() {
  const qc = useQueryClient();
  const { data: patients = [], isLoading } = useQuery(patientsQuery);
  const { data: sessions = [] } = useQuery(sessionsQuery);
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");

  const criar = useMutation({
    mutationFn: savePatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      setAberto(false);
      toast.success("Paciente cadastrado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtrados = patients.filter((p) =>
    p.nome.toLowerCase().includes(busca.trim().toLowerCase()),
  );

  const contagem = (id: string) =>
    sessions.filter((s) => s.patient_id === id && s.status === "realizada").length;

  return (
    <AppShell
      title="Pacientes"
      subtitle="Cada ficha reúne contato, frequência combinada, valor e histórico de evolução."
      actions={
        <button
          onClick={() => setAberto((v) => !v)}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          {aberto ? "Fechar" : "Novo paciente"}
        </button>
      }
    >
      {aberto && (
        <div className="mb-8">
          <PatientForm onSubmit={(v) => criar.mutate(v)} pending={criar.isPending} />
        </div>
      )}

      <div className="mb-4">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome"
          className="w-full max-w-sm rounded border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <Panel title={`${filtrados.length} paciente(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="label-eyebrow px-5 py-3">Paciente</th>
                <th className="label-eyebrow px-5 py-3">Frequência</th>
                <th className="label-eyebrow px-5 py-3">Modalidade</th>
                <th className="label-eyebrow px-5 py-3">Valor</th>
                <th className="label-eyebrow px-5 py-3">Sessões</th>
                <th className="label-eyebrow px-5 py-3 text-right">Prontuário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-sm text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              )}
              {!isLoading && filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-sm text-muted-foreground">
                    Nenhum paciente cadastrado ainda.
                  </td>
                </tr>
              )}
              {filtrados.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium">{p.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.email || p.telefone || "sem contato"}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Tag tone={p.ativo ? "success" : "neutral"}>
                      {p.ativo ? p.frequencia : "inativo"}
                    </Tag>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{p.modalidade}</td>
                  <td className="px-5 py-4 text-xs">{brl(Number(p.valor_sessao))}</td>
                  <td className="px-5 py-4 text-xs">{contagem(p.id)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to="/pacientes/$patientId"
                      params={{ patientId: p.id }}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      Abrir
                    </Link>
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

export function PatientForm({
  onSubmit,
  pending,
  initial,
}: {
  onSubmit: (values: Parameters<typeof savePatient>[0]) => void;
  pending: boolean;
  initial?: Patient;
}) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [telefone, setTelefone] = useState(initial?.telefone ?? "");
  const [frequencia, setFrequencia] = useState<Patient["frequencia"]>(
    initial?.frequencia ?? "semanal",
  );
  const [modalidade, setModalidade] = useState<Patient["modalidade"]>(
    initial?.modalidade ?? "presencial",
  );
  const [valor, setValor] = useState(Number(initial?.valor_sessao ?? 200));
  const [ativo, setAtivo] = useState(initial?.ativo ?? true);
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...(initial ? { id: initial.id } : {}),
          nome,
          email: email || null,
          telefone: telefone || null,
          frequencia,
          modalidade,
          valor_sessao: valor,
          ativo,
          observacoes: observacoes || null,
        });
      }}
      className="grid grid-cols-1 gap-4 rounded-xl bg-surface p-5 shadow-ring md:grid-cols-3"
    >
      <label className="block">
        <span className="label-eyebrow">Nome</span>
        <input
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="label-eyebrow">E-mail</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="label-eyebrow">Telefone</span>
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="label-eyebrow">Frequência</span>
        <select
          value={frequencia}
          onChange={(e) => setFrequencia(e.target.value as Patient["frequencia"])}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        >
          {frequencias.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label-eyebrow">Modalidade</span>
        <select
          value={modalidade}
          onChange={(e) => setModalidade(e.target.value as Patient["modalidade"])}
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
        <span className="label-eyebrow">Valor da sessão (R$)</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="block md:col-span-2">
        <span className="label-eyebrow">Observações clínicas</span>
        <textarea
          rows={3}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <div className="flex flex-col justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
          Paciente em acompanhamento ativo
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar paciente"}
        </button>
      </div>
    </form>
  );
}
