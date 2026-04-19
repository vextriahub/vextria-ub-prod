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
      setError('Acesso negado. Apenas super administradores podem acessar estes dados.');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 fetchAdmins: Buscando dados reais...');
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('offices')
        .select(`
          id,
          name,
          created_at,
          office_users (
            role,
            profiles:user_id (
              id,
              full_name,
              email
            )
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

      const transformedAdmins: AdminOffice[] = (data || []).map((office: any) => {
        const mainAdmin = office.office_users?.find((ou: any) => ou.role === 'admin') || office.office_users?.[0];
        const profileData = mainAdmin?.profiles;
        
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
          id: profileData?.id || office.id,
          full_name: profileData?.full_name || 'Sem Admin',
          email: profileData?.email || 'N/A',
          role: mainAdmin?.role || 'user',
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
      setError('Erro inesperado ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, user]);

  useEffect(() => {
    fetchAdmins();

    const webhookSubscription = supabase
      .channel('admin-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
         fetchAdmins();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
         fetchAdmins();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(webhookSubscription);
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