import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Tipos para Timesheet
export type Timesheet = Tables<'timesheets'>;
export type NovoTimesheet = TablesInsert<'timesheets'>;
export type AtualizarTimesheet = TablesUpdate<'timesheets'>;

// Categorias específicas para área jurídica
export const TIMESHEET_CATEGORIAS = [
  'atendimento',
  'processo', 
  'reuniao',
  'administrativa',
  'audiencia',
  'peticao',
  'consulta',
  'pesquisa'
] as const;

export type TimesheetCategoria = typeof TIMESHEET_CATEGORIAS[number];

// Interface para resultado do hook
export interface TimesheetHookResult {
  data: Timesheet[];
  loading: boolean;
  error: string | null;
  activeTimer: Timesheet | null;
  fetchData: () => Promise<void>;
  create: (newRecord: NovoTimesheet) => Promise<Timesheet | null>;
  update: (id: string, updates: AtualizarTimesheet) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  startTimer: (tarefa_descricao: string, categoria: TimesheetCategoria, cliente_id?: string, processo_id?: string) => Promise<Timesheet | null>;
  pauseTimer: (id: string) => Promise<boolean>;
  stopTimer: (id: string, observacoes?: string) => Promise<boolean>;
  getActiveTimer: () => Promise<Timesheet | null>;
  getTodayStats: () => { totalMinutos: number; totalRegistros: number };
  getWeekStats: () => { totalMinutos: number; totalRegistros: number };
}

