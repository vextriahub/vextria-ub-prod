
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Publication {
  id: string;
  created_at: string;
  office_id: string;
  numero_processo: string;
  titulo: string;
  conteudo: string;
  data_publicacao: string;
  status: 'nova' | 'lida' | 'arquivada' | 'processada';
  urgencia: 'baixa' | 'media' | 'alta';
  tags: string[];
  cliente_id?: string;
  processo_id?: string;
}

export const usePublicacoes = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicacoes = async () => {
    if (!user?.office_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('publicacoes')
        .select('*')
        .eq('office_id', user.office_id)
        .order('data_publicacao', { ascending: false });

      if (error) throw error;
      setPublications(data || []);
    } catch (error) {
      console.error('Error fetching publicacoes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicacoes();
  }, [user?.office_id]);

  const syncByOab = async (oab: string, uf: string, days: number = 7) => {
    if (!user?.office_id) return [];
    
    try {
      console.log(`[Sync] Starting sync for OAB: ${oab}-${uf} (${days} days)`);
      
      const { data: results, error: invokeError } = await supabase.functions.invoke('fetch-by-oab', {
        body: { oab, uf, days }
      });

      if (invokeError) {
        console.error('[Sync] Invoke Error:', invokeError);
        throw new Error(`Erro na API de busca: ${invokeError.message}`);
      }
      if (!results || !Array.isArray(results)) return [];

      const savedResults = [];
      for (const item of results) {
        // Simple duplicate check (by process number and content hash or similar)
        // For now, relies on supabase's RLS or unique constraints if any
        const newRecord = {
          titulo: item.titulo || `Publicação ${item.numeroProcesso}`,
          conteudo: item.ultimoAndamento?.descricao || item.conteudo || '',
          data_publicacao: item.ultimoAndamento?.data ? new Date(item.ultimoAndamento.data).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          numero_processo: item.numeroProcesso,
          status: 'nova' as const,
          urgencia: 'media' as const,
          tags: ['auto-sync', item.tribunal]
        };

        // We check if it already exists to avoid duplication
        const { data: existing } = await supabase
          .from('publicacoes')
          .select('id')
          .eq('office_id', user.office_id)
          .eq('numero_processo', newRecord.numero_processo)
          .eq('conteudo', newRecord.conteudo)
          .maybeSingle();

        if (!existing) {
          const saved = await createPublication(newRecord as any);
          if (saved) savedResults.push(saved);
        }
      }

      return savedResults;
    } catch (error: any) {
      console.error('[Sync] Critical Error in syncByOab:', error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível conectar aos tribunais no momento.",
        variant: "destructive"
      });
      return [];
    }
  };

  useEffect(() => {
    if (!user?.office_id) return;

    const runAutoSync = async () => {
      // Buscar OAB do Proprietário do Escritório (Admin)
      const ownerProfile = await getOfficeOwnerProfile();
      
      if (!ownerProfile?.oab || !ownerProfile?.oab_uf) {
        console.log('⚠️ OAB do Admin não configurada. Auto-sync cancelado.');
        return;
      }

      const sessionKey = `last_office_oab_sync_${user.office_id}_${ownerProfile.oab}`;
      const lastSync = sessionStorage.getItem(sessionKey);
      
      if (!lastSync) {
        console.log(`🚀 Sincronizando OAB Mestra (${ownerProfile.oab}) em segundo plano...`);
        const news = await syncByOab(ownerProfile.oab, ownerProfile.oab_uf);
        
        if (news.length > 0) {
          toast({
            title: "Sincronização concluída",
            description: `${news.length} novas publicações para Dr. ${ownerProfile.full_name} encontradas.`,
          });
          fetchPublicacoes();
        }
        sessionStorage.setItem(sessionKey, new Date().toISOString());
      }
    };

    runAutoSync();
  }, [user?.office_id]);

  const updateStatus = async (id: string, status: Publication['status']) => {
    try {
      const { error } = await supabase
        .from('publicacoes')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setPublications(prev => 
        prev.map(p => p.id === id ? { ...p, status } : p)
      );
      
      return true;
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar a publicação.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePublication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('publicacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPublications(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: "Publicação excluída",
        description: "A publicação foi removida com sucesso.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível remover a publicação.",
        variant: "destructive",
      });
      return false;
    }
  };

  const createPublication = async (data: Omit<Publication, 'id' | 'created_at' | 'office_id'>) => {
    if (!user?.office_id) return null;

    try {
      const { data: newPub, error } = await supabase
        .from('publicacoes')
        .insert([{ ...data, office_id: user.office_id }])
        .select()
        .single();

      if (error) throw error;
      
      setPublications(prev => [newPub, ...prev]);
      return newPub;
    } catch (error) {
      console.error('Error creating publication:', error);
      return null;
    }
  };

  const getOfficeOwnerProfile = async () => {
    if (!user?.office_id) return null;

    try {
      // 1. Pegar o escritório para descobrir quem é o dono (created_by)
      const { data: office, error: officeError } = await supabase
        .from('offices')
        .select('created_by')
        .eq('id', user.office_id)
        .single();

      if (officeError || !office?.created_by) return null;

      // 2. Pegar o perfil do dono
      const { data: ownerProfile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, oab, oab_uf')
        .eq('user_id', office.created_by)
        .single();

      if (profileError) return null;

      return ownerProfile;
    } catch (error) {
      console.error('Error fetching office owner profile:', error);
      return null;
    }
  };

  const fetchByCnj = async (cnj: string) => {
    if (!user?.office_id) return [];

    try {
      // Simulação de busca na API externa (PJE/Datajud)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = [
        {
          titulo: `Intimação Automática - Processo ${cnj}`,
          data_publicacao: new Date().toISOString().split('T')[0],
          numero_processo: cnj,
          conteudo: "Conteúdo capturado via consulta CNJ. Intimação referente ao andamento processual detectado no diário oficial eletrônico.",
          urgencia: 'media' as const,
          status: 'nova' as const,
          tags: ["cnj-fetch", "novo"]
        }
      ];

      const savedResults = [];
      for (const res of mockResults) {
        const saved = await createPublication(res as any);
        if (saved) savedResults.push(saved);
      }

      return savedResults;
    } catch (error) {
      console.error('Error fetching by CNJ:', error);
      return [];
    }
  };

  return {
    publications,
    loading,
    refresh: fetchPublicacoes,
    updateStatus,
    deletePublication,
    createPublication,
    getOfficeOwnerProfile,
    fetchByCnj,
    syncByOab
  };
};
