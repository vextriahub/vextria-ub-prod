import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProcessos } from '@/hooks/useProcessos';
import { FileText, Loader2, RotateCw, Search, Plus } from 'lucide-react';

// Debug logs
console.log('%c [VEXTRIA] DEPLOY VERIFICADO - V13.1 - ABAS ATIVAS ', 'background: #f59e0b; color: #000; font-weight: bold; font-size: 16px;');
console.log('🔍 Processos.tsx - Renderização V13.1 (Full Deploy)');

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

const Processos = React.memo(() => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    data: dbProcessos, 
    loading, 
    create, 
    update, 
    requestDelete, 
    isEmpty: dbIsEmpty 
  } = useProcessos();

  // Mapeamento dos dados do banco para o formato da UI
  const processos = useMemo(() => {
    return dbProcessos.map(p => ({
      id: p.id,
      titulo: p.titulo,
      cliente: (p as any).cliente?.nome || 'Cliente não identificado',
      clienteId: (p as any).clienteId || p.cliente_id,
      status: (p.status || 'Em andamento') as any,
      dataInicio: (p as any).dataInicio || p.data_inicio || p.created_at,
      proximoPrazo: (p as any).proximoPrazo || p.proximo_prazo,
      descricao: p.observacoes,
      valorCausa: (p as any).valorCausa || p.valor_causa,
      numeroProcesso: (p as any).numeroProcesso || p.numero_processo,
      tipoProcesso: (p as any).tipoProcesso || p.tipo_processo,
      faseProcessual: (p as any).faseProcessual || (p as any).fase_processual || 'Fase Inicial',
      responsavelId: (p as any).responsavelId || (p as any).responsavel_id,
      responsavelNome: (p as any).responsavelNome || (p as any).responsavel?.full_name || 'Não atribuído',
      area: (p as any).tipoProcesso || p.tipo_processo || 'Cível',
      ultimaMovimentacao: (p as any).ultimaMovimentacao || p.data_ultima_atualizacao || p.created_at,
      tribunal: (p as any).tribunal,
      vara: (p as any).vara,
      comarca: (p as any).comarca,
      requerido: (p as any).requerido,
    }));
  }, [dbProcessos]);

  const [view, setView] = useState<'grid' | 'table'>('table');
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [filters, setFilters] = useState<IProcessoFilters>({
    search: '',
    status: 'all',
    cliente: 'all',
    numeroProcesso: 'all',
    area: 'all',
    movimentacao: 'all'
  });
  const [editingProcesso, setEditingProcesso] = useState<Processo | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processoToDelete, setProcessoToDelete] = useState<Processo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cnjSearch, setCnjSearch] = useState('');

  // Memoized values
  const showEmptyState = useMemo(() => {
    return dbIsEmpty && !loading;
  }, [dbIsEmpty, loading]);

  // Função auxiliar para verificar data de movimentação
  const isWithinDateRange = useCallback((dataMovimentacao: string | undefined, range: string) => {
    if (!dataMovimentacao || range === 'all') return true;
    
    const hoje = new Date();
    const dataMovimento = new Date(dataMovimentacao);
    const diffTime = hoje.getTime() - dataMovimento.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (range) {
      case '7dias':
        return diffDays <= 7;
      case '15dias':
        return diffDays <= 15;
      default:
        return true;
    }
  }, []);

  // Filtrar processos - memoizado para evitar recálculos desnecessários
  const filteredProcessos = useMemo(() => {
    return processos.filter(processo => {
      const matchesSearch = filters.search === '' || 
        processo.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
        processo.cliente.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCnj = cnjSearch === '' || 
        (processo.numeroProcesso && processo.numeroProcesso.toLowerCase().includes(cnjSearch.toLowerCase()));
      
      const matchesStatus = filters.status === 'all' || processo.status === filters.status;
      const matchesCliente = filters.cliente === 'all' || processo.cliente === filters.cliente;
      const matchesNumeroProcesso = filters.numeroProcesso === 'all' || processo.numeroProcesso === filters.numeroProcesso;
      const matchesArea = filters.area === 'all' || processo.area === filters.area;
      const matchesMovimentacao = isWithinDateRange(processo.ultimaMovimentacao, filters.movimentacao);
      
      return matchesSearch && matchesCnj && matchesStatus && matchesCliente && matchesNumeroProcesso && matchesArea && matchesMovimentacao;
    });
  }, [processos, filters, cnjSearch, isWithinDateRange]);

  // Listas únicas para filtros - memoizadas
  const uniqueClientes = useMemo(() => {
    return Array.from(new Set(processos.map(p => p.cliente).filter(Boolean))).sort();
  }, [processos]);

  const uniqueNumerosProcesso = useMemo(() => {
    return Array.from(new Set(processos.map(p => p.numeroProcesso).filter(Boolean))).sort();
  }, [processos]);

  // Contagem de filtros ativos - memoizada
  const activeFiltersCount = useMemo(() => {
    return [
      filters.search !== '',
      filters.status !== 'all',
      filters.cliente !== 'all',
      filters.numeroProcesso !== 'all',
      filters.area !== 'all',
      filters.movimentacao !== 'all'
    ].filter(Boolean).length + (cnjSearch !== '' ? 1 : 0);
  }, [filters, cnjSearch]);

  const [isNovoProcessoOpen, setIsNovoProcessoOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'carteira');

  // Sincronizar aba com URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'carteira' || tab === 'novo')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handlers - todos usando useCallback para evitar re-criações
  const handleAddProcesso = useCallback(async (novoProcesso: any) => {
    const success = await create({
      titulo: novoProcesso.titulo,
      cliente_id: (novoProcesso as any).clienteId || null,
      status: novoProcesso.status,
      numero_processo: novoProcesso.numeroProcesso || '',
      tipo_processo: novoProcesso.tipoProcesso || 'Cível',
      valor_causa: novoProcesso.valorCausa || 0,
      observacoes: novoProcesso.descricao || '',
      proximo_prazo: novoProcesso.proximoPrazo || null,
      data_inicio: new Date().toISOString().split('T')[0],
      tribunal: novoProcesso.tribunal,
      vara: novoProcesso.vara,
      comarca: novoProcesso.comarca,
      requerido: novoProcesso.requerido,
      segredo_justica: novoProcesso.segredoJustica,
      justica_gratuita: novoProcesso.justicaGratuita
    });

    if (success) {
      toast({
        title: "Processo criado",
        description: `Processo "${novoProcesso.titulo}" foi criado com sucesso.`,
      });
    }
  }, [create, toast]);

  const handleImportedSync = useCallback(async (processes: any[]) => {
    let successCount = 0;
    try {
      for (const proc of processes) {
        const partesArray = proc.titulo?.split(' x ') || [];
        const autorNome = partesArray[0] || proc.titulo;
        const reuNome = partesArray[1] || proc.requerido || '';

        // Build observacoes with all extra info that doesn't have a DB column
        const obsLines = [];
        if (reuNome) obsLines.push(`Réu: ${reuNome}`);
        if (proc.ultimoAndamento?.descricao) obsLines.push(`Último andamento: ${proc.ultimoAndamento.descricao}`);
        obsLines.push('Importado via OAB');

        const success = await create({
          titulo: autorNome,
          clienteId: (proc as any).clienteId || null,
          status: 'Em andamento',
          numeroProcesso: proc.numeroProcesso,
          tipoProcesso: proc.faseProcessual || proc.tipoProcesso || 'Cível',
          proximoPrazo: null,
          valorCausa: proc.valorCausa || 0,
          descricao: obsLines.join(' | '),
          tribunal: proc.tribunal,
          vara: proc.vara || '',
          comarca: proc.comarca || '',
        } as any);
        if (success) successCount++;
      }

      
      if (successCount > 0) {
        toast({
          title: "Importação concluída",
          description: `${successCount} processos foram adicionados com sucesso ao seu escritório.`,
        });
      }
    } catch (error) {
      console.error('Erro ao importar processos da OAB:', error);
      toast({
        title: "Erro na importação",
        description: "Houve um problema ao salvar alguns processos.",
        variant: "destructive"
      });
    }
  }, [create, user, toast]);

  const handleEditProcesso = useCallback((processo: Processo) => {
    setEditingProcesso(processo);
    setEditDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback((processo: Processo) => {
    setSelectedProcesso(processo);
    setIsDetailsOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async (processoAtualizado: Processo) => {
    const success = await update(processoAtualizado.id, {
      titulo: processoAtualizado.titulo,
      status: processoAtualizado.status,
      numero_processo: processoAtualizado.numeroProcesso,
      tipo_processo: processoAtualizado.tipoProcesso,
      valor_causa: processoAtualizado.valorCausa,
      observacoes: processoAtualizado.descricao,
      proximo_prazo: processoAtualizado.proximoPrazo
    });
    
    if (success) {
      toast({
        title: "Processo atualizado",
        description: `Processo "${processoAtualizado.titulo}" foi atualizado com sucesso.`,
      });
    }
  }, [update, toast]);

  const handleDeleteProcesso = useCallback((processo: Processo) => {
    setProcessoToDelete(processo);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!processoToDelete) return;

    setIsDeleting(true);
    
    try {
      const success = await requestDelete(processoToDelete.id);
      
      if (success) {
        toast({
          title: "Solicitado",
          description: `A exclusão do processo "${processoToDelete.titulo}" foi solicitada.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao solicitar a exclusão.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProcessoToDelete(null);
    }
  }, [processoToDelete, requestDelete, toast]);

  const handleClienteClick = useCallback((clienteId: string) => {
    navigate(`/clientes?filter=${clienteId}`);
  }, [navigate]);

  const handleLoadSampleData = useCallback(() => {
    toast({
      title: "Aviso",
      description: "A função de carregar dados de exemplo foi desativada em produção para garantir a integridade do seu banco de dados real.",
    });
  }, [toast]);

  const handleProcessoEncontradoAPI = useCallback(async (processoAPI: any) => {
    await create({
      titulo: processoAPI.titulo,
      cliente_id: null,
      status: processoAPI.status,
      numero_processo: processoAPI.numeroProcesso,
      tipo_processo: 'Importado via API',
      valor_causa: 0,
      observacoes: `Processo importado via API. Última movimentação: ${processoAPI.ultimaMovimentacao.descricao}`,
      proximo_prazo: null,
      data_inicio: new Date().toISOString().split('T')[0]
    });
    
    toast({
      title: "Processo importado",
      description: `Processo "${processoAPI.titulo}" foi importado com sucesso.`,
    });
  }, [toast]);

  const handleFiltersChange = useCallback((newFilters: IProcessoFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      cliente: 'all',
      numeroProcesso: 'all',
      area: 'all',
      movimentacao: 'all'
    });
    setCnjSearch('');
  }, []);

  const handleEditDialogOpenChange = useCallback((open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditingProcesso(null);
    }
  }, []);

  const handleDeleteDialogOpenChange = useCallback((open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setProcessoToDelete(null);
    }
  }, []);

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-10 overflow-x-hidden entry-animate">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Processos Jurídicos
              </h1>
            </div>
            <p className="text-sm md:text-lg text-muted-foreground font-medium">
              {activeTab === 'carteira' 
                ? "Gerencie sua carteira de processos com inteligência." 
                : "Importe novos processos ou cadastre manualmente."}
            </p>
          </div>
        </div>

        <TabsContent value="carteira" className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 glass-morphism p-3 rounded-[2rem]">
            <div className="relative group flex-1 md:min-w-[300px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/40 h-5 w-5 transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Buscar por número CNJ..." 
                value={cnjSearch}
                onChange={(e) => setCnjSearch(e.target.value)}
                className="pl-12 h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 placeholder:text-muted-foreground/50 transition-all font-medium"
              />
            </div>
            
            <div className="flex items-center gap-3 h-12">
              <ProcessoViewSwitcher view={view} onViewChange={setView} />
            </div>
          </div>

          {showEmptyState ? (
            <EmptyState
              icon={FileText}
              title="Nenhum processo cadastrado"
              description="Seu escritório ainda não possui processos no banco de dados. Comece importando processos via OAB ou cadastrando-os manualmente."
              actionLabel="Criar Primeiro Processo"
              onAction={() => setActiveTab('novo')}
            />
          ) : (
            <>
              <ProcessoFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                clientes={uniqueClientes}
                numerosProcesso={uniqueNumerosProcesso}
                activeFiltersCount={activeFiltersCount}
                onClearFilters={handleClearFilters}
              />

              {filteredProcessos.length === 0 ? (
                <Card className="glass-card border-white/5 bg-card/30 p-12 text-center rounded-[2rem] shadow-premium">
                  <CardContent className="space-y-6">
                    <div className="p-6 bg-primary/5 rounded-full inline-block border border-primary/10">
                      <Search className="h-12 w-12 text-primary opacity-40" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-extrabold">Nenhum processo encontrado</h3>
                      <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                        Tente ajustar seus filtros ou faça uma nova busca refinada para encontrar o que procura.
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleClearFilters} className="rounded-xl font-bold h-12 px-8 border-white/10 hover:bg-white/5">
                      Limpar Filtros
                    </Button>
                  </CardContent>
                </Card>
              ) : view === 'table' ? (
                <ProcessoTable
                  processos={filteredProcessos as any}
                  onEdit={handleEditProcesso}
                  onDelete={handleDeleteProcesso}
                  onViewDetails={handleViewDetails}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProcessos.map((processo) => (
                    <ProcessoCard
                      key={processo.id}
                      processo={processo as any}
                      onEdit={handleEditProcesso}
                      onDelete={handleDeleteProcesso}
                      onClienteClick={handleClienteClick}
                      onClick={() => handleViewDetails(processo as any)}
                    />
                  ))}
                </div>
              )}

              <div className="text-center text-sm text-muted-foreground pb-8">
                Mostrando {filteredProcessos.length} de {processos.length} processo(s)
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="novo" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ProcessoIntegracaoPanel 
            onAddProcesso={handleImportedSync}
            onSuccess={() => setActiveTab('carteira')}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      <ProcessoEditDialog
        processo={editingProcesso}
        open={editDialogOpen}
        onOpenChange={handleEditDialogOpenChange}
        onSave={handleSaveEdit}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
        onConfirm={handleConfirmDelete}
        title="Excluir Processo"
        description={`Tem certeza que deseja excluir o processo "${processoToDelete?.titulo}"? Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
      />

      {/* Painel de Detalhes (Drawer) */}
      <ProcessoDetailsDrawer
        processo={selectedProcesso as any}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
});

Processos.displayName = 'Processos';

export default Processos;
