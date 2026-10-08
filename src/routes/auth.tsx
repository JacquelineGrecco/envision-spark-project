import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar no PsicoHub" },
      { name: "description", content: "Acesse a gestão do seu consultório psicológico." },
      { property: "og:title", content: "Entrar no PsicoHub" },
      {
        property: "og:description",
        content: "Acesse agenda, prontuários e financeiro do seu consultório.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [crp, setCrp] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.navigate({ to: "/painel" });
    });
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      if (modo === "criar") {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: { nome, crp },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Conta criada. Bem-vindo ao PsicoHub.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      }
      router.navigate({ to: "/painel" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível continuar");
    } finally {
      setCarregando(false);
    }
  };

  const recuperarSenha = async () => {
    if (!email) {
      toast.error("Informe seu e-mail para recuperar a senha");
      return;
    }
    setCarregando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      if (error) throw error;
      toast.success("Enviamos um link de recuperação para seu e-mail.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível enviar o e-mail de recuperação",
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded bg-primary">
            <div className="size-1.5 rounded-full bg-primary-foreground" />
          </div>
          <span className="font-medium tracking-tight">PsicoHub</span>
        </Link>

        <div className="rounded-xl bg-surface p-8 shadow-ring">
          <h1 className="text-xl font-medium">
            {modo === "entrar" ? "Entrar no consultório" : "Criar meu consultório"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {modo === "entrar"
              ? "Use o e-mail cadastrado para acessar sua agenda e prontuários."
              : "Leva menos de um minuto e seus dados ficam restritos à sua conta."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {modo === "criar" && (
              <>
                <Field label="Nome" value={nome} onChange={setNome} required />
                <Field label="CRP" value={crp} onChange={setCrp} placeholder="06/123456" />
              </>
            )}
            <Field label="E-mail" type="email" value={email} onChange={setEmail} required />
            <Field label="Senha" type="password" value={senha} onChange={setSenha} required />

            {modo === "entrar" && (
              <button
                type="button"
                onClick={recuperarSenha}
                className="block text-xs text-muted-foreground hover:underline"
              >
                Esqueci minha senha
              </button>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {carregando ? "Aguarde..." : modo === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <button
            onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")}
            className="mt-6 text-xs font-medium text-primary hover:underline"
          >
            {modo === "entrar" ? "Ainda não tenho conta" : "Já tenho conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label-eyebrow">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
