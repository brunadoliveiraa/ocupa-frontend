import { Alert, Button, Card, Label, Select, TextInput } from "flowbite-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

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
  const [fotoUrl, setFotoUrl] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Filter tab and modal details states
  const [activePeriod, setActivePeriod] = useState<string>("");
  const [detailEvent, setDetailEvent] = useState<any | null>(null);

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

  function getPeriodLabel(periodStr: string) {
    if (!periodStr) return "";
    const [yearStr, monthStr] = periodStr.split("-");
    const year = parseInt(yearStr);
    const date = new Date(year, parseInt(monthStr) - 1, 1);
    const monthLabel = date.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase().replace(".", "");
    
    const currentYear = new Date().getFullYear();
    if (year !== currentYear) {
      const shortYear = yearStr.substring(2);
      return `${monthLabel} '${shortYear}`;
    }
    return monthLabel;
  }

  const availablePeriods = useMemo(() => {
    const periodsSet = new Set<string>();
    eventos.forEach(ev => {
      if (ev.dataEvento) {
        const date = new Date(ev.dataEvento + "T00:00:00");
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        periodsSet.add(`${y}-${m}`);
      }
    });
    if (periodsSet.size === 0) {
      const now = new Date();
      const y = now.getFullYear();
      const m = (now.getMonth() + 1).toString().padStart(2, '0');
      periodsSet.add(`${y}-${m}`);
    }
    return Array.from(periodsSet).sort();
  }, [eventos]);

  useEffect(() => {
    if (availablePeriods.length > 0 && (!activePeriod || !availablePeriods.includes(activePeriod))) {
      setActivePeriod(availablePeriods[0]);
    }
  }, [availablePeriods, activePeriod]);

  const filteredEventos = useMemo(() => {
    if (!activePeriod) return eventos;
    return eventos.filter(ev => {
      if (!ev.dataEvento) return false;
      const date = new Date(ev.dataEvento + "T00:00:00");
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${y}-${m}` === activePeriod;
    });
  }, [eventos, activePeriod]);

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
    setFotoUrl("");
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
    setFotoUrl(evento.fotoUrl || "");
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
      latitude: espacoObj?.latitude || null,
      longitude: espacoObj?.longitude || null,
      fotoUrl,
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
        <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Agenda Cultural</h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Gerencie a agenda do ecossistema: batalhas de rima, saraus, festivais e mostras culturais.
              </p>
            </div>
            {user && (
              <Button color="purple" onClick={() => { isEditing ? resetForm() : setShowForm(!showForm); }}>
                {showForm ? "Esconder Formulário" : "Agendar Novo Evento"}
              </Button>
            )}
          </div>
          
          {availablePeriods.length > 0 && (
            <div className="flex justify-end w-full">
              <div className="flex gap-2">
                {availablePeriods.map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePeriod(p)}
                    className={`px-4 py-3 text-sm font-bold uppercase transition-all border-b-2 -mb-[2px] ${
                      activePeriod === p
                        ? "border-purple-600 text-purple-600 dark:text-purple-400 font-extrabold"
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

                <div>
                  <Label htmlFor="eventFoto">Foto / Capa de Título do Evento</Label>
                  <input
                    id="eventFoto"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const base64 = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = () => resolve(reader.result as string);
                            reader.onerror = reject;
                          });
                          setFotoUrl(base64);
                        } catch (err) {
                          console.error("Erro ao converter imagem do evento:", err);
                        }
                      }
                    }}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 bg-white border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
                  />
                  {fotoUrl && (
                    <div className="mt-2 h-20 w-32 rounded overflow-hidden border border-slate-200 dark:border-slate-800">
                      <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
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

        {/* Directory Container */}
        <div className="space-y-6">
          <h3 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-200">
            Programação do Mês
          </h3>

          {filteredEventos.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredEventos.map((evento) => {
                const dateObj = new Date(evento.dataEvento + "T00:00:00");
                const day = dateObj.getDate().toString().padStart(2, '0');
                const monthShort = dateObj.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase().replace(".", "");
                const dateFormatted = `${day}.${monthShort}`;

                return (
                  <Card key={evento.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full p-0 overflow-hidden">
                    <div className="p-4 flex flex-col h-full space-y-3">
                      {/* 1. Date above image */}
                      <span className="text-sm font-extrabold text-slate-500 tracking-wider">
                        {dateFormatted}
                      </span>

                      {/* 2. Cover image */}
                      <div className="h-40 w-full rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 relative">
                        {evento.fotoUrl ? (
                          <img src={evento.fotoUrl} alt={evento.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500/25 to-pink-500/25 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-xs">
                            Sem Foto de Capa
                          </div>
                        )}
                      </div>

                      {/* 3. Title below image */}
                      <h4 className="text-md font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {evento.espaco ? `${evento.espaco.nome} | ` : ""}{evento.nome}
                      </h4>

                      {/* 4. Description below title */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed flex-grow">
                        {evento.descricao || "Sem descrição disponível."}
                      </p>

                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate italic">
                        {evento.local || (evento.espaco ? evento.espaco.endereco : "")}
                      </p>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
                        <Button size="xs" color="purple" className="w-full font-bold" onClick={() => setDetailEvent(evento)}>
                          Ver Detalhes
                        </Button>
                        {user && (user.role === "ADMIN" || user.email === evento.criadoPorEmail) && (
                          <div className="flex gap-2">
                            <Button size="xs" color="gray" className="flex-1" onClick={() => fillForm(evento)}>
                              Editar
                            </Button>
                            <Button size="xs" color="failure" className="flex-1" onClick={() => handleDelete(evento.id)}>
                              Excluir
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
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
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{detailEvent.nome}</h3>
                <button onClick={() => setDetailEvent(null)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-xl">&times;</button>
              </div>
              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4">
                {detailEvent.fotoUrl && (
                  <div className="h-48 w-full rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                    <img src={detailEvent.fotoUrl} alt={detailEvent.nome} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs uppercase text-slate-400 font-bold">Data & Hora</h4>
                    <p className="text-sm font-semibold">
                      {new Date(detailEvent.dataEvento + "T00:00:00").toLocaleDateString("pt-BR")} às {detailEvent.horaEvento.substring(0, 5)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase text-slate-400 font-bold">Público Estimado</h4>
                    <p className="text-sm font-semibold">{detailEvent.publicoEstimado || 0} pessoas</p>
                  </div>
                </div>

                {detailEvent.espaco && (
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                    <h4 className="text-xs uppercase text-slate-400 font-bold">Espaço / Localização</h4>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{detailEvent.espaco.nome}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{detailEvent.espaco.endereco}</p>
                    {detailEvent.local && <p className="text-xs italic text-slate-500 mt-1">Ref: {detailEvent.local}</p>}
                  </div>
                )}

                {detailEvent.artista && (
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                    <h4 className="text-xs uppercase text-slate-400 font-bold">Artista / Coletivo</h4>
                    <p className="text-sm font-semibold">{detailEvent.artista.nome}</p>
                    <p className="text-xs text-slate-500">{detailEvent.artista.categoria}</p>
                  </div>
                )}

                <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                  <h4 className="text-xs uppercase text-slate-400 font-bold">Sobre o Evento</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line mt-1 bg-slate-100 dark:bg-slate-950 p-3 rounded-lg">
                    {detailEvent.descricao || "Sem descrição."}
                  </p>
                </div>
              </div>
              {/* Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                <Button color="purple" onClick={() => setDetailEvent(null)}>Fechar</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
