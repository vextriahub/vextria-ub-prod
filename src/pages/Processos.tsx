import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProcessosV2 } from '@/hooks/useProcessosV2';
import { FileText, Loader2, RotateCw, Search, Plus, Filter, Database } from 'lucide-react';
import { formatCNJ, extractYearFromCNJ } from '@/utils/formatCNJ';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

// Componentes específicos
import { ProcessoCard } from '@/components/Processos/ProcessoCard';
import { NovoProcessoDialog } from '@/components/Processos/NovoProcessoDialog';
import { ProcessoEditDialog } from '@/components/Processos/ProcessoEditDialog';
import { BuscaProcessoAPI } from '@/components/Processos/BuscaProcessoAPI';
import { ProcessoFilters } from '@/components/Processos/ProcessoFilters';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';
import { ProcessoTable } from '@/components/Processos/ProcessoTable';
import { ProcessoDetailsDrawer } from '@/components/Processos/ProcessoDetailsDrawer';
import { ProcessoViewSwitcher } from '@/components/Processos/ProcessoViewSwitcher';
import { JudicialSyncDialog } from '@/components/Processos/JudicialSyncDialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProcessoIntegracaoPanel } from '@/components/Processos/ProcessoIntegracaoPanel';
import { LayoutGrid, Table as TableIcon, Download, List } from 'lucide-react';

// Tipos e dados
import { Processo, NovoProcessoForm, ProcessoFilters as IProcessoFilters, statusProcesso } from '@/types/processo';

const Processos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { 
    data: processos, 
    loading, 
    refresh, 
    requestDelete,
    update: updateProcesso
  } = useProcessosV2();

  // Estados locais
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [isNovoDialogOpen, setIsNovoDialogOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [isIntegracaoOpen, setIsIntegracaoOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [processoToDelete, setProcessoToDelete] = useState<Processo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('ativos');
  
  // Filtros
  const [filters, setFilters] = useState<IProcessoFilters>({
    search: '',
    status: 'all',
    cliente: 'all',
    numeroProcesso: '',
    area: 'all',
    movimentacao: 'all'
  });

  // Filtragem
  const filteredProcessos = useMemo(() => {
    return processos.filter(p => {
      const matchesSearch = 
        p.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.cliente.toLowerCase().includes(filters.search.toLowerCase()) ||
        (p.numeroProcesso && p.numeroProcesso.includes(filters.search));
        
      const matchesStatus = filters.status === 'all' || p.status === filters.status;
      const matchesCliente = filters.cliente === 'all' || p.cliente === filters.cliente;
      const matchesArea = filters.area === 'all' || p.area === filters.area;
      
      const matchesTab = activeTab === 'todos' || 
        (activeTab === 'ativos' && p.status === 'Em andamento') ||
        (activeTab === 'concluidos' && p.status === 'Concluído') ||
        (activeTab === 'suspensos' && p.status === 'Suspenso');

      return matchesSearch && matchesStatus && matchesCliente && matchesArea && matchesTab;
    });
  }, [processos, filters, activeTab]);

  const clientesDisponiveis = useMemo(() => {
    const unique = new Set(processos.map(p => p.cliente));
    return Array.from(unique).sort();
  }, [processos]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.cliente !== 'all') count++;
    if (filters.area !== 'all') count++;
    return count;
  }, [filters]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      cliente: 'all',
      area: 'all',
      movimentacao: 'all',
      numeroProcesso: ''
    });
  }, []);

  const handleSyncComplete = () => {
    refresh();
    setIsSyncDialogOpen(false);
    toast({
      title: "Sincronização concluída",
      description: "Seus processos foram atualizados com os dados oficiais.",
    });
  };

  if (loading && processos.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <FileText className="h-10 w-10 text-primary" />
            Processos Judiciais
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Gestão inteligente de processos e acompanhamento processual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsIntegracaoOpen(true)}
            className="rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[10px] glass-card border-black/5 dark:border-white/10 hover:bg-primary/5 transition-all"
          >
            <Database className="h-4 w-4 mr-2 text-primary" />
            Integração DataJud
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setIsSyncDialogOpen(true)}
            className="rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[10px] bg-white dark:bg-card/40 border-black/5 dark:border-white/10 shadow-premium hover:bg-primary/5 transition-all"
          >
            <RotateCw className="h-4 w-4 mr-2 text-primary" />
            Sincronizar Todos
          </Button>
          
          <Button 
            onClick={() => setIsNovoDialogOpen(true)}
            className="rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[10px] shadow-premium hover:scale-[1.02] transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Processo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 glass-card p-6 rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-premium bg-white dark:bg-card/40">
            <div className="relative group/search flex-1">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground/30 h-5 w-5 transition-all group-focus-within/search:text-primary" />
              <Input 
                placeholder="Busca: título, cliente ou número CNJ (ex: 07166164)..." 
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-14 h-16 bg-white dark:bg-white/[0.05] border-black/5 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground/30 transition-all font-black text-lg shadow-premium"
              />
            </div>
            
            <ProcessoViewSwitcher view={view} onViewChange={setView} />
          </div>

          <Card className="glass-card border-black/5 dark:border-white/10 overflow-hidden rounded-[2.5rem] shadow-premium">
            <CardContent className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <TabsList className="bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl h-14 border border-black/5 dark:border-white/5">
                    <TabsTrigger value="ativos" className="rounded-xl px-8 h-11 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-primary data-[state=active]:shadow-premium transition-all">
                      Em Andamento
                    </TabsTrigger>
                    <TabsTrigger value="concluidos" className="rounded-xl px-8 h-11 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-primary data-[state=active]:shadow-premium transition-all">
                      Concluídos
                    </TabsTrigger>
                    <TabsTrigger value="suspensos" className="rounded-xl px-8 h-11 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-primary data-[state=active]:shadow-premium transition-all">
                      Suspensos
                    </TabsTrigger>
                    <TabsTrigger value="todos" className="rounded-xl px-8 h-11 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-primary data-[state=active]:shadow-premium transition-all">
                      Todos
                    </TabsTrigger>
                  </TabsList>

                  <ProcessoFilters 
                    filters={filters} 
                    onFiltersChange={setFilters}
                    clientes={clientesDisponiveis}
                    activeFiltersCount={activeFiltersCount}
                    onClearFilters={handleClearFilters}
                  />
                </div>

                <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none ring-0">
                  {filteredProcessos.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="Nenhum processo encontrado"
                      description="Não encontramos processos que correspondam aos filtros selecionados."
                      actionLabel="Limpar Filtros"
                      onAction={handleClearFilters}
                    />
                  ) : (
                    view === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProcessos.map((p) => (
                          <ProcessoCard 
                            key={p.id} 
                            processo={p} 
                            onClick={() => {
                              setSelectedProcesso(p);
                              setIsDetailsOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <ProcessoTable 
                        processos={filteredProcessos}
                        onEdit={(p) => setSelectedProcesso(p)}
                        onDelete={(p) => {
                          setProcessoToDelete(p);
                          setIsDeleteDialogOpen(true);
                        }}
                      />
                    )
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <NovoProcessoDialog 
        open={isNovoDialogOpen} 
        onOpenChange={setIsNovoDialogOpen}
        onSuccess={() => {
          refresh();
          setIsNovoDialogOpen(false);
        }}
      />

      <JudicialSyncDialog
        open={isSyncDialogOpen}
        onOpenChange={setIsSyncDialogOpen}
        onSyncComplete={handleSyncComplete}
      />

      <ProcessoIntegracaoPanel
        open={isIntegracaoOpen}
        onOpenChange={setIsIntegracaoOpen}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={async () => {
          if (processoToDelete) {
            setIsDeleting(true);
            try {
              await requestDelete(processoToDelete.id);
              setIsDeleteDialogOpen(false);
              setProcessoToDelete(null);
            } finally {
              setIsDeleting(false);
            }
          }
        }}
        title="Arquivar Processo"
        description={`Deseja arquivar o processo "${processoToDelete?.titulo}"?`}
        isLoading={isDeleting}
      />

      <ProcessoDetailsDrawer
        processo={selectedProcesso as any}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default Processos;
