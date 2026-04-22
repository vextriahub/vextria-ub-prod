
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
  const { user } = useAuth();
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
        .select('full_name, oab')
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
    fetchByCnj
  };
};
