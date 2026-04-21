import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Processo, NovoProcesso, DatabaseHookResult } from '@/types/database';

export function useProcessos(): DatabaseHookResult<Processo, NovoProcesso> {
  const [data, setData] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Map database row -> frontend Processo
  // IMPORTANT: Only map columns that ACTUALLY EXIST in the database table.
  // Real columns: id, user_id, cliente_id, numero_processo, titulo, status,
  //   tipo_processo, tribunal, comarca, sistema_tribunal, vara, valor_causa,
  //   data_inicio, data_ultima_atualizacao, proximo_prazo, etiquetas,
  //   observacoes, deletado, deletado_pendente, created_at, updated_at, office_id
  const mapDatabaseToProcesso = (dbRecord: any): Processo => {
    return {
      id: dbRecord.id,
      titulo: dbRecord.titulo,
      cliente: dbRecord.cliente?.nome || 'Sem cliente',
      clienteId: dbRecord.cliente_id,
      status: dbRecord.status === 'ativo' ? 'Em andamento' : dbRecord.status,
      dataInicio: dbRecord.data_inicio || dbRecord.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      proximoPrazo: dbRecord.proximo_prazo,
      descricao: dbRecord.observacoes,
      valorCausa: dbRecord.valor_causa ? Number(dbRecord.valor_causa) : undefined,
      numeroProcesso: dbRecord.numero_processo,
      tipoProcesso: dbRecord.tipo_processo,
      faseProcessual: dbRecord.tipo_processo, // No dedicated column; reuse tipo_processo
      responsavelId: dbRecord.user_id,
      responsavelNome: undefined, // No join available
      ultimaMovimentacao: dbRecord.data_ultima_atualizacao || dbRecord.updated_at?.split('T')[0],
      tribunal: dbRecord.tribunal,
      vara: dbRecord.vara,
      comarca: dbRecord.comarca,
      requerido: undefined, // Column does not exist in DB; stored in observacoes
      segredoJustica: false,
      justicaGratuita: false,
      observacoes: dbRecord.observacoes
    };
  };

  const fetchData = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Try office-based query first (new RLS), fallback to user-based
      let result: any[] | null = null;
      let fetchError: any = null;

      if (user.office_id) {
        const resp = await supabase
          .from('processos')
          .select(`
            *,
            cliente:clientes!cliente_id(nome)
          `)
          .eq('office_id', user.office_id)
          .eq('deletado', false)
          .order('created_at', { ascending: false });

        result = resp.data;
        fetchError = resp.error;
      }

      // Fallback: if office query fails or returns nothing, try user_id based
      if (fetchError || !result || result.length === 0) {
        console.log('📋 Fallback: buscando processos por user_id');
        const resp2 = await supabase
          .from('processos')
          .select(`
            *,
            cliente:clientes!cliente_id(nome)
          `)
          .eq('user_id', user.id)
          .eq('deletado', false)
          .order('created_at', { ascending: false });

        if (!resp2.error) {
          result = resp2.data;
          fetchError = null;
        } else {
          fetchError = resp2.error;
        }
      }

      if (fetchError) {
        console.error('Erro detalhado Supabase (Processos):', fetchError);
        setError(`Erro: ${fetchError.message}`);
        return;
      }

      const mappedData = (result || []).map(mapDatabaseToProcesso);
      setData(mappedData);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao buscar processos:', err);
      setError(err.message || 'Erro desconhecido');
      toast({
        title: 'Erro ao carregar processos',
        description: 'Não foi possível carregar a lista de processos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const create = async (newRecord: NovoProcesso): Promise<Processo | null> => {
    if (!user) return null;

    try {
      // Build insert payload with ONLY columns that exist in the database
      const insertPayload: Record<string, any> = {
        user_id: user.id,
        titulo: newRecord.titulo,
        numero_processo: newRecord.numeroProcesso || '',
        status: newRecord.status === 'Em andamento' ? 'ativo' : newRecord.status,
        tipo_processo: newRecord.tipoProcesso,
        tribunal: newRecord.tribunal,
        vara: newRecord.vara,
        comarca: newRecord.comarca,
        valor_causa: newRecord.valorCausa,
        proximo_prazo: newRecord.proximoPrazo,
        observacoes: newRecord.descricao || (newRecord as any).observacoes || '',
      };

      // Only include optional FK fields if they have values
      if (newRecord.clienteId) {
        insertPayload.cliente_id = newRecord.clienteId;
      }

      // Include office_id if user has one
      if (user.office_id) {
        insertPayload.office_id = user.office_id;
      }

      const { data: result, error } = await supabase
        .from('processos')
        .insert([insertPayload])
        .select('*')
        .single();

      if (error) {
        console.error('Erro detalhado ao criar processo:', error);
        throw error;
      }

      const mapped = mapDatabaseToProcesso(result);
      setData(prev => [mapped, ...prev]);
      
      return mapped;
    } catch (err) {
      console.error('Erro ao criar processo:', err);
      toast({
        title: 'Erro ao criar processo',
        description: 'Não foi possível criar o processo.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const update = async (id: string, updates: Partial<Processo>): Promise<Processo | null> => {
    if (!user) return null;

    try {
      // Build update payload with ONLY columns that exist
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.titulo !== undefined) updatePayload.titulo = updates.titulo;
      if (updates.clienteId !== undefined) updatePayload.cliente_id = updates.clienteId;
      if (updates.status !== undefined) updatePayload.status = updates.status === 'Em andamento' ? 'ativo' : updates.status;
      if (updates.numeroProcesso !== undefined) updatePayload.numero_processo = updates.numeroProcesso;
      if (updates.tipoProcesso !== undefined) updatePayload.tipo_processo = updates.tipoProcesso;
      if (updates.tribunal !== undefined) updatePayload.tribunal = updates.tribunal;
      if (updates.vara !== undefined) updatePayload.vara = updates.vara;
      if (updates.comarca !== undefined) updatePayload.comarca = updates.comarca;
      if (updates.valorCausa !== undefined) updatePayload.valor_causa = updates.valorCausa;
      if (updates.proximoPrazo !== undefined) updatePayload.proximo_prazo = updates.proximoPrazo;
      if (updates.descricao !== undefined || (updates as any).observacoes !== undefined) {
        updatePayload.observacoes = updates.descricao || (updates as any).observacoes;
      }

      let query = supabase
        .from('processos')
        .update(updatePayload)
        .eq('id', id);

      // Use the right filter based on available context
      if (user.office_id) {
        query = query.eq('office_id', user.office_id);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data: result, error } = await query.select('*').single();

      if (error) throw error;

      const mapped = mapDatabaseToProcesso(result);
      setData(prev => prev.map(item => 
        item.id === id ? mapped : item
      ));

      toast({
        title: 'Processo atualizado',
        description: 'O processo foi atualizado com sucesso.',
      });
      
      return mapped;
    } catch (err) {
      console.error('Erro ao atualizar processo:', err);
      toast({
        title: 'Erro ao atualizar processo',
        description: 'Não foi possível atualizar o processo.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const requestDelete = async (id: string, motivo?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const recordToDelete = data.find(item => item.id === id);
      if (!recordToDelete) return false;

      let deleteQuery = supabase
        .from('processos')
        .update({ deletado_pendente: true })
        .eq('id', id);

      if (user.office_id) {
        deleteQuery = deleteQuery.eq('office_id', user.office_id);
      } else {
        deleteQuery = deleteQuery.eq('user_id', user.id);
      }

      const { error: updateError } = await deleteQuery;

      if (updateError) throw updateError;

      const { error: exclusionError } = await supabase
        .from('exclusoes_pendentes')
        .insert([
          {
            user_id: user.id,
            tabela: 'processos',
            registro_id: id,
            dados_registro: recordToDelete,
            motivo: motivo,
          }
        ]);

      if (exclusionError) throw exclusionError;

      setData(prev => prev.filter(item => item.id !== id));

      toast({
        title: 'Solicitação de exclusão enviada',
        description: 'Sua solicitação foi enviada para aprovação do administrador.',
      });
      
      return true;
    } catch (err) {
      console.error('Erro ao solicitar exclusão:', err);
      toast({
        title: 'Erro ao solicitar exclusão',
        description: 'Não foi possível processar a solicitação de exclusão.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const requestMultipleDelete = async (ids: string[], motivo?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const recordsToDelete = data.filter(item => ids.includes(item.id));

      let deleteQuery = supabase
        .from('processos')
        .update({ deletado_pendente: true })
        .in('id', ids);

      if (user.office_id) {
        deleteQuery = deleteQuery.eq('office_id', user.office_id);
      } else {
        deleteQuery = deleteQuery.eq('user_id', user.id);
      }

      const { error: updateError } = await deleteQuery;

      if (updateError) throw updateError;

      const exclusionRecords = recordsToDelete.map(record => ({
        user_id: user.id,
        tabela: 'processos',
        registro_id: record.id,
        dados_registro: record,
        motivo: motivo,
      }));

      const { error: exclusionError } = await supabase
        .from('exclusoes_pendentes')
        .insert(exclusionRecords);

      if (exclusionError) throw exclusionError;

      setData(prev => prev.filter(item => !ids.includes(item.id)));

      toast({
        title: 'Solicitações de exclusão enviadas',
        description: `${ids.length} solicitação(ões) foram enviadas para aprovação.`,
      });
      
      return true;
    } catch (err) {
      console.error('Erro ao solicitar exclusões múltiplas:', err);
      toast({
        title: 'Erro ao solicitar exclusões',
        description: 'Não foi possível processar as solicitações de exclusão.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    create,
    update,
    requestDelete,
    requestMultipleDelete,
    isEmpty: data.length === 0 && !loading,
  };
}