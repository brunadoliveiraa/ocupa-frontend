import {
  Badge,
  DarkThemeToggle,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const ROUTE_TO_PATH: Record<string, string> = {
  home: "/",
  artistas: "/artistas",
  espacos: "/espacos",
  eventos: "/agenda",
  oportunidades: "/oportunidades",
  painel: "/painel",
  login: "/login",
  register: "/cadastrar",
  moderacao: "/moderacao",
};

function pathToRoute(pathname: string): string {
  const p = pathname.toLowerCase().replace(/\/+$/, "") || "/";
  for (const [route, path] of Object.entries(ROUTE_TO_PATH)) {
    if (p === path) return route;
  }
  return "home";
}
import ArtistasPage from "./pages/ArtistasPage";
import EspacosPage from "./pages/EspacosPage";
import EventosPage from "./pages/EventosPage";
import LoginPage from "./pages/LoginPage";
import OportunidadesPage from "./pages/OportunidadesPage";
import PainelPage from "./pages/PainelPage";
import RegisterPage from "./pages/RegisterPage";
import ModeracaoPage from "./pages/ModeracaoPage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('ocupaToken');
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...options, headers });
};

function EcossistemasTooltip() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        aria-expanded={isOpen}
        aria-describedby="tooltip-ecossistemas"
        className="font-bold text-ocupa underline decoration-dotted underline-offset-4 decoration-ocupa/80 hover:decoration-ocupa transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-ocupa rounded-xs inline bg-ocupa/10 px-1 py-0.5"
      >
        Ecossistemas Culturais
      </button>

      {isOpen && (
        <span
          id="tooltip-ecossistemas"
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-84 sm:w-[420px] p-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm rounded-sm shadow-xl border border-slate-900 dark:border-slate-600 z-50 text-left font-normal normal-case leading-relaxed block pointer-events-none transition-all"
        >
          {/* Top Badge & Header */}
          <span className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-2">
              <span className="bg-ocupa text-white text-xs font-display uppercase tracking-wider px-2 py-0.5 rounded">
                💡 Conceito
              </span>
              <strong className="font-display text-base tracking-wider uppercase text-ocupa">
                Ecossistema Cultural
              </strong>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">📍 Território</span>
          </span>

          {/* Main Definition Text */}
          <span className="block text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-3">
            <span className="block text-justify">
              <strong className="text-slate-900 dark:text-white font-semibold">Ecossistema cultural</strong> é um território — como um bairro, comunidade ou cidade — onde artistas, coletivos, espaços culturais, produtores, instituições e moradores se conectam para criar, compartilhar e fortalecer a cultura local.
            </span>

            {/* Visual Tags Grid */}
            <span className="grid grid-cols-2 gap-2 pt-1">
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded text-xs border border-slate-300 dark:border-slate-700">
                🎨 Artistas & Coletivos
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded text-xs border border-slate-300 dark:border-slate-700">
                🏛️ Espaços & Centros
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded text-xs border border-slate-300 dark:border-slate-700">
                🎬 Produtores & Eventos
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded text-xs border border-slate-300 dark:border-slate-700">
                🤝 Moradores & Rede
              </span>
            </span>
          </span>

          {/* Pointer Arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900 dark:border-t-slate-600" />
        </span>
      )}
    </span>
  );
}

export default function App() {
  const [route, setRoute] = useState(() => pathToRoute(window.location.pathname));

  const navigate = useCallback((r: string) => {
    setRoute(r);
    const path = ROUTE_TO_PATH[r] || "/";
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(pathToRoute(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const [user, setUser] = useState<any>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem("ocupaUser");
    return stored ? JSON.parse(stored) : null;
  });

  // Global counts for homepage stats
  const [stats, setStats] = useState({ artistas: 0, espacos: 0, eventos: 0, oportunidades: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`${API_URL}/api/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            artistas: data.artistas || 0,
            espacos: data.espacos || 0,
            eventos: data.eventos || 0,
            oportunidades: data.oportunidades || 0
          });
        }
      } catch (err) {
        console.error("Erro ao buscar estatísticas do ecossistema:", err);
      }
    }
    fetchStats();
  }, []);

  const content = useMemo(() => {
    switch (route) {
      case "artistas":
        return <ArtistasPage user={user} />;
      case "espacos":
        return <EspacosPage user={user} />;
      case "eventos":
        return <EventosPage user={user} />;
      case "oportunidades":
        return <OportunidadesPage user={user} />;
      case "painel":
        return <PainelPage user={user} />;
      case "moderacao":
        return user?.role === 'ADMIN' ? <ModeracaoPage user={user} authFetch={authFetch} /> : <main>Acesso negado</main>;
      case "login":
        return (
          <LoginPage
            onLoginSuccess={(response) => {
              window.localStorage.setItem('ocupaToken', response.token);
              window.localStorage.setItem('ocupaUser', JSON.stringify(response.user));
              setUser(response.user);
              navigate("painel");
            }}
            onNavigateToRegister={() => navigate("register")}
          />
        );
      case "register":
        return (
          <RegisterPage
            onRegisterSuccess={() => navigate("login")}
            onNavigateToLogin={() => navigate("login")}
          />
        );
      default:
        return (
          <main>
            {/* ═══════ HERO BANNER ═══════ */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
              <section className="relative w-full h-[380px] sm:h-[460px] overflow-hidden rounded-md grain-overlay">
                <img
                  src="/topo.jpeg"
                  alt="Arte urbana periférica"
                  className="absolute inset-0 w-full h-full"
                />
              </section>
            </div>

            {/* ═══════ SEÇÃO UNIFICADA EM 2 COLUNAS (ALINHAMENTO PERFEITO) ═══════ */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-28 relative z-10">
              <div className="grid gap-8 lg:grid-cols-[auto_1fr] items-start">
                
                {/* ═══════ COLUNA DA ESQUERDA ═══════ */}
                <div className="space-y-12">
                  {/* Bloco Topo: Card (com margens iguais no XS) + IMPACTO (oculto no XS) */}
                  <div className="flex items-start gap-3 sm:gap-4 mx-6 sm:mx-0 sm:ml-14 lg:ml-12 flex-shrink-0">
                    <div className="w-full sm:w-[380px] lg:w-[390px] bg-white dark:bg-slate-900 border border-slate-900 dark:border-slate-600 rounded-sm p-4 sm:p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="font-display text-xl sm:text-2xl tracking-wider uppercase text-slate-900 dark:text-white">
                          Ativos do Ecossistema
                        </h2>
                        <Badge color="failure" className="font-body text-xs uppercase tracking-wider">Ao Vivo</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                        Acompanhe aqui em tempo real o impacto do <span className="font-display text-ocupa">OCUPA</span>. Ao fortalecer as redes culturais locais, potencializamos oportunidades econômicas e a redução de desigualdades (ODS 8 e 10).
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { label: "Artistas", value: stats.artistas, target: "artistas" },
                          { label: "Espaços Mapeados", value: stats.espacos, target: "espacos" },
                          { label: "Eventos na Agenda", value: stats.eventos, target: "eventos" },
                          { label: "Oportunidades", value: stats.oportunidades, target: "oportunidades" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            onClick={() => navigate(item.target)}
                            className="border border-slate-900 dark:border-slate-600 rounded-sm p-2.5 cursor-pointer hover:border-ocupa dark:hover:border-ocupa transition-colors group bg-slate-50/50 dark:bg-slate-800/30"
                          >
                            <p className="text-[11px] font-body text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.label}</p>
                            <p className="text-2xl sm:text-3xl font-display text-ocupa">+{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* IMPACTO vertical text: Oculto no XS (hidden sm:block) para evitar quebra de layout */}
                    <div className="hidden sm:block pt-28 sm:pt-32 flex-shrink-0">
                      <span className="vertical-text font-display text-4xl sm:text-5xl tracking-[0.25em] text-slate-900 dark:text-white select-none whitespace-nowrap">
                        IMPACTO
                      </span>
                    </div>
                  </div>

                  {/* Bloco Inferior: Plataforma + CTAs + Como Funciona (Assume 100% de largura abaixo de lg, e lg:w-[390px] no desktop) */}
                  <div className="px-6 sm:px-14 lg:px-0 lg:ml-12 w-full lg:w-[390px] space-y-8">
                    {/* Descrição */}
                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                      Plataforma feita para <strong className="text-slate-900 dark:text-white font-bold">artistas, coletivos</strong> e <strong className="text-slate-900 dark:text-white font-bold">espaços periféricos</strong>. Um espaço para descobrir talentos, ocupar territórios, fortalecer conexões e ampliar oportunidades culturais.
                    </p>

                    {/* CTAs */}
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => navigate("register")}
                          className="cursor-pointer font-display text-xl tracking-widest uppercase text-blue-900 dark:text-blue-400 hover:text-ocupa transition-colors"
                        >
                          Cadastre-se
                        </button>
                        <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-slate-400" />
                        <button
                          onClick={() => navigate("artistas")}
                          className="cursor-pointer font-display text-xl tracking-widest uppercase text-blue-900 dark:text-blue-400 hover:text-ocupa transition-colors"
                        >
                          Contrate
                        </button>
                        <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-slate-400" />
                        <button
                          onClick={() => navigate("espacos")}
                          className="cursor-pointer font-display text-xl tracking-widest uppercase text-blue-900 dark:text-blue-400 hover:text-ocupa transition-colors"
                        >
                          Conheça Espaços
                        </button>
                      </div>
                      <hr className="border-slate-300 dark:border-slate-700" />
                    </div>

                    {/* Como Funciona */}
                    <div className="space-y-6 pt-2">
                      <div className="space-y-1">
                        <span className="font-display text-base tracking-[0.3em] uppercase text-blue-900 dark:text-blue-400">
                          Como Funciona?
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                          O que você encontra no <span className="font-display text-ocupa">OCUPA</span>
                        </h2>
                        <p className="text-sm font-semibold text-blue-900/80 dark:text-blue-300/80 text-justify">
                          Tudo o que movimenta a cultura periférica em um único lugar.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {[
                          {
                            title: "Artistas e Serviços",
                            desc: "Veja portfólios, contatos e solicite orçamentos.",
                            action: () => navigate("artistas"),
                          },
                          {
                            title: "Espaços Disponíveis",
                            desc: "Encontre praças, galerias, muros e muitos outros lugares.",
                            action: () => navigate("espacos"),
                          },
                          {
                            title: "Agenda Cultural",
                            desc: "Acompanhe e cadastre batalhas de rima, mostras de dança e intervenções urbanas.",
                            action: () => navigate("eventos"),
                          },
                          {
                            title: "Oportunidades",
                            desc: "Consulte editais de fomento, bolsas, chamadas residências e vagas.",
                            action: () => navigate("oportunidades"),
                          },
                        ].map((item) => (
                          <div
                            key={item.title}
                            onClick={item.action}
                            className="border border-slate-900 dark:border-slate-600 rounded-sm p-4 hover:border-ocupa hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-slate-900"
                          >
                            <h3 className="font-display text-xl tracking-wider uppercase text-ocupa group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                              {item.title}
                            </h3>
                            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                              {item.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ═══════ COLUNA DA DIREITA (QUEM SOMOS + O QUE QUEREMOS NO MESMO CONTAINER) ═══════ */}
                <div className="space-y-16 w-full px-6 sm:px-14 lg:px-12 pt-6 lg:pt-32">
                  
                  {/* QUEM SOMOS */}
                  <div className="space-y-4">
                    <h2 className="font-display text-4xl lg:text-5xl tracking-wider uppercase leading-tight text-slate-900 dark:text-white">
                      Quem Somos
                    </h2>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base text-justify">
                      Uma <span className="text-ocupa font-bold">Plataforma de Gestão de </span>
                      <EcossistemasTooltip />
                    </p>
                    <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                      Reunimos várias funcionalidades (que hoje estão dispersas em diferentes sistemas) para facilitar a produção, organização e divulgação da arte. Aqui você encontra ferramentas de orçamento, mensagens, divulgação de oportunidades, lista de espaços para intervenções artísticas, agenda de eventos, portfólio profissional e painel do artista com registro de acessos, contatos, propostas de trabalho, participações em eventos e muito mais.
                    </p>
                    <hr className="border-slate-300 dark:border-slate-700 mt-4" />
                  </div>

                  {/* O QUE QUEREMOS (Dentro da mesma coluna da direita: alinhamento 100% automático!) */}
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-6 w-full">
                      {/* Imagem + Texto Vertical "O QUE QUEREMOS" */}
                      <div className="flex items-start gap-3 sm:gap-4 flex-shrink-0">
                        <div className="relative rounded-sm overflow-hidden grain-overlay h-[260px] sm:h-[300px] lg:h-[360px] w-[170px] sm:w-[200px] lg:w-[260px] flex-shrink-0">
                          <img
                            src="/o_que_queremos.jpeg"
                            alt="O que queremos"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="vertical-text font-display text-2xl sm:text-3xl lg:text-4xl tracking-[0.25em] text-slate-900 dark:text-white select-none whitespace-nowrap pt-2">
                          O QUE QUEREMOS
                        </span>
                      </div>

                      {/* Textos sobre missão */}
                      <div className="space-y-4 flex-1 w-full max-w-full">
                        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                          Nosso <strong className="text-slate-900 dark:text-white font-bold">objetivo</strong> é fortalecer ecossistemas culturais para que eles produzam oportunidades, reforcem sua cultura local, ampliem a geração de renda e valorizem a memória do território.
                        </p>

                        <div className="space-y-1.5 pt-1">
                          <p className="font-display text-base sm:text-lg tracking-wider uppercase text-slate-900 dark:text-white">
                            E como fazemos isso?
                          </p>
                          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                            O <strong className="font-bold text-ocupa">OCUPA</strong> cria a infraestrutura digital que integra e divulga artistas, espaços, eventos e oportunidades, estimulando o{" "}
                            <strong className="text-slate-900 dark:text-white font-bold">crescimento da economia criativa</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </section>
          </main>
        );
    }
  }, [route, stats, user, navigate]);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      <div>
        {/* ═══════ NAVBAR ═══════ */}
        <Navbar fluid rounded className="border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95 sticky top-0 z-[5000] backdrop-blur-md px-0 py-2">
          <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between">
            <NavbarBrand href="#" onClick={() => navigate("home")} className="py-1">
              <img
                src="/logo_ocupa.svg"
                alt="OCUPA - O território fala o Ocupa conecta"
                className="h-14 sm:h-16 w-auto object-contain block dark:hidden"
              />
              <img
                src="/logo_ocupa_branco.svg"
                alt="OCUPA - O território fala o Ocupa conecta"
                className="h-14 sm:h-16 w-auto object-contain hidden dark:block"
              />
            </NavbarBrand>
            
            <div className="flex items-center gap-4 md:order-2">
              <DarkThemeToggle />
              {user ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("painel")}
                    className={`font-display text-base sm:text-lg tracking-widest uppercase transition-colors cursor-pointer ${
                      route === "painel" ? "text-ocupa font-bold" : "text-slate-900 dark:text-white hover:text-ocupa"
                    }`}
                  >
                    Painel
                  </button>
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => navigate("moderacao")}
                      className={`font-display text-base sm:text-lg tracking-widest uppercase transition-colors cursor-pointer flex items-center gap-2 ${
                        route === "moderacao" ? "text-ocupa font-bold" : "text-slate-900 dark:text-white hover:text-ocupa"
                      }`}
                    >
                      Moderação
                    </button>
                  )}
                  <button
                    onClick={() => {
                      window.localStorage.removeItem("ocupaToken");
                      window.localStorage.removeItem("ocupaUser");
                      setUser(null);
                      navigate("home");
                    }}
                    className="font-display text-base sm:text-lg tracking-widest uppercase text-slate-500 hover:text-ocupa transition-colors cursor-pointer"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("login")}
                    className={`font-display text-base sm:text-lg tracking-widest uppercase transition-colors cursor-pointer ${
                      route === "login" ? "text-ocupa font-bold" : "text-slate-900 dark:text-white hover:text-ocupa"
                    }`}
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => navigate("register")}
                    className={`font-display text-base sm:text-lg tracking-widest uppercase transition-colors cursor-pointer ${
                      route === "register" ? "text-ocupa font-bold" : "text-slate-900 dark:text-white hover:text-ocupa"
                    }`}
                  >
                    Cadastrar
                  </button>
                </div>
              )}
              <NavbarToggle />
            </div>

            <NavbarCollapse>
              <NavbarLink active={route === "home"} onClick={() => navigate("home")} className="cursor-pointer font-display tracking-widest uppercase text-base sm:text-lg hover:text-ocupa">
                Home
              </NavbarLink>
              <NavbarLink active={route === "artistas"} onClick={() => navigate("artistas")} className="cursor-pointer font-display tracking-widest uppercase text-base sm:text-lg hover:text-ocupa">
                Artistas
              </NavbarLink>
              <NavbarLink active={route === "espacos"} onClick={() => navigate("espacos")} className="cursor-pointer font-display tracking-widest uppercase text-base sm:text-lg hover:text-ocupa">
                Espaços
              </NavbarLink>
              <NavbarLink active={route === "eventos"} onClick={() => navigate("eventos")} className="cursor-pointer font-display tracking-widest uppercase text-base sm:text-lg hover:text-ocupa">
                Agenda
              </NavbarLink>
              <NavbarLink active={route === "oportunidades"} onClick={() => navigate("oportunidades")} className="cursor-pointer font-display tracking-widest uppercase text-base sm:text-lg hover:text-ocupa">
                Oportunidades
              </NavbarLink>
            </NavbarCollapse>
          </div>
        </Navbar>
        
        {content}
      </div>

      {/* ═══════ FOOTER: PAREDE GRAFITADA SANGRAMENTO SEM BORDA ═══════ */}
      <footer className="border-t border-slate-200 dark:border-slate-800 relative overflow-hidden bg-white dark:bg-slate-950 mt-16 pt-10 pb-6">
        {/* Parede grafitada de fundo no lado esquerdo */}
        <div className="absolute left-0 top-0 bottom-0 w-full md:w-[30%] h-full overflow-hidden grain-overlay pointer-events-none opacity-40 md:opacity-80">
          <img
            src="/footer.jpeg"
            alt="Parede grafitada"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white dark:to-slate-950" />
        </div>

        {/* Conteúdo posicionado à direita da imagem */}
        <div className="w-full pl-4 md:pl-[32%] pr-6 sm:pr-10 lg:pr-12 relative z-10">
          <div className="flex flex-wrap justify-between items-start gap-6 lg:gap-6 w-full">
            
            {/* Coluna 1: Logo OCUPA */}
            <div className="space-y-2 max-w-[200px]">
              <img
                src="/logo_ocupa.svg"
                alt="OCUPA"
                className="h-14 sm:h-16 lg:h-20 w-auto object-contain block dark:hidden cursor-pointer"
                onClick={() => navigate("home")}
              />
              <img
                src="/logo_ocupa_branco.svg"
                alt="OCUPA"
                className="h-14 sm:h-16 lg:h-20 w-auto object-contain hidden dark:block cursor-pointer"
                onClick={() => setRoute("home")}
              />
            </div>

            {/* Coluna 2: CATÁLOGOS */}
            <div className="space-y-3">
              <h3 className="font-display text-lg tracking-wider uppercase text-slate-900 dark:text-white">
                Catálogos
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => navigate("artistas")}
                    className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-ocupa dark:hover:text-ocupa transition-colors whitespace-nowrap font-medium"
                  >
                    Artistas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("espacos")}
                    className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-ocupa dark:hover:text-ocupa transition-colors whitespace-nowrap font-medium"
                  >
                    Espaços
                  </button>
                </li>
              </ul>
            </div>

            {/* Coluna 3: NOVIDADES */}
            <div className="space-y-3">
              <h3 className="font-display text-lg tracking-wider uppercase text-slate-900 dark:text-white">
                Novidades
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => navigate("eventos")}
                    className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-ocupa dark:hover:text-ocupa transition-colors whitespace-nowrap font-medium"
                  >
                    Agenda
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("oportunidades")}
                    className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-ocupa dark:hover:text-ocupa transition-colors whitespace-nowrap font-medium"
                  >
                    Oportunidades
                  </button>
                </li>
              </ul>
            </div>

            {/* Coluna 4: CONTATO */}
            <div className="space-y-3">
              <h3 className="font-display text-lg tracking-wider uppercase text-slate-900 dark:text-white">
                Contato
              </h3>
              <div className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <a href="mailto:contato@ocupa.cultura.br" className="flex items-center gap-2.5 hover:text-ocupa transition-colors">
                  <svg className="w-4 h-4 text-ocupa flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>contato@ocupa.cultura.br</span>
                </a>
                <a href="tel:21999999999" className="flex items-center gap-2.5 hover:text-ocupa transition-colors">
                  <svg className="w-4 h-4 text-ocupa flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>(21) 99999-9999</span>
                </a>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-ocupa flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Rio de Janeiro, RJ</span>
                </div>
              </div>
            </div>

            {/* Coluna 5: FIQUE POR DENTRO */}
            <div className="space-y-3 max-w-xs">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-ocupa flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="font-display text-lg tracking-wider uppercase text-slate-900 dark:text-white">
                  Fique por Dentro
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Receba novidades, oportunidades e conteúdos sobre cultura e território.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); alert("Obrigado por se inscrever!"); }} className="flex items-center pt-1">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  required
                  className="w-full bg-white dark:bg-slate-900 border border-slate-900 dark:border-slate-700 rounded-l-sm px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-ocupa placeholder-slate-400"
                />
                <button
                  type="submit"
                  aria-label="Inscrever-se"
                  className="bg-[#e76e3c] hover:bg-[#d65d2b] text-white px-4 py-2 rounded-r-sm transition-colors cursor-pointer flex items-center justify-center border border-l-0 border-[#e76e3c]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}
