import { Alert, Badge, Button, Card, Label, Select, TextInput, Textarea } from "flowbite-react";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface PainelPageProps {
  user: any;
}

export default function PainelPage({ user }: PainelPageProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "portfolio" | "requests">("dashboard");
  const [portfolio, setPortfolio] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  
  // Artist states
  const [artista, setArtista] = useState<any>(null);
  const [cidade, setCidade] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  
  // Form portfolio states
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [contacts, setContacts] = useState("");
  const [mediaList, setMediaList] = useState<{ mediaType: string; url: string; caption: string }[]>([]);
  
  // Media input states
  const [newMediaType, setNewMediaType] = useState("IMAGE");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaCaption, setNewMediaCaption] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.artistaId) {
      fetchPortfolio();
      fetchRequestsForProvider();
      fetchAnalytics();
      fetchArtista();
    } else if (user?.email) {
      fetchRequestsForRequester();
    }
  }, [user]);

  async function fetchPortfolio() {
    try {
      const response = await fetch(`${API_URL}/api/portfolios/artista/${user.artistaId}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
        setHeadline(data.headline || "");
        setAbout(data.about || "");
        setContacts(data.contacts || "");
        setMediaList(data.mediaItems || []);
      } else {
        // Portfolio not created yet, we'll create a default state
        setPortfolio(null);
      }
    } catch (err) {
      console.error("Erro ao carregar portfólio:", err);
    }
  }

  async function fetchArtista() {
    try {
      const response = await fetch(`${API_URL}/api/artistas/${user.artistaId}`);
      if (response.ok) {
        const data = await response.json();
        setArtista(data);
        setCidade(data.cidade || "");
        setFotoUrl(data.fotoUrl || "");
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes do artista:", err);
    }
  }

  async function fetchRequestsForProvider() {
    try {
      const response = await fetch(`${API_URL}/api/requests/provider/${user.artistaId}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.sort((a: any, b: any) => b.id - a.id));
      }
    } catch (err) {
      console.error("Erro ao carregar solicitações:", err);
    }
  }

  async function fetchRequestsForRequester() {
    try {
      const response = await fetch(`${API_URL}/api/requests/requester/${user.email}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.sort((a: any, b: any) => b.id - a.id));
      }
    } catch (err) {
      console.error("Erro ao carregar solicitações:", err);
    }
  }

  async function fetchAnalytics() {
    try {
      const response = await fetch(`${API_URL}/api/analytics`);
      if (response.ok) {
        const data = await response.json();
        // Filter analytics for this artist
        const artistAnalytics = data.filter((item: any) => item.artista?.id === user.artistaId);
        setAnalytics(artistAnalytics);
      }
    } catch (err) {
      console.error("Erro ao carregar analytics:", err);
    }
  }

  async function handleSavePortfolio(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // 1. Salvar informações do artista (cidade, fotoUrl)
      const artistPayload = {
        ...artista,
        cidade,
        fotoUrl
      };

      const artistResponse = await fetch(`${API_URL}/api/artistas/${user.artistaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artistPayload)
      });

      if (!artistResponse.ok) {
        throw new Error("Erro ao salvar informações do artista");
      }
      
      const updatedArtista = await artistResponse.json();
      setArtista(updatedArtista);

      // 2. Salvar portfólio
      const payload = {
        id: portfolio?.id || undefined,
        artista: { id: user.artistaId },
        headline,
        about,
        contacts,
        mediaItems: mediaList
      };

      const method = portfolio?.id ? "PUT" : "POST";
      const url = portfolio?.id ? `${API_URL}/api/portfolios/${portfolio.id}` : `${API_URL}/api/portfolios`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar portfólio");
      }

      const data = await response.json();
      setPortfolio(data);
      setSuccess("Portfólio e perfil atualizados com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro de conexão ao salvar portfólio");
    }
  }

  function addMediaItem() {
    if (!newMediaUrl) return;
    setMediaList([...mediaList, { mediaType: newMediaType, url: newMediaUrl, caption: newMediaCaption }]);
    setNewMediaUrl("");
    setNewMediaCaption("");
  }

  function removeMediaItem(index: number) {
    setMediaList(mediaList.filter((_, i) => i !== index));
  }

  async function handleUpdateRequestStatus(id: number, newStatus: string) {
    try {
      const reqToUpdate = requests.find((r) => r.id === id);
      if (!reqToUpdate) return;

      const payload = {
        ...reqToUpdate,
        status: newStatus
      };

      const response = await fetch(`${API_URL}/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (user.artistaId) {
          fetchRequestsForProvider();
        } else {
          fetchRequestsForRequester();
        }
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  }

  // Statistics
  const profileViews = analytics.filter(a => a.eventType === "profile_view").length;
  const contactClicks = analytics.filter(a => a.eventType === "contact_click").length;
  const budgetRequests = requests.length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Olá, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.nome}</span>! Gerencie seus orçamentos e perfil de empreendedor.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-6 py-3 font-medium transition ${
              activeTab === "dashboard"
                ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Métricas & Visão Geral
          </button>
          
          {user?.artistaId && (
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`px-6 py-3 font-medium transition ${
                activeTab === "portfolio"
                  ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              Meu Portfólio
            </button>
          )}

          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-3 font-medium transition ${
              activeTab === "requests"
                ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Orçamentos {requests.filter(r => r.status === "PENDING").length > 0 && (
              <Badge color="failure" size="xs" className="inline ml-1">
                {requests.filter(r => r.status === "PENDING").length}
              </Badge>
            )}
          </button>
        </div>

        {/* Content Tabs */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {user?.artistaId ? (
              <>
                <div className="grid gap-6 sm:grid-cols-3">
                  <Card className="border-l-4 border-indigo-500 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Visualizações</p>
                      <Badge color="info">Perfil</Badge>
                    </div>
                    <p className="text-3xl font-bold">{profileViews}</p>
                    <p className="text-xs text-slate-500">Total de acessos ao seu portfólio profissional</p>
                  </Card>

                  <Card className="border-l-4 border-emerald-500 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Cliques de Contato</p>
                      <Badge color="success">Redes/Email</Badge>
                    </div>
                    <p className="text-3xl font-bold">{contactClicks}</p>
                    <p className="text-xs text-slate-500">Cliques nos seus links de contato público</p>
                  </Card>

                  <Card className="border-l-4 border-rose-500 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Solicitações</p>
                      <Badge color="failure">Orçamentos</Badge>
                    </div>
                    <p className="text-3xl font-bold">{budgetRequests}</p>
                    <p className="text-xs text-slate-500">Total de propostas de trabalho recebidas</p>
                  </Card>
                </div>

                <Card>
                  <h3 className="text-lg font-bold">Resumo da sua Ocupação</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Como empreendedor da cena cultural, manter seu portfólio atualizado é fundamental para atrair novos orçamentos e interações. Veja os gráficos de desempenho e contatos recentes para planejar sua agenda artística.
                  </p>
                  {!portfolio && (
                    <Alert color="warning" className="mt-4">
                      Você ainda não criou seu Portfólio. Vá na aba <strong>"Meu Portfólio"</strong> para cadastrar sua bio, mídias e serviços para que todos possam te contratar!
                    </Alert>
                  )}
                </Card>
              </>
            ) : (
              <Card>
                <h3 className="text-lg font-bold">Painel de Contratações</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Bem-vindo! Aqui você pode gerenciar os orçamentos que solicitou aos artistas da plataforma periférica. Vá para a aba <strong>"Orçamentos"</strong> para verificar as respostas e andamento de suas solicitações.
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === "portfolio" && user?.artistaId && (
          <Card>
            <form onSubmit={handleSavePortfolio} className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-2">Informações Profissionais</h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="cidade">Cidade do Artista</Label>
                  <TextInput
                    id="cidade"
                    placeholder="Ex: São Paulo"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="foto">Foto de Perfil do Artista</Label>
                  <input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const base64 = await convertToBase64(file);
                          setFotoUrl(base64);
                        } catch (err) {
                          console.error("Erro ao converter foto:", err);
                        }
                      }
                    }}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 bg-white border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
                  />
                  {fotoUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-500">Visualização:</span>
                      <img src={fotoUrl} alt="Visualização" className="h-10 w-10 object-cover rounded-full border border-slate-200" />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="headline">Headline / Slogan Profissional</Label>
                <TextInput
                  id="headline"
                  placeholder="Ex: Grafiteira e Muralista no Extremo Sul, especializada em retratos urbanos."
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="about">Sobre você (Bio detalhada de portfólio)</Label>
                <Textarea
                  id="about"
                  placeholder="Conte sua trajetória, as técnicas que domina, os estilos de eventos e oficinas que ministra..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contacts">Contatos Públicos (Redes, Telefone, Email)</Label>
                <TextInput
                  id="contacts"
                  placeholder="Ex: Instagram: @nome_artista | WhatsApp: (11) 99999-9999"
                  value={contacts}
                  onChange={(e) => setContacts(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold border-b pb-2">Mídias do Portfólio (Fotos/Vídeos)</h3>
                
                <div className="grid gap-3 sm:grid-cols-3 items-end bg-slate-100 dark:bg-slate-900 p-4 rounded-lg">
                  <div>
                    <Label htmlFor="mediaType">Tipo de Mídia</Label>
                    <Select id="mediaType" value={newMediaType} onChange={(e) => setNewMediaType(e.target.value)}>
                      <option value="IMAGE">Imagem</option>
                      <option value="VIDEO">Vídeo (URL do YouTube/Vimeo)</option>
                      <option value="AUDIO">Áudio (SoundCloud/Spotify)</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mediaUrl">{newMediaType === "IMAGE" ? "Carregar Imagem" : "URL da Mídia"}</Label>
                    {newMediaType === "IMAGE" ? (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const base64 = await convertToBase64(file);
                              setNewMediaUrl(base64);
                            } catch (err) {
                              console.error("Erro ao converter mídia:", err);
                            }
                          }
                        }}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 bg-white border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
                      />
                    ) : (
                      <TextInput
                        id="mediaUrl"
                        placeholder={newMediaType === "VIDEO" ? "https://youtube.com/..." : "https://soundcloud.com/..."}
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="mediaCaption">Legenda</Label>
                    <TextInput
                      id="mediaCaption"
                      placeholder="Nome do trabalho / local"
                      value={newMediaCaption}
                      onChange={(e) => setNewMediaCaption(e.target.value)}
                    />
                  </div>
                  <Button type="button" onClick={addMediaItem} className="w-full mt-2 sm:col-span-3">
                    Adicionar Mídia ao Portfólio
                  </Button>
                </div>

                {mediaList.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mt-4">
                    {mediaList.map((item, idx) => (
                      <Card key={idx} className="relative overflow-hidden group">
                        <div className="h-32 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                          {item.mediaType === "IMAGE" ? (
                            <img src={item.url} alt={item.caption} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs uppercase text-slate-500 font-semibold">{item.mediaType} Link</span>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-slate-500">{item.mediaType}</p>
                          <p className="font-semibold text-sm truncate">{item.caption || "Sem legenda"}</p>
                          <Button
                            size="xs"
                            color="failure"
                            className="mt-2 w-full"
                            onClick={() => removeMediaItem(idx)}
                          >
                            Remover
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Nenhuma mídia adicionada ainda.</p>
                )}
              </div>

              {error && <Alert color="failure">{error}</Alert>}
              {success && <Alert color="success">{success}</Alert>}

              <Button type="submit" color="indigo" size="lg" className="w-full">
                Salvar Meu Portfólio
              </Button>
            </form>
          </Card>
        )}

        {activeTab === "requests" && (
          <Card>
            <h2 className="text-xl font-bold border-b pb-2">Gerenciamento de Solicitações</h2>
            
            {requests.length > 0 ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-4">
                {requests.map((req) => (
                  <div key={req.id} className="pt-4 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">
                          {user?.artistaId ? `De: ${req.requesterNome}` : `Para: ${req.provider?.nome}`}
                        </h3>
                        
                        <Badge
                          color={
                            req.status === "PENDING"
                              ? "warning"
                              : req.status === "ACCEPTED"
                              ? "info"
                              : req.status === "REJECTED"
                              ? "failure"
                              : "success"
                          }
                        >
                          {req.status}
                        </Badge>
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 p-3 rounded text-sm whitespace-pre-line">
                        {req.descricao}
                      </p>
                      
                      <div className="text-xs text-slate-500 space-y-1">
                        <p><strong>Contato do Cliente:</strong> {req.requesterContato}</p>
                        <p><strong>Solicitado em:</strong> {new Date(req.criadoEm).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>

                    {user?.artistaId && req.status === "PENDING" && (
                      <div className="flex md:flex-col gap-2 justify-end items-end self-center md:self-auto">
                        <Button
                          size="sm"
                          color="success"
                          onClick={() => handleUpdateRequestStatus(req.id, "ACCEPTED")}
                        >
                          Aceitar Proposta
                        </Button>
                        <Button
                          size="sm"
                          color="failure"
                          onClick={() => handleUpdateRequestStatus(req.id, "REJECTED")}
                        >
                          Recusar
                        </Button>
                      </div>
                    )}

                    {user?.artistaId && req.status === "ACCEPTED" && (
                      <div className="flex justify-end items-center self-center md:self-auto">
                        <Button
                          size="sm"
                          color="indigo"
                          onClick={() => handleUpdateRequestStatus(req.id, "COMPLETED")}
                        >
                          Concluir Trabalho
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-center py-10">Você não tem solicitações de orçamento registradas.</p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
