import {
  Badge,
  Button,
  Card,
  DarkThemeToggle,
  Footer,
  FooterBrand,
  FooterLink,
  FooterLinkGroup,
  FooterTitle,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";

const ITEMS = [
  {
    title: "Artistas",
    description: "Encontre talentos musicais, visuais e performáticos em toda a cidade.",
  },
  {
    title: "Espaços",
    description: "Cadastre e descubra locais ideais para shows, exposições e workshops.",
  },
  {
    title: "Eventos",
    description: "Acompanhe programação cultural, feiras e apresentações ao vivo.",
  },
  {
    title: "Oportunidades",
    description: "Fique por dentro de chamadas, editais e residências artísticas.",
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar fluid rounded className="border-b border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-950/90">
        <NavbarBrand href="#">
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Ocupa
          </span>
        </NavbarBrand>
        <div className="flex items-center gap-3">
          <DarkThemeToggle />
          <Button size="sm">Entrar</Button>
        </div>
        <NavbarToggle />
        <NavbarCollapse>
          <NavbarLink href="#features">Recursos</NavbarLink>
          <NavbarLink href="#categories">Categorias</NavbarLink>
          <NavbarLink href="#contato">Contato</NavbarLink>
        </NavbarCollapse>
      </Navbar>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge color="info">Plataforma cultural</Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Conecte artistas, espaços e oportunidades em um só lugar.
              </h1>
              <p className="max-w-2xl text-slate-600 dark:text-slate-300 sm:text-lg">
                Ocupa facilita a divulgação de projetos culturais e a busca por vagas,
                eventos e locais disponíveis para sua próxima criação.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>Explorar agora</Button>
              <Button color="gray">Cadastrar espaço</Button>
            </div>
          </div>

          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Destaque
                  </p>
                  <h2 className="text-2xl font-semibold">Rede colaborativa</h2>
                </div>
                <Badge color="success">Ativo</Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Cadastre sua conta, navegue pelas oportunidades e conecte-se com a
                cena local de forma rápida e intuitiva.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Artistas</p>
                  <p className="text-xl font-semibold">+120</p>
                </Card>
                <Card>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Eventos</p>
                  <p className="text-xl font-semibold">+45</p>
                </Card>
              </div>
            </div>
          </Card>
        </section>

        <section id="features" className="mt-16 space-y-6">
          <div className="space-y-3">
            <span className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Recursos
            </span>
            <h2 className="text-3xl font-semibold">O que você encontra no Ocupa</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {ITEMS.map((item) => (
              <Card key={item.title} className="border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-slate-600 dark:text-slate-300">{item.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer container className="border-t border-slate-200 bg-white/80 py-8 dark:border-slate-800 dark:bg-slate-950/90">
        <div className="w-full">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <FooterBrand href="#" name="Ocupa" src="/flowbite.svg" />
              <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                Plataforma para artistas, espaços e eventos culturais crescerem juntos.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FooterTitle title="Sobre" />
                <FooterLinkGroup col>
                  <FooterLink href="#">Nossa missão</FooterLink>
                  <FooterLink href="#">Equipe</FooterLink>
                </FooterLinkGroup>
              </div>
              <div>
                <FooterTitle title="Suporte" />
                <FooterLinkGroup col>
                  <FooterLink href="#">Contato</FooterLink>
                  <FooterLink href="#">Ajuda</FooterLink>
                </FooterLinkGroup>
              </div>
            </div>
          </div>
        </div>
      </Footer>
    </div>
  );
}
