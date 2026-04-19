import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminOffice {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  office_id: string | null;
  office_name: string | null;
  created_at: string;
  payment_status: 'em_dia' | 'proximo_vencimento' | 'vencido' | 'pendente';
  plan_name: string;
  price: number;
  end_date: string | null;
  is_trial: boolean;
}

export interface UseSuperAdminOfficesResult {
  admins: AdminOffice[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isEmpty: boolean;
}

export const useSuperAdminOffices = (): UseSuperAdminOfficesResult => {
  const [admins, setAdmins] = useState<AdminOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSuperAdmin, user } = useAuth();

  const fetchAdmins = useCallback(async () => {
    const isMainSuperAdmin = user?.email?.toLowerCase().trim() === 'contato@vextriahub.com.br';
    
    if (!isSuperAdmin && !isMainSuperAdmin) {
      setError('Acesso negado.');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 fetchAdmins: Carregando dados da plataforma...');
      setLoading(true);
      setError(null);

      // Buscando escritórios com a coluna 'plan' incluída
      const { data, error: fetchError } = await supabase
        .from('offices')
        .select(`
          id,
          name,
          plan,
          created_at,
          office_users (
            role,
            user_id
          ),
          subscriptions (
            status,
            plan,
            price,
            end_date
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ fetchError:', fetchError);
        throw fetchError;
      }

      // Buscamos os perfis separadamente para estabilidade do schema
      const userIds = (data || [])
        .flatMap((office: any) => office.office_users?.map((ou: any) => ou.user_id))
        .filter(Boolean);

      let profilesMap: Record<string, any> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);
          
        profilesData?.forEach(p => {
          profilesMap[p.user_id] = p;
        });
      }

      const transformedAdmins: AdminOffice[] = (data || []).map((office: any) => {
        const mainAdminUser = office.office_users?.find((ou: any) => ou.role === 'admin') || office.office_users?.[0];
        const profileData = mainAdminUser ? profilesMap[mainAdminUser.user_id] : null;
        const sub = office.subscriptions?.[0];
        
        // Regra de Trial de Duas Fontes: Tabela 'offices' OU Tabela 'subscriptions'
        const isTrial = office.plan === 'trial' || sub?.status === 'trial' || sub?.status === 'trialing';
        
        let payment_status: AdminOffice['payment_status'] = 'pendente';
        let plan_display_name = office.plan || sub?.plan || 'Free/Nenhum';

        if (isTrial) {
          payment_status = 'em_dia';
          plan_display_name = 'Trial';
        } else if (sub) {
          if (sub.status === 'active') {
            payment_status = 'em_dia';
          } else if (sub.status === 'past_due' || sub.status === 'unpaid') {
            payment_status = 'proximo_vencimento';
          } else {
            payment_status = 'vencido';
          }
        }

        return {
          id: mainAdminUser?.user_id || office.id,
          full_name: profileData?.full_name || 'Admin',
          email: profileData?.email || 'N/A',
          role: mainAdminUser?.role || 'user',
          office_id: office.id,
          office_name: office.name || 'Aguardando Cadastro...',
          created_at: office.created_at,
          payment_status,
          plan_name: plan_display_name,
          price: sub?.price || 0,
          end_date: sub?.end_date || null,
          is_trial: isTrial
        };
      });

      setAdmins(transformedAdmins);
    } catch (err: any) {
      console.error('Erro inesperado:', err);
      setError('Erro ao carregar dados: ' + (err.message || 'Erro de conexão'));
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, user]);

  useEffect(() => {
    fetchAdmins();
    const ch = supabase.channel('adm-sync').on('postgres_changes', {event:'*', schema:'public', table:'offices'}, () => fetchAdmins()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchAdmins]);

  return {
    admins,
    loading,
    error,
    refresh: fetchAdmins,
    isEmpty: admins.length === 0,
  };
};