import { Button, Card, Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import { useEffect, useState } from "react";

export default function ModeracaoPage({ user, authFetch }: { user: any; authFetch: any }) {
  const [artistas, setArtistas] = useState<any[]>([]);
  const [espacos, setEspacos] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [oportunidades, setOportunidades] = useState<any[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<any>(null);
  const [entityType, setEntityType] = useState<string>("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchPendentes();
    }
  }, [user]);

  async function fetchPendentes() {
    try {
      const [artistasRes, espacosRes, eventosRes, opRes] = await Promise.all([
        authFetch(`${API_URL}/api/admin/artistas/pendentes`),
        authFetch(`${API_URL}/api/admin/espacos/pendentes`),
        authFetch(`${API_URL}/api/admin/eventos/pendentes`),
        authFetch(`${API_URL}/api/admin/oportunidades/pendentes`),
      ]);
      if (artistasRes.ok) setArtistas(await artistasRes.json());
      if (espacosRes.ok) setEspacos(await espacosRes.json());
      if (eventosRes.ok) setEventos(await eventosRes.json());
      if (opRes.ok) setOportunidades(await opRes.json());
    } catch (e) {
      console.error(e);
    }
  }

  function handleOpenModal(entity: any, type: string) {
    setCurrentEntity(entity);
    setEntityType(type);
    setModalOpen(true);
  }

  async function handleAprovarRejeitar(id: number, type: string, action: "aprovar" | "rejeitar") {
    try {
      await authFetch(`${API_URL}/api/admin/${type}/${id}/${action}`, { method: "PUT" });
      setModalOpen(false);
      fetchPendentes();
    } catch (e) {
      console.error(e);
    }
  }

  const renderSection = (title: string, list: any[], type: string) => (
    <Card className="mb-6">
      <h3 className="text-xl font-bold mb-4">{title} ({list.length})</h3>
      {list.length === 0 ? (
        <p className="text-slate-500">Nenhum item pendente.</p>
      ) : (
        <div className="space-y-4">
          {list.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div>
                <h4 className="font-bold">{item.nome || item.titulo}</h4>
                <p className="text-sm text-slate-500">{item.email || item.descricao}</p>
              </div>
              <Button onClick={() => handleOpenModal(item, type)}>Analisar</Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-8 uppercase tracking-wider font-display">Moderação do Sistema</h1>
      
      {renderSection("Artistas Pendentes", artistas, "artistas")}
      {renderSection("Espaços Pendentes", espacos, "espacos")}
      {renderSection("Eventos Pendentes", eventos, "eventos")}
      {renderSection("Oportunidades Pendentes", oportunidades, "oportunidades")}

      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalHeader>Analisar {entityType}</ModalHeader>
        <ModalBody>
          {currentEntity && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">{currentEntity.nome || currentEntity.titulo}</h3>
              <p>{currentEntity.email || currentEntity.descricao}</p>
              <pre className="text-xs bg-slate-100 p-2 overflow-auto max-h-40">{JSON.stringify(currentEntity, null, 2)}</pre>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={() => handleAprovarRejeitar(currentEntity.id, entityType, "aprovar")}>Aprovar</Button>
          <Button color="failure" onClick={() => handleAprovarRejeitar(currentEntity.id, entityType, "rejeitar")}>Rejeitar</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
