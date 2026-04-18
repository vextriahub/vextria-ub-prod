import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tarefa, TarefaFormData } from "@/types/tarefa";
import { useTarefaService } from "@/services/tarefaService";
import { useMultiSelect } from "@/hooks/useMultiSelect";

// Componentes refatorados
import { TarefasPageHeader } from "@/components/Tarefas/TarefasPageHeader";
import { TarefasFilters } from "@/components/Tarefas/TarefasFilters";
import { TarefasList } from "@/components/Tarefas/TarefasList";
import { TarefasEmptyState } from "@/components/Tarefas/TarefasEmptyState";
import { NovaTarefaDialog } from "@/components/Tarefas/NovaTarefaDialog";

// Componentes existentes mantidos
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

// Dados de exemplo
const initialTasks: Tarefa[] = [
  {
    id: 1,
    title: "Protocolar petição inicial - Silva vs. Empresa XYZ",
    dueDate: "Hoje, 16:00",
    priority: "alta",
    client: "Maria Silva",
    case: "Trabalhista #2025-001",
    points: 50,
    completed: false,
    description: "Protocolar petição inicial no processo trabalhista contra a Empresa XYZ"
  },
  {
    id: 2,
    title: "Responder publicação judicial",
    dueDate: "Amanhã, 12:00",
    priority: "alta",
    client: "João Santos",
    case: "Civil #2025-015",
    points: 40,
    completed: false,
    description: "Responder à publicação judicial referente ao processo civil"
  },
  {
    id: 3,
    title: "Reunião com cliente",
    dueDate: "23/01, 14:30",
    priority: "media",
    client: "Tech Solutions Ltda",
    case: "Empresarial #2025-008",
    points: 20,
    completed: true,
    description: "Reunião de alinhamento sobre contratos empresariais"
  }
];

