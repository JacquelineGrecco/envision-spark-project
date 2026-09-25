import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [{ title: "Redefinir senha — PsicoHub" }, { name: "robots", content: "noindex" }],
  }),
  component: RedefinirSenhaPage,
});

function RedefinirSenhaPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [pronto, setPronto] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setPronto(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPronto(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      toast.success("Senha atualizada. Você já pode continuar.");
      router.navigate({ to: "/painel" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar a senha");
    } finally {
      setCarregando(false);
    }
  };

  if (!pronto) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-medium">Link inválido ou expirado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Solicite um novo link de recuperação na tela de login.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-medium">Defina sua nova senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha uma nova senha para acessar sua conta.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block">
            <span className="label-eyebrow">Nova senha</span>
            <input
              type="password"
              value={senha}
              required
              minLength={6}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {carregando ? "Aguarde..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
