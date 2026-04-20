import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { Client } from "@/types/client";
import { Loader2 } from "lucide-react";
import { useClientes } from "@/hooks/useClientes";

// Componentes refatorados
import { ClientsPageHeader } from "@/components/Clientes/ClientsPageHeader";
import { ClientsSearchBar } from "@/components/Clientes/ClientsSearchBar";
import { ClientsAdvancedFilters } from "@/components/Clientes/ClientsAdvancedFilters";
import { ClientsEmptyState } from "@/components/Clientes/ClientsEmptyState";
import { ClientsSelectionControls } from "@/components/Clientes/ClientsSelectionControls";
import { ClientsGrid } from "@/components/Clientes/ClientsGrid";
import { ClientDetailsModal } from "@/components/Clientes/ClientDetailsModal";

// Componentes existentes mantidos
import { EditClientDialog } from "@/components/Clientes/EditClientDialog";
import { NovoClienteDialog } from "@/components/Clientes/NovoClienteDialog";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

const Clientes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    data: dbClientes, 
    loading, 
    create, 
    update, 
    requestMultipleDelete, 
    isEmpty: dbIsEmpty 
  } = useClientes();
  
  // Mapeamento dos dados do banco para o formato da UI
  const clients = dbClientes.map(c => ({
    id: c.id,
    name: c.nome,
    email: c.email || '',
    phone: c.telefone || '',
    cases: c.processos?.[0]?.count || 0, // Contagem real vinda da query agregada do Supabase
    status: c.status || 'Ativo',
    lastContact: c.updated_at,
    cpfCnpj: c.cpf_cnpj || '',
    tipoPessoa: (c.tipo_pessoa || "fisica") as any,
    origem: c.origem || '',
    endereco: c.endereco || '',
    dataAniversario: c.data_aniversario || '',
    createdAt: c.created_at
  }));

  // Estados
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [novoClienteDialogOpen, setNovoClienteDialogOpen] = useState(false);
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const showEmptyState = dbIsEmpty && !loading;

  // Atualizar lista filtrada quando os dados ou a busca mudarem
  useEffect(() => {
    applyFilters(clients, searchValue, {});
  }, [dbClientes, searchValue]);

  // Multi-seleção
  const multiSelect = useMultiSelect(filteredClients);

  // Aplicar filtros
  const applyFilters = (clientsList: Client[], search: string, advancedFilters: any) => {
    let filtered = [...clientsList];

    // Filtro de busca
    if (search) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.phone.includes(search) ||
        client.cpfCnpj.includes(search)
      );
    }

    // Filtros avançados
    if (advancedFilters.tipoPessoa) {
      filtered = filtered.filter(client => client.tipoPessoa === advancedFilters.tipoPessoa);
    }

    if (advancedFilters.origem) {
      filtered = filtered.filter(client => client.origem === advancedFilters.origem);
    }

    if (advancedFilters.status) {
      filtered = filtered.filter(client => client.status === advancedFilters.status);
    }

    if (advancedFilters.dataInicioFrom) {
      filtered = filtered.filter(client => 
        new Date(client.createdAt) >= advancedFilters.dataInicioFrom
      );
    }

    if (advancedFilters.dataInicioTo) {
      filtered = filtered.filter(client => 
        new Date(client.createdAt) <= advancedFilters.dataInicioTo
      );
    }

    setFilteredClients(filtered);
  };

  // Handlers de cliente
  const handleEditClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setEditingClient(client);
      setEditDialogOpen(true);
    }
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setClientDetailsOpen(true);
  };

  const handleSaveClient = async (updatedClient: Client) => {
    const success = await update(updatedClient.id, {
      nome: updatedClient.name,
      email: updatedClient.email,
      telefone: updatedClient.phone,
      cpf_cnpj: updatedClient.cpfCnpj,
      tipo_pessoa: updatedClient.tipoPessoa,
      origem: updatedClient.origem,
      endereco: updatedClient.endereco,
      status: updatedClient.status,
      data_aniversario: updatedClient.dataAniversario
    });
    
    if (success) {
      toast({
        title: "Cliente atualizado",
        description: `Os dados de ${updatedClient.name} foram atualizados com sucesso.`,
      });
    }
  };

  const handleNovoCliente = async (newClient: Client) => {
    const success = await create({
      nome: newClient.name,
      email: newClient.email,
      telefone: newClient.phone,
      cpf_cnpj: newClient.cpfCnpj,
      tipo_pessoa: newClient.tipoPessoa,
      origem: newClient.origem,
      endereco: newClient.endereco,
      status: newClient.status || 'Ativo',
      data_aniversario: newClient.dataAniversario
    });
    
    if (success) {
      toast({
        title: "Cliente cadastrado",
        description: `${newClient.name} foi cadastrado com sucesso.`,
      });
    }
  };

  // Handlers de navegação
  const handleViewProcesses = (clientId: string, clientName: string) => {
    navigate('/processos', { state: { clientFilter: clientName, clientId } });
  };

  const handleViewAtendimentos = (clientId: string, clientName: string) => {
    navigate('/atendimentos', { state: { clientFilter: clientName, clientId } });
  };

  const handleViewConsultivo = (clientId: string, clientName: string) => {
    navigate('/consultivo', { state: { clientFilter: clientName, clientId } });
  };

  // Handlers de exclusão
  const handleDeleteSelected = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const selectedIds = multiSelect.getSelectedItems().map(client => client.id);
      const success = await requestMultipleDelete(selectedIds, "Exclusão solicitada pelo usuário");
      
      if (success) {
        multiSelect.clearSelection();
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir os clientes.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Handlers de UI
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    applyFilters(clients, value, {});
  };

  const handleAdvancedFiltersChange = (filters: any) => {
    applyFilters(clients, searchValue, filters);
  };

  const handleClearAdvancedFilters = () => {
    applyFilters(clients, searchValue, {});
  };

  const handleFilterClick = () => {
    // This is now handled by the ClientsAdvancedFilters component
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-10 overflow-x-hidden animate-in">
      {/* Page Header */}
      <ClientsPageHeader
        selectedCount={multiSelect.selectedCount}
        onDeleteSelected={handleDeleteSelected}
        onNewClient={() => setNovoClienteDialogOpen(true)}
        isNoneSelected={multiSelect.isNoneSelected}
      />

      {/* Empty State ou Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Carregando seus clientes...</p>
        </div>
      ) : showEmptyState ? (
        <EmptyState
          icon={Users}
          title="Sua base de clientes está vazia"
          description="Comece a cadastrar seus clientes para gerenciar processos, honorários e atendimentos de forma integrada."
          actionLabel="Cadastrar Novo Cliente"
          onAction={() => setNovoClienteDialogOpen(true)}
        />
      ) : (
        // Conteúdo normal quando há clientes
        <>
          {/* Search and Advanced Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <ClientsSearchBar
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                onFilterClick={handleFilterClick}
              />
            </div>
            <ClientsAdvancedFilters
              onFiltersChange={handleAdvancedFiltersChange}
              onClearFilters={handleClearAdvancedFilters}
            />
          </div>

          {/* Selection Controls */}
          {filteredClients.length > 0 && (
            <ClientsSelectionControls
              isAllSelected={multiSelect.isAllSelected}
              selectedCount={multiSelect.selectedCount}
              totalCount={filteredClients.length}
              onSelectAll={multiSelect.selectAll}
              onClearSelection={multiSelect.clearSelection}
            />
          )}

          {/* Clients Grid */}
          {filteredClients.length > 0 && (
            <ClientsGrid
              clients={filteredClients}
              selectedIds={multiSelect.getSelectedItems().map(item => item.id)}
              onToggleSelect={multiSelect.toggleItem}
              onClientClick={handleClientClick}
              onEditClient={handleEditClient}
              onViewProcesses={handleViewProcesses}
              onViewAtendimentos={handleViewAtendimentos}
              onViewConsultivo={handleViewConsultivo}
            />
          )}
        </>
      )}

      {/* Modais */}
      <ClientDetailsModal
        client={selectedClient}
        isOpen={clientDetailsOpen}
        onClose={() => setClientDetailsOpen(false)}
        onEditClient={handleEditClient}
        onViewProcesses={handleViewProcesses}
        onViewAtendimentos={handleViewAtendimentos}
        onViewConsultivo={handleViewConsultivo}
      />

      <EditClientDialog
        client={editingClient}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveClient}
      />

      <NovoClienteDialog
        open={novoClienteDialogOpen}
        onOpenChange={setNovoClienteDialogOpen}
        onSave={handleNovoCliente}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir Clientes"
        description={`Tem certeza que deseja excluir ${multiSelect.selectedCount} cliente(s)? Clientes com processos associados não podem ser excluídos.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Clientes;
