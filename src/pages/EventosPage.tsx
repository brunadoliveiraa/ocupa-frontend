import { Alert, Button, Card, Label, Select, TextInput } from "flowbite-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

declare const L: any;

export default function EventosPage({ user }: { user: any }) {
  const [eventos, setEventos] = useState<any[]>([]);
  const [artistas, setArtistas] = useState<any[]>([]);
  const [espacos, setEspacos] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  
  // Fields
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [local, setLocal] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [horaEvento, setHoraEvento] = useState("");
  const [publicoEstimado, setPublicoEstimado] = useState(0);
  const [selectedArtistaId, setSelectedArtistaId] = useState("");
  const [selectedEspacoId, setSelectedEspacoId] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAll();
    fetchDropdowns();
  }, []);

  async function fetchDropdowns() {
    try {
      const [rArtistas, rEspacos] = await Promise.all([
        fetch(`${API_URL}/api/artistas`),
        fetch(`${API_URL}/api/espacos`)
      ]);
      if (rArtistas.ok) setArtistas(await rArtistas.json());
      if (rEspacos.ok) setEspacos(await rEspacos.json());
    } catch (err) {
      console.error("Erro ao buscar dados secundários:", err);
    }
  }

  // Initialize and Update Map
  useEffect(() => {
    const mapElement = document.getElementById("event-map");
    if (!mapElement || typeof L === "undefined") return;

    // Create Map centered in Sao Paulo (default)
    const map = L.map("event-map").setView([-23.55052, -46.633308], 13);
    
    // Load OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
    }).addTo(map);

    // Custom pins for events (styled purple with Tailwind CSS)
    const eventIcon = L.divIcon({
      html: `<div class="w-8 h-8 bg-purple-600 hover:bg-purple-700 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white transition-all transform hover:scale-115">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
               </svg>
             </div>`,
      className: "custom-leaflet-event-pin",
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    // Populate markers on map based on event locations (inherited from associated spaces)
    eventos.forEach((evento) => {
      // Coordinate fallback: event coordinates OR associated space coordinates
      const lat = evento.latitude || evento.espaco?.latitude;
      const lng = evento.longitude || evento.espaco?.longitude;

      if (lat && lng) {
        L.marker([lat, lng], { icon: eventIcon })
          .addTo(map)
          .bindPopup(
            `<div class="p-2 space-y-1">
              <h4 class="font-bold text-slate-800 text-sm">${evento.nome}</h4>
              <p class="text-xs text-indigo-600 font-semibold">${evento.dataEvento} às ${evento.horaEvento.substring(0, 5)}</p>
              <p class="text-xs text-slate-600">${evento.local || evento.espaco?.nome || "Espaço periférico"}</p>
             </div>`
          );
      }
    });

    // Adjust bounds
    const validCoords = eventos
      .map(ev => [ev.latitude || ev.espaco?.latitude, ev.longitude || ev.espaco?.longitude])
      .filter(coords => coords[0] && coords[1]);

    if (validCoords.length > 0) {
      map.fitBounds(validCoords, { padding: [50, 50], maxZoom: 15 });
    }

    // Cleanup Leaflet map when component unmounts
    return () => {
      map.remove();
    };
  }, [eventos]);

  async function fetchAll() {
    try {
      const response = await fetch(`${API_URL}/api/eventos`);
      if (response.ok) {
        const data = await response.json();
        // Sort by date (upcoming events first)
        setEventos(data.sort((a: any, b: any) => new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime()));
      }
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
    }
  }

  const isEditing = useMemo(() => selected !== null, [selected]);

  function resetForm() {
    setSelected(null);
    setNome("");
    setDescricao("");
    setLocal("");
    setDataEvento("");
    setHoraEvento("");
    setPublicoEstimado(0);
    setSelectedArtistaId("");
    setSelectedEspacoId("");
    setError(null);
    setShowForm(false);
  }

  function fillForm(evento: any) {
    setSelected(evento);
    setNome(evento.nome || "");
    setDescricao(evento.descricao || "");
    setLocal(evento.local || "");
    setDataEvento(evento.dataEvento || "");
    setHoraEvento(evento.horaEvento || "");
    setPublicoEstimado(evento.publicoEstimado || 0);
    setSelectedArtistaId(evento.artista?.id?.toString() || "");
    setSelectedEspacoId(evento.espaco?.id?.toString() || "");
    setError(null);
    setShowForm(true);
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    // Find full references of selected items
    const artistaObj = artistas.find(a => a.id.toString() === selectedArtistaId);
    const espacoObj = espacos.find(e => e.id.toString() === selectedEspacoId);

    const payload = {
      nome,
      descricao,
      local: local || espacoObj?.nome || "",
      dataEvento,
      horaEvento: horaEvento.includes(":") && horaEvento.split(":").length === 2 ? `${horaEvento}:00` : horaEvento,
      publicoEstimado,
      artista: artistaObj ? { id: artistaObj.id } : null,
      espaco: espacoObj ? { id: espacoObj.id } : null,
      // If event coordinates are not typed, inherit them from associated space
      latitude: espacoObj?.latitude || null,
      longitude: espacoObj?.longitude || null,
      criadoPorEmail: isEditing ? selected.criadoPorEmail : (user ? user.email : null)
    };

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/api/eventos/${selected.id}` : `${API_URL}/api/eventos`;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar evento");
      }

      await fetchAll();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Erro de conexão ao salvar evento");
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`${API_URL}/api/eventos/${id}`, { method: "DELETE" });
      await fetchAll();
    } catch (err) {
      console.error("Erro ao deletar evento:", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Agenda Cultural</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gerencie a agenda do ecossistema: batalhas de rima, saraus, festivais e mostras culturais.
            </p>
          </div>
          {user && (
            <Button color="purple" onClick={() => { isEditing ? resetForm() : setShowForm(!showForm); }}>
              {showForm ? "Esconder Formulário" : "Agendar Novo Evento"}
            </Button>
          )}
        </div>

        {/* Form panel */}
        {showForm && (
          <Card className="border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold border-b pb-2 text-purple-600 dark:text-purple-400">
              {isEditing ? "Editar Evento da Agenda" : "Agendar Novo Evento Cultural"}
            </h2>
            
            <form className="grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Evento</Label>
                  <TextInput id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Sarau da Quebrada - 12ª Edição" required />
                </div>
                
                <div>
                  <Label htmlFor="descricao">Descrição Completa</Label>
                  <TextInput id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Microfone aberto para poesias, performances e debate..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataEvento">Data</Label>
                    <TextInput id="dataEvento" type="date" value={dataEvento} onChange={(e) => setDataEvento(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="horaEvento">Hora</Label>
                    <TextInput id="horaEvento" type="time" value={horaEvento} onChange={(e) => setHoraEvento(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="publicoEstimado">Público Estimado (Capacidade)</Label>
                  <TextInput
                    id="publicoEstimado"
                    type="number"
                    value={publicoEstimado}
                    onChange={(e) => setPublicoEstimado(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="artistaId">Artista / Coletivo Responsável</Label>
                  <Select id="artistaId" value={selectedArtistaId} onChange={(e) => setSelectedArtistaId(e.target.value)} required>
                    <option value="">Selecione um artista...</option>
                    {artistas.map(a => (
                      <option key={a.id} value={a.id}>{a.nome} ({a.categoria})</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="espacoId">Espaço Cultural / Localização</Label>
                  <Select id="espacoId" value={selectedEspacoId} onChange={(e) => setSelectedEspacoId(e.target.value)} required>
                    <option value="">Selecione um espaço mapeado...</option>
                    {espacos.map(e => (
                      <option key={e.id} value={e.id}>{e.nome} - {e.endereco}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="local">Referência de Localização Especial (Opcional)</Label>
                  <TextInput id="local" value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex: Próximo à estação de metrô / Palco A" />
                </div>
              </div>

              {error && <Alert color="failure" className="lg:col-span-2">{error}</Alert>}

              <div className="lg:col-span-2 flex gap-3 pt-2">
                <Button type="submit" color="purple">{isEditing ? "Atualizar" : "Salvar na Agenda"}</Button>
                <Button color="gray" onClick={resetForm}>Cancelar</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Map and Directory Container */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Map display */}
          <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold p-4 border-b">Distribuição Geográfica dos Eventos (Mapeamento Afetivo)</h3>
            <div id="event-map" className="w-full h-[450px] rounded-b-lg"></div>
          </Card>

          {/* Events directory */}
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
            <h3 className="text-lg font-bold border-b pb-2">Programação (Linha do Tempo)</h3>
            
            {eventos.length > 0 ? (
              eventos.map((evento) => {
                const dateParsed = new Date(evento.dataEvento).toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short"
                });
                
                return (
                  <Card key={evento.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow">
                    <div className="flex items-start gap-4">
                      {/* Date badge */}
                      <div className="flex flex-col items-center justify-center bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 p-3 rounded-lg font-bold min-w-16">
                        <span className="text-xs uppercase">{dateParsed.split(" ")[0]}</span>
                        <span className="text-xl">{dateParsed.split(" ")[1]}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold leading-tight">{evento.nome}</h2>
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          Hora: {evento.horaEvento.substring(0, 5)} | Público Est.: {evento.publicoEstimado || 0}
                        </p>
                        
                        {evento.espaco && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                            Local: {evento.espaco.nome}
                          </p>
                        )}
                        
                        {evento.artista && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Organizado por: <span className="font-semibold text-slate-600 dark:text-slate-300">{evento.artista.nome}</span>
                          </p>
                        )}

                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-3 bg-slate-100 dark:bg-slate-900 p-2 rounded whitespace-pre-line">
                          {evento.descricao || "Sem descrição."}
                        </p>
                      </div>
                    </div>

                    {user && (user.role === "ADMIN" || user.email === evento.criadoPorEmail) && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 justify-end">
                        <Button size="xs" color="gray" onClick={() => fillForm(evento)}>Editar</Button>
                        <Button size="xs" color="failure" onClick={() => handleDelete(evento.id)}>Excluir</Button>
                      </div>
                    )}
                  </Card>
                );
              })
            ) : (
              <p className="text-slate-500 italic text-sm">Nenhum evento agendado ainda.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
