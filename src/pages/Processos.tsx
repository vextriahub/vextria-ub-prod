import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProcessos } from '@/hooks/useProcessos';
import { FileText, Loader2 } from 'lucide-react';

// Debug logs
console.log('🔍 Processos.tsx - Iniciando carregamento do componente');

// Componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

// Componentes específicos
import { ProcessoCard } from '@/components/Processos/ProcessoCard';
import { NovoProcessoDialog } from '@/components/Processos/NovoProcessoDialog';
import { ProcessoEditDialog } from '@/components/Processos/ProcessoEditDialog';
import { BuscaProcessoAPI } from '@/components/Processos/BuscaProcessoAPI';
import { ProcessoFilters } from '@/components/Processos/ProcessoFilters';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';

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
      clienteId: p.cliente_id,
      status: (p.status || 'Em andamento') as any,
      dataInicio: p.data_inicio || p.created_at,
      proximoPrazo: p.proximo_prazo,
      descricao: p.observacoes,
      valorCausa: p.valor_causa,
      numeroProcesso: p.numero_processo,
      tipoProcesso: p.tipo_processo,
      area: p.tipo_processo || 'Cível',
      ultimaMovimentacao: p.data_ultima_atualizacao || p.created_at
    }));
  }, [dbProcessos]);
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
        processo.cliente.toLowerCase().includes(filters.search.toLowerCase()) ||
        (processo.numeroProcesso && processo.numeroProcesso.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatus = filters.status === 'all' || processo.status === filters.status;
      const matchesCliente = filters.cliente === 'all' || processo.cliente === filters.cliente;
      const matchesNumeroProcesso = filters.numeroProcesso === 'all' || processo.numeroProcesso === filters.numeroProcesso;
      const matchesArea = filters.area === 'all' || processo.area === filters.area;
      const matchesMovimentacao = isWithinDateRange(processo.ultimaMovimentacao, filters.movimentacao);
      
      return matchesSearch && matchesStatus && matchesCliente && matchesNumeroProcesso && matchesArea && matchesMovimentacao;
    });
  }, [processos, filters, isWithinDateRange]);

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
    ].filter(Boolean).length;
  }, [filters]);

  // Handlers - todos usando useCallback para evitar re-criações
  const handleAddProcesso = useCallback(async (novoProcesso: NovoProcessoForm) => {
    const success = await create({
      titulo: novoProcesso.titulo,
      cliente_id: (novoProcesso as any).clienteId || null,
      status: novoProcesso.status,
      numero_processo: novoProcesso.numeroProcesso || '',
      tipo_processo: novoProcesso.tipoProcesso || 'Cível',
      valor_causa: novoProcesso.valorCausa || 0,
      observacoes: novoProcesso.descricao || '',
      proximo_prazo: novoProcesso.proximoPrazo || null,
      data_inicio: new Date().toISOString().split('T')[0]
    });

    if (success) {
      toast({
        title: "Processo criado",
        description: `Processo "${novoProcesso.titulo}" foi criado com sucesso.`,
      });
    }
  }, [create, toast]);

  const handleEditProcesso = useCallback((processo: Processo) => {
    setEditingProcesso(processo);
    setEditDialogOpen(true);
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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Processos Jurídicos
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus processos jurídicos de forma simples e eficiente
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NovoProcessoDialog onAddProcesso={handleAddProcesso} />
        </div>
      </div>

      {/* Empty State */}
      {showEmptyState ? (
        <Card className="border-dashed border-2 p-8">
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Nenhum processo cadastrado</h3>
              <p className="text-muted-foreground">
                Você ainda não possui processos cadastrados. 
                Comece criando seu primeiro processo ou carregue dados de exemplo.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <NovoProcessoDialog 
                onAddProcesso={handleAddProcesso}
                trigger={
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Criar Primeiro Processo
                  </Button>
                }
              />
              <Button variant="outline" onClick={handleLoadSampleData}>
                Carregar Dados de Exemplo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filtros */}
          <ProcessoFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            clientes={uniqueClientes}
            numerosProcesso={uniqueNumerosProcesso}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
          />

          {/* Busca por API */}
          <BuscaProcessoAPI 
            onProcessoEncontrado={handleProcessoEncontradoAPI}
            processosAtivos={processos.length}
          />

          {/* Grid de Processos ou Loading/Empty State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Carregando seus processos...</p>
            </div>
          ) : filteredProcessos.length === 0 ? (
            <Card className="border-dashed border-2 p-8">
              <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Nenhum processo encontrado</h3>
                  <p className="text-muted-foreground">
                    Não foram encontrados processos com os filtros aplicados. 
                    Tente ajustar os filtros ou criar um novo processo.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpar Filtros
                  </Button>
                  <NovoProcessoDialog onAddProcesso={handleAddProcesso} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProcessos.map((processo) => (
                <ProcessoCard
                  key={processo.id}
                  processo={processo as any}
                  onEdit={handleEditProcesso}
                  onDelete={handleDeleteProcesso}
                  onClienteClick={handleClienteClick}
                />
              ))}
            </div>
          )}

          {/* Contador de resultados */}
          {filteredProcessos.length > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              Mostrando {filteredProcessos.length} de {processos.length} processo(s)
            </div>
          )}
        </>
      )}

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
    </div>
  );
});

Processos.displayName = 'Processos';

export default Processos;