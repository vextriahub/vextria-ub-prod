import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProcessos } from '@/hooks/useProcessos';
import { FileText, Loader2, RotateCw, Search, Plus, Filter, Database } from 'lucide-react';
import { formatCNJ, extractYearFromCNJ } from '@/utils/formatCNJ';

// Debug logs
console.log('%c [VEXTRIA] DEPLOY VERIFICADO - V20.2 - FINAL STABILITY ', 'background: #10b981; color: #fff; font-weight: bold; font-size: 16px;');
console.log('🔍 Processos.tsx - Renderização V20.2 (Auth Fix & Broad Search)');

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
    data: dbProcessos = [], 
    loading, 
    create, 
    update, 
    requestDelete, 
    isEmpty: hookIsEmpty,
    addMovimentacao
  } = useProcessos();

  const [view, setView] = useState<'grid' | 'table'>('table');
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [filters, setFilters] = useState<IProcessoFilters>({
    search: '',
    status: 'all',
    cliente: 'all',
    area: 'all',
    movimentacao: 'all'
  });
  
  const [editingProcesso, setEditingProcesso] = useState<Processo | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processoToDelete, setProcessoToDelete] = useState<Processo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mapeamento dos dados do banco para o formato da UI
  const processos = useMemo(() => {
    return dbProcessos.map(p => ({
      ...p,
      cliente: p.cliente || 'Cliente não identificado',
      faseProcessual: p.faseProcessual || 'Fase Inicial',
      responsavelNome: 'Não atribuído',
      area: p.tipoProcesso || 'Cível'
    }));
  }, [dbProcessos]);

  // Função auxiliar para verificar data de movimentação
  const isWithinDateRange = useCallback((dataMovimentacao: string | undefined, range: string) => {
    if (!dataMovimentacao || range === 'all') return true;
    
    const hoje = new Date();
    const dataMovimento = new Date(dataMovimentacao);
    const diffTime = hoje.getTime() - dataMovimento.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (range) {
      case '7dias': return diffDays <= 7;
      case '15dias': return diffDays <= 15;
      case '30dias': return diffDays <= 30;
      default: return true;
    }
  }, []);

  // Filtrar processos
  const filteredProcessos = useMemo(() => {
    return processos.filter(processo => {
      const searchTerms = filters.search.toLowerCase();
      const matchesSearch = filters.search === '' || 
        processo.titulo.toLowerCase().includes(searchTerms) ||
        processo.cliente.toLowerCase().includes(searchTerms) ||
        (processo.numeroProcesso && processo.numeroProcesso.includes(searchTerms.replace(/\D/g, '')));
      
      const matchesStatus = filters.status === 'all' || processo.status === filters.status;
      const matchesCliente = filters.cliente === 'all' || processo.cliente === filters.cliente;
      const matchesArea = filters.area === 'all' || processo.area === filters.area;
      const matchesMovimentacao = isWithinDateRange(processo.ultimaMovimentacao, filters.movimentacao);
      
      return matchesSearch && matchesStatus && matchesCliente && matchesArea && matchesMovimentacao;
    });
  }, [processos, filters, isWithinDateRange]);

  // Listas únicas para filtros
  const uniqueClientes = useMemo(() => {
    return Array.from(new Set(processos.map(p => p.cliente).filter(Boolean))).sort();
  }, [processos]);

  // Contagem de filtros ativos
  const activeFiltersCount = useMemo(() => {
    return [
      filters.status !== 'all',
      filters.cliente !== 'all',
      filters.area !== 'all',
      filters.movimentacao !== 'all'
    ].filter(Boolean).length;
  }, [filters]);

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'carteira');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'carteira' || tab === 'novo')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleImportedSync = useCallback(async (input: any[] | any) => {
    let successCount = 0;
    try {
      const processes = Array.isArray(input) ? input : [input];
      
      console.log(`🚀 Iniciando sincronização de ${processes.length} processo(s)...`);

      for (const proc of processes) {
        const autorNome = proc.autor || proc.titulo?.split(' x ')[0] || proc.titulo;
        const reuNome = proc.reu || proc.titulo?.split(' x ')[1] || proc.requerido || '';
        const obs = proc.ultimoAndamento?.descricao || proc.descricao || 'Sincronizado via Vextria Hub.';
        
        // Extrair dataInicio do CNJ se possível
        const cnjYear = extractYearFromCNJ(proc.numeroProcesso || proc.numero_processo);
        const dataInicioReal = cnjYear ? `${cnjYear}-01-01` : proc.dataInicio || proc.data_inicio || new Date().toISOString().split('T')[0];

        const createdProc = await create({
          titulo: autorNome,
          clienteId: (proc as any).clienteId || (proc as any).cliente_id || null,
          status: 'Em andamento',
          numeroProcesso: proc.numeroProcesso || proc.numero_processo,
          tipoProcesso: proc.faseProcessual || proc.tipoProcesso || proc.tipo_processo || 'Cível',
          valorCausa: proc.valorCausa || proc.valor_causa || 0,
          descricao: obs,
          tribunal: proc.tribunal,
          vara: proc.vara || '',
          comarca: proc.comarca || '',
          requerido: reuNome,
          segredoJustica: proc.segredoJustica || proc.segredo_justica || false,
          justicaGratuita: proc.justicaGratuita || proc.justica_gratuita || false,
          dataInicio: dataInicioReal
        } as any);

        if (createdProc && addMovimentacao) {
          successCount++;
          
          // Se tiver andamento específico na busca por OAB
          if (proc.ultimoAndamento) {
            await addMovimentacao(createdProc.id, {
              data: proc.ultimoAndamento.data,
              descricao: proc.ultimoAndamento.descricao,
              tipo: 'andamento'
            });
          } 
          // Se tiver andamentos (array)
          else if (Array.isArray(proc.andamentos) && proc.andamentos.length > 0) {
            for (const and of proc.andamentos) {
              await addMovimentacao(createdProc.id, {
                data: and.data,
                descricao: and.resumo || and.descricao,
                tipo: 'andamento'
              });
            }
          }
        }
      }

      if (successCount > 0) {
        toast({ title: "Sincronização concluída", description: `${successCount} processo(s) processado(s) com sucesso.` });
      }
    } catch (error: any) {
      console.error('Erro ao importar processos:', error);
      toast({ 
        title: "Erro na importação", 
        description: error.message || "Ocorreu um problema ao salvar os dados.",
        variant: "destructive" 
      });
    }
  }, [create, addMovimentacao, toast]);

  const handleViewDetails = useCallback((processo: Processo) => {
    setSelectedProcesso(processo);
    setIsDetailsOpen(true);
  }, []);

  const handleEditProcesso = useCallback((processo: Processo) => {
    setEditingProcesso(processo);
    setEditDialogOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async (processoAtualizado: Processo) => {
    await update(processoAtualizado.id, {
      titulo: processoAtualizado.titulo,
      status: processoAtualizado.status,
      numeroProcesso: processoAtualizado.numeroProcesso,
      tipoProcesso: processoAtualizado.tipoProcesso,
      valorCausa: processoAtualizado.valorCausa,
      descricao: processoAtualizado.descricao,
      proximoPrazo: processoAtualizado.proximoPrazo,
      requerido: (processoAtualizado as any).requerido
    });
    setEditDialogOpen(false);
  }, [update]);

  const handleConfirmDelete = useCallback(async () => {
    if (!processoToDelete) return;
    setIsDeleting(true);
    try {
      await requestDelete(processoToDelete.id);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProcessoToDelete(null);
    }
  }, [processoToDelete, requestDelete]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      cliente: 'all',
      area: 'all',
      movimentacao: 'all'
    });
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
                Gestão de Processos
              </h1>
            </div>
            <p className="text-sm md:text-lg text-muted-foreground font-medium">
              {activeTab === 'carteira' 
                ? "Visualize e gerencie toda sua carteira acumulada." 
                : "Sincronize processos novos diretamente dos tribunais."}
            </p>
          </div>

          <div className="flex items-center gap-2">
             <Button variant="outline" onClick={() => navigate('/publicacoes')} className="rounded-xl font-bold h-10 border-white/10">
               Ver Publicações
             </Button>
             <Button onClick={() => setActiveTab('novo')} className="rounded-xl font-bold h-10 group">
               <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
               Sincronizar Novos
             </Button>
          </div>
        </div>

        <TabsContent value="carteira" className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 glass-morphism p-3 rounded-[2rem]">
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/40 h-5 w-5 transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Busca global: título, cliente ou número CNJ..." 
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-12 h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 placeholder:text-muted-foreground/50 transition-all font-medium"
              />
            </div>
            
            <ProcessoViewSwitcher view={view} onViewChange={setView} />
          </div>

          {hookIsEmpty ? (
            <div className="flex flex-col items-center justify-center p-16 text-center space-y-6 glass-card rounded-[3rem] border-white/5">
               <div className="p-6 rounded-full bg-primary/5 border border-primary/10">
                 <Database className="h-16 w-16 text-primary opacity-40" />
               </div>
               <div className="space-y-2">
                 <h2 className="text-2xl font-black">Sua carteira está limpa</h2>
                 <p className="text-muted-foreground max-w-sm mx-auto">Importe processos por OAB para começar a gerenciar seus prazos e andamentos de forma automatizada.</p>
               </div>
               <Button onClick={() => setActiveTab('novo')} size="lg" className="rounded-2xl font-bold h-14 px-10">
                 Iniciar Primeira Sincronização
               </Button>
            </div>
          ) : (
            <>
              <ProcessoFilters
                filters={filters}
                onFiltersChange={setFilters}
                clientes={uniqueClientes}
                activeFiltersCount={activeFiltersCount}
                onClearFilters={handleClearFilters}
              />

              {filteredProcessos.length === 0 ? (
                <div className="p-20 text-center glass-card rounded-[2rem] border-white/5 space-y-4">
                   <Filter className="h-12 w-12 text-primary/20 mx-auto" />
                   <p className="text-white/40 font-bold uppercase tracking-tighter">Nenhum processo corresponde aos filtros</p>
                   <Button variant="link" onClick={handleClearFilters}>Limpar todos os filtros</Button>
                </div>
              ) : view === 'table' ? (
                <ProcessoTable
                  processos={filteredProcessos as any}
                  onEdit={handleEditProcesso}
                  onDelete={setProcessoToDelete}
                  onViewDetails={handleViewDetails}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProcessos.map((processo) => (
                    <ProcessoCard
                      key={processo.id}
                      processo={processo as any}
                      onEdit={handleEditProcesso}
                      onDelete={() => { setProcessoToDelete(processo as any); setDeleteDialogOpen(true); }}
                      onClienteClick={() => navigate(`/clientes?id=${processo.clienteId}`)}
                      onClick={() => handleViewDetails(processo as any)}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-white/30 px-4">
                <span>V20 • Judicial Sync Hardened</span>
                <span>Exibindo {filteredProcessos.length} processos de {processos.length} no total</span>
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

      <ProcessoEditDialog
        processo={editingProcesso}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveEdit}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
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
});

Processos.displayName = 'Processos';
export default Processos;
