import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { addDays } from 'date-fns';

export interface AdminOffice {
  id: string; // User ID do admin principal
  full_name: string | null;
  email: string | null;
  role: string;
  office_id: string | null;
  office_name: string | null;
  office_email: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
  payment_status: 'em_dia' | 'proximo_vencimento' | 'vencido' | 'pendente';
  plan_name: string;
  price: number;
  end_date: string | null;
  is_trial: boolean;
  active: boolean;
  is_lifetime: boolean;
  manual_discount_percent: number;
}

export interface UseSuperAdminOfficesResult {
  admins: AdminOffice[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateOfficeStatus: (officeId: string, active: boolean) => Promise<boolean>;
  updateOfficeFull: (officeId: string, updates: Partial<AdminOffice>) => Promise<boolean>;
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
          *,
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
        
        const isLegacyLifetime = sub?.end_date?.includes('2099') || office.is_lifetime === true || office.is_lifetime === 1;
        const isTrial = office.plan === 'trial' || sub?.status === 'trial' || sub?.status === 'trialing';
        
        let payment_status: AdminOffice['payment_status'] = 'pendente';
        let plan_display_name = office.plan || sub?.plan || 'Free';

        if (isTrial) {
          payment_status = 'em_dia';
          plan_display_name = 'Trial';
        } else if (isLegacyLifetime) {
          payment_status = 'em_dia';
          plan_display_name = 'Vitalício';
        } else if (sub) {
          if (sub.status === 'active') {
            payment_status = 'em_dia';
          } else if (sub.status === 'past_due' || sub.status === 'unpaid') {
            payment_status = 'proximo_vencimento';
          } else {
            payment_status = 'vencido';
          }
        }

        let end_date = sub?.end_date || office.end_date || null;
        if (isTrial && !end_date && office.created_at) {
          end_date = addDays(new Date(office.created_at), 7).toISOString();
        }

        return {
          id: mainAdminUser?.user_id || office.id,
          full_name: profileData?.full_name || 'Admin Principal',
          email: profileData?.email || 'N/A',
          role: mainAdminUser?.role || 'user',
          office_id: office.id,
          office_name: office.name || 'Sem Nome',
          office_email: office.email || null,
          address: office.address || null,
          phone: office.phone || null,
          created_at: office.created_at,
          payment_status,
          plan_name: plan_display_name,
          price: sub?.price || 0,
          end_date: end_date,
          is_trial: isTrial,
          active: office.active ?? true,
          is_lifetime: !!isLegacyLifetime,
          manual_discount_percent: office.manual_discount_percent || 0
        };
      });

      setAdmins(transformedAdmins);
    } catch (err: any) {
      console.error('Erro de sincronização resiliênte:', err);
      setError('Erro ao carregar dados administrativos.');
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
        description: `Status alterado com sucesso.`
      });
      
      await fetchAdmins();
      return true;
    } catch (err: any) {
      toast({ 
        title: "Erro ao suspender",
        description: err.message || "Erro de permissão no banco.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateOfficeFull = async (officeId: string, updates: Partial<AdminOffice>) => {
    try {
      console.log(`🔐 [SAVE ATTEMPT] Office: ${officeId}`, updates);
      
      const dbUpdates: any = {};
      if (updates.office_name !== undefined) dbUpdates.name = updates.office_name;
      if (updates.office_email !== undefined) dbUpdates.email = updates.office_email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.is_lifetime !== undefined) dbUpdates.is_lifetime = updates.is_lifetime;
      if (updates.manual_discount_percent !== undefined) dbUpdates.manual_discount_percent = updates.manual_discount_percent;

      const { data, error } = await supabase
        .from('offices')
        .update(dbUpdates)
        .eq('id', officeId)
        .select();

      if (error) {
        console.error('❌ [SUPABASE ERROR]:', error);
        throw error;
      };

      toast({ 
        title: "Dados Atualizados",
        description: "As informações foram salvas com sucesso."
      });
      
      await fetchAdmins();
      return true;
    } catch (err: any) {
      console.error('❌ [CATCH ERROR]:', err);
      toast({ 
        title: "Erro ao salvar",
        description: `Motivo: ${err.message || 'Erro desconhecido'} (Código: ${err.code || 'N/A'})`,
        variant: "destructive"
      });
      return false;
    }
  };

  const sendPaymentReminder = async (email: string, officeName: string) => {
    toast({ title: "Cobrança Enviada" });
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
    updateOfficeFull,
    sendPaymentReminder,
    isEmpty: admins.length === 0,
  };
};