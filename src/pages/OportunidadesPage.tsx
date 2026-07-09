import { Alert, Badge, Button, Card, Label, Select, TextInput } from "flowbite-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function OportunidadesPage() {
  const [oportunidades, setOportunidades] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  
  // Fields
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("Edital");
  const [descricao, setDescricao] = useState("");
  const [local, setLocal] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [inscricaoLink, setInscricaoLink] = useState("");
  const [contato, setContato] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterTipo, setFilterTipo] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const response = await fetch(`${API_URL}/api/oportunidades`);
      if (response.ok) {
        const data = await response.json();
        setOportunidades(data);
      }
    } catch (err) {
      console.error("Erro ao buscar oportunidades:", err);
    }
  }

  const isEditing = useMemo(() => selected !== null, [selected]);

  const filteredOportunidades = oportunidades.filter((op) => {
    if (!filterTipo) return true;
    return op.tipo?.toLowerCase() === filterTipo.toLowerCase();
  });

  function resetForm() {
    setSelected(null);
    setTitulo("");
    setTipo("Edital");
    setDescricao("");
    setLocal("");
    setDataInicio("");
    setDataFim("");
    setInscricaoLink("");
    setContato("");
    setError(null);
    setShowForm(false);
  }

  function fillForm(item: any) {
    setSelected(item);
    setTitulo(item.titulo || "");
    setTipo(item.tipo || "Edital");
    setDescricao(item.descricao || "");
    setLocal(item.local || "");
    setDataInicio(item.dataInicio || "");
    setDataFim(item.dataFim || "");
    setInscricaoLink(item.inscricaoLink || "");
    setContato(item.contato || "");
    setError(null);
    setShowForm(true);
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = { titulo, tipo, descricao, local, dataInicio, dataFim, inscricaoLink, contato };
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/api/oportunidades/${selected.id}` : `${API_URL}/api/oportunidades`;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar oportunidade");
      }

      await fetchAll();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Erro de conexão ao salvar oportunidade");
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`${API_URL}/api/oportunidades/${id}`, { method: "DELETE" });
      await fetchAll();
    } catch (err) {
      console.error("Erro ao deletar oportunidade:", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Editais & Vagas</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Explore bolsas de residência artística, chamadas abertas e editais de incentivo cultural.
            </p>
          </div>
          <Button color="amber" onClick={() => { isEditing ? resetForm() : setShowForm(!showForm); }}>
            {showForm ? "Esconder Formulário" : "Publicar Oportunidade"}
          </Button>
        </div>

        {/* Form panel */}
        {showForm && (
          <Card className="border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold border-b pb-2 text-amber-600 dark:text-amber-400">
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
                  <Label htmlFor="descricao">Descrição e Critérios</Label>
                  <TextInput id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Projeto focado em muralistas locais com premiação de..." />
                </div>

                <div>
                  <Label htmlFor="inscricaoLink">Link Externo do Edital / Formulário</Label>
                  <TextInput id="inscricaoLink" value={inscricaoLink} onChange={(e) => setInscricaoLink(e.target.value)} placeholder="https://exemplo.com/edital-completo" />
                </div>

                <div>
                  <Label htmlFor="contato">Informações de Contato / E-mail</Label>
                  <TextInput id="contato" value={contato} onChange={(e) => setContato(e.target.value)} placeholder="contato@edital.com" required />
                </div>
              </div>

              {error && <Alert color="failure" className="lg:col-span-2">{error}</Alert>}

              <div className="lg:col-span-2 flex gap-3 pt-2">
                <Button type="submit" color="amber">{isEditing ? "Atualizar" : "Publicar Oportunidade"}</Button>
                <Button color="gray" onClick={resetForm}>Cancelar</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Filter Section */}
        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-sm font-bold text-slate-500 uppercase">Filtrar por Tipo:</span>
          <div className="flex gap-2 flex-wrap">
            {["", "Edital", "Residência", "Bolsa", "Vaga", "Chamada"].map((tipoOp) => (
              <button
                key={tipoOp}
                onClick={() => setFilterTipo(tipoOp)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all ${
                  (filterTipo === tipoOp)
                    ? "bg-amber-500 border-amber-500 text-white shadow-md"
                    : "bg-transparent border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tipoOp || "Todas"}
              </button>
            ))}
          </div>
        </div>

        {/* Opportunities List Grid */}
        {filteredOportunidades.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredOportunidades.map((item) => {
              const daysLeft = item.dataFim
                ? Math.ceil((new Date(item.dataFim).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                : null;
              
              return (
                <Card
                  key={item.id}
                  className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge color="warning" size="sm" className="uppercase tracking-wider font-extrabold">
                        {item.tipo || "Edital"}
                      </Badge>
                      
                      {daysLeft !== null && daysLeft >= 0 ? (
                        <Badge color={daysLeft <= 5 ? "failure" : "info"}>
                          {daysLeft} dias restantes
                        </Badge>
                      ) : daysLeft !== null ? (
                        <Badge color="gray">Inscrições Encerradas</Badge>
                      ) : null}
                    </div>

                    <div>
                      <h2 className="text-xl font-bold tracking-tight">{item.titulo}</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Abrangência: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.local || "Online"}</span>
                      </p>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                      {item.descricao}
                    </p>

                    <div className="text-xs text-slate-500 space-y-1">
                      {item.dataInicio && <p><strong>Início:</strong> {new Date(item.dataInicio).toLocaleDateString("pt-BR")}</p>}
                      {item.dataFim && <p><strong>Fim das Inscrições:</strong> {new Date(item.dataFim).toLocaleDateString("pt-BR")}</p>}
                      <p><strong>Contato do Edital:</strong> {item.contato}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex gap-2">
                      <Button size="xs" color="gray" onClick={() => fillForm(item)}>Editar</Button>
                      <Button size="xs" color="failure" onClick={() => handleDelete(item.id)}>Excluir</Button>
                    </div>

                    {item.inscricaoLink && (
                      <Button size="sm" color="amber">
                        <a href={item.inscricaoLink} target="_blank" rel="noopener noreferrer">
                          Inscrever-se
                        </a>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 italic">Nenhuma oportunidade publicada nesta categoria ainda.</p>
          </div>
        )}

      </div>
    </div>
  );
}
