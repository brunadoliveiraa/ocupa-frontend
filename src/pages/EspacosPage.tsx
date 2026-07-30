import { Alert, Label, TextInput, ToggleSwitch } from "flowbite-react";
import { useEffect, useMemo, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface EspacosPageProps {
  user?: any;
}

export default function EspacosPage({ user }: EspacosPageProps) {
  const [espacos, setEspacos] = useState<any[]>([]);
  const [selectedEspaco, setSelectedEspaco] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Lightbox / Image Zoom & Carousel state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSelectingLocation, setIsSelectingLocationState] = useState(false);
  const isSelectingLocationRef = useRef(false);

  function setIsSelectingLocation(val: boolean) {
    setIsSelectingLocationState(val);
    isSelectingLocationRef.current = val;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGrafite, setFilterGrafite] = useState(false);
  const [filterBatalha, setFilterBatalha] = useState(false);
  const [filterDanca, setFilterDanca] = useState(false);
  const [filterCobertura, setFilterCobertura] = useState(false);
  const [filterIluminacao, setFilterIluminacao] = useState(false);
  const [filterEnergia, setFilterEnergia] = useState(false);
  const [filterBanheiro, setFilterBanheiro] = useState(false);

  // Map states
  const [mapMode, setMapMode] = useState<"mapa" | "satelite">("mapa");
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const tileRef = useRef<any>(null);
  const tempMarkerRef = useRef<any>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Form states
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [capacidade, setCapacidade] = useState<number>(0);
  const [latitude, setLatitude] = useState("-23.55052");
  const [longitude, setLongitude] = useState("-46.633308");
  const [cobertura, setCobertura] = useState(false);
  const [iluminacao, setIluminacao] = useState(false);
  const [energia, setEnergia] = useState(false);
  const [banheiro, setBanheiro] = useState(false);
  const [permiteGrafite, setPermiteGrafite] = useState(false);
  const [permiteBatalha, setPermiteBatalha] = useState(false);
  const [permiteDanca, setPermiteDanca] = useState(false);
  const [mediaList, setMediaList] = useState<{ url: string; caption: string }[]>([]);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [mediaCaptionInput, setMediaCaptionInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  /* ═══════ FILTERED SPACES ═══════ */
  const filteredEspacos = useMemo(() => {
    return espacos.filter((e) => {
      if (searchQuery && !e.nome?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterGrafite && !e.permiteGrafite) return false;
      if (filterBatalha && !e.permiteBatalha) return false;
      if (filterDanca && !e.permiteDanca) return false;
      if (filterCobertura && !e.cobertura) return false;
      if (filterIluminacao && !e.iluminacao) return false;
      if (filterEnergia && !e.energia) return false;
      if (filterBanheiro && !e.banheiro) return false;
      return true;
    });
  }, [espacos, searchQuery, filterGrafite, filterBatalha, filterDanca, filterCobertura, filterIluminacao, filterEnergia, filterBanheiro]);

  /* ═══════ FETCH ═══════ */
  async function fetchEspacos() {
    try {
      const res = await fetch(`${API_URL}/api/espacos`);
      if (res.ok) setEspacos(await res.json());
    } catch (err) {
      console.error("Erro ao buscar espaços:", err);
    }
  }

  useEffect(() => { fetchEspacos(); }, []);

  // Keep selectedEspaco in sync after refetch
  useEffect(() => {
    if (selectedEspaco) {
      const updated = espacos.find((e) => e.id === selectedEspaco.id);
      if (updated) setSelectedEspaco(updated);
      else setSelectedEspaco(null);
    }
  }, [espacos]);

  /* ═══════ LIGHTBOX CAROUSEL HELPERS & KEYBOARD NAV ═══════ */
  function handlePrevImage(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && selectedEspaco?.mediaItems?.length) {
      if (lightboxIndex > 0) {
        setLightboxIndex((prev) => (prev !== null ? prev - 1 : 0));
        setIsZoomed(false);
      }
    }
  }

  function handleNextImage(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && selectedEspaco?.mediaItems?.length) {
      if (lightboxIndex < selectedEspaco.mediaItems.length - 1) {
        setLightboxIndex((prev) => (prev !== null ? prev + 1 : 0));
        setIsZoomed(false);
      }
    }
  }

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevImage();
      else if (e.key === "ArrowRight") handleNextImage();
      else if (e.key === "Escape") {
        setLightboxIndex(null);
        setIsZoomed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, selectedEspaco]);

  /* ═══════ MAP INIT ═══════ */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const L = (window as any).L;
    if (!L) return;
    const container = document.getElementById("espacos-map");
    if (!container) return;
    if ((container as any)._leaflet_id) (container as any)._leaflet_id = null;

    const m = L.map("espacos-map", { zoomControl: false }).setView([-23.55052, -46.633308], 11);
    L.control.zoom({ position: "bottomright" }).addTo(m);

    const tile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      className: "grayscale-tiles",
    }).addTo(m);
    tileRef.current = tile;

    m.on("click", (ev: any) => {
      // ONLY place pin and open modal IF location selection mode is active!
      if (!isSelectingLocationRef.current) return;

      const lat = ev.latlng.lat.toFixed(6);
      const lng = ev.latlng.lng.toFixed(6);
      setLatitude(lat);
      setLongitude(lng);

      // Add temporary marker for location selection
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }

      const tempIcon = L.divIcon({
        className: "ocupa-pin",
        html: `<div class="ocupa-pin-circle ocupa-pin-temp"><svg viewBox="0 0 24 24" fill="none" stroke="#1b1cbb" stroke-width="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg></div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      tempMarkerRef.current = L.marker(ev.latlng, { icon: tempIcon }).addTo(m);

      setIsSelectingLocation(false);
      setShowForm(true);
    });

    mapRef.current = m;
    return () => { m.remove(); };
  }, []);

  /* ═══════ MAP CURSOR FOR LOCATION SELECTION ═══════ */
  useEffect(() => {
    if (!mapRef.current) return;
    try {
      const container = mapRef.current.getContainer();
      if (container) {
        container.style.cursor = isSelectingLocation ? "crosshair" : "";
      }
    } catch (e) {
      console.error(e);
    }
  }, [isSelectingLocation]);

  /* ═══════ TILE SWITCH ═══════ */
  useEffect(() => {
    const m = mapRef.current;
    const L = (window as any).L;
    if (!m || !L) return;
    if (tileRef.current) m.removeLayer(tileRef.current);

    if (mapMode === "satelite") {
      tileRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "&copy; Esri" }
      ).addTo(m);
    } else {
      tileRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        className: "grayscale-tiles",
      }).addTo(m);
    }
  }, [mapMode]);

  /* ═══════ MARKERS ═══════ */
  useEffect(() => {
    const m = mapRef.current;
    const L = (window as any).L;
    if (!m || !L) return;

    markersRef.current.forEach((mk) => mk.remove());
    const fresh: any[] = [];

    filteredEspacos.forEach((espaco) => {
      if (!espaco.latitude || !espaco.longitude) return;
      const photo = espaco.mediaItems?.[0]?.url;

      const icon = L.divIcon({
        className: "ocupa-pin",
        html: photo
          ? `<div class="ocupa-pin-circle"><img src="${photo}" alt="" /></div>`
          : `<div class="ocupa-pin-circle ocupa-pin-default"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      const tip = `
        <div class="ocupa-tip">
          ${photo ? `<img src="${photo}" alt="" />` : ""}
          <div class="ocupa-tip-body">
            <strong>${espaco.nome}</strong>
            <span>${espaco.endereco || ""}</span>
            <em>${espaco.capacidade || 0} pessoas</em>
          </div>
        </div>`;

      const marker = L.marker([Number(espaco.latitude), Number(espaco.longitude)], { icon })
        .addTo(m)
        .bindTooltip(tip, { direction: "top", offset: [0, -28], className: "ocupa-tip-wrap", opacity: 1 });

      marker.on("click", () => {
        setSelectedEspaco(espaco);
        m.flyTo([Number(espaco.latitude), Number(espaco.longitude)], 15, { duration: 0.8 });
      });

      fresh.push(marker);
    });

    markersRef.current = fresh;
    if (fresh.length > 0) {
      const g = L.featureGroup(fresh);
      m.fitBounds(g.getBounds(), { padding: [80, 80], maxZoom: 15 });
    }
  }, [filteredEspacos]);

  /* ═══════ INVALIDATE MAP ON PANEL TOGGLE ═══════ */
  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;
    const t = setTimeout(() => m.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [selectedEspaco]);

  /* ═══════ SCROLL PANEL TO TOP ═══════ */
  useEffect(() => {
    if (selectedEspaco && panelRef.current) panelRef.current.scrollTop = 0;
  }, [selectedEspaco]);

  /* ═══════ CRUD HELPERS ═══════ */
  function resetForm() {
    setNome(""); setEndereco(""); setDescricao(""); setCapacidade(0);
    setLatitude("-23.55052"); setLongitude("-46.633308");
    setCobertura(false); setIluminacao(false); setEnergia(false); setBanheiro(false);
    setPermiteGrafite(false); setPermiteBatalha(false); setPermiteDanca(false);
    setMediaList([]); setMediaUrlInput(""); setMediaCaptionInput("");
    setIsEditing(false); setSelectedId(null); setShowForm(false); setIsSelectingLocation(false); setError(null);
    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }
  }

  function fillForm(espaco: any) {
    setNome(espaco.nome || ""); setEndereco(espaco.endereco || "");
    setDescricao(espaco.descricao || ""); setCapacidade(espaco.capacidade || 0);
    setLatitude(espaco.latitude || "-23.55052"); setLongitude(espaco.longitude || "-46.633308");
    setCobertura(espaco.cobertura || false); setIluminacao(espaco.iluminacao || false);
    setEnergia(espaco.energia || false); setBanheiro(espaco.banheiro || false);
    setPermiteGrafite(espaco.permiteGrafite || false); setPermiteBatalha(espaco.permiteBatalha || false);
    setPermiteDanca(espaco.permiteDanca || false);
    setMediaList(espaco.mediaItems?.map((m: any) => ({ url: m.url, caption: m.caption || "" })) || []);
    setIsEditing(true); setSelectedId(espaco.id); setShowForm(true);
  }

  function handleStartMapping() {
    setIsSelectingLocation(true);
    setSelectedEspaco(null);
    setError(null);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setMediaList((prev) => [
          ...prev,
          { url: base64String, caption: mediaCaptionInput || file.name },
        ]);
        setMediaCaptionInput("");
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function handleAddMedia() {
    if (!mediaUrlInput) return;
    setMediaList([...mediaList, { url: mediaUrlInput, caption: mediaCaptionInput }]);
    setMediaUrlInput(""); setMediaCaptionInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    const payload = {
      nome, endereco, descricao, capacidade, latitude, longitude,
      cobertura, iluminacao, energia, banheiro,
      permiteGrafite, permiteBatalha, permiteDanca,
      criadoPorEmail: user?.email,
      mediaItems: mediaList.map((m) => ({ mediaType: "IMAGE", url: m.url, caption: m.caption })),
    };
    try {
      const url = isEditing ? `${API_URL}/api/espacos/${selectedId}` : `${API_URL}/api/espacos`;
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro ao salvar espaço cultural");
      resetForm(); fetchEspacos();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar espaço");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja remover este espaço?")) return;
    try {
      const res = await fetch(`${API_URL}/api/espacos/${id}`, { method: "DELETE" });
      if (res.ok) fetchEspacos();
    } catch (err) { console.error("Erro ao deletar espaço:", err); }
  }

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <>
      {/* ── CUSTOM CSS FOR LEAFLET PINS & TOOLTIPS ── */}
      <style>{`
        /* Grayscale base map */
        .grayscale-tiles { filter: grayscale(100%) contrast(1.05) brightness(1.05); }

        /* Pin circle */
        .ocupa-pin { background: none !important; border: none !important; }
        .ocupa-pin-circle {
          width: 48px; height: 48px; border-radius: 50%;
          border: 3px solid #e76e3c; overflow: hidden;
          background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.35);
          transition: transform 0.2s ease, border-color 0.2s ease;
          cursor: pointer; position: relative;
        }
        .ocupa-pin-circle:hover { transform: scale(1.25); border-color: #1b1cbb; z-index: 999 !important; }
        .ocupa-pin-circle img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ocupa-pin-default {
          display: flex; align-items: center; justify-content: center; color: #e76e3c;
        }
        .ocupa-pin-default svg { width: 24px; height: 24px; }
        .ocupa-pin-temp { border-color: #1b1cbb; background: #e0e7ff; }

        /* Tooltip */
        .ocupa-tip-wrap {
          background: transparent !important; border: none !important;
          box-shadow: none !important; padding: 0 !important;
        }
        .ocupa-tip-wrap::before, .ocupa-tip-wrap .leaflet-tooltip-arrow { display: none !important; }
        .leaflet-tooltip.ocupa-tip-wrap { pointer-events: none; }
        .ocupa-tip {
          background: #fff; border-radius: 4px; overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.22); width: 250px;
          border: 1px solid #0f172a;
        }
        .ocupa-tip img { width: 100%; height: 110px; object-fit: cover; display: block; }
        .ocupa-tip-body {
          padding: 8px 10px; display: flex; flex-direction: column; gap: 2px;
        }
        .ocupa-tip-body strong {
          font-family: 'Bebas Neue', sans-serif; font-size: 16px;
          letter-spacing: 0.04em; text-transform: uppercase; color: #0f172a;
          white-space: normal !important; word-break: break-word !important;
          overflow-wrap: break-word !important; line-height: 1.2;
        }
        .ocupa-tip-body span { font-size: 11px; color: #64748b; line-height: 1.3; }
        .ocupa-tip-body em {
          font-family: 'Bebas Neue', sans-serif; font-style: normal;
          color: #e76e3c; font-size: 12px; text-transform: uppercase;
          letter-spacing: 0.06em; margin-top: 2px;
        }
        /* Dark mode tooltip */
        .dark .ocupa-tip { background: #0f172a; border-color: #475569; }
        .dark .ocupa-tip-body strong { color: #f1f5f9; }
        .dark .ocupa-tip-body span { color: #94a3b8; }
        .dark .ocupa-pin-circle { background: #1e293b; }

        /* Detail panel slide */
        .panel-slide { animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

        /* Custom scrollbar for gallery - Subtle gray */
        .gallery-scroll {
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 transparent;
        }
        .gallery-scroll::-webkit-scrollbar { height: 6px; }
        .gallery-scroll::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.06); border-radius: 4px; }
        .gallery-scroll::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 4px; }
        .gallery-scroll::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .dark .gallery-scroll::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.06); }
        .dark .gallery-scroll::-webkit-scrollbar-thumb { background: #475569; }
        .dark .gallery-scroll::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>

      <div className="relative bg-white dark:bg-slate-950 overflow-hidden flex" style={{ height: "calc(100vh - 65px)" }}>
        {/* ═══════ MAP AREA ═══════ */}
        <div className="flex-1 relative min-w-0 h-full">
          <div id="espacos-map" className="w-full h-full" />

          {/* ═══════ FILTER BAR (floating on map) ═══════ */}
          <div
            className="absolute top-0 left-0 right-0 z-[1000] p-3 pointer-events-none"
            style={selectedEspaco ? { right: "420px" } : {}}
          >
            <div className="mx-auto max-w-5xl space-y-2">
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-900 dark:border-slate-600 rounded-sm p-3 space-y-2 shadow-lg pointer-events-auto">
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Buscar espaço por nome..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border border-slate-300 dark:border-slate-700 rounded-sm focus:border-[#e76e3c] focus:ring-1 focus:ring-[#e76e3c] text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                    />
                  </div>

                  {user && (
                    <button
                      onClick={handleStartMapping}
                      className="bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-base tracking-wider uppercase rounded-sm px-4 py-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      + Mapear Espaço
                    </button>
                  )}
                </div>

                {/* Filter chips (Fontes maiores) */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-xs sm:text-sm tracking-wider uppercase text-slate-800 dark:text-slate-200 mr-1">Atividades:</span>
                  {[
                    { label: "Grafite", active: filterGrafite, toggle: () => setFilterGrafite(!filterGrafite) },
                    { label: "Batalha de Rima", active: filterBatalha, toggle: () => setFilterBatalha(!filterBatalha) },
                    { label: "Dança", active: filterDanca, toggle: () => setFilterDanca(!filterDanca) },
                  ].map((f) => (
                    <button
                      key={f.label}
                      onClick={f.toggle}
                      className={`font-display text-xs sm:text-sm tracking-wider uppercase px-3 py-1.5 rounded-sm border transition-all cursor-pointer ${
                        f.active
                          ? "bg-[#e76e3c] text-white border-[#e76e3c]"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-[#e76e3c]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}

                  <span className="font-display text-xs sm:text-sm tracking-wider uppercase text-slate-800 dark:text-slate-200 ml-3 mr-1">Infraestrutura:</span>
                  {[
                    { label: "Cobertura", active: filterCobertura, toggle: () => setFilterCobertura(!filterCobertura) },
                    { label: "Iluminação", active: filterIluminacao, toggle: () => setFilterIluminacao(!filterIluminacao) },
                    { label: "Energia", active: filterEnergia, toggle: () => setFilterEnergia(!filterEnergia) },
                    { label: "Banheiro", active: filterBanheiro, toggle: () => setFilterBanheiro(!filterBanheiro) },
                  ].map((f) => (
                    <button
                      key={f.label}
                      onClick={f.toggle}
                      className={`font-display text-xs sm:text-sm tracking-wider uppercase px-3 py-1.5 rounded-sm border transition-all cursor-pointer ${
                        f.active
                          ? "bg-[#1b1cbb] text-white border-[#1b1cbb]"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-[#1b1cbb]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SELECIONE A LOCALIZAÇÃO BANNER */}
              {isSelectingLocation && (
                <div className="bg-[#e76e3c] text-white border border-slate-900 dark:border-slate-600 rounded-sm p-3 flex items-center justify-between shadow-xl pointer-events-auto">
                  <div className="flex items-center gap-2 font-display text-sm sm:text-base uppercase tracking-wider">
                    <svg className="w-5 h-5 animate-bounce flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>SELECIONE A LOCALIZAÇÃO — Clique no ponto do mapa onde fica o espaço</span>
                  </div>
                  <button
                    onClick={() => setIsSelectingLocation(false)}
                    className="font-body text-xs underline uppercase tracking-wider hover:text-slate-200 cursor-pointer ml-3 whitespace-nowrap"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mapa / Satélite toggle + Counter badge */}
          <div className="absolute bottom-6 left-4 z-[1000] flex items-stretch gap-3">
            <div className="flex rounded-sm overflow-hidden border border-slate-900 dark:border-slate-600 shadow-lg">
              <button
                onClick={() => setMapMode("mapa")}
                className={`font-display text-xs tracking-wider uppercase px-3 py-1.5 transition-colors cursor-pointer flex items-center justify-center ${
                  mapMode === "mapa"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                Mapa
              </button>
              <button
                onClick={() => setMapMode("satelite")}
                className={`font-display text-xs tracking-wider uppercase px-3 py-1.5 transition-colors cursor-pointer flex items-center justify-center ${
                  mapMode === "satelite"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                Satélite
              </button>
            </div>

            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-900 dark:border-slate-600 rounded-sm px-3 py-1.5 shadow-lg flex items-center justify-center">
              <span className="font-display text-xs tracking-wider uppercase text-slate-900 dark:text-white leading-none">
                {filteredEspacos.length} espaço{filteredEspacos.length !== 1 ? "s" : ""} mapeado{filteredEspacos.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ═══════ DETAIL PANEL (right side) ═══════ */}
        {selectedEspaco && (
          <div
            ref={panelRef}
            className="panel-slide w-full sm:w-[420px] h-full overflow-y-auto bg-white dark:bg-slate-900 border-l border-slate-900 dark:border-slate-600 flex-shrink-0 relative z-[1001]"
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedEspaco(null)}
              className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-[#e76e3c] hover:border-[#e76e3c] cursor-pointer transition-colors text-lg font-bold"
              title="Fechar"
            >
              ×
            </button>

            {/* Cover photo */}
            {selectedEspaco.mediaItems?.[0]?.url ? (
              <div
                onClick={() => {
                  setLightboxIndex(0);
                  setIsZoomed(false);
                }}
                className="relative h-[280px] w-full overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                title="Clique para ver a foto de capa inteira com zoom"
              >
                <img
                  src={selectedEspaco.mediaItems[0].url}
                  alt={selectedEspaco.nome}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            ) : (
              <div className="h-[180px] w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg className="w-16 h-16 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}

            {/* Info content */}
            <div className="p-5 space-y-5">
              <div>
                <h2 className="font-display text-3xl uppercase tracking-wider text-slate-900 dark:text-white leading-tight">
                  {selectedEspaco.nome}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedEspaco.endereco || "Endereço não cadastrado"}
                </p>
              </div>

              {/* Horizontal photo gallery (logo abaixo do endereço) */}
              {selectedEspaco.mediaItems && selectedEspaco.mediaItems.length > 1 && (
                <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="font-display text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-2 pt-2">
                    Galeria de Fotos
                  </h4>
                  <div className="flex gap-3 overflow-x-auto pb-2 gallery-scroll">
                    {selectedEspaco.mediaItems.slice(1).map((media: any, idx: number) => (
                      <div
                        key={media.id || idx}
                        onClick={() => {
                          setLightboxIndex(idx + 1);
                          setIsZoomed(false);
                        }}
                        className="flex-shrink-0 w-[140px] h-[100px] rounded-sm overflow-hidden border border-slate-900 dark:border-slate-700 hover:border-[#e76e3c] transition-colors cursor-pointer"
                        title="Clique para ver a foto inteira com zoom"
                      >
                        <img src={media.url} alt={media.caption || ""} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Capacity badge (Fonte aumentada) */}
              <div className="flex items-center gap-2">
                <span className="font-display text-sm sm:text-base px-3.5 py-1 bg-[#e76e3c] text-white uppercase tracking-wider rounded">
                  Capacidade: {selectedEspaco.capacidade || 0} Pessoas
                </span>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                {selectedEspaco.descricao || "Sem descrição cadastrada."}
              </p>

              {/* Infrastructure tags (Fontes aumentadas) */}
              <div className="space-y-2.5">
                <h4 className="font-display text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                  Infraestrutura
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEspaco.cobertura && <span className="font-display text-xs sm:text-sm px-3 py-1 rounded bg-blue-900 text-white uppercase">Coberto</span>}
                  {selectedEspaco.iluminacao && <span className="font-display text-xs sm:text-sm px-3 py-1 rounded bg-blue-900 text-white uppercase">Iluminado</span>}
                  {selectedEspaco.energia && <span className="font-display text-xs sm:text-sm px-3 py-1 rounded bg-blue-900 text-white uppercase">Energia</span>}
                  {selectedEspaco.banheiro && <span className="font-display text-xs sm:text-sm px-3 py-1 rounded bg-blue-900 text-white uppercase">Banheiro</span>}
                  {!selectedEspaco.cobertura && !selectedEspaco.iluminacao && !selectedEspaco.energia && !selectedEspaco.banheiro && (
                    <span className="text-xs text-slate-400 italic">Nenhuma informação</span>
                  )}
                </div>
              </div>

              {/* Activities tags (Fontes aumentadas) */}
              <div className="space-y-2.5">
                <h4 className="font-display text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                  Atividades Permitidas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEspaco.permiteGrafite && <span className="font-display text-xs sm:text-sm px-3 py-1 rounded bg-emerald-700 text-white uppercase">Grafite / Mural</span>}
                  {selectedEspaco.permiteBatalha && <span className="font-display text-xs sm:text-sm px-3 py-1 rounded bg-emerald-700 text-white uppercase">Batalha de Rima</span>}
                  {selectedEspaco.permiteDanca && <span className="font-display text-xs sm:text-sm px-3 py-1 rounded bg-emerald-700 text-white uppercase">Dança / B-Boy</span>}
                  {!selectedEspaco.permiteGrafite && !selectedEspaco.permiteBatalha && !selectedEspaco.permiteDanca && (
                    <span className="text-xs text-slate-400 italic">Nenhuma informação</span>
                  )}
                </div>
              </div>

              {/* Admin actions */}
              {user && (user.role === "ADMIN" || user.email === selectedEspaco.criadoPorEmail) && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                  <button
                    onClick={() => { fillForm(selectedEspaco); setSelectedEspaco(null); }}
                    className="bg-[#1b1cbb] hover:bg-[#15169a] text-white font-display text-xs tracking-wider uppercase rounded-sm px-3 py-1.5 transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => { handleDelete(selectedEspaco.id); setSelectedEspaco(null); }}
                    className="bg-red-600 hover:bg-red-700 text-white font-display text-xs tracking-wider uppercase rounded-sm px-3 py-1.5 transition-colors cursor-pointer"
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════ FORM MODAL OVERLAY ═══════ */}
        {showForm && (
          <div
            className="absolute inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-900 dark:border-slate-600 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="font-display text-2xl uppercase tracking-wider text-[#e76e3c]">
                  {isEditing ? "Editar Detalhes do Espaço" : "Mapear Novo Espaço Periférico"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-2xl cursor-pointer transition-colors"
                >
                  ×
                </button>
              </div>

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
                    <TextInput id="capacidade" type="number" value={capacidade} onChange={(e) => setCapacidade(Number(e.target.value))} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <TextInput id="latitude" value={latitude} readOnly disabled className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-75 font-mono text-xs" />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <TextInput id="longitude" value={longitude} readOnly disabled className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-75 font-mono text-xs" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 italic">Localização selecionada via clique direto no mapa.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-display text-sm uppercase text-slate-500 tracking-wider">Infraestrutura</h3>
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

                  {/* Upload de Fotos do Computador */}
                  <div className="space-y-3">
                    <h3 className="font-display text-base uppercase text-slate-900 dark:text-white tracking-wider font-bold">
                      Galeria de Fotos
                    </h3>
                    
                    <div className="flex flex-col gap-3">
                      {/* Botão de Upload do Dispositivo */}
                      <label className="flex items-center justify-center gap-2 bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-base tracking-wider uppercase rounded-sm px-4 py-3 cursor-pointer transition-colors text-center w-full shadow-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>ESCOLHER FOTOS DO COMPUTADOR</span>
                        <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                      </label>
                      
                      <TextInput
                        placeholder="Legenda para a foto (opcional)"
                        value={mediaCaptionInput}
                        onChange={(e) => setMediaCaptionInput(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {mediaList.length > 0 && (
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 mt-4">
                      {mediaList.map((item, idx) => (
                        <div key={idx} className="relative overflow-hidden p-2 border border-slate-900 dark:border-slate-700 rounded-sm bg-slate-50 dark:bg-slate-800">
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
                    className="font-body font-semibold text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer px-4 py-2"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Image Zoom Modal with Carousel */}
      {lightboxIndex !== null && selectedEspaco?.mediaItems?.[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
          onClick={() => {
            setLightboxIndex(null);
            setIsZoomed(false);
          }}
        >
          {/* Header Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 text-white">
            <div className="flex items-center gap-3 truncate max-w-md">
              <span className="font-display text-xs px-2.5 py-1 rounded bg-[#e76e3c] text-white uppercase tracking-wider flex-shrink-0">
                {lightboxIndex + 1} / {selectedEspaco.mediaItems.length}
              </span>
              <span className="font-display text-lg sm:text-xl tracking-wider uppercase truncate">
                {selectedEspaco.mediaItems[lightboxIndex].caption || selectedEspaco.nome}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed((prev) => !prev);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs uppercase font-display tracking-wider px-3 py-1.5 rounded border border-slate-600 transition-colors cursor-pointer"
              >
                {isZoomed ? "🔍 Normal" : "🔍 Zoom In"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLightboxIndex(null);
                  setIsZoomed(false);
                }}
                className="text-white hover:text-ocupa font-bold text-3xl cursor-pointer leading-none px-2"
                aria-label="Fechar"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Left Arrow Button */}
          {selectedEspaco.mediaItems.length > 1 && lightboxIndex > 0 && (
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-slate-900/80 hover:bg-[#e76e3c] text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl border border-slate-600 transition-all cursor-pointer shadow-lg hover:scale-110"
              aria-label="Foto anterior"
              title="Foto anterior (Seta para a esquerda)"
            >
              &#10094;
            </button>
          )}

          {/* Right Arrow Button */}
          {selectedEspaco.mediaItems.length > 1 && lightboxIndex < selectedEspaco.mediaItems.length - 1 && (
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-slate-900/80 hover:bg-[#e76e3c] text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl border border-slate-600 transition-all cursor-pointer shadow-lg hover:scale-110"
              aria-label="Próxima foto"
              title="Próxima foto (Seta para a direita)"
            >
              &#10095;
            </button>
          )}

          {/* Image Canvas Container */}
          <div
            className="w-full h-full flex items-center justify-center overflow-auto p-4 pt-16 pb-12"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedEspaco.mediaItems[lightboxIndex].url}
              alt={selectedEspaco.mediaItems[lightboxIndex].caption || selectedEspaco.nome}
              onClick={() => setIsZoomed((prev) => !prev)}
              className={`transition-transform duration-300 rounded-sm shadow-2xl object-contain max-h-[85vh] cursor-pointer ${
                isZoomed ? "scale-150 cursor-zoom-out max-h-none max-w-none" : "max-w-full cursor-zoom-in"
              }`}
            />
          </div>

          <p className="absolute bottom-4 text-xs text-slate-400 text-center">
            Use as setas laterais (ou setas ◄ ► do teclado) para navegar | Clique para dar Zoom
          </p>
        </div>
      )}
    </>
  );
}
