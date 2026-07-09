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
      criadoPorEmail: isEditing ? selected.criadoPorEmail : (user ? user.email : null)
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
