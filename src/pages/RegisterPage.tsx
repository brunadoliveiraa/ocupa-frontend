import { Button, Card, Label, TextInput } from "flowbite-react";
import { FormEvent, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export default function RegisterPage({ onRegisterSuccess, onNavigateToLogin }: RegisterPageProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [categoria, setCategoria] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Todo cadastrado no Ocupa é Artista/Empreendedor periférico
    const payload = {
      nome,
      email,
      senha,
      role: "ARTISTA",
      categoria
    };

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json();
      if (!response.ok) {
        setError(body.error || "Erro ao cadastrar");
        return;
      }

      setSuccess("Cadastro realizado com sucesso! Redirecionando para login...");
      setNome("");
      setEmail("");
      setSenha("");
      setCategoria("");
      
      setTimeout(() => {
        onRegisterSuccess();
      }, 1500);
    } catch (err) {
      setError("Não foi possível conectar ao servidor");
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="w-full max-w-lg">
        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              Criar Conta Ocupa
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Cadastre seu perfil de artista e comece a empreender na rede periférica.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="nome">Nome Artístico / Coletivo</Label>
              <TextInput
                id="nome"
                placeholder="Ex: Mariana Muralista"
                value={nome}
                onChange={(event) => setNome(event.currentTarget.value)}
                required
              />
            </div>
            
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
                placeholder="Sua senha de acesso"
                value={senha}
                onChange={(event) => setSenha(event.currentTarget.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="categoria">Sua Categoria de Atuação Principal</Label>
              <TextInput
                id="categoria"
                placeholder="Ex: Grafite, Rap, Produção, DJ, Teatro..."
                value={categoria}
                onChange={(event) => setCategoria(event.currentTarget.value)}
                required
              />
            </div>
            
            {error ? <p className="text-sm text-red-600 font-semibold">{error}</p> : null}
            {success ? <p className="text-sm text-green-600 font-semibold">{success}</p> : null}
            
            <Button type="submit" color="indigo" className="mt-2">
              Finalizar Cadastro
            </Button>
            
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-indigo-600 hover:underline font-medium dark:text-indigo-400"
              >
                Entrar
              </button>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
