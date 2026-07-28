import { Alert, Badge, Label, Modal, ModalHeader, ModalBody, ModalFooter, TextInput, Textarea } from "flowbite-react";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface ArtistasPageProps {
  user?: any;
}

export default function ArtistasPage({ user }: ArtistasPageProps) {
  const [artistas, setArtistas] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedArtista, setSelectedArtista] = useState<any | null>(null);
  const [portfolio, setPortfolio] = useState<any | null>(null);
  
  // Request budget modal/form states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requesterNome, setRequesterNome] = useState(user?.nome || "");
  const [requesterContato, setRequesterContato] = useState(user?.email || "");
  const [requestDescricao, setRequestDescricao] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [rArtistas, rPortfolios] = await Promise.all([
        fetch(`${API_URL}/api/artistas`),
        fetch(`${API_URL}/api/portfolios`)
      ]);
      if (rArtistas.ok) {
        setArtistas(await rArtistas.json());
      }
      if (rPortfolios.ok) {
        setPortfolios(await rPortfolios.json());
      }
    } catch (err) {
      console.error("Erro ao buscar artistas e portfólios:", err);
    }
  }

  // Filter artists based on search keyword (name, category, or city)
  const filteredArtistas = artistas.filter((a) => {
    const query = search.toLowerCase();
    return (
      a.nome?.toLowerCase().includes(query) ||
      a.categoria?.toLowerCase().includes(query) ||
      a.cidade?.toLowerCase().includes(query)
    );
  });

  async function handleOpenProfile(artista: any) {
    setSelectedArtista(artista);
    setPortfolio(null);
    setRequestSuccess(false);
    setRequestError(null);
    
    // Auto-fill budget form if user is logged in
    setRequesterNome(user?.nome || "");
    setRequesterContato(user?.email || "");
    setRequestDescricao("");

    // Save analytics: profile view
    trackEvent(artista.id, "profile_view");

    // Fetch portfolio
    try {
      const response = await fetch(`${API_URL}/api/portfolios/artista/${artista.id}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      }
    } catch (err) {
      console.error("Erro ao buscar portfólio:", err);
    }
  }

  async function trackEvent(artistaId: number, eventType: string) {
    try {
      await fetch(`${API_URL}/api/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artista: { id: artistaId },
          page: `/artistas/${artistaId}`,
          eventType,
          value: 1
        })
      });
    } catch (err) {
      console.error("Erro ao trackear evento:", err);
    }
  }

  async function handleSendRequest(e: React.FormEvent) {
    e.preventDefault();
    setRequestError(null);
    setRequestSuccess(false);

    if (!selectedArtista) return;

    const payload = {
      requesterNome,
      requesterContato,
      provider: { id: selectedArtista.id },
      descricao: requestDescricao,
      status: "PENDING"
    };

    try {
      const response = await fetch(`${API_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error || "Erro ao enviar proposta de orçamento");
      }

      setRequestSuccess(true);
      setRequestDescricao("");
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
      }, 2000);
    } catch (err: any) {
      setRequestError(err.message || "Erro de conexão ao enviar proposta");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wider leading-tight text-slate-900 dark:text-white">
              Contrate Talentos
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Catálogo de artistas, prestadores de serviços e empreendedores criativos locais.
            </p>
          </div>
          
          <div className="w-full md:w-80">
            <TextInput
              type="text"
              placeholder="Buscar por nome, categoria ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Artist Grid List */}
        {filteredArtistas.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArtistas.map((artista) => {
              const isCurrentUser = user?.artistaId === artista.id;
              const artistPortfolio = portfolios.find(p => p.artista?.id === artista.id);
              
              return (
                <div
                  key={artista.id}
                  className="border border-slate-900 dark:border-slate-600 rounded-sm p-5 hover:border-ocupa hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-900 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                        {artista.fotoUrl ? (
                          <img src={artista.fotoUrl} alt={artista.nome} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-display text-2xl bg-[#e76e3c] text-white">
                            {artista.nome ? artista.nome.charAt(0) : "A"}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="font-display text-2xl uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-ocupa transition-colors truncate">
                            {artista.nome}
                          </h2>
                          {isCurrentUser && (
                            <span className="font-display text-[10px] px-2 py-0.5 rounded bg-[#e76e3c] text-white uppercase tracking-wider">
                              Você
                            </span>
                          )}
                        </div>
                        <p className="font-display text-sm uppercase tracking-wider text-blue-900 dark:text-blue-400">
                          {artista.categoria || "Artista"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{artista.cidade || "Cidade não informada"}</p>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-3 text-justify">
                      {artistPortfolio?.about || "Biografia não informada."}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-3">
                    <button
                      onClick={() => handleOpenProfile(artista)}
                      className="flex-1 bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-lg tracking-wider uppercase rounded-sm px-3 py-1.5 transition-colors cursor-pointer text-center"
                    >
                      Ver Portfólio
                    </button>
                    
                    {!isCurrentUser && (
                      <button
                        onClick={() => {
                          setSelectedArtista(artista);
                          setShowRequestModal(true);
                        }}
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-body font-semibold text-sm transition-colors cursor-pointer text-center px-3 py-1.5"
                      >
                        Contratar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-sm border border-slate-900 dark:border-slate-600">
            <p className="text-slate-500 italic">Nenhum artista encontrado com os termos pesquisados.</p>
          </div>
        )}
      </div>

      {/* Profile/Portfolio Detail Modal */}
      {selectedArtista && (
        <Modal show={selectedArtista !== null && !showRequestModal} onClose={() => setSelectedArtista(null)} size="4xl">
          <ModalHeader>
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl uppercase tracking-wider text-slate-900 dark:text-white">
                {selectedArtista.nome}
              </span>
              <Badge color="failure" className="font-display text-xs uppercase tracking-wider">
                {selectedArtista.categoria}
              </Badge>
            </div>
          </ModalHeader>
          <ModalBody className="space-y-6">
            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
              {/* Left Column: Card Detail */}
              <div className="space-y-4">
                <div className="h-48 w-full overflow-hidden rounded-sm bg-slate-200 dark:bg-slate-800 border border-slate-900 dark:border-slate-700">
                  {selectedArtista.fotoUrl ? (
                    <img src={selectedArtista.fotoUrl} alt={selectedArtista.nome} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-display text-5xl bg-[#e76e3c] text-white">
                      {selectedArtista.nome.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-sm uppercase text-slate-500 tracking-wider">Cidade</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedArtista.cidade || "Não informada"}</p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-sm uppercase text-slate-500 tracking-wider">Contato</h3>
                  {portfolio?.contacts ? (
                    <a
                      href={`mailto:${portfolio.contacts}`}
                      onClick={() => trackEvent(selectedArtista.id, "contact_click")}
                      className="text-blue-900 dark:text-blue-400 hover:underline text-sm block"
                    >
                      {portfolio.contacts}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-500 italic">Não informado</p>
                  )}
                </div>

                {selectedArtista.redesSociais && (
                  <div className="space-y-1">
                    <h3 className="font-display text-sm uppercase text-slate-500 tracking-wider">Redes Sociais</h3>
                    <p className="text-sm text-ocupa font-semibold">{selectedArtista.redesSociais}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Portfolio and Bio */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-display text-2xl uppercase tracking-wider text-ocupa">
                    {portfolio?.headline || "Artista / Empreendedor Criativo"}
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap text-justify">
                    {portfolio?.about || "Nenhuma informação detalhada fornecida ainda."}
                  </p>
                </div>

                {portfolio?.mediaItems && portfolio.mediaItems.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-display text-lg tracking-wider uppercase border-b border-slate-200 dark:border-slate-700 pb-1 text-slate-900 dark:text-slate-100">
                      Galeria de Trabalhos
                    </h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      {portfolio.mediaItems.map((item: any) => (
                        <div key={item.id} className="border border-slate-900 dark:border-slate-800 rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-900">
                          <div className="h-32 bg-slate-200 dark:bg-slate-800">
                            {item.mediaType === "IMAGE" ? (
                              <img src={item.url} alt={item.caption} className="w-full h-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex flex-col items-center justify-center p-2 text-center">
                                <span className="font-display text-xs uppercase text-slate-500">{item.mediaType}</span>
                                <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-900 dark:text-blue-400 hover:underline text-xs mt-2 truncate w-full px-2">
                                  Acessar link externo
                                </a>
                              </div>
                            )}
                          </div>
                          {item.caption && (
                            <p className="p-2 text-xs font-medium text-slate-700 dark:text-slate-300 border-t bg-white dark:bg-slate-800 truncate">
                              {item.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="w-full flex justify-between items-center gap-3">
              <button
                onClick={() => setSelectedArtista(null)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-body font-semibold text-sm transition-colors cursor-pointer px-4 py-2"
              >
                Fechar
              </button>
              {user?.artistaId !== selectedArtista.id && (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-[#1b1cbb] hover:bg-[#15169a] text-white font-display text-lg tracking-wider uppercase rounded-sm px-4 py-2 transition-colors cursor-pointer"
                >
                  Solicitar Orçamento
                </button>
              )}
            </div>
          </ModalFooter>
        </Modal>
      )}

      {/* Solicitar Orçamento Modal */}
      {selectedArtista && showRequestModal && (
        <Modal show={showRequestModal} onClose={() => setShowRequestModal(false)} size="md">
          <ModalHeader>
            <span className="font-display text-2xl uppercase tracking-wider">
              Solicitar Orçamento a {selectedArtista.nome}
            </span>
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <Label htmlFor="reqNome">Seu Nome / Empresa</Label>
                <TextInput
                  id="reqNome"
                  value={requesterNome}
                  onChange={(e) => setRequesterNome(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div>
                <Label htmlFor="reqContato">Seu Contato (E-mail ou WhatsApp)</Label>
                <TextInput
                  id="reqContato"
                  value={requesterContato}
                  onChange={(e) => setRequesterContato(e.target.value)}
                  placeholder="seu@email.com ou (11) 99999-9999"
                  required
                />
              </div>

              <div>
                <Label htmlFor="reqDesc">Detalhes do Serviço / Apresentação</Label>
                <Textarea
                  id="reqDesc"
                  value={requestDescricao}
                  onChange={(e) => setRequestDescricao(e.target.value)}
                  placeholder="Descreva as datas sugeridas, tipo de evento, tempo de apresentação e qualquer outra instrução..."
                  rows={4}
                  required
                />
              </div>

              {requestError && <Alert color="failure">{requestError}</Alert>}
              {requestSuccess && <Alert color="success">Sua proposta foi enviada! O artista responderá no painel dele.</Alert>}

              <div className="flex justify-end items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-body font-semibold text-sm transition-colors cursor-pointer px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-lg tracking-wider uppercase rounded-sm px-4 py-2 transition-colors cursor-pointer"
                >
                  Enviar Proposta
                </button>
              </div>
            </form>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}
