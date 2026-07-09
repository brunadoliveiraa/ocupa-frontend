import {
  Badge,
  Button,
  Card,
  DarkThemeToggle,
  Footer,
  FooterLink,
  FooterLinkGroup,
  FooterTitle,
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
        return <EspacosPage />;
      case "eventos":
        return <EventosPage />;
      case "oportunidades":
        return <OportunidadesPage />;
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
          <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
            <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-6">
                <Badge color="indigo" size="sm" className="w-fit">Rede Cultural e Comercial Periférica</Badge>
                <div className="space-y-4">
                  <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                    Ocupa o território. Conecte sua arte.
                  </h1>
                  <p className="max-w-2xl text-slate-600 dark:text-slate-300 sm:text-lg">
                    Uma plataforma feita por e para artistas, coletivos e espaços periféricos. Cadastre-se, divulgue suas oportunidades, encontre locais livres para apresentações e gerencie contatos e contratações em um ecossistema comercial descentralizado.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button color="indigo" size="lg" onClick={() => setRoute("artistas")}>Explorar Artistas</Button>
                  <Button color="emerald" size="lg" onClick={() => setRoute("espacos")}>Ver Espaços Livres</Button>
                </div>
              </div>

              <Card className="shadow-2xl border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
                        Ativos do Ecossistema
                      </p>
                      <h2 className="text-2xl font-bold tracking-tight mt-1">Impacto Periférico</h2>
                    </div>
                    <Badge color="success">Ao Vivo</Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Ao fortalecer as redes culturais locais, potencializamos oportunidades econômicas e a redução de desigualdades (ODS 8, 10).
                  </p>
                  <div className="grid gap-3 grid-cols-2">
                    <Card className="bg-slate-100/50 dark:bg-slate-800/50 p-2">
                      <p className="text-xs font-semibold text-slate-500">Artistas/Projetos</p>
                      <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">+{stats.artistas}</p>
                    </Card>
                    <Card className="bg-slate-100/50 dark:bg-slate-800/50 p-2">
                      <p className="text-xs font-semibold text-slate-500">Espaços Mapeados</p>
                      <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">+{stats.espacos}</p>
                    </Card>
                    <Card className="bg-slate-100/50 dark:bg-slate-800/50 p-2">
                      <p className="text-xs font-semibold text-slate-500">Eventos na Agenda</p>
                      <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">+{stats.eventos}</p>
                    </Card>
                    <Card className="bg-slate-100/50 dark:bg-slate-800/50 p-2">
                      <p className="text-xs font-semibold text-slate-500">Editais e Vagas</p>
                      <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">+{stats.oportunidades}</p>
                    </Card>
                  </div>
                </div>
              </Card>
            </section>

            <section id="features" className="space-y-6">
              <div className="space-y-3 text-center">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
                  Como Funciona?
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight">O que você encontra no Ocupa</h2>
                <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-sm">
                  O ecossistema reúne ferramentas integradas para que o agente cultural seja protagonista da própria sustentabilidade e atuação artística.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Artistas & Serviços", description: "Veja portfólios profissionais detalhados, contatos e solicite orçamentos para apresentações.", action: () => setRoute("artistas"), btnColor: "indigo" },
                  { title: "Espaços Disponíveis", description: "Encontre praças comunitárias, galerias, muros para grafite e galpões periféricos cadastrados.", action: () => setRoute("espacos"), btnColor: "emerald" },
                  { title: "Agenda Cultural", description: "Acompanhe e cadastre saraus, batalhas de rima, mostras de dança e intervenções urbanas.", action: () => setRoute("eventos"), btnColor: "purple" },
                  { title: "Oportunidades", description: "Consulte editais de fomento, bolsas, workshops e residências de arte da comunidade.", action: () => setRoute("oportunidades"), btnColor: "amber" },
                ].map((item) => (
                  <Card key={item.title} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
                      <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">{item.description}</p>
                    </div>
                    <Button size="xs" color={item.btnColor} className="mt-4 w-fit" onClick={item.action}>
                      Acessar funcionalidade
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          </main>
        );
    }
  }, [route, stats, user]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar fluid rounded className="border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95 sticky top-0 z-50 backdrop-blur-md">
          <NavbarBrand href="#" onClick={() => setRoute("home")}>
            <span className="self-center whitespace-nowrap text-2xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
              OCUPA
            </span>
          </NavbarBrand>
          
          <div className="flex items-center gap-3 md:order-2">
            <DarkThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <Button size="sm" color="indigo" onClick={() => setRoute("painel")}>
                  Painel
                </Button>
                <Button
                  size="sm"
                  color="gray"
                  onClick={() => {
                    window.localStorage.removeItem("ocupaUser");
                    setUser(null);
                    setRoute("home");
                  }}
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" color="indigo" onClick={() => setRoute("login")}>
                  Entrar
                </Button>
                <Button size="sm" color="gray" onClick={() => setRoute("register")}>
                  Cadastrar
                </Button>
              </div>
            )}
            <NavbarToggle />
          </div>

          <NavbarCollapse>
            <NavbarLink active={route === "home"} onClick={() => setRoute("home")} className="cursor-pointer">
              Home
            </NavbarLink>
            <NavbarLink active={route === "artistas"} onClick={() => setRoute("artistas")} className="cursor-pointer">
              Artistas
            </NavbarLink>
            <NavbarLink active={route === "espacos"} onClick={() => setRoute("espacos")} className="cursor-pointer">
              Espaços
            </NavbarLink>
            <NavbarLink active={route === "eventos"} onClick={() => setRoute("eventos")} className="cursor-pointer">
              Agenda/Eventos
            </NavbarLink>
            <NavbarLink active={route === "oportunidades"} onClick={() => setRoute("oportunidades")} className="cursor-pointer">
              Oportunidades
            </NavbarLink>
          </NavbarCollapse>
        </Navbar>
        
        {content}
      </div>

      <Footer container className="border-t border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95 py-8 mt-16">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
                OCUPA
              </span>
              <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                Fortalecendo os ecossistemas periféricos de arte e negócios. Conectando artistas, coletivos e espaços criativos locais.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FooterTitle title="Mapeamento" />
                <FooterLinkGroup col>
                  <FooterLink href="#" onClick={() => setRoute("artistas")}>Artistas</FooterLink>
                  <FooterLink href="#" onClick={() => setRoute("espacos")}>Espaços Culturais</FooterLink>
                </FooterLinkGroup>
              </div>
              <div>
                <FooterTitle title="Objetivos ODS" />
                <FooterLinkGroup col>
                  <FooterLink href="https://brasil.un.org/pt-br/sdgs/8" target="_blank">ODS 8 - Trabalho Decente</FooterLink>
                  <FooterLink href="https://brasil.un.org/pt-br/sdgs/10" target="_blank">ODS 10 - Redução de Desigualdades</FooterLink>
                </FooterLinkGroup>
              </div>
            </div>
          </div>
          <div className="w-full border-t border-slate-200 dark:border-slate-800 pt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Ocupa Plataforma Cultural. Todos os direitos reservados.
          </div>
        </div>
      </Footer>
    </div>
  );
}
