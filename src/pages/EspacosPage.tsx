import { Alert, Label, TextInput, ToggleSwitch } from "flowbite-react";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface EspacosPageProps {
  user?: any;
}

export default function EspacosPage({ user }: EspacosPageProps) {
  const [espacos, setEspacos] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form states
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [capacidade, setCapacidade] = useState<number>(0);
  const [latitude, setLatitude] = useState("-23.55052");
  const [longitude, setLongitude] = useState("-46.633308");

  // Infrastructure toggles
  const [cobertura, setCobertura] = useState(false);
  const [iluminacao, setIluminacao] = useState(false);
  const [energia, setEnergia] = useState(false);
  const [banheiro, setBanheiro] = useState(false);
  const [permiteGrafite, setPermiteGrafite] = useState(false);
  const [permiteBatalha, setPermiteBatalha] = useState(false);
  const [permiteDanca, setPermiteDanca] = useState(false);

  // Media gallery states
  const [mediaList, setMediaList] = useState<{ url: string; caption: string }[]>([]);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [mediaCaptionInput, setMediaCaptionInput] = useState("");

  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [tempMarker, setTempMarker] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEspacos();
  }, []);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const L = (window as any).L;
    if (!L) return;
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    if ((mapContainer as any)._leaflet_id) {
      (mapContainer as any)._leaflet_id = null;
    }

    const initialMap = L.map("map").setView([-23.55052, -46.633308], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(initialMap);

    initialMap.on("click", (e: any) => {
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      setLatitude(lat);
      setLongitude(lng);

      if (tempMarker) {
        tempMarker.setLatLng(e.latlng);
      } else {
        const marker = L.marker(e.latlng).addTo(initialMap).bindPopup("Local selecionado").openPopup();
        setTempMarker(marker);
      }
    });

    setMap(initialMap);

    return () => {
      initialMap.remove();
    };
  }, []);

  // Render markers when spaces list updates
  useEffect(() => {
    if (!map) return;
    const L = (window as any).L;
    if (!L) return;
    markers.forEach((m) => m.remove());
    const newMarkers: any[] = [];

    espacos.forEach((espaco) => {
      if (espaco.latitude && espaco.longitude) {
        const marker = L.marker([Number(espaco.latitude), Number(espaco.longitude)])
          .addTo(map)
          .bindPopup(`
            <div style="font-family: inherit;">
              <strong style="font-size: 14px; color: #e76e3c;">${espaco.nome}</strong><br/>
              <span style="font-size: 12px; color: #666;">${espaco.endereco || ""}</span><br/>
              <p style="font-size: 11px; margin-top: 4px;">Capacidade: ${espaco.capacidade || "N/A"} pessoas</p>
            </div>
          `);
        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);

    if (newMarkers.length > 0) {
      const group = L.featureGroup(newMarkers);
      map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, espacos]);

  async function fetchEspacos() {
    try {
      const res = await fetch(`${API_URL}/api/espacos`);
      if (res.ok) {
        const data = await res.json();
        setEspacos(data);
      }
    } catch (err) {
      console.error("Erro ao buscar espaços:", err);
    }
  }

  function resetForm() {
    setNome("");
    setEndereco("");
    setDescricao("");
    setCapacidade(0);
    setLatitude("-23.55052");
    setLongitude("-46.633308");
    setCobertura(false);
    setIluminacao(false);
    setEnergia(false);
    setBanheiro(false);
    setPermiteGrafite(false);
    setPermiteBatalha(false);
    setPermiteDanca(false);
    setMediaList([]);
    setMediaUrlInput("");
    setMediaCaptionInput("");
    setIsEditing(false);
    setSelectedId(null);
    setShowForm(false);
    if (tempMarker) {
      tempMarker.remove();
      setTempMarker(null);
    }
  }

  function fillForm(espaco: any) {
    setNome(espaco.nome || "");
    setEndereco(espaco.endereco || "");
    setDescricao(espaco.descricao || "");
    setCapacidade(espaco.capacidade || 0);
    setLatitude(espaco.latitude || "-23.55052");
    setLongitude(espaco.longitude || "-46.633308");
    setCobertura(espaco.cobertura || false);
    setIluminacao(espaco.iluminacao || false);
    setEnergia(espaco.energia || false);
    setBanheiro(espaco.banheiro || false);
    setPermiteGrafite(espaco.permiteGrafite || false);
    setPermiteBatalha(espaco.permiteBatalha || false);
    setPermiteDanca(espaco.permiteDanca || false);

    if (espaco.mediaItems && Array.isArray(espaco.mediaItems)) {
      setMediaList(espaco.mediaItems.map((m: any) => ({ url: m.url, caption: m.caption || "" })));
    } else {
      setMediaList([]);
    }

    setIsEditing(true);
    setSelectedId(espaco.id);
    setShowForm(true);
  }

  function handleAddMedia() {
    if (!mediaUrlInput) return;
    setMediaList([...mediaList, { url: mediaUrlInput, caption: mediaCaptionInput }]);
    setMediaUrlInput("");
    setMediaCaptionInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      nome,
      endereco,
      descricao,
      capacidade,
      latitude,
      longitude,
      cobertura,
      iluminacao,
      energia,
      banheiro,
      permiteGrafite,
      permiteBatalha,
      permiteDanca,
      criadoPorEmail: user?.email,
      mediaItems: mediaList.map((m) => ({ mediaType: "IMAGE", url: m.url, caption: m.caption })),
    };

    try {
      const url = isEditing ? `${API_URL}/api/espacos/${selectedId}` : `${API_URL}/api/espacos`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar espaço cultural");

      resetForm();
      fetchEspacos();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar espaço");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja remover este espaço?")) return;
    try {
      const res = await fetch(`${API_URL}/api/espacos/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchEspacos();
      }
    } catch (err) {
      console.error("Erro ao deletar espaço:", err);
    }
  }

  return (
    <div className="min-h-screen bg-white py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wider leading-tight text-slate-900 dark:text-white">
              Espaços Culturais
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Locais públicos, praças e pontos mapeados para intervenções artísticas periféricas.
            </p>
          </div>
          {user && (
            <button
              onClick={() => { isEditing ? resetForm() : setShowForm(!showForm); }}
              className="bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-lg tracking-wider uppercase rounded-sm px-4 py-2 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              {showForm ? "Esconder Formulário" : "Mapear Novo Espaço"}
            </button>
          )}
        </div>

        {/* Form panel */}
        {showForm && (
          <div className="border border-slate-900 dark:border-slate-600 rounded-sm p-6 bg-white dark:bg-slate-900 space-y-6">
            <h2 className="font-display text-2xl uppercase tracking-wider text-[#e76e3c] border-b border-slate-200 dark:border-slate-800 pb-2">
              {isEditing ? "Editar Detalhes do Espaço" : "Mapear Novo Espaço Periférico"}
            </h2>
            
            <form className="grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Espaço</Label>
                  <TextInput id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Praça do Sarau Comunidade" required />
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <TextInput id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua das Flores, 123 - Bairro" required />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição / Histórico</Label>
                  <TextInput id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Ponto de encontro comunitário aos domingos..." />
                </div>
                <div>
                  <Label htmlFor="capacidade">Capacidade Aproximada de Público</Label>
                  <TextInput
                    id="capacidade"
                    type="number"
                    value={capacidade}
                    onChange={(e) => setCapacidade(Number(e.target.value))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <TextInput id="latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <TextInput id="longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic">Dica: Você também pode clicar em qualquer local no mapa à direita para preencher a Latitude e Longitude automaticamente!</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-display text-sm uppercase text-slate-500 tracking-wider">Atributos Físicos</h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-sm border border-slate-200 dark:border-slate-700">
                    <ToggleSwitch checked={cobertura} label="Cobertura" onChange={() => setCobertura(!cobertura)} />
                    <ToggleSwitch checked={iluminacao} label="Iluminação" onChange={() => setIluminacao(!iluminacao)} />
                    <ToggleSwitch checked={energia} label="Energia Elétrica" onChange={() => setEnergia(!energia)} />
                    <ToggleSwitch checked={banheiro} label="Banheiro Público" onChange={() => setBanheiro(!banheiro)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-display text-sm uppercase text-slate-500 tracking-wider">Atividades Permitidas</h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-sm border border-slate-200 dark:border-slate-700">
                    <ToggleSwitch checked={permiteGrafite} label="Grafite / Mural" onChange={() => setPermiteGrafite(!permiteGrafite)} />
                    <ToggleSwitch checked={permiteBatalha} label="Batalha de Rimas" onChange={() => setPermiteBatalha(!permiteBatalha)} />
                    <ToggleSwitch checked={permiteDanca} label="Danças / B-Boys" onChange={() => setPermiteDanca(!permiteDanca)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-display text-sm uppercase text-slate-500 tracking-wider">Galeria de Fotos (URL)</h3>
                  <div className="flex gap-2">
                    <TextInput
                      placeholder="https://exemplo.com/foto.jpg"
                      value={mediaUrlInput}
                      onChange={(e) => setMediaUrlInput(e.target.value)}
                      className="flex-1"
                    />
                    <TextInput
                      placeholder="Legenda (opcional)"
                      value={mediaCaptionInput}
                      onChange={(e) => setMediaCaptionInput(e.target.value)}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddMedia}
                      className="bg-[#1b1cbb] hover:bg-[#15169a] text-white font-display text-base tracking-wider uppercase rounded-sm px-3 py-1.5 transition-colors cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                {mediaList.length > 0 && (
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 md:grid-cols-6 mt-4">
                    {mediaList.map((item, idx) => (
                      <div key={idx} className="relative overflow-hidden group p-2 border border-slate-900 dark:border-slate-700 rounded-sm bg-slate-50 dark:bg-slate-800">
                        <div className="h-20 bg-slate-200 dark:bg-slate-800 flex items-center justify-center rounded-sm overflow-hidden">
                          <img src={item.url} alt={item.caption} className="w-full h-full object-cover" />
                        </div>
                        <div className="mt-1">
                          <p className="font-semibold text-xs truncate text-slate-700 dark:text-slate-300">{item.caption || "Sem legenda"}</p>
                          <button
                            type="button"
                            className="mt-1 w-full bg-red-600 hover:bg-red-700 text-white font-display text-xs tracking-wider uppercase rounded-sm py-1 cursor-pointer transition-colors"
                            onClick={() => setMediaList(mediaList.filter((_, i) => i !== idx))}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && <Alert color="failure" className="lg:col-span-2">{error}</Alert>}

              <div className="lg:col-span-2 flex gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-lg tracking-wider uppercase rounded-sm px-5 py-2 transition-colors cursor-pointer"
                >
                  {isEditing ? "Atualizar" : "Salvar Espaço"}
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

        {/* Map and Directory Container */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Map display */}
          <div className="border border-slate-900 dark:border-slate-600 rounded-sm overflow-hidden bg-white dark:bg-slate-900 p-0">
            <h3 className="font-display text-xl uppercase tracking-wider p-4 border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
              Mapeamento Afetivo de Espaços
            </h3>
            <div id="map" className="w-full h-[450px]"></div>
          </div>

          {/* Spaces directory */}
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
            <h3 className="font-display text-xl uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2 text-slate-900 dark:text-white">
              Lista de Espaços
            </h3>
            
            {espacos.length > 0 ? (
              espacos.map((espaco) => (
                <div
                  key={espaco.id}
                  className="border border-slate-900 dark:border-slate-600 rounded-sm p-4 bg-white dark:bg-slate-900 hover:border-ocupa hover:shadow-md transition-all cursor-pointer group space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-display text-xl uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-ocupa transition-colors">
                        {espaco.nome}
                      </h2>
                      <p className="text-xs text-slate-500">{espaco.endereco}</p>
                    </div>
                    <span className="font-display text-xs px-2 py-0.5 rounded bg-[#e76e3c] text-white uppercase tracking-wider whitespace-nowrap">
                      {espaco.capacidade || 0} Pessoas
                    </span>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 text-justify">
                    {espaco.descricao || "Sem descrição cadastrada."}
                  </p>

                  {/* Space media items compact gallery */}
                  {espaco.mediaItems && espaco.mediaItems.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {espaco.mediaItems.map((media: any) => (
                        <div key={media.id} className="h-16 rounded-sm overflow-hidden border border-slate-900 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 relative group">
                          <img src={media.url} alt={media.caption} className="w-full h-full object-cover" />
                          {media.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] truncate p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {media.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mt-3">
                    {espaco.cobertura && <span className="font-display text-[10px] px-2 py-0.5 rounded bg-blue-900 text-white uppercase">Coberto</span>}
                    {espaco.iluminacao && <span className="font-display text-[10px] px-2 py-0.5 rounded bg-blue-900 text-white uppercase">Iluminado</span>}
                    {espaco.energia && <span className="font-display text-[10px] px-2 py-0.5 rounded bg-blue-900 text-white uppercase">Energia</span>}
                    {espaco.banheiro && <span className="font-display text-[10px] px-2 py-0.5 rounded bg-blue-900 text-white uppercase">Banheiro</span>}
                    {espaco.permiteGrafite && <span className="font-display text-[10px] px-2 py-0.5 rounded bg-emerald-700 text-white uppercase">Grafite</span>}
                    {espaco.permiteBatalha && <span className="font-display text-[10px] px-2 py-0.5 rounded bg-emerald-700 text-white uppercase">Batalha</span>}
                    {espaco.permiteDanca && <span className="font-display text-[10px] px-2 py-0.5 rounded bg-emerald-700 text-white uppercase">Dança</span>}
                  </div>

                  {user && (user.role === "ADMIN" || user.email === espaco.criadoPorEmail) && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                      <button
                        onClick={() => fillForm(espaco)}
                        className="bg-[#1b1cbb] hover:bg-[#15169a] text-white font-display text-xs tracking-wider uppercase rounded-sm px-3 py-1 transition-colors cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(espaco.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-display text-xs tracking-wider uppercase rounded-sm px-3 py-1 transition-colors cursor-pointer"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic text-sm">Nenhum espaço mapeado ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