export function useTimesheet(): TimesheetHookResult {
  const [data, setData] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTimer, setActiveTimer] = useState<Timesheet | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch dados dos últimos 7 dias
  const fetchData = async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: result, error } = await supabase
        .from('timesheets')
        .select('*')
        .eq('user_id', user.id)
        .eq('deletado', false)
        .gte('data_inicio', sevenDaysAgo.toISOString())
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      
      setData(result || []);
      setError(null);

      // Verificar timer ativo
      await getActiveTimer();
    } catch (err) {
      console.error('Erro ao buscar timesheets:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setData([]); // Garantir que data seja um array vazio em caso de erro
      // Remover toast de erro para não incomodar durante desenvolvimento
      // toast({
      //   title: 'Erro ao carregar timesheet',
      //   description: 'Não foi possível carregar os registros de tempo.',
      //   variant: 'destructive',
      // });
    } finally {
      setLoading(false);
    }
  };

  // Criar novo registro
  const create = async (newRecord: NovoTimesheet): Promise<Timesheet | null> => {
    if (!user) return null;

    try {
      const { data: result, error } = await supabase
        .from('timesheets')
        .insert({
          ...newRecord,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      setData(prev => [result, ...prev]);
      
      toast({
        title: 'Registro criado',
        description: 'Novo registro de tempo foi criado com sucesso.',
      });

      return result;
    } catch (err) {
      console.error('Erro ao criar timesheet:', err);
      toast({
        title: 'Erro ao criar registro',
        description: 'Não foi possível criar o registro de tempo.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Atualizar registro
  const update = async (id: string, updates: AtualizarTimesheet): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('timesheets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Atualizar lista local
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));

      toast({
        title: 'Registro atualizado',
        description: 'O registro foi atualizado com sucesso.',
      });

      return true;
    } catch (err) {
      console.error('Erro ao atualizar timesheet:', err);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o registro.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Remover registro (soft delete)
  const remove = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('timesheets')
        .update({ 
          deletado: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Remover da lista local
      setData(prev => prev.filter(item => item.id !== id));

      toast({
        title: 'Registro removido',
        description: 'O registro foi removido com sucesso.',
      });

      return true;
    } catch (err) {
      console.error('Erro ao remover timesheet:', err);
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o registro.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Iniciar timer
  const startTimer = async (
    tarefa_descricao: string,
    categoria: TimesheetCategoria,
    cliente_id?: string,
    processo_id?: string
  ): Promise<Timesheet | null> => {
    if (!user) return null;

    // Verificar se já há timer ativo
    const currentActiveTimer = await getActiveTimer();
    if (currentActiveTimer) {
      toast({
        title: 'Timer já ativo',
        description: 'Pare o timer atual antes de iniciar um novo.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const newTimesheet: NovoTimesheet = {
        user_id: user.id,
        tarefa_descricao,
        categoria,
        cliente_id: cliente_id || null,
        processo_id: processo_id || null,
        data_inicio: new Date().toISOString(),
        status: 'ativo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .from('timesheets')
        .insert(newTimesheet)
        .select()
        .single();

      if (error) throw error;

      setActiveTimer(result);
      setData(prev => [result, ...prev]);

      toast({
        title: 'Timer iniciado',
        description: `Timer iniciado para: ${tarefa_descricao}`,
      });

      return result;
    } catch (err) {
      console.error('Erro ao iniciar timer:', err);
      toast({
        title: 'Erro ao iniciar timer',
        description: 'Não foi possível iniciar o timer.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Pausar timer
  const pauseTimer = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('timesheets')
        .update({
          status: 'pausado',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setActiveTimer(null);
      await fetchData();

      toast({
        title: 'Timer pausado',
        description: 'O timer foi pausado com sucesso.',
      });

      return true;
    } catch (err) {
      console.error('Erro ao pausar timer:', err);
      toast({
        title: 'Erro ao pausar timer',
        description: 'Não foi possível pausar o timer.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Parar timer
  const stopTimer = async (id: string, observacoes?: string): Promise<boolean> => {
    try {
      const timerRecord = data.find(t => t.id === id) || activeTimer;
      if (!timerRecord) return false;

      const dataFim = new Date();
      const dataInicio = new Date(timerRecord.data_inicio);
      const duracaoMinutos = Math.floor((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60));

      const { error } = await supabase
        .from('timesheets')
        .update({
          status: 'finalizado',
          data_fim: dataFim.toISOString(),
          duracao_minutos: duracaoMinutos,
          observacoes: observacoes || timerRecord.observacoes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setActiveTimer(null);
      await fetchData();

      toast({
        title: 'Timer finalizado',
        description: `Registro concluído. Duração: ${Math.floor(duracaoMinutos / 60)}h ${duracaoMinutos % 60}m`,
      });

      return true;
    } catch (err) {
      console.error('Erro ao parar timer:', err);
      toast({
        title: 'Erro ao parar timer',
        description: 'Não foi possível finalizar o timer.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Buscar timer ativo
  const getActiveTimer = async (): Promise<Timesheet | null> => {
    if (!user) return null;

    try {
      const { data: result, error } = await supabase
        .from('timesheets')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ativo')
        .eq('deletado', false)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = não encontrado

      setActiveTimer(result || null);
      return result || null;
    } catch (err) {
      console.error('Erro ao buscar timer ativo:', err);
      return null;
    }
  };

  // Estatísticas do dia
  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayRecords = data.filter(record => 
      new Date(record.data_inicio).toDateString() === today &&
      record.status === 'finalizado'
    );

    const totalMinutos = todayRecords.reduce((sum, record) => 
      sum + (record.duracao_minutos || 0), 0
    );

    return {
      totalMinutos,
      totalRegistros: todayRecords.length
    };
  };

  // Estatísticas da semana
  const getWeekStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weekRecords = data.filter(record => 
      new Date(record.data_inicio) >= oneWeekAgo &&
      record.status === 'finalizado'
    );

    const totalMinutos = weekRecords.reduce((sum, record) => 
      sum + (record.duracao_minutos || 0), 0
    );

    return {
      totalMinutos,
      totalRegistros: weekRecords.length
    };
  };

  // Efeito para carregar dados na inicialização
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return {
    data,
    loading,
    error,
    activeTimer,
    fetchData,
    create,
    update,
    remove,
    startTimer,
    pauseTimer,
    stopTimer,
    getActiveTimer,
    getTodayStats,
    getWeekStats
  };
} 