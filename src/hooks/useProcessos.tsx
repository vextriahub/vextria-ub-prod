import { useState, useEffect } from 'react';
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

  const fetchData = async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('processos')
        .select(`
          *,
          cliente:clientes(nome)
        `)
        .eq('office_id', user.office_id)
        .eq('deletado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setData(result || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar processos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast({
        title: 'Erro ao carregar processos',
        description: 'Não foi possível carregar a lista de processos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (newRecord: NovoProcesso): Promise<Processo | null> => {
    if (!user) return null;

    try {
      const { data: result, error } = await supabase
        .from('processos')
        .insert([
          {
            ...newRecord,
            user_id: user.id,
            office_id: user.office_id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setData(prev => [result, ...prev]);
      toast({
        title: 'Processo criado',
        description: 'O processo foi criado com sucesso.',
      });
      
      return result;
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
        .update(updates)
        .eq('id', id)
        .eq('office_id', user.office_id)
        .select()
        .single();

      if (error) throw error;

      setData(prev => prev.map(item => 
        item.id === id ? { ...item, ...result } : item
      ));

      toast({
        title: 'Processo atualizado',
        description: 'O processo foi atualizado com sucesso.',
      });
      
      return result;
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