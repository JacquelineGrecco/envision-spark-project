import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BellRing,
  Calendar,
  FileText,
  HeartHandshake,
  Receipt,
  ShieldCheck,
  Wallet,
} from "lucide-react";

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
    icone: Calendar,
    titulo: "Agenda clínica",
    texto: "Sessões recorrentes, confirmação e remarcação sem trocar dezenas de mensagens.",
  },
  {
    icone: FileText,
    titulo: "Prontuário eletrônico",
    texto: "Evolução por sessão, histórico completo e acesso restrito à sua conta.",
  },
  {
    icone: Wallet,
    titulo: "Fluxo de caixa",
    texto: "Status de cada sessão: pago, pendente ou atrasado, com totais do mês.",
  },
  {
    icone: Receipt,
    titulo: "Recibos automáticos",
    texto: "Gere recibos por sessão ou por período, prontos para enviar ao paciente.",
  },
  {
    icone: BellRing,
    titulo: "Lembretes de sessão",
    texto: "Reduza faltas com confirmações automáticas antes de cada atendimento.",
  },
  {
    icone: ShieldCheck,
    titulo: "Acesso restrito",
    texto: "Prontuários e dados financeiros visíveis só para você, com login individual.",
  },
];

const passos = [
  {
    numero: "01",
    titulo: "Crie sua conta",
    texto: "Leva menos de um minuto. Você já começa com agenda, prontuário e financeiro prontos.",
  },
  {
    numero: "02",
    titulo: "Cadastre seus pacientes",
    texto: "Frequência, modalidade e valor da sessão ficam salvos para cada paciente ativo.",
  },
  {
    numero: "03",
    titulo: "Acompanhe tudo em um painel",
    texto: "Sessões do dia, pendências financeiras e histórico clínico em um só lugar.",
  },
];

const perguntas = [
  {
    pergunta: "Meus dados e os dos meus pacientes estão seguros?",
    resposta:
      "Sim. Cada conta acessa apenas os próprios dados, com login individual e prontuários restritos a você.",
  },
  {
    pergunta: "Preciso instalar algum programa?",
    resposta: "Não. O PsicoHub funciona direto no navegador, no computador ou no celular.",
  },
  {
    pergunta: "Posso migrar os pacientes que já atendo hoje?",
    resposta:
      "Sim, o cadastro é simples e pode ser feito a qualquer momento, sem perder histórico.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded bg-primary">
              <div className="size-1.5 rounded-full bg-primary-foreground" />
            </div>
            <span className="font-medium tracking-tight">PsicoHub</span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#recursos" className="transition-colors hover:text-foreground">
              Recursos
            </a>
            <a href="#como-funciona" className="transition-colors hover:text-foreground">
              Como funciona
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              Perguntas frequentes
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="rounded px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent sm:px-4"
            >
              Entrar
            </Link>
            <Link
              to="/auth"
              className="hidden rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 sm:inline-flex"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-5xl gap-12 border-b border-border px-6 py-20 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <p className="label-eyebrow">Gestão de consultório psicológico</p>
            <h1 className="mt-4 max-w-[34ch] text-4xl font-medium leading-tight tracking-tight text-balance">
              Todo o seu consultório em um só lugar.
            </h1>
            <p className="mt-5 max-w-[46ch] text-muted-foreground">
              Psicólogos clínicos perdem horas por semana com recibos, planilhas e confirmações. O
              PsicoHub reúne agenda, prontuário e financeiro para devolver esse tempo ao
              atendimento.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 rounded bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
              >
                Criar meu consultório
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center rounded px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                Ver como funciona
              </a>
            </div>
          </div>

          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface shadow-ring"
            aria-hidden="true"
          >
            <div className="absolute -top-12 -right-12 size-48 rounded-full bg-accent" />
            <div className="absolute -bottom-20 -left-16 size-64 rounded-full bg-primary/10" />
            <div className="absolute right-12 bottom-12 size-24 rotate-6 rounded-2xl bg-muted" />
            <div className="absolute left-10 top-1/4 size-16 -rotate-6 rounded-xl bg-primary/15" />
            <div className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-primary shadow-ring">
              <HeartHandshake className="size-7 text-primary-foreground" />
            </div>
          </div>
        </section>

        <section id="recursos" className="mx-auto max-w-5xl border-b border-border px-6 py-20">
          <p className="label-eyebrow">Recursos</p>
          <h2 className="mt-3 max-w-[40ch] text-2xl font-medium tracking-tight text-balance">
            Feito para o dia a dia de quem atende.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recursos.map(({ icone: Icone, titulo, texto }) => (
              <div key={titulo} className="rounded-xl bg-surface p-6 shadow-ring">
                <Icone className="size-5 text-primary" />
                <h3 className="mt-4 text-sm font-medium">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {texto}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-5xl border-b border-border px-6 py-20">
          <p className="label-eyebrow">Como funciona</p>
          <h2 className="mt-3 max-w-[40ch] text-2xl font-medium tracking-tight text-balance">
            Três passos para organizar seu consultório.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {passos.map(({ numero, titulo, texto }) => (
              <div key={numero} className="rounded-xl bg-surface p-6 shadow-ring">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {numero}
                </div>
                <h3 className="mt-4 text-sm font-medium">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {texto}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-5xl border-b border-border px-6 py-20">
          <p className="label-eyebrow">Perguntas frequentes</p>
          <div className="mt-8 divide-y divide-border">
            {perguntas.map(({ pergunta, resposta }) => (
              <details key={pergunta} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                  {pergunta}
                  <span className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {resposta}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="text-2xl font-medium tracking-tight text-balance">
            Pronto para simplificar seu consultório?
          </h2>
          <p className="mx-auto mt-3 max-w-[46ch] text-sm text-muted-foreground">
            Crie sua conta e comece a organizar agenda, prontuário e financeiro hoje mesmo.
          </p>
          <div className="mt-6">
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Criar meu consultório
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <span>PsicoHub — gestão de consultório para psicólogos.</span>
          <span>Feito para psicólogos clínicos autônomos.</span>
        </div>
      </footer>
    </div>
  );
}
