import { Button, Card, Label, TextInput } from "flowbite-react";
import { FormEvent, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onNavigateToRegister: () => void;
}

export default function LoginPage({ onLoginSuccess, onNavigateToRegister }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const body = await response.json();
      if (!response.ok) {
        setError(body.error || "Erro ao fazer login");
        return;
      }

      window.localStorage.setItem("ocupaUser", JSON.stringify(body));
      onLoginSuccess(body);
    } catch (err) {
      setError("Não foi possível conectar ao servidor");
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              Entrar no Ocupa
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Conecte-se e gerencie seus trabalhos culturais periféricos.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <TextInput
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="senha">Senha</Label>
              <TextInput
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(event) => setSenha(event.currentTarget.value)}
                required
              />
            </div>
            
            {error ? <p className="text-sm text-red-600 font-semibold">{error}</p> : null}
            
            <Button type="submit" color="indigo" className="mt-2">
              Entrar na Rede
            </Button>
            
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
              Ainda não tem conta?{" "}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-indigo-600 hover:underline font-medium dark:text-indigo-400"
              >
                Cadastrar-se
              </button>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
