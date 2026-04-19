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
  const { isSuperAdmin } = useAuth();

  const fetchAdmins = useCallback(async () => {
    if (!isSuperAdmin) {
      setError('Acesso negado. Apenas super administradores podem acessar estes dados.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Usando relacionamentos diretos do Supabase para aninhar: profiles -> offices -> subscriptions
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          office_id,
          created_at,
          offices:office_id (
            id,
            name,
            subscriptions (
              status,
              plan
            )
          )
        `)
        .not('office_id', 'is', null) // Traz todos os advogados com escritório criado
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Montando a resposta de forma segura tirando de MOCK e jogando pra REAL, assim o Trial da Stripe cai aqui dentro certinho!
      const transformedAdmins: AdminOffice[] = (data || []).map((admin: any) => {
        const officeData = admin.offices;
        let payment_status: AdminOffice['payment_status'] = 'pendente';
        let plan_name = 'Free/Nenhum';

        if (officeData && officeData.subscriptions && officeData.subscriptions.length > 0) {
          // Pega a assinatura mais recente/atrelada
          const sub = officeData.subscriptions[0];
          plan_name = sub.plan || 'Free/Nenhum';

          if (sub.status === 'active' || sub.status === 'trialing') {
            payment_status = 'em_dia';
          } else if (sub.status === 'past_due' || sub.status === 'unpaid') {
            payment_status = 'proximo_vencimento';
          } else {
            payment_status = 'vencido';
          }
        }

        return {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email,
          role: admin.role,
          office_id: admin.office_id,
          office_name: officeData?.name || 'Aguardando Cadastro...',
          created_at: admin.created_at,
          payment_status,
          plan_name
        };
      });

      setAdmins(transformedAdmins);
    } catch (err: any) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchAdmins();

    // Ouvinte Mágico: Atualiza o painel do Admin REALTIME na hora que cair o PIX ou Cadastrar sem F5
    const webhookSubscription = supabase
      .channel('admin-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
         console.log("Recebendo Pagamento Webhook, atualizando a Dashboard!");
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