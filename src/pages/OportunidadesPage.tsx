import { Alert, Label, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { authFetch } from "../App";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface OportunidadesPageProps {
  user?: any;
}

export default function OportunidadesPage({ user }: OportunidadesPageProps) {
  const [oportunidades, setOportunidades] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form states
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("Edital");
  const [local, setLocal] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [inscricaoLink, setInscricaoLink] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [detailOportunidade, setDetailOportunidade] = useState<any | null>(null);

  // Lightbox / Image Zoom state
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title?: string } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    fetchOportunidades();
  }, []);

  async function fetchOportunidades() {
    try {
      const res = await fetch(`${API_URL}/api/oportunidades`);
      if (res.ok) {
        const data = await res.json();
        setOportunidades(data);
      }
    } catch (err) {
      console.error("Erro ao carregar oportunidades:", err);
    }
  }

  function resetForm() {
    setTitulo("");
    setDescricao("");
    setTipo("Edital");
    setLocal("");
    setDataInicio("");
    setDataFim("");
    setInscricaoLink("");
    setFotoUrl("");
    setIsEditing(false);
    setSelectedId(null);
    setShowForm(false);
  }

  function fillForm(item: any) {
    setTitulo(item.titulo || "");
    setDescricao(item.descricao || "");
    setTipo(item.tipo || "Edital");
    setLocal(item.local || "");
    setDataInicio(item.dataInicio || "");
    setDataFim(item.dataFim || "");
    setInscricaoLink(item.inscricaoLink || "");
    setFotoUrl(item.fotoUrl || "");

    setIsEditing(true);
    setSelectedId(item.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      titulo,
      descricao,
      tipo,
      local,
      dataInicio,
      dataFim,
      inscricaoLink,
      fotoUrl,
      criadoPorEmail: user?.email,
    };

    try {
      const url = isEditing ? `${API_URL}/api/oportunidades/${selectedId}` : `${API_URL}/api/oportunidades`;
      const method = isEditing ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar oportunidade");

      resetForm();
      fetchOportunidades();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar oportunidade");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja remover esta oportunidade?")) return;
    try {
      const res = await authFetch(`${API_URL}/api/oportunidades/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchOportunidades();
      }
    } catch (err) {
      console.error("Erro ao deletar oportunidade:", err);
    }
  }

  return (
    <div className="min-h-screen bg-white py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wider leading-tight text-slate-900 dark:text-white">
              Acompanhe as Oportunidades
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore editais de fomento, residências artísticas, bolsas, vagas de emprego e chamadas públicas.
            </p>
          </div>
          {user && (
            <button
              onClick={() => { isEditing ? resetForm() : setShowForm(!showForm); }}
              className="bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-lg tracking-wider uppercase rounded-sm px-4 py-2 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              {showForm ? "Esconder Formulário" : "Publicar Oportunidade"}
            </button>
          )}
        </div>

        {/* Form panel */}
        {showForm && (
          <div className="border border-slate-900 dark:border-slate-600 rounded-sm p-6 bg-white dark:bg-slate-900 space-y-6">
            <h2 className="font-display text-2xl uppercase tracking-wider text-[#e76e3c] border-b border-slate-200 dark:border-slate-800 pb-2">
              {isEditing ? "Editar Detalhes da Oportunidade" : "Publicar Nova Oportunidade Cultural"}
            </h2>
            
            <form className="grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título da Oportunidade</Label>
                  <TextInput id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Bolsa de Residência em Artes Visuais 2026" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                      <option value="Edital">Edital de Fomento</option>
                      <option value="Residência">Residência Artística</option>
                      <option value="Bolsa">Bolsa de Estudo</option>
                      <option value="Vaga">Vaga de Trabalho</option>
                      <option value="Chamada">Chamada Coletiva</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="local">Localidade / Abrangência</Label>
                    <TextInput id="local" value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex: Extremo Sul / Online" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataInicio">Data Início das Inscrições</Label>
                    <TextInput id="dataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="dataFim">Data Limite de Inscrição</Label>
                    <TextInput id="dataFim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="oportFoto">Foto / Capa da Oportunidade</Label>
                  <input
                    id="oportFoto"
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
                            reader.onerror = (error) => reject(error);
                          });
                          setFotoUrl(base64);
                        } catch (err) {
                          console.error("Erro ao converter imagem:", err);
                        }
                      }
                    }}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-display file:uppercase file:bg-[#1b1cbb] file:text-white hover:file:bg-[#15169a] cursor-pointer"
                  />
                  {fotoUrl && (
                    <div className="mt-2 h-24 w-full rounded-sm overflow-hidden border border-slate-900">
                      <img src={fotoUrl} alt="Preview da oportunidade" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição Completa e Requisitos</Label>
                  <TextInput id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes dos prêmios, critérios de seleção e público-alvo..." required />
                </div>

                <div>
                  <Label htmlFor="inscricaoLink">Link Externo para Inscrição / Edital (URL)</Label>
                  <TextInput id="inscricaoLink" value={inscricaoLink} onChange={(e) => setInscricaoLink(e.target.value)} placeholder="https://exemplo.com/edital-pdf" />
                </div>
              </div>

              {error && <Alert color="failure" className="lg:col-span-2">{error}</Alert>}

              <div className="lg:col-span-2 flex gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-lg tracking-wider uppercase rounded-sm px-5 py-2 transition-colors cursor-pointer"
                >
                  {isEditing ? "Atualizar" : "Salvar Oportunidade"}
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

        {/* Opportunities List */}
        {oportunidades.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {oportunidades.map((item) => {
              const daysLeft = item.dataFim ? Math.ceil((new Date(item.dataFim).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;

              return (
                <div
                  key={item.id}
                  className="border border-slate-900 dark:border-slate-600 rounded-sm p-5 bg-white dark:bg-slate-900 hover:border-ocupa hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-xs px-2 py-0.5 rounded border border-ocupa text-ocupa uppercase tracking-wider">
                        {item.tipo || "Edital"}
                      </span>
                      
                      {daysLeft !== null && daysLeft >= 0 ? (
                        <span className={`font-display text-xs px-2 py-0.5 rounded uppercase tracking-wider border ${daysLeft <= 5 ? "border-red-600 text-red-600" : "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400"}`}>
                          {daysLeft} dias restantes
                        </span>
                      ) : daysLeft !== null ? (
                        <span className="font-display text-xs px-2 py-0.5 rounded border border-slate-400 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Encerrado
                        </span>
                      ) : null}
                    </div>

                    {item.fotoUrl && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage({ url: item.fotoUrl, title: item.titulo });
                          setIsZoomed(false);
                        }}
                        className="h-40 w-full rounded-sm overflow-hidden border border-slate-900 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-pointer hover:opacity-90 transition-opacity"
                        title="Clique para ver a foto de capa inteira com zoom"
                      >
                        <img src={item.fotoUrl} alt={item.titulo} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div>
                      <h2 className="font-display text-xl uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-ocupa transition-colors">
                        {item.titulo}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Abrangência: <span className="font-semibold text-blue-900 dark:text-blue-400">{item.local || "Online"}</span>
                      </p>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-3 text-justify">
                      {item.descricao}
                    </p>

                    <div className="text-xs text-slate-500 space-y-1 pt-1">
                      {item.dataInicio && <p><strong className="text-slate-900 dark:text-white">Início:</strong> {new Date(item.dataInicio).toLocaleDateString("pt-BR")}</p>}
                      {item.dataFim && <p><strong className="text-slate-900 dark:text-white">Fim das Inscrições:</strong> {new Date(item.dataFim).toLocaleDateString("pt-BR")}</p>}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex flex-wrap gap-2 items-center">
                      <button
                        onClick={() => setDetailOportunidade(item)}
                        className="bg-[#1b1cbb] hover:bg-[#15169a] text-white font-display text-xs tracking-wider uppercase rounded-sm px-3 py-1 transition-colors cursor-pointer"
                      >
                        Ver Detalhes
                      </button>
                      {user && (user.role === "ADMIN" || user.email === item.criadoPorEmail) && (
                        <>
                          <button
                            onClick={() => fillForm(item)}
                            className="bg-slate-600 hover:bg-slate-700 text-white font-display text-xs tracking-wider uppercase rounded-sm px-2 py-1 transition-colors cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-display text-xs tracking-wider uppercase rounded-sm px-2 py-1 transition-colors cursor-pointer"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>

                    {item.inscricaoLink && (
                      <a
                        href={item.inscricaoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-xs tracking-wider uppercase rounded-sm px-3 py-1 transition-colors cursor-pointer"
                      >
                        Inscrever-se
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-sm border border-slate-900 dark:border-slate-600">
            <p className="text-slate-500 italic">Nenhuma oportunidade publicada nesta categoria ainda.</p>
          </div>
        )}

        {/* Details Modal */}
        {detailOportunidade && (
          <div className="fixed inset-0 z-[5010] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-sm max-w-lg w-full overflow-hidden shadow-2xl border border-slate-900 dark:border-slate-800 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-display text-xs px-2 py-0.5 rounded bg-[#e76e3c] text-white uppercase tracking-wider flex-shrink-0">
                    {detailOportunidade.tipo || "Edital"}
                  </span>
                  <h3 className="font-display text-xl uppercase tracking-wider text-slate-900 dark:text-white truncate">
                    {detailOportunidade.titulo}
                  </h3>
                </div>
                <button onClick={() => setDetailOportunidade(null)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-2xl cursor-pointer">&times;</button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 overflow-y-auto">
                {detailOportunidade.fotoUrl && (
                  <div
                    onClick={() => {
                      setLightboxImage({ url: detailOportunidade.fotoUrl, title: detailOportunidade.titulo });
                      setIsZoomed(false);
                    }}
                    className="h-48 w-full rounded-sm overflow-hidden border border-slate-900 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-pointer hover:opacity-90 transition-opacity"
                    title="Clique para ver a foto de capa inteira com zoom"
                  >
                    <img src={detailOportunidade.fotoUrl} alt={detailOportunidade.titulo} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-1">
                  <h4 className="font-display text-sm uppercase tracking-wider text-slate-500">Descrição & Requisitos</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-justify">
                    {detailOportunidade.descricao || "Sem detalhes adicionais."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <h4 className="font-display text-xs uppercase tracking-wider text-slate-500">Abrangência</h4>
                    <p className="font-semibold text-blue-900 dark:text-blue-400">{detailOportunidade.local || "Online / Geral"}</p>
                  </div>

                  {detailOportunidade.dataFim && (
                    <div>
                      <h4 className="font-display text-xs uppercase tracking-wider text-slate-500">Inscrições até</h4>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(detailOportunidade.dataFim).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center gap-3">
                <button
                  onClick={() => setDetailOportunidade(null)}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-display text-lg tracking-wider uppercase rounded-sm px-4 py-2 transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                {detailOportunidade.inscricaoLink && (
                  <a
                    href={detailOportunidade.inscricaoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#e76e3c] hover:bg-[#d65d2b] text-white font-display text-lg tracking-wider uppercase rounded-sm px-4 py-2 transition-colors cursor-pointer"
                  >
                    Inscrever-se Agora
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Lightbox / Fullscreen Image Zoom Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
          onClick={() => {
            setLightboxImage(null);
            setIsZoomed(false);
          }}
        >
          {/* Header Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 text-white">
            <span className="font-display text-lg sm:text-xl tracking-wider uppercase truncate max-w-md">
              {lightboxImage.title || "Visualização da Imagem"}
            </span>
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
                  setLightboxImage(null);
                  setIsZoomed(false);
                }}
                className="text-white hover:text-ocupa font-bold text-3xl cursor-pointer leading-none px-2"
                aria-label="Fechar"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Image Canvas Container */}
          <div
            className="w-full h-full flex items-center justify-center overflow-auto p-4 pt-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title || "Imagem inteira"}
              onClick={() => setIsZoomed((prev) => !prev)}
              className={`transition-transform duration-300 rounded-sm shadow-2xl object-contain max-h-[85vh] cursor-pointer ${
                isZoomed ? "scale-150 cursor-zoom-out max-h-none max-w-none" : "max-w-full cursor-zoom-in"
              }`}
            />
          </div>

          <p className="absolute bottom-4 text-xs text-slate-400 text-center">
            Clique na imagem ou no botão para alternar o Zoom | Clique fora para fechar
          </p>
        </div>
      )}
    </div>
  );
}
