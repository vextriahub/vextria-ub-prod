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

      // Usando uma query mais flat e segura para evitar erros de join 400
      const { data, error: fetchError } = await supabase
        .from('offices')
        .select(`
          id,
          name,
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

      // Agora buscamos os perfis separadamente para evitar erros de relação de junção complexa (400)
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
        
        let payment_status: AdminOffice['payment_status'] = 'pendente';
        let plan_name = 'Free/Nenhum';

        if (office.subscriptions && office.subscriptions.length > 0) {
          const sub = office.subscriptions[0];
          plan_name = sub.plan || 'Free/Nenhum';

          if (sub.status === 'active' || sub.status === 'trial' || sub.status === 'trialing') {
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
          plan_name,
          price: office.subscriptions?.[0]?.price || 0,
          end_date: office.subscriptions?.[0]?.end_date || null,
          is_trial: office.subscriptions?.[0]?.status === 'trial' || office.subscriptions?.[0]?.status === 'trialing'
        };
      });

      setAdmins(transformedAdmins);
    } catch (err: any) {
      console.error('Erro inesperado:', err);
      setError('Erro ao carregar dados: ' + (err.message || 'Verifique sua conexão'));
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, user]);

  useEffect(() => {
    fetchAdmins();

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => fetchAdmins())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAdmins]);

  return {
    admins,
    loading,
    error,
    refresh: fetchAdmins,
    isEmpty: admins.length === 0,
  };
};