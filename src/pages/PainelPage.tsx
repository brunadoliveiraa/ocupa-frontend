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
  const [activeTab, setActiveTab] = useState<"dashboard" | "portfolio" | "requests" | "contribuicoes" | "perfil">("dashboard");
  const [portfolio, setPortfolio] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [contribuicoes, setContribuicoes] = useState<any>({ espacos: [], eventos: [], oportunidades: [] });
  
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
    if (user?.role === 'ADMIN') {
      setActiveTab("dashboard");
    } else if (user?.role === 'COLABORADOR') {
      setActiveTab("contribuicoes");
      fetchContribuicoes();
    } else if (user?.artistaId) {
      setActiveTab("dashboard");
      fetchPortfolio();
      fetchRequestsForProvider();
      fetchAnalytics();
      fetchArtista();
      fetchContribuicoes();
    }
  }, [user]);

  async function fetchContribuicoes() {
    try {
      const email = user.email;
      const [espacosRes, eventosRes, opRes] = await Promise.all([
        fetch(`${API_URL}/api/espacos/meus?email=${email}`),
        fetch(`${API_URL}/api/eventos/meus?email=${email}`),
        fetch(`${API_URL}/api/oportunidades/meus?email=${email}`)
      ]);
      const espacos = espacosRes.ok ? await espacosRes.json() : [];
      const eventos = eventosRes.ok ? await eventosRes.json() : [];
      const oportunidades = opRes.ok ? await opRes.json() : [];
      setContribuicoes({ espacos, eventos, oportunidades });
    } catch(e) {
      console.error(e);
    }
  }

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

  async function fetchAnalytics() {
    try {
      const response = await fetch(`${API_URL}/api/analytics`);
      if (response.ok) {
        const data = await response.json();
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
      const artistPayload = { ...artista, cidade, fotoUrl };
      const artistResponse = await fetch(`${API_URL}/api/artistas/${user.artistaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artistPayload)
      });

      if (!artistResponse.ok) throw new Error("Erro ao salvar informações do artista");
      const updatedArtista = await artistResponse.json();
      setArtista(updatedArtista);

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

      if (!response.ok) throw new Error("Erro ao salvar portfólio");
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

      const payload = { ...reqToUpdate, status: newStatus };
      const response = await fetch(`${API_URL}/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (user.artistaId) fetchRequestsForProvider();
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  }

  const profileViews = analytics.filter(a => a.eventType === "profile_view").length;
  const contactClicks = analytics.filter(a => a.eventType === "contact_click").length;
  const budgetRequests = requests.length;

  return (
    <div className="min-h-screen bg-white py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-slate-900 dark:text-white">
            Painel de Controle
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Olá, <span className="font-semibold text-ocupa">{user?.nome}</span>! Gerencie sua conta e atividades.
          </p>
        </div>

        {artista?.status === 'PENDING' && (
          <Alert color="warning">Seu perfil de artista está em análise pela curadoria do OCUPA.</Alert>
        )}
        {artista?.status === 'REJECTED' && (
          <Alert color="failure">Seu perfil de artista não foi aprovado pela curadoria.</Alert>
        )}

        <div className="flex border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
          {user?.role === 'ADMIN' && (
            <button onClick={() => setActiveTab("dashboard")} className={`px-6 py-3 font-display text-base tracking-wider uppercase transition cursor-pointer border-b-2 -mb-[2px] ${activeTab === "dashboard" ? "border-ocupa text-ocupa font-bold" : "border-transparent text-slate-500"}`}>Visão Geral</button>
          )}

          {user?.role === 'ARTISTA' && (
            <>
              <button onClick={() => setActiveTab("dashboard")} className={`px-6 py-3 font-display text-base tracking-wider uppercase transition cursor-pointer border-b-2 -mb-[2px] ${activeTab === "dashboard" ? "border-ocupa text-ocupa font-bold" : "border-transparent text-slate-500"}`}>Métricas & Visão Geral</button>
              <button onClick={() => setActiveTab("portfolio")} className={`px-6 py-3 font-display text-base tracking-wider uppercase transition cursor-pointer border-b-2 -mb-[2px] ${activeTab === "portfolio" ? "border-ocupa text-ocupa font-bold" : "border-transparent text-slate-500"}`}>Meu Portfólio</button>
              <button onClick={() => setActiveTab("requests")} className={`px-6 py-3 font-display text-base tracking-wider uppercase transition cursor-pointer border-b-2 -mb-[2px] ${activeTab === "requests" ? "border-ocupa text-ocupa font-bold" : "border-transparent text-slate-500"}`}>Orçamentos</button>
              <button onClick={() => setActiveTab("contribuicoes")} className={`px-6 py-3 font-display text-base tracking-wider uppercase transition cursor-pointer border-b-2 -mb-[2px] ${activeTab === "contribuicoes" ? "border-ocupa text-ocupa font-bold" : "border-transparent text-slate-500"}`}>Minhas Contribuições</button>
            </>
          )}

          {user?.role === 'COLABORADOR' && (
            <>
              <button onClick={() => setActiveTab("contribuicoes")} className={`px-6 py-3 font-display text-base tracking-wider uppercase transition cursor-pointer border-b-2 -mb-[2px] ${activeTab === "contribuicoes" ? "border-ocupa text-ocupa font-bold" : "border-transparent text-slate-500"}`}>Minhas Contribuições</button>
              <button onClick={() => setActiveTab("perfil")} className={`px-6 py-3 font-display text-base tracking-wider uppercase transition cursor-pointer border-b-2 -mb-[2px] ${activeTab === "perfil" ? "border-ocupa text-ocupa font-bold" : "border-transparent text-slate-500"}`}>Meu Perfil</button>
            </>
          )}
        </div>

        {activeTab === "dashboard" && user?.role === 'ADMIN' && (
          <Card>
            <h3 className="text-xl font-bold">Visão Geral do Administrador</h3>
            <p>Você tem acesso ao painel de administração.</p>
            <div className="mt-4">
              <Button onClick={() => window.location.hash = "#" /* handled by app maybe? Wait, App uses route state */}>
                Para moderar, clique no menu "Moderação" na navegação superior.
              </Button>
            </div>
          </Card>
        )}

        {activeTab === "dashboard" && user?.role === 'ARTISTA' && (
          <div className="space-y-6">
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
          </div>
        )}

        {activeTab === "portfolio" && user?.role === 'ARTISTA' && (
          <Card>
            <form onSubmit={handleSavePortfolio} className="space-y-6">
              <h2 className="text-xl font-bold border-b border-slate-200 dark:border-slate-700 pb-2 text-slate-800 dark:text-slate-200">Informações Profissionais</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="cidade">Cidade do Artista</Label>
                  <TextInput id="cidade" placeholder="Ex: São Paulo" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="foto">Foto de Perfil do Artista</Label>
                  <input id="foto" type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const base64 = await convertToBase64(file);
                      setFotoUrl(base64);
                    }
                  }} className="block w-full text-sm..." />
                  {fotoUrl && <img src={fotoUrl} alt="Visualização" className="mt-2 h-10 w-10 object-cover rounded-full border border-slate-200" />}
                </div>
              </div>
              <div>
                <Label htmlFor="headline">Headline / Slogan Profissional</Label>
                <TextInput id="headline" placeholder="Ex: Grafiteira e Muralista..." value={headline} onChange={(e) => setHeadline(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="about">Sobre você (Bio detalhada de portfólio)</Label>
                <Textarea id="about" placeholder="Conte sua trajetória..." value={about} onChange={(e) => setAbout(e.target.value)} rows={5} required />
              </div>
              <div>
                <Label htmlFor="contacts">Contatos Públicos (Redes, Telefone, Email)</Label>
                <TextInput id="contacts" placeholder="Ex: Instagram: @nome_artista" value={contacts} onChange={(e) => setContacts(e.target.value)} required />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold border-b border-slate-200 dark:border-slate-700 pb-2 text-slate-800 dark:text-slate-200">Mídias do Portfólio (Fotos/Vídeos)</h3>
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
                      <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const base64 = await convertToBase64(file);
                          setNewMediaUrl(base64);
                        }
                      }} className="block w-full text-sm..." />
                    ) : (
                      <TextInput id="mediaUrl" placeholder={newMediaType === "VIDEO" ? "https://youtube.com/..." : "https://soundcloud.com/..."} value={newMediaUrl} onChange={(e) => setNewMediaUrl(e.target.value)} />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="mediaCaption">Legenda</Label>
                    <TextInput id="mediaCaption" placeholder="Nome do trabalho / local" value={newMediaCaption} onChange={(e) => setNewMediaCaption(e.target.value)} />
                  </div>
                  <Button type="button" onClick={addMediaItem} className="w-full mt-2 sm:col-span-3">Adicionar Mídia ao Portfólio</Button>
                </div>
                {mediaList.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mt-4">
                    {mediaList.map((item, idx) => (
                      <Card key={idx} className="relative overflow-hidden group">
                        <div className="h-32 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                          {item.mediaType === "IMAGE" ? <img src={item.url} alt={item.caption} className="w-full h-full object-cover" /> : <span className="text-xs uppercase text-slate-500 font-semibold">{item.mediaType} Link</span>}
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-slate-500">{item.mediaType}</p>
                          <p className="font-semibold text-sm truncate">{item.caption || "Sem legenda"}</p>
                          <Button size="xs" color="failure" className="mt-2 w-full" onClick={() => removeMediaItem(idx)}>Remover</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              {error && <Alert color="failure">{error}</Alert>}
              {success && <Alert color="success">{success}</Alert>}
              <Button type="submit" color="indigo" size="lg" className="w-full">Salvar Meu Portfólio</Button>
            </form>
          </Card>
        )}

        {activeTab === "requests" && user?.role === 'ARTISTA' && (
          <Card>
            <h2 className="text-xl font-bold border-b border-slate-200 dark:border-slate-700 pb-2 text-slate-800 dark:text-slate-200">Gerenciamento de Solicitações</h2>
            {requests.length > 0 ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-4">
                {requests.map((req) => (
                  <div key={req.id} className="pt-4 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">De: {req.requesterNome}</h3>
                        <Badge color={req.status === "PENDING" ? "warning" : req.status === "ACCEPTED" ? "info" : req.status === "REJECTED" ? "failure" : "success"}>{req.status}</Badge>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 p-3 rounded text-sm whitespace-pre-line">{req.descricao}</p>
                      <div className="text-xs text-slate-500 space-y-1">
                        <p><strong>Contato do Cliente:</strong> {req.requesterContato}</p>
                        <p><strong>Solicitado em:</strong> {new Date(req.criadoEm).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                    {req.status === "PENDING" && (
                      <div className="flex md:flex-col gap-2 justify-end items-end self-center md:self-auto">
                        <Button size="sm" color="success" onClick={() => handleUpdateRequestStatus(req.id, "ACCEPTED")}>Aceitar</Button>
                        <Button size="sm" color="failure" onClick={() => handleUpdateRequestStatus(req.id, "REJECTED")}>Recusar</Button>
                      </div>
                    )}
                    {req.status === "ACCEPTED" && (
                      <div className="flex justify-end items-center self-center md:self-auto">
                        <Button size="sm" color="indigo" onClick={() => handleUpdateRequestStatus(req.id, "COMPLETED")}>Concluir</Button>
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

        {activeTab === "contribuicoes" && (
          <Card>
            <h2 className="text-xl font-bold border-b border-slate-200 dark:border-slate-700 pb-2 text-slate-800 dark:text-slate-200">Minhas Contribuições</h2>
            
            <div className="space-y-8 mt-4">
              <div>
                <h3 className="text-lg font-bold mb-2">Espaços Mapeados</h3>
                {contribuicoes.espacos.length === 0 ? <p className="text-slate-500 text-sm">Nenhum espaço.</p> : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {contribuicoes.espacos.map((item: any) => (
                      <div key={item.id} className="p-3 border rounded-lg flex justify-between">
                        <span className="font-semibold">{item.nome}</span>
                        <Badge color={item.status === 'PENDING' ? 'warning' : item.status === 'REJECTED' ? 'failure' : 'success'}>{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Eventos Sugeridos</h3>
                {contribuicoes.eventos.length === 0 ? <p className="text-slate-500 text-sm">Nenhum evento.</p> : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {contribuicoes.eventos.map((item: any) => (
                      <div key={item.id} className="p-3 border rounded-lg flex justify-between">
                        <span className="font-semibold">{item.titulo}</span>
                        <Badge color={item.status === 'PENDING' ? 'warning' : item.status === 'REJECTED' ? 'failure' : 'success'}>{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Oportunidades Compartilhadas</h3>
                {contribuicoes.oportunidades.length === 0 ? <p className="text-slate-500 text-sm">Nenhuma oportunidade.</p> : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {contribuicoes.oportunidades.map((item: any) => (
                      <div key={item.id} className="p-3 border rounded-lg flex justify-between">
                        <span className="font-semibold">{item.titulo}</span>
                        <Badge color={item.status === 'PENDING' ? 'warning' : item.status === 'REJECTED' ? 'failure' : 'success'}>{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {activeTab === "perfil" && user?.role === 'COLABORADOR' && (
          <Card>
            <h2 className="text-xl font-bold border-b border-slate-200 dark:border-slate-700 pb-2 text-slate-800 dark:text-slate-200">Meu Perfil</h2>
            <div className="space-y-4 mt-4">
              <p><strong>Nome:</strong> {user.nome}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p className="text-sm text-slate-500">Como colaborador, seu papel é mapear espaços, sugerir eventos e oportunidades culturais na região.</p>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