const Tarefas = () => {
  const { toast } = useToast();
  const tarefaService = useTarefaService();
  
  // Estados
  const [tarefas, setTarefas] = useState<Tarefa[]>(initialTasks);
  const [completedTasks, setCompletedTasks] = useState<number[]>([3]);
  const [searchValue, setSearchValue] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndividualDialogOpen, setDeleteIndividualDialogOpen] = useState(false);
  const [tarefaToDelete, setTarefaToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [novaTarefaDialogOpen, setNovaTarefaDialogOpen] = useState(false);

  // Multi-seleção
  const multiSelect = useMultiSelect(tarefas);

  // Handlers
  const handleToggleComplete = (taskId: number) => {
    const result = tarefaService.toggleTaskCompletion(tarefas, taskId);
    setTarefas(result.tarefas);
    
    if (result.completedTask) {
      setCompletedTasks(prev => 
        result.completedTask!.completed 
          ? [...prev, taskId]
          : prev.filter(id => id !== taskId)
      );
    }
  };

  const handleNewTarefa = () => {
    setNovaTarefaDialogOpen(true);
  };

  const handleAddTarefa = (tarefaData: TarefaFormData) => {
    const novaTarefa: Tarefa = {
      ...tarefaData,
      id: Date.now(), // ID temporário
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTarefas(prev => [novaTarefa, ...prev]);
  };

  const handleDeleteSelected = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const selectedIds = multiSelect.getSelectedItems().map(item => item.id);
      const result = tarefaService.deleteTarefas(tarefas, selectedIds);
      
      if (result.success) {
        setTarefas(result.tarefas);
        setCompletedTasks(prev => prev.filter(id => !selectedIds.includes(id)));
        multiSelect.clearSelection();
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir as tarefas.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteTarefa = (tarefaId: number) => {
    setTarefaToDelete(tarefaId);
    setDeleteIndividualDialogOpen(true);
  };

  const handleConfirmDeleteIndividual = async () => {
    if (!tarefaToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = tarefaService.deleteTarefas(tarefas, [tarefaToDelete]);
      
      if (result.success) {
        setTarefas(result.tarefas);
        setCompletedTasks(prev => prev.filter(id => id !== tarefaToDelete));
        toast({
          title: "Tarefa excluída",
          description: "A tarefa foi excluída com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a tarefa.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteIndividualDialogOpen(false);
      setTarefaToDelete(null);
    }
  };

  const handleLoadSampleData = () => {
    setTarefas(initialTasks);
    setCompletedTasks([3]);
    toast({
      title: "Dados carregados",
      description: "Dados de exemplo foram carregados com sucesso.",
    });
  };

  // Handlers de filtros
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handlePriorityFilterChange = (value: string) => {
    setPriorityFilter(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setPriorityFilter("all");
    setStatusFilter("all");
    setSortBy("priority");
  };

  // Filtragem e ordenação
  const filteredTarefas = tarefaService.filterTarefas(tarefas, {
    search: searchValue,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const sortedTarefas = tarefaService.sortTarefas(filteredTarefas, sortBy as any);

  // Estatísticas
  const stats = tarefaService.calculateStats(tarefas);

  // Contagem de filtros ativos
  const activeFiltersCount = [
    searchValue !== "",
    priorityFilter !== "all",
    statusFilter !== "all"
  ].filter(Boolean).length;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <TarefasPageHeader
        selectedCount={multiSelect.selectedCount}
        onDeleteSelected={handleDeleteSelected}
        onNewTarefa={handleNewTarefa}
        isNoneSelected={multiSelect.isNoneSelected}
        stats={stats}
      />

      {/* Empty State */}
      {tarefas.length === 0 ? (
        <TarefasEmptyState
          onNewTarefa={handleNewTarefa}
          onLoadSampleData={handleLoadSampleData}
        />
      ) : (
        <>
          {/* Filtros */}
          <TarefasFilters
            searchValue={searchValue}
            priorityFilter={priorityFilter}
            statusFilter={statusFilter}
            sortBy={sortBy}
            onSearchChange={handleSearchChange}
            onPriorityFilterChange={handlePriorityFilterChange}
            onStatusFilterChange={handleStatusFilterChange}
            onSortChange={handleSortChange}
            onClearFilters={handleClearFilters}
            activeFiltersCount={activeFiltersCount}
          />

          {/* Empty State para filtros */}
          {sortedTarefas.length === 0 ? (
            <TarefasEmptyState
              onNewTarefa={handleNewTarefa}
              onLoadSampleData={handleLoadSampleData}
              isFiltered={true}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <>
              {/* Controles de seleção */}
              {sortedTarefas.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={multiSelect.isAllSelected}
                      onCheckedChange={() => 
                        multiSelect.isAllSelected ? multiSelect.clearSelection() : multiSelect.selectAll()
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {multiSelect.selectedCount > 0 ? (
                        `${multiSelect.selectedCount} de ${sortedTarefas.length} selecionada(s)`
                      ) : (
                        "Selecionar todas"
                      )}
                    </span>
                  </div>
                  {multiSelect.selectedCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={multiSelect.clearSelection}
                    >
                      Limpar seleção
                    </Button>
                  )}
                </div>
              )}

              {/* Lista de Tarefas */}
              <TarefasList
                tarefas={sortedTarefas}
                selectedIds={multiSelect.getSelectedItems().map(item => item.id)}
                completedIds={completedTasks}
                onToggleSelect={multiSelect.toggleItem}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTarefa}
                getPriorityColor={tarefaService.getPriorityColor}
              />
            </>
          )}
        </>
      )}

      {/* Modal de confirmação de exclusão em lote */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir Tarefas"
        description={`Tem certeza que deseja excluir ${multiSelect.selectedCount} tarefa(s)? Apenas tarefas concluídas podem ser excluídas.`}
        isLoading={isDeleting}
      />

      {/* Modal de confirmação de exclusão individual */}
      <DeleteConfirmDialog
        open={deleteIndividualDialogOpen}
        onOpenChange={setDeleteIndividualDialogOpen}
        onConfirm={handleConfirmDeleteIndividual}
        title="Excluir Tarefa"
        description="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
        isLoading={isDeleting}
      />

      {/* Modal de nova tarefa */}
      <NovaTarefaDialog
        open={novaTarefaDialogOpen}
        onOpenChange={setNovaTarefaDialogOpen}
        onAddTarefa={handleAddTarefa}
      />
    </div>
  );
};

export default Tarefas;