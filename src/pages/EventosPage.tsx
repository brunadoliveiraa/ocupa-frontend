import { Alert, Label, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface EventosPageProps {
  user?: any;
}

export default function EventosPage({ user }: EventosPageProps) {
  const [eventos, setEventos] = useState<any[]>([]);
  const [artistas, setArtistas] = useState<any[]>([]);
  const [espacos, setEspacos] = useState<any[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form fields
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [horaEvento, setHoraEvento] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [artistaId, setArtistaId] = useState<string>("");
  const [espacoId, setEspacoId] = useState<string>("");

  // Period tab navigation filter
  const [activePeriod, setActivePeriod] = useState<string>("");
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Details Modal State
  const [detailEvent, setDetailEvent] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [rEvt, rArt, rEsp] = await Promise.all([
        fetch(`${API_URL}/api/eventos`),
        fetch(`${API_URL}/api/artistas`),
        fetch(`${API_URL}/api/espacos`),
      ]);

      let evtsData: any[] = [];
      if (rEvt.ok) {
        evtsData = await rEvt.json();
        setEventos(evtsData);
      }
      if (rArt.ok) setArtistas(await rArt.json());
      if (rEsp.ok) setEspacos(await rEsp.json());

      // Extract unique YYYY-MM periods from data, sorted ascending
      const periods = Array.from(
        new Set(
          evtsData
            .map((e) => e.dataEvento && e.dataEvento.substring(0, 7))
            .filter(Boolean)
        )
      ).sort() as string[];

      setAvailablePeriods(periods);
      
      // Auto-select current month if available, else select first period
      const currentMonth = new Date().toISOString().substring(0, 7);
      if (periods.includes(currentMonth)) {
        setActivePeriod(currentMonth);
      } else if (periods.length > 0) {
        setActivePeriod(periods[0]);
      }
    } catch (err) {
      console.error("Erro ao carregar dados da agenda:", err);
    }
  }

  function resetForm() {
    setNome("");
    setDescricao("");
    setDataEvento("");
    setHoraEvento("");
    setFotoUrl("");
    setArtistaId("");
    setEspacoId("");
    setIsEditing(false);
    setSelectedId(null);
    setShowForm(false);
  }

  function fillForm(evento: any) {
    setNome(evento.nome || "");
    setDescricao(evento.descricao || "");
    setDataEvento(evento.dataEvento || "");
    setHoraEvento(evento.horaEvento || "");
    setFotoUrl(evento.fotoUrl || "");
    setArtistaId(evento.artista?.id ? String(evento.artista.id) : "");
    setEspacoId(evento.espaco?.id ? String(evento.espaco.id) : "");

    setIsEditing(true);
    setSelectedId(evento.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      nome,
      descricao,
      dataEvento,
      horaEvento,
      fotoUrl,
      artista: artistaId ? { id: Number(artistaId) } : null,
      espaco: espacoId ? { id: Number(espacoId) } : null,
      criadoPorEmail: user?.email,
    };

    try {
      const url = isEditing ? `${API_URL}/api/eventos/${selectedId}` : `${API_URL}/api/eventos`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar evento na agenda");

      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar evento");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja remover este evento da agenda?")) return;
    try {
      const res = await fetch(`${API_URL}/api/eventos/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Erro ao deletar evento:", err);
    }
  }

  // Filter events by selected period tab YYYY-MM
  const filteredEvents = eventos.filter((e) => {
    if (!activePeriod) return true;
    return e.dataEvento && e.dataEvento.startsWith(activePeriod);
  });

  const getPeriodLabel = (periodStr: string) => {
    if (!periodStr) return "";
    const [year, month] = periodStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-white py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wider leading-tight text-slate-900 dark:text-white">
                Agenda Cultural
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                Eventos oficiais da comunidade organizados em um só lugar: batalhas de rima, mutirões, festivais e muito mais.
              </p>
            </div>
            {user && (
              <button
                onClick={() => { isEditing ? resetForm() : setShowForm(!showForm); }}
                className="bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-lg tracking-wider uppercase rounded-sm px-4 py-2 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                {showForm ? "Esconder Formulário" : "Agendar Novo Evento"}
              </button>
            )}
          </div>
          
          {availablePeriods.length > 0 && (
            <div className="flex justify-end w-full pt-2">
              <div className="flex gap-2 flex-wrap">
                {availablePeriods.map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePeriod(p)}
                    className={`px-4 py-2 text-sm font-display uppercase tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer ${
                      activePeriod === p
                        ? "border-[#e76e3c] text-[#e76e3c] font-bold"
                        : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {getPeriodLabel(p)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form panel */}
        {showForm && (
          <div className="border border-slate-900 dark:border-slate-600 rounded-sm p-6 bg-white dark:bg-slate-900 space-y-6">
            <h2 className="font-display text-2xl uppercase tracking-wider text-[#e76e3c] border-b border-slate-200 dark:border-slate-800 pb-2">
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
                  <Label htmlFor="fotoUrl">URL da Foto de Capa (Opcional)</Label>
                  <TextInput id="fotoUrl" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} placeholder="https://exemplo.com/cartaz.jpg" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="artistaId">Vincular Artista Principal (Opcional)</Label>
                  <Select id="artistaId" value={artistaId} onChange={(e) => setArtistaId(e.target.value)}>
                    <option value="">Nenhum artista vinculado</option>
                    {artistas.map((a) => (
                      <option key={a.id} value={a.id}>{a.nome} ({a.categoria || "Artista"})</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="espacoId">Vincular Espaço Mapeado (Opcional)</Label>
                  <Select id="espacoId" value={espacoId} onChange={(e) => setEspacoId(e.target.value)}>
                    <option value="">Nenhum espaço vinculado</option>
                    {espacos.map((esp) => (
                      <option key={esp.id} value={esp.id}>{esp.nome} - {esp.endereco}</option>
                    ))}
                  </Select>
                </div>
              </div>

              {error && <Alert color="failure" className="lg:col-span-2">{error}</Alert>}

              <div className="lg:col-span-2 flex gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-lg tracking-wider uppercase rounded-sm px-5 py-2 transition-colors cursor-pointer"
                >
                  {isEditing ? "Atualizar" : "Salvar Evento"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-display text-lg tracking-wider uppercase rounded-sm px-5 py-2 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events Grid by Selected Period */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="font-display text-xl uppercase tracking-wider text-slate-900 dark:text-white">
              Eventos de {getPeriodLabel(activePeriod) || "Todos os meses"}
            </h3>
            <span className="font-display text-xs px-2 py-0.5 rounded bg-[#e76e3c] text-white uppercase tracking-wider">
              {filteredEvents.length} Evento(s)
            </span>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredEvents.map((evento) => {
                return (
                  <div
                    key={evento.id}
                    className="border border-slate-900 dark:border-slate-600 rounded-sm p-4 bg-white dark:bg-slate-900 hover:border-ocupa hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Cover image */}
                      <div className="h-60 w-full rounded-sm overflow-hidden border border-slate-900 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 relative">
                        {evento.fotoUrl ? (
                          <img src={evento.fotoUrl} alt={evento.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-display text-lg text-slate-500 uppercase">
                            Sem Foto de Capa
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="font-display text-xl uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-ocupa transition-colors line-clamp-2">
                        {evento.nome}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed text-justify">
                        {evento.descricao || "Sem descrição disponível."}
                      </p>

                      {/* Meta Details */}
                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1">
                        {evento.dataEvento && (
                          <p>
                            <strong className="text-slate-900 dark:text-white">Data & Hora:</strong> {new Date(evento.dataEvento + "T00:00:00").toLocaleDateString("pt-BR")}
                            {evento.horaEvento ? ` às ${evento.horaEvento.substring(0, 5)}` : ""}
                          </p>
                        )}

                        {evento.artista && (
                          <p>
                            <strong className="text-slate-900 dark:text-white">Artista:</strong> <span className="font-semibold text-ocupa">{evento.artista.nome}</span>
                          </p>
                        )}

                        {evento.espaco && (
                          <div>
                            <p><strong className="text-slate-900 dark:text-white">Espaço:</strong> <span className="font-semibold text-blue-900 dark:text-blue-400">{evento.espaco.nome}</span></p>
                            {evento.espaco.endereco && <p className="text-[11px] text-slate-400 truncate italic">{evento.espaco.endereco}</p>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 justify-between items-center">
                      <button
                        onClick={() => setDetailEvent(evento)}
                        className="bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-sm tracking-wider uppercase rounded-sm px-3 py-1 transition-colors cursor-pointer"
                      >
                        Ver Detalhes
                      </button>

                      {user && (user.role === "ADMIN" || user.email === evento.criadoPorEmail) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => fillForm(evento)}
                            className="bg-[#1b1cbb] hover:bg-[#15169a] text-white font-display text-xs tracking-wider uppercase rounded-sm px-3 py-1 transition-colors cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(evento.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-display text-xs tracking-wider uppercase rounded-sm px-3 py-1 transition-colors cursor-pointer"
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 italic text-sm">Nenhum evento agendado para {getPeriodLabel(activePeriod) || "este mês"}.</p>
          )}
        </div>

        {/* Details Modal */}
        {detailEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-sm max-w-lg w-full overflow-hidden shadow-2xl border border-slate-900 dark:border-slate-800 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-display text-2xl uppercase tracking-wider text-slate-900 dark:text-white truncate">
                  {detailEvent.nome}
                </h3>
                <button onClick={() => setDetailEvent(null)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-2xl cursor-pointer">&times;</button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 overflow-y-auto">
                {detailEvent.fotoUrl && (
                  <div className="h-64 w-full rounded-sm overflow-hidden border border-slate-900 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                    <img src={detailEvent.fotoUrl} alt={detailEvent.nome} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-1">
                  <h4 className="font-display text-sm uppercase tracking-wider text-slate-500">Descrição</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                    {detailEvent.descricao || "Sem descrição detalhada fornecida."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {detailEvent.dataEvento && (
                    <div>
                      <h4 className="font-display text-xs uppercase tracking-wider text-slate-500">Data e Horário</h4>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(detailEvent.dataEvento + "T00:00:00").toLocaleDateString("pt-BR")}
                        {detailEvent.horaEvento ? ` às ${detailEvent.horaEvento.substring(0, 5)}` : ""}
                      </p>
                    </div>
                  )}

                  {detailEvent.artista && (
                    <div>
                      <h4 className="font-display text-xs uppercase tracking-wider text-slate-500">Artista Principal</h4>
                      <p className="font-semibold text-ocupa">{detailEvent.artista.nome}</p>
                    </div>
                  )}

                  {detailEvent.espaco && (
                    <div className="col-span-2">
                      <h4 className="font-display text-xs uppercase tracking-wider text-slate-500">Espaço Cultural</h4>
                      <p className="font-semibold text-blue-900 dark:text-blue-400">{detailEvent.espaco.nome}</p>
                      {detailEvent.espaco.endereco && (
                        <p className="text-slate-500 italic">{detailEvent.espaco.endereco}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
                <button
                  onClick={() => setDetailEvent(null)}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-display text-lg tracking-wider uppercase rounded-sm px-4 py-2 transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
