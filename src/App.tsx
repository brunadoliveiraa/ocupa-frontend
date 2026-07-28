import {
  Badge,
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
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
              <section className="relative w-full h-[380px] sm:h-[460px] overflow-hidden rounded-md grain-overlay">
                <img
                  src="/topo.jpeg"
                  alt="Arte urbana periférica"
                  className="absolute inset-0 w-full h-full"
                />
              </section>
            </div>

            {/* ═══════ STATS + QUEM SOMOS ═══════ */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-28 relative z-10">
              <div className="grid gap-8 lg:grid-cols-[auto_1fr] items-start">
                {/* Bloco Unificado: Card + IMPACTO colado permanentemente ao lado */}
                <div className="flex items-start gap-3 sm:gap-4 ml-4 sm:ml-10 lg:ml-6 flex-shrink-0">
                  {/* Stats Card: mais estreito e deslocado para a direita */}
                  <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-900 dark:border-slate-600 rounded-sm p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-xl sm:text-2xl tracking-wider uppercase text-slate-900 dark:text-white">
                        Ativos do Ecossistema
                      </h2>
                      <Badge color="failure" className="font-body text-xs uppercase tracking-wider">Ao Vivo</Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
                          onClick={() => setRoute(item.target)}
                          className="border border-slate-900 dark:border-slate-600 rounded-sm p-2.5 cursor-pointer hover:border-ocupa dark:hover:border-ocupa transition-colors group bg-slate-50/50 dark:bg-slate-800/30"
                        >
                          <p className="text-[11px] font-body text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.label}</p>
                          <p className="text-2xl sm:text-3xl font-display text-ocupa">+{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* IMPACTO vertical text: Pressionado para baixo para ficar fora do hero banner, grudado diretamente no card */}
                  <div className="pt-28 sm:pt-32 flex-shrink-0">
                    <span className="vertical-text font-display text-4xl sm:text-5xl tracking-[0.25em] text-slate-900 dark:text-white select-none whitespace-nowrap">
                      IMPACTO
                    </span>
                  </div>
                </div>

                {/* Quem Somos */}
                <div className="space-y-4 pt-6 lg:pt-32">
                  <h2 className="font-display text-4xl lg:text-5xl tracking-wider uppercase leading-tight text-slate-900 dark:text-white">
                    Quem Somos
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                    Uma <strong className="text-ocupa">Plataforma de Gestão de Ecossistemas Culturais</strong>
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Reunimos várias funcionalidades (que hoje estão dispersas em diferentes sistemas) para facilitar a produção, organização e divulgação da arte.
                  </p>
                  <hr className="border-slate-300 dark:border-slate-700 mt-4" />
                </div>
              </div>
            </section>

            {/* ═══════ SEÇÃO PRINCIPAL (2 COLUNAS EM TELAS GRANDES, LARGURA INTEIRA EM TELAS MENORES) ═══════ */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-start">
                {/* COLUNA DA ESQUERDA (Descrição + CTAs + Como Funciona) */}
                <div className="space-y-8 w-full">
                  {/* Descrição */}
                  <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    Plataforma feita para <strong className="text-slate-900 dark:text-white font-bold">artistas, coletivos</strong> e <strong className="text-slate-900 dark:text-white font-bold">espaços periféricos</strong>. Um espaço para descobrir talentos, ocupar territórios, fortalecer conexões e ampliar oportunidades culturais.
                  </p>

                  {/* CTAs */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        onClick={() => setRoute("register")}
                        className="font-display text-xl tracking-widest uppercase text-blue-900 dark:text-blue-400 hover:text-ocupa transition-colors"
                      >
                        Cadastre-se
                      </button>
                      <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-slate-400" />
                      <button
                        onClick={() => setRoute("artistas")}
                        className="font-display text-xl tracking-widest uppercase text-blue-900 dark:text-blue-400 hover:text-ocupa transition-colors"
                      >
                        Contrate
                      </button>
                      <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-slate-400" />
                      <button
                        onClick={() => setRoute("espacos")}
                        className="font-display text-xl tracking-widest uppercase text-blue-900 dark:text-blue-400 hover:text-ocupa transition-colors"
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
                      <p className="text-sm font-semibold text-blue-900/80 dark:text-blue-300/80">
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
                          className="border border-slate-900 dark:border-slate-600 rounded-sm p-4 hover:border-ocupa hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-slate-900"
                        >
                          <h3 className="font-display text-xl tracking-wider uppercase text-ocupa group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* COLUNA DA DIREITA (O QUE QUEREMOS: Texto à direita da foto em telas menores/médias) */}
                <div className="space-y-6 w-full lg:pl-4">
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-6 w-full">
                    {/* Imagem + Texto Vertical "O QUE QUEREMOS" */}
                    <div className="flex items-start gap-3 sm:gap-4 flex-shrink-0">
                      <div className="relative rounded-sm overflow-hidden grain-overlay h-[260px] sm:h-[300px] lg:h-[360px] w-[170px] sm:w-[200px] lg:w-[260px] flex-shrink-0">
                        <img
                          src="/mission_photo.jpg"
                          alt="O que queremos"
                          className="w-full h-full object-cover grayscale"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#e76e3c]/50 via-orange-900/40 to-orange-950/80 mix-blend-multiply" />
                      </div>
                      <span className="vertical-text font-display text-2xl sm:text-3xl lg:text-4xl tracking-[0.25em] text-slate-900 dark:text-white select-none whitespace-nowrap pt-2">
                        O QUE QUEREMOS
                      </span>
                    </div>

                    {/* Textos sobre missão (à direita da foto em telas menores/médias) */}
                    <div className="space-y-4 flex-1 w-full max-w-full">
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        Nosso <strong className="text-slate-900 dark:text-white font-bold">objetivo</strong> é fortalecer ecossistemas culturais para que eles produzam oportunidades, reforcem sua cultura local, ampliem a geração de renda e valorizem a memória do território.
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <p className="font-display text-base sm:text-lg tracking-wider uppercase text-slate-900 dark:text-white">
                          E como fazemos isso?
                        </p>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          O <strong className="font-display text-ocupa">OCUPA</strong> cria a infraestrutura digital que integra e divulga artistas, espaços, eventos e oportunidades, estimulando o{" "}
                          <strong className="text-slate-900 dark:text-white font-bold">crescimento da economia criativa</strong>.
                        </p>
                      </div>
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
        <Navbar fluid rounded className="border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95 sticky top-0 z-50 backdrop-blur-md px-0 py-2">
          <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between">
            <NavbarBrand href="#" onClick={() => setRoute("home")} className="py-1">
              <img
                src="/logo_ocupa.svg"
                alt="OCUPA - O território fala o Ocupa conecta"
                className="h-10 sm:h-12 w-auto object-contain block dark:hidden"
              />
              <img
                src="/logo_ocupa_branco.svg"
                alt="OCUPA - O território fala o Ocupa conecta"
                className="h-10 sm:h-12 w-auto object-contain hidden dark:block"
              />
            </NavbarBrand>
            
            <div className="flex items-center gap-4 md:order-2">
              <DarkThemeToggle />
              {user ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRoute("painel")}
                    className="font-display text-base sm:text-lg tracking-widest uppercase text-slate-900 dark:text-white hover:text-ocupa transition-colors"
                  >
                    Painel
                  </button>
                  <button
                    onClick={() => {
                      window.localStorage.removeItem("ocupaUser");
                      setUser(null);
                      setRoute("home");
                    }}
                    className="font-display text-base sm:text-lg tracking-widest uppercase text-slate-500 hover:text-ocupa transition-colors"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRoute("login")}
                    className="font-display text-base sm:text-lg tracking-widest uppercase text-slate-900 dark:text-white hover:text-ocupa transition-colors"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => setRoute("register")}
                    className="font-display text-base sm:text-lg tracking-widest uppercase text-slate-900 dark:text-white hover:text-ocupa transition-colors"
                  >
                    Cadastrar
                  </button>
                </div>
              )}
              <NavbarToggle />
            </div>

            <NavbarCollapse>
              <NavbarLink active={route === "home"} onClick={() => setRoute("home")} className="cursor-pointer font-display tracking-widest uppercase text-base sm:text-lg hover:text-ocupa">
                Home
              </NavbarLink>
              <NavbarLink active={route === "artistas"} onClick={() => setRoute("artistas")} className="cursor-pointer font-display tracking-widest uppercase text-base sm:text-lg hover:text-ocupa">
                Artistas
              </NavbarLink>
              <NavbarLink active={route === "espacos"} onClick={() => setRoute("espacos")} className="cursor-pointer font-display tracking-widest uppercase text-base sm:text-lg hover:text-ocupa">
                Espaços
              </NavbarLink>
              <NavbarLink active={route === "eventos"} onClick={() => setRoute("eventos")} className="cursor-pointer font-display tracking-widest uppercase text-base sm:text-lg hover:text-ocupa">
                Agenda
              </NavbarLink>
              <NavbarLink active={route === "oportunidades"} onClick={() => setRoute("oportunidades")} className="cursor-pointer font-display tracking-widest uppercase text-base sm:text-lg hover:text-ocupa">
                Oportunidades
              </NavbarLink>
            </NavbarCollapse>
          </div>
        </Navbar>
        
        {content}
      </div>

      {/* ═══════ FOOTER: PAREDE GRAFITADA SANGRAMENTO SEM BORDA ═══════ */}
      <footer className="border-t border-slate-900 dark:border-slate-700 relative overflow-hidden bg-white dark:bg-slate-950 mt-16 min-h-[180px] sm:min-h-[220px]">
        {/* Parede grafitada na metade esquerda sem borda, sangrando até os limites esquerdo e inferior */}
        <div className="absolute left-0 top-0 bottom-0 w-full md:w-3/5 h-full overflow-hidden grain-overlay pointer-events-none">
          <img
            src="/footer_wall.jpg"
            alt="Parede grafitada"
            className="w-full h-full object-cover grayscale"
          />
          {/* Overlay de gradiente suave que funde o grafite diretamente no fundo do footer */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/50 via-orange-950/70 to-white dark:to-slate-950 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white dark:to-slate-950" />
        </div>

        {/* Conteúdo do Rodapé */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10 min-h-[180px] sm:min-h-[220px] flex flex-col justify-end items-end pb-6 pt-12">
          <div className="text-right font-body text-xs text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm px-3 py-1.5 rounded-sm border border-slate-200 dark:border-slate-800">
            © {new Date().getFullYear()} Ocupa Plataforma Cultural. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
