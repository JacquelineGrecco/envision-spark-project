import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PsicoHub — todo o seu consultório em um só lugar" },
      {
        name: "description",
        content:
          "Agenda, prontuário eletrônico, cobranças e recibos em uma plataforma feita para psicólogos clínicos autônomos.",
      },
      { property: "og:title", content: "PsicoHub — gestão de consultório para psicólogos" },
      {
        property: "og:description",
        content:
          "Menos segundo turno administrativo: agenda, prontuário e financeiro do consultório em um só lugar.",
      },
    ],
  }),
  component: Landing,
});

const recursos = [
  {
    titulo: "Agenda clínica",
    texto: "Sessões recorrentes, confirmação e remarcação sem trocar dezenas de mensagens.",
  },
  {
    titulo: "Prontuário eletrônico",
    texto: "Evolução por sessão, histórico completo e acesso restrito à sua conta.",
  },
  {
    titulo: "Fluxo de caixa",
    texto: "Status de cada sessão: pago, pendente ou atrasado, com totais do mês.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded bg-primary">
            <div className="size-1.5 rounded-full bg-primary-foreground" />
          </div>
          <span className="font-medium tracking-tight">PsicoHub</span>
        </div>
        <Link
          to="/auth"
          className="rounded px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent"
        >
          Entrar
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        <section className="border-b border-border py-20">
          <p className="label-eyebrow">Gestão de consultório psicológico</p>
          <h1 className="mt-4 max-w-[34ch] text-4xl font-medium leading-tight tracking-tight text-balance">
            Todo o seu consultório em um só lugar.
          </h1>
          <p className="mt-5 max-w-[58ch] text-muted-foreground">
            Psicólogos clínicos perdem horas por semana com recibos, planilhas e confirmações. O
            PsicoHub reúne agenda, prontuário e financeiro para devolver esse tempo ao atendimento.
          </p>
          <div className="mt-8">
            <Link
              to="/auth"
              className="inline-flex items-center rounded bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Criar meu consultório
            </Link>
          </div>
        </section>

        <section className="grid gap-4 py-16 md:grid-cols-3">
          {recursos.map((r) => (
            <div key={r.titulo} className="rounded-xl bg-surface p-6 shadow-ring">
              <h2 className="text-sm font-medium">{r.titulo}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {r.texto}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
