import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { Client } from "@/types/client";
import { Loader2, Users, Plus } from "lucide-react";
import { useClientes } from "@/hooks/useClientes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-12 overflow-x-hidden animate-in">
      {/* Page Header Moderno */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 drop-shadow-sm">
              Gestão de Clientes
            </h1>
          </div>
          <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-2xl">
            Visualize e gerencie todos os seus relacionamentos profissionais e CRM.
          </p>
        </div>
        
        <div className="flex items-center gap-3 glass-morphism p-2 rounded-2xl">
          <Button 
            onClick={() => setNovoClienteDialogOpen(true)}
            size="lg"
            className="rounded-xl shadow-premium h-12 px-6 font-bold"
          >
            <Plus className="mr-2 h-5 w-5" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Seção de Filtros e Busca */}
      <div className="grid grid-cols-1 gap-6">
        <div className="glass-card p-6 rounded-3xl shadow-premium border-white/10 group transition-all duration-500">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Buscar por nome, email ou CPF/CNPJ..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 h-14 bg-background/50 border-white/5 rounded-2xl text-lg focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
              />
            </div>
          </div>
          <ClientsAdvancedFilters onFiltersChange={handleAdvancedFiltersChange} />
        </div>
      </div>

      {/* Lista de Clientes */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <Loader2 className="h-14 w-14 animate-spin text-primary relative" />
          </div>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Sincronizando Base de Clientes...</p>
        </div>
      ) : showEmptyState ? (
        <ClientsEmptyState onAction={() => setNovoClienteDialogOpen(true)} />
      ) : (
        <>
          <ClientsSelectionControls
            isAllSelected={multiSelect.isAllSelected}
            selectedCount={multiSelect.selectedCount}
            totalCount={filteredClients.length}
            onSelectAll={multiSelect.selectAll}
            onClearSelection={multiSelect.clearSelection}
          />

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
