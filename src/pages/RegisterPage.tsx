import { Label, TextInput } from "flowbite-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("ARTISTA");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      nome,
      email,
      senha,
      role
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

      if (body.token) localStorage.setItem('ocupaToken', body.token);
      if (body.user) localStorage.setItem('ocupaUser', JSON.stringify(body.user));

      if (role === 'ARTISTA') {
        setSuccess("Seu perfil será analisado pela curadoria do OCUPA antes de ficar público. Redirecionando...");
      } else {
        setSuccess("Cadastro realizado! Acesse o Painel para começar a contribuir. Redirecionando...");
      }

      setNome("");
      setEmail("");
      setSenha("");
      
      setTimeout(() => {
        onRegisterSuccess();
      }, 1500);
    } catch (err) {
      setError("Não foi possível conectar ao servidor");
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-white px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="w-full max-w-lg">
        <div className="border border-slate-900 dark:border-slate-600 rounded-sm p-6 sm:p-8 bg-white dark:bg-slate-900 space-y-6">
          <div className="text-center space-y-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-slate-900 dark:text-white">
              Criar Conta OCUPA
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Escolha seu perfil para interagir e fortalecer a rede periférica.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => setRole("ARTISTA")} 
              className={`p-4 border rounded-sm cursor-pointer transition-all ${role === "ARTISTA" ? "border-[#e76e3c] bg-[#e76e3c]/10 ring-1 ring-[#e76e3c]" : "border-slate-300 dark:border-slate-700 hover:border-[#e76e3c]"}`}
            >
              <h3 className="font-display text-xl uppercase text-slate-900 dark:text-white mb-1">🎨 Sou Artista</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Quero divulgar meu trabalho, criar meu portfólio e receber orçamentos</p>
            </div>
            <div 
              onClick={() => setRole("COLABORADOR")} 
              className={`p-4 border rounded-sm cursor-pointer transition-all ${role === "COLABORADOR" ? "border-[#e76e3c] bg-[#e76e3c]/10 ring-1 ring-[#e76e3c]" : "border-slate-300 dark:border-slate-700 hover:border-[#e76e3c]"}`}
            >
              <h3 className="font-display text-xl uppercase text-slate-900 dark:text-white mb-1">🤝 Sou Colaborador do Território</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Quero mapear espaços, sugerir eventos e oportunidades</p>
            </div>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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
              <div className="relative mt-1">
                <TextInput
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha de acesso"
                  value={senha}
                  onChange={(event) => setSenha(event.currentTarget.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                  title={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? (
                    /* Eye Off Icon */
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.962 8.962 0 012.122-.313c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                    </svg>
                  ) : (
                    /* Eye Icon */
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-100 border border-red-500 text-red-700 text-xs rounded-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-100 border border-emerald-500 text-emerald-700 text-xs rounded-sm">
                {success}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-xl tracking-wider uppercase rounded-sm py-2.5 transition-colors cursor-pointer text-center mt-2"
            >
              Finalizar Cadastro
            </button>
            
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 pt-2">
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-slate-900 dark:text-white hover:text-ocupa dark:hover:text-ocupa font-bold underline transition-colors cursor-pointer"
              >
                Entrar
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
