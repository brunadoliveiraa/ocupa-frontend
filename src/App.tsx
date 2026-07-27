import {
  Badge,
  Button,
  Card,
  DarkThemeToggle,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import ArtistasPage from "./pages/ArtistasPage";
import EspacosPage from "./pages/EspacosPage";
import EventosPage from "./pages/EventosPage";
import LoginPage from "./pages/LoginPage";
import OportunidadesPage from "./pages/OportunidadesPage";
import PainelPage from "./pages/PainelPage";
import RegisterPage from "./pages/RegisterPage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function App() {
  const [route, setRoute] = useState("home");
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
        const [rArtistas, rEspacos, rEventos, rOportunidades] = await Promise.all([
          fetch(`${API_URL}/api/artistas`),
          fetch(`${API_URL}/api/espacos`),
          fetch(`${API_URL}/api/eventos`),
          fetch(`${API_URL}/api/oportunidades`),
        ]);
        
        const countArtistas = rArtistas.ok ? (await rArtistas.json()).length : 0;
        const countEspacos = rEspacos.ok ? (await rEspacos.json()).length : 0;
        const countEventos = rEventos.ok ? (await rEventos.json()).length : 0;
        const countOportunidades = rOportunidades.ok ? (await rOportunidades.json()).length : 0;
        
        setStats({
          artistas: countArtistas,
          espacos: countEspacos,
          eventos: countEventos,
          oportunidades: countOportunidades
        });
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
      case "login":
        return (
          <LoginPage
            onLoginSuccess={(u) => {
              setUser(u);
              setRoute("painel");
            }}
            onNavigateToRegister={() => setRoute("register")}
          />
        );
      case "register":
        return (
          <RegisterPage
            onRegisterSuccess={() => setRoute("login")}
            onNavigateToLogin={() => setRoute("login")}
          />
        );
      default:
        return (
          <main>
            {/* ═══════ HERO BANNER ═══════ */}
            <section className="relative w-full h-[420px] sm:h-[500px] overflow-hidden grain-overlay">
              <img
                src="/hero_banner.jpg"
                alt="Arte urbana periférica"
                className="absolute inset-0 w-full h-full object-cover grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-orange-700/60 via-orange-600/40 to-orange-900/70 mix-blend-multiply" />
            </section>

            {/* ═══════ STATS + QUEM SOMOS ═══════ */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.05fr_0.85fr] items-start">
                {/* Stats Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl tracking-wider uppercase text-slate-900 dark:text-white">
                      Ativos do Ecossistema
                    </h2>
                    <Badge color="failure" className="font-body text-xs uppercase tracking-wider">Ao Vivo</Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Acompanhe aqui em tempo real o impacto do Ocupa. Ao fortalecer as redes culturais locais, potencializamos oportunidades econômicas e a redução de desigualdades (ODS 8 e 10).
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Artistas", value: stats.artistas },
                      { label: "Espaços Mapeados", value: stats.espacos },
                      { label: "Eventos na Agenda", value: stats.eventos },
                      { label: "Oportunidades", value: stats.oportunidades },
                    ].map((item) => (
                      <div key={item.label} className="border border-slate-200 dark:border-slate-700 rounded-sm p-3">
                        <p className="text-xs font-body text-slate-500 dark:text-slate-400">{item.label}</p>
                        <p className="text-3xl font-display text-orange-600 dark:text-orange-500">+{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* IMPACTO vertical text */}
                <div className="hidden lg:flex items-center justify-center">
                  <span className="vertical-text font-display text-5xl tracking-[0.3em] text-slate-300 dark:text-slate-700 select-none">
                    IMPACTO
                  </span>
                </div>

                {/* Quem Somos */}
                <div className="space-y-4 pt-4 lg:pt-36">
                  <h2 className="font-display text-4xl lg:text-5xl tracking-wider uppercase leading-tight text-slate-900 dark:text-white">
                    Quem Somos
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Uma <strong className="text-orange-600 dark:text-orange-500">Plataforma de Gestão de Ecossistemas Culturais</strong>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Reunimos várias funcionalidades (que hoje estão dispersas em diferentes sistemas) para facilitar a produção, organização e divulgação da arte.
                  </p>
                </div>
              </div>
            </section>

            {/* ═══════ PLATAFORMA + CTAs ═══════ */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 space-y-8">
              <div>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Plataforma feita para <strong className="text-slate-900 dark:text-white">artistas, coletivos</strong> e <strong className="text-slate-900 dark:text-white">espaços periféricos</strong>. Um espaço para descobrir talentos, ocupar territórios, fortalecer conexões e ampliar oportunidades culturais.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <button
                  onClick={() => setRoute("register")}
                  className="font-display text-lg tracking-widest uppercase text-blue-900 dark:text-blue-400 hover:text-orange-600 dark:hover:text-orange-500 transition-colors underline underline-offset-4"
                >
                  Cadastre-se
                </button>
                <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-slate-400" />
                <button
                  onClick={() => setRoute("artistas")}
                  className="font-display text-lg tracking-widest uppercase text-blue-900 dark:text-blue-400 hover:text-orange-600 dark:hover:text-orange-500 transition-colors underline underline-offset-4"
                >
                  Contrate
                </button>
                <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-slate-400" />
                <button
                  onClick={() => setRoute("espacos")}
                  className="font-display text-lg tracking-widest uppercase text-blue-900 dark:text-blue-400 hover:text-orange-600 dark:hover:text-orange-500 transition-colors underline underline-offset-4"
                >
                  Conheça Espaços
                </button>
              </div>
            </section>

            {/* ═══════ COMO FUNCIONA ═══════ */}
            <section className="border-t border-slate-200 dark:border-slate-800">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 space-y-8">
                <div className="space-y-2">
                  <span className="font-display text-sm tracking-[0.3em] uppercase text-orange-600 dark:text-orange-500">
                    Como Funciona?
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    O que você encontra no{" "}
                    <span className="text-orange-600 dark:text-orange-500">Ocupa</span>
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg">
                    Tudo o que movimenta a cultura periférica em um único lugar.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      title: "Artistas e Serviços",
                      desc: "Veja portfólios, contatos e solicite orçamentos.",
                      action: () => setRoute("artistas"),
                    },
                    {
                      title: "Espaços Disponíveis",
                      desc: "Encontre praças, galerias, muros e muitos outros lugares.",
                      action: () => setRoute("espacos"),
                    },
                    {
                      title: "Agenda Cultural",
                      desc: "Acompanhe e cadastre batalhas de rima, mostras de dança e intervenções urbanas.",
                      action: () => setRoute("eventos"),
                    },
                    {
                      title: "Oportunidades",
                      desc: "Consulte editais de fomento, bolsas, chamadas residências e vagas.",
                      action: () => setRoute("oportunidades"),
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      onClick={item.action}
                      className="border border-slate-200 dark:border-slate-700 rounded-sm p-5 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <h3 className="font-display text-xl tracking-wider uppercase text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════ O QUE QUEREMOS ═══════ */}
            <section className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid gap-8 lg:grid-cols-[1fr_0.05fr_1fr] items-start">
                  {/* Photo */}
                  <div className="relative rounded-sm overflow-hidden grain-overlay h-[400px]">
                    <img
                      src="/mission_photo.jpg"
                      alt="Artista criando mural"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* O QUE QUEREMOS vertical text */}
                  <div className="hidden lg:flex items-center justify-center">
                    <span className="vertical-text font-display text-4xl tracking-[0.3em] text-slate-300 dark:text-slate-700 select-none whitespace-nowrap">
                      O QUE QUEREMOS
                    </span>
                  </div>

                  {/* Mission text */}
                  <div className="space-y-6">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      Nosso <strong className="text-slate-900 dark:text-white">objetivo</strong> é fortalecer ecossistemas culturais para que eles produzam oportunidades, reforcem sua cultura local, ampliem a geração de renda e valorizem a memória do território.
                    </p>

                    <div className="space-y-2">
                      <p className="font-display text-xl tracking-wider uppercase text-slate-900 dark:text-white">
                        E como fazemos isso?
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        O <strong className="text-orange-600 dark:text-orange-500">OCUPA</strong> cria a infraestrutura digital que integra e divulga artistas, espaços, eventos e oportunidades, estimulando o{" "}
                        <strong className="text-slate-900 dark:text-white">crescimento da economia criativa</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        );
    }
  }, [route, stats, user]);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      <div>
        {/* ═══════ NAVBAR ═══════ */}
        <Navbar fluid rounded className="border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95 sticky top-0 z-50 backdrop-blur-md">
          <NavbarBrand href="#" onClick={() => setRoute("home")}>
            <div className="flex flex-col leading-none">
              <span className="font-display text-3xl tracking-wider text-slate-900 dark:text-white">
                OCUPA
              </span>
              <span className="font-body text-[9px] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 -mt-1">
                O território fala o Ocupa conecta
              </span>
            </div>
          </NavbarBrand>
          
          <div className="flex items-center gap-3 md:order-2">
            <DarkThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRoute("painel")}
                  className="font-display text-xs tracking-widest uppercase text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  Painel
                </button>
                <button
                  onClick={() => {
                    window.localStorage.removeItem("ocupaUser");
                    setUser(null);
                    setRoute("home");
                  }}
                  className="font-display text-xs tracking-widest uppercase text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRoute("login")}
                  className="font-display text-xs tracking-widest uppercase text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  Entrar
                </button>
                <button
                  onClick={() => setRoute("register")}
                  className="font-display text-xs tracking-widest uppercase text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  Cadastrar
                </button>
              </div>
            )}
            <NavbarToggle />
          </div>

          <NavbarCollapse>
            <NavbarLink active={route === "home"} onClick={() => setRoute("home")} className="cursor-pointer font-display tracking-widest uppercase text-xs">
              Home
            </NavbarLink>
            <NavbarLink active={route === "artistas"} onClick={() => setRoute("artistas")} className="cursor-pointer font-display tracking-widest uppercase text-xs">
              Artistas
            </NavbarLink>
            <NavbarLink active={route === "espacos"} onClick={() => setRoute("espacos")} className="cursor-pointer font-display tracking-widest uppercase text-xs">
              Espaços
            </NavbarLink>
            <NavbarLink active={route === "eventos"} onClick={() => setRoute("eventos")} className="cursor-pointer font-display tracking-widest uppercase text-xs">
              Agenda
            </NavbarLink>
            <NavbarLink active={route === "oportunidades"} onClick={() => setRoute("oportunidades")} className="cursor-pointer font-display tracking-widest uppercase text-xs">
              Oportunidades
            </NavbarLink>
          </NavbarCollapse>
        </Navbar>
        
        {content}
      </div>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 mt-16">
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-body">
          © {new Date().getFullYear()} Ocupa Plataforma Cultural. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
