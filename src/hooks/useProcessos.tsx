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

  const mapDatabaseToProcesso = (dbRecord: any): Processo => {
    return {
      id: dbRecord.id,
      titulo: dbRecord.titulo,
      cliente: dbRecord.cliente?.nome || 'Sem cliente',
      clienteId: dbRecord.cliente_id,
      status: dbRecord.status,
      dataInicio: dbRecord.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      proximoPrazo: dbRecord.proximo_prazo,
      descricao: dbRecord.descricao,
      valorCausa: dbRecord.valor_causa,
      numeroProcesso: dbRecord.numero_processo,
      tipoProcesso: dbRecord.tipo_processo,
      faseProcessual: dbRecord.fase_processual,
      responsavelId: dbRecord.responsavel_id,
      responsavelNome: dbRecord.responsavel?.full_name || 'Desconhecido',
      ultimaMovimentacao: dbRecord.updated_at?.split('T')[0] || dbRecord.created_at?.split('T')[0],
      tribunal: dbRecord.tribunal,
      vara: dbRecord.vara,
      comarca: dbRecord.comarca,
      requerido: dbRecord.requerido,
      segredoJustica: dbRecord.segredo_justica,
      justicaGratuita: dbRecord.justica_gratuita
    };
  };

  const fetchData = useCallback(async () => {
    if (!user || !user.office_id) {
      if (!user) setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: result, error: fetchError } = await supabase
        .from('processos')
        .select(`
          *,
          cliente:clientes(nome),
          responsavel:profiles(full_name)
        `)
        .eq('office_id', user.office_id)
        .eq('deletado', false)
        .order('created_at', { ascending: false });

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
      const { data: result, error } = await supabase
        .from('processos')
        .insert([
          {
            office_id: user.office_id,
            user_id: user.id,
            titulo: newRecord.titulo,
            cliente_id: newRecord.clienteId,
            status: newRecord.status,
            numero_processo: newRecord.numeroProcesso,
            tipo_processo: newRecord.tipoProcesso,
            fase_processual: newRecord.faseProcessual,
            responsavel_id: newRecord.responsavelId || user.id,
            proximo_prazo: newRecord.proximoPrazo,
            valor_causa: newRecord.valorCausa,
            descricao: newRecord.descricao,
            tribunal: newRecord.tribunal,
            vara: newRecord.vara,
            comarca: newRecord.comarca,
            requerido: newRecord.requerido,
            segredo_justica: newRecord.segredoJustica,
            justica_gratuita: newRecord.justicaGratuita
          }
        ])
        .select(`
          *,
          cliente:clientes(nome),
          responsavel:profiles(full_name)
        `)
        .single();

      if (error) throw error;

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
      const { data: result, error } = await supabase
        .from('processos')
        .update({
          titulo: updates.titulo,
          cliente_id: updates.clienteId,
          status: updates.status,
          numero_processo: updates.numeroProcesso,
          tipo_processo: updates.tipoProcesso,
          fase_processual: updates.faseProcessual,
          responsavel_id: updates.responsavelId,
          proximo_prazo: updates.proximoPrazo,
          valor_causa: updates.valorCausa,
          descricao: updates.descricao,
          tribunal: updates.tribunal,
          vara: updates.vara,
          comarca: updates.comarca,
          requerido: updates.requerido,
          segredo_justica: updates.segredoJustica,
          justica_gratuita: updates.justicaGratuita,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('office_id', user.office_id)
        .select(`
          *,
          cliente:clientes(nome),
          responsavel:profiles(full_name)
        `)
        .single();

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

      const { error: updateError } = await supabase
        .from('processos')
        .update({ deletado_pendente: true })
        .eq('id', id)
        .eq('office_id', user.office_id);

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

      const { error: updateError } = await supabase
        .from('processos')
        .update({ deletado_pendente: true })
        .in('id', ids)
        .eq('office_id', user.office_id);

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