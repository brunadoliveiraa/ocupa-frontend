import { Alert, Badge, Button, Card, Label, TextInput, ToggleSwitch } from "flowbite-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Declare Leaflet global object
declare const L: any;

export default function EspacosPage({ user }: { user: any }) {
  const [espacos, setEspacos] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  
  // Fields
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [capacidade, setCapacidade] = useState(0);
  const [cobertura, setCobertura] = useState(false);
  const [iluminacao, setIluminacao] = useState(false);
  const [energia, setEnergia] = useState(false);
  const [banheiro, setBanheiro] = useState(false);
  const [permiteGrafite, setPermiteGrafite] = useState(false);
  const [permiteBatalha, setPermiteBatalha] = useState(false);
  const [permiteDanca, setPermiteDanca] = useState(false);
  const [latitude, setLatitude] = useState("-23.55052");
  const [longitude, setLongitude] = useState("-46.633308");
  
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Space media states
  const [mediaList, setMediaList] = useState<{ mediaType: string; url: string; caption: string }[]>([]);
  const [newMediaCaption, setNewMediaCaption] = useState("");

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Initialize and Update Map
  useEffect(() => {
    const mapElement = document.getElementById("map");
    if (!mapElement || typeof L === "undefined") return;

    // Create Map centered in Sao Paulo (default)
    const map = L.map("map").setView([-23.55052, -46.633308], 13);
    
    // Load OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
    }).addTo(map);

    // Map click event to auto-fill latitude and longitude
    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
    });

    // Custom modern pins using Leaflet divIcon (fully styled with Tailwind CSS)
    const spaceIcon = L.divIcon({
      html: `<div class="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white transition-all transform hover:scale-115">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                 <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
               </svg>
             </div>`,
      className: "custom-leaflet-pin",
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    // Populate markers on map
    espacos.forEach((espaco) => {
      if (espaco.latitude && espaco.longitude) {
        L.marker([espaco.latitude, espaco.longitude], { icon: spaceIcon })
          .addTo(map)
          .bindPopup(
            `<div class="p-2 space-y-1">
              <h4 class="font-bold text-slate-800 text-sm">${espaco.nome}</h4>
              <p class="text-xs text-slate-500">${espaco.endereco}</p>
              <p class="text-xs text-slate-600 font-semibold mt-1">Capacidade: ${espaco.capacidade || 0} pessoas</p>
             </div>`
          );
      }
    });

    // Adjust map bounds if spaces exist
    if (espacos.length > 0) {
      const validCoords = espacos.filter(e => e.latitude && e.longitude).map(e => [e.latitude, e.longitude]);
      if (validCoords.length > 0) {
        map.fitBounds(validCoords, { padding: [50, 50], maxZoom: 15 });
      }
    }

    // Cleanup Leaflet map when component unmounts or before re-running
    return () => {
      map.remove();
    };
  }, [espacos]);

  async function fetchAll() {
    try {
      const response = await fetch(`${API_URL}/api/espacos`);
      if (response.ok) {
        const data = await response.json();
        setEspacos(data);
      }
    } catch (err) {
      console.error("Erro ao buscar espaços:", err);
    }
  }

  const isEditing = useMemo(() => selected !== null, [selected]);

  function resetForm() {
    setSelected(null);
    setNome("");
    setEndereco("");
    setDescricao("");
    setCapacidade(0);
    setCobertura(false);
    setIluminacao(false);
    setEnergia(false);
    setBanheiro(false);
    setPermiteGrafite(false);
    setPermiteBatalha(false);
    setPermiteDanca(false);
    setLatitude("-23.55052");
    setLongitude("-46.633308");
    setError(null);
    setShowForm(false);
    setMediaList([]);
    setNewMediaCaption("");
  }

  function fillForm(espaco: any) {
    setSelected(espaco);
    setNome(espaco.nome || "");
    setEndereco(espaco.endereco || "");
    setDescricao(espaco.descricao || "");
    setCapacidade(espaco.capacidade || 0);
    setCobertura(espaco.cobertura || false);
    setIluminacao(espaco.iluminacao || false);
    setEnergia(espaco.energia || false);
    setBanheiro(espaco.banheiro || false);
    setPermiteGrafite(espaco.permiteGrafite || false);
    setPermiteBatalha(espaco.permiteBatalha || false);
    setPermiteDanca(espaco.permiteDanca || false);
    setLatitude(espaco.latitude?.toString() || "-23.55052");
    setLongitude(espaco.longitude?.toString() || "-46.633308");
    setMediaList(espaco.mediaItems || []);
    setError(null);
    setShowForm(true);
    
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = {
      nome,
      endereco,
      descricao,
      capacidade,
      cobertura,
      iluminacao,
      energia,
      banheiro,
      permiteGrafite,
      permiteBatalha,
      permiteDanca,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      criadoPorEmail: isEditing ? selected.criadoPorEmail : (user ? user.email : null),
      mediaItems: mediaList
    };

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/api/espacos/${selected.id}` : `${API_URL}/api/espacos`;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar espaço");
      }

      await fetchAll();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Erro de conexão ao salvar espaço");
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`${API_URL}/api/espacos/${id}`, { method: "DELETE" });
      await fetchAll();
    } catch (err) {
      console.error("Erro ao deletar espaço:", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Espaços Culturais</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Locais públicos, praças e pontos mapeados para intervenções artísticas periféricas.
            </p>
          </div>
          {user && (
            <Button color="emerald" onClick={() => { isEditing ? resetForm() : setShowForm(!showForm); }}>
              {showForm ? "Esconder Formulário" : "Mapear Novo Espaço"}
            </Button>
          )}
        </div>

        {/* Form panel */}
        {showForm && (
          <Card className="border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold border-b pb-2 text-emerald-600 dark:text-emerald-400">
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
                  <h3 className="font-semibold text-sm uppercase text-slate-500">Atributos Físicos</h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-lg">
                    <ToggleSwitch checked={cobertura} label="Cobertura" onChange={() => setCobertura(!cobertura)} />
                    <ToggleSwitch checked={iluminacao} label="Iluminação" onChange={() => setIluminacao(!iluminacao)} />
                    <ToggleSwitch checked={energia} label="Energia Elétrica" onChange={() => setEnergia(!energia)} />
                    <ToggleSwitch checked={banheiro} label="Banheiro Público" onChange={() => setBanheiro(!banheiro)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm uppercase text-slate-500">Atividades Permitidas</h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-lg">
                    <ToggleSwitch checked={permiteGrafite} label="Grafite / Mural" onChange={() => setPermiteGrafite(!permiteGrafite)} />
                    <ToggleSwitch checked={permiteBatalha} label="Batalha de Rimas" onChange={() => setPermiteBatalha(!permiteBatalha)} />
                    <ToggleSwitch checked={permiteDanca} label="Danças / B-Boys" onChange={() => setPermiteDanca(!permiteDanca)} />
                  </div>
                </div>
              </div>

              {/* Media gallery upload for Espaco */}
              <div className="lg:col-span-2 space-y-4 border-t pt-4">
                <h3 className="font-semibold text-md text-emerald-600 dark:text-emerald-400">Galeria de Fotos do Local</h3>
                <div className="grid gap-3 sm:grid-cols-3 items-end bg-slate-100 dark:bg-slate-900/40 p-4 rounded-lg">
                  <div className="sm:col-span-2">
                    <Label htmlFor="spaceFile">Adicionar Imagem</Label>
                    <input
                      id="spaceFile"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const base64 = await convertToBase64(file);
                            setMediaList([...mediaList, { mediaType: "IMAGE", url: base64, caption: newMediaCaption }]);
                            setNewMediaCaption("");
                            e.target.value = "";
                          } catch (err) {
                            console.error("Erro ao converter imagem do espaco:", err);
                          }
                        }
                      }}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 bg-white border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="spaceMediaCaption">Legenda da Imagem (Opcional)</Label>
                    <TextInput
                      id="spaceMediaCaption"
                      placeholder="Ex: Fachada, Palco, etc."
                      value={newMediaCaption}
                      onChange={(e) => setNewMediaCaption(e.target.value)}
                    />
                  </div>
                </div>

                {mediaList.length > 0 ? (
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 md:grid-cols-6 mt-4">
                    {mediaList.map((item, idx) => (
                      <Card key={idx} className="relative overflow-hidden group p-2 border-slate-200 dark:border-slate-800">
                        <div className="h-20 bg-slate-200 dark:bg-slate-800 flex items-center justify-center rounded overflow-hidden">
                          <img src={item.url} alt={item.caption} className="w-full h-full object-cover" />
                        </div>
                        <div className="mt-1">
                          <p className="font-semibold text-xs truncate text-slate-700 dark:text-slate-300">{item.caption || "Sem legenda"}</p>
                          <Button
                            size="xs"
                            color="failure"
                            className="mt-1 w-full"
                            onClick={() => setMediaList(mediaList.filter((_, i) => i !== idx))}
                          >
                            Remover
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Nenhuma foto anexada a este espaço.</p>
                )}
              </div>

              {error && <Alert color="failure" className="lg:col-span-2">{error}</Alert>}

              <div className="lg:col-span-2 flex gap-3 pt-2">
                <Button type="submit" color="emerald">{isEditing ? "Atualizar" : "Salvar Espaço"}</Button>
                <Button color="gray" onClick={resetForm}>Cancelar</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Map and Directory Container */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Map display */}
          <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold p-4 border-b">Mapeamento Georreferenciado dos Ativos (Mapa Afetivo)</h3>
            <div id="map" className="w-full h-[450px] rounded-b-lg"></div>
          </Card>

          {/* Spaces directory */}
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
            <h3 className="text-lg font-bold border-b pb-2">Lista de Espaços</h3>
            
            {espacos.length > 0 ? (
              espacos.map((espaco) => (
                <Card key={espaco.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold">{espaco.nome}</h2>
                      <p className="text-xs text-slate-500">{espaco.endereco}</p>
                    </div>
                    <Badge color="success">{espaco.capacidade || 0} Pessoas</Badge>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 mt-2">
                    {espaco.descricao || "Sem descrição cadastrada."}
                  </p>

                  {/* Space media items compact gallery */}
                  {espaco.mediaItems && espaco.mediaItems.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {espaco.mediaItems.map((media: any) => (
                        <div key={media.id} className="h-16 rounded overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 relative group">
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
                    {espaco.cobertura && <Badge color="indigo" size="xs">Coberto</Badge>}
                    {espaco.iluminacao && <Badge color="indigo" size="xs">Iluminado</Badge>}
                    {espaco.energia && <Badge color="indigo" size="xs">Energia</Badge>}
                    {espaco.banheiro && <Badge color="indigo" size="xs">Banheiro</Badge>}
                    {espaco.permiteGrafite && <Badge color="success" size="xs">Grafite</Badge>}
                    {espaco.permiteBatalha && <Badge color="success" size="xs">Batalha</Badge>}
                    {espaco.permiteDanca && <Badge color="success" size="xs">Dança</Badge>}
                  </div>

                  {user && (user.role === "ADMIN" || user.email === espaco.criadoPorEmail) && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                      <Button size="xs" color="gray" onClick={() => fillForm(espaco)}>Editar</Button>
                      <Button size="xs" color="failure" onClick={() => handleDelete(espaco.id)}>Excluir</Button>
                    </div>
                  )}
                </Card>
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
