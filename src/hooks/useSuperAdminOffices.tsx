import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  active: boolean; // Adicionado para controle de suspensão
}

export interface UseSuperAdminOfficesResult {
  admins: AdminOffice[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateOfficeStatus: (officeId: string, active: boolean) => Promise<boolean>;
  sendPaymentReminder: (email: string, officeName: string) => Promise<boolean>;
  isEmpty: boolean;
}

export const useSuperAdminOffices = (): UseSuperAdminOfficesResult => {
  const [admins, setAdmins] = useState<AdminOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSuperAdmin, user } = useAuth();
  const { toast } = useToast();

  const fetchAdmins = useCallback(async () => {
    const normalizedEmail = user?.email?.toLowerCase().trim();
    const isMainSuperAdmin = normalizedEmail === 'contato@vextriahub.com.br';
    
    if (!isSuperAdmin && !isMainSuperAdmin) {
      setError('Acesso negado.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('offices')
        .select(`
          id,
          name,
          plan,
          active,
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

      if (fetchError) throw fetchError;

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
        
        const isTrial = office.plan === 'trial' || sub?.status === 'trial' || sub?.status === 'trialing';
        
        let payment_status: AdminOffice['payment_status'] = 'pendente';
        let plan_display_name = office.plan || sub?.plan || 'Free';

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
          full_name: profileData?.full_name || 'Admin Principal',
          email: profileData?.email || 'N/A',
          role: mainAdminUser?.role || 'user',
          office_id: office.id,
          office_name: office.name || 'Sem Nome',
          created_at: office.created_at,
          payment_status,
          plan_name: plan_display_name,
          price: sub?.price || 0,
          end_date: sub?.end_date || null,
          is_trial: isTrial,
          active: office.active ?? true
        };
      });

      setAdmins(transformedAdmins);
    } catch (err: any) {
      console.error('Erro de sincronização:', err);
      setError('Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, user]);

  const updateOfficeStatus = async (officeId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('offices')
        .update({ active })
        .eq('id', officeId);

      if (error) throw error;

      toast({
        title: active ? "Acesso Restaurado" : "Acesso Suspenso",
        description: `O escritório foi ${active ? 'ativado' : 'suspenso'} com sucesso.`,
      });

      await fetchAdmins();
      return true;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast({
        title: "Erro na operação",
        description: "Não foi possível alterar o status do escritório.",
        variant: "destructive"
      });
      return false;
    }
  };

  const sendPaymentReminder = async (email: string, officeName: string) => {
    // Simulação de envio de cobrança
    toast({
      title: "Cobrança Enviada",
      description: `Lembrete de pagamento extra enviado para ${email}.`,
    });
    return true;
  };

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return {
    admins,
    loading,
    error,
    refresh: fetchAdmins,
    updateOfficeStatus,
    sendPaymentReminder,
    isEmpty: admins.length === 0,
  };
};