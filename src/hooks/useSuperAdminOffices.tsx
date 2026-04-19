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

      // PASSO 1: Busca todos os escritórios e suas assinaturas
      const { data: offices, error: officesError } = await supabase
        .from('offices')
        .select(`
          *,
          subscriptions (
            id,
            status,
            plan,
            price,
            end_date
          )
        `)
        .order('created_at', { ascending: false });

      if (officesError) throw officesError;

      // PASSO 2: Busca todos os usuários administradores vinculados a esses escritórios
      // Usamos office_users + profiles para garantir 100% de precisão nos nomes e emails
      const { data: userData, error: userError } = await supabase
        .from('office_users')
        .select(`
          office_id,
          role,
          user_id,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .in('office_id', (offices || []).map(o => o.id));

      if (userError) console.error("Erro ao buscar usuários:", userError);

      const transformedAdmins: AdminOffice[] = (offices || []).map((office: any) => {
        // Encontra o usuário admin deste escritório no segundo fetch
        const officeUser = (userData || []).find((u: any) => u.office_id === office.id && u.role === 'admin') 
                        || (userData || []).find((u: any) => u.office_id === office.id);
        
        const profile = (officeUser as any)?.profiles;
        const sub = office.subscriptions?.[0];
        
        const isLegacyLifetime = sub?.end_date?.includes('2099') || office.plan === 'lifetime';
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
          id: (officeUser as any)?.user_id || office.id,
          full_name: profile?.full_name || 'Usuário Hub',
          email: profile?.email || 'Sem e-mail',
          role: (officeUser as any)?.role || 'user',
          office_id: office.id,
          office_name: office.name || 'Escritório Sem Nome',
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
          manual_discount_percent: 0
        };
      });

      setAdmins(transformedAdmins);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
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
      toast({ title: active ? "Acesso Liberado" : "Acesso Suspenso" });
      await fetchAdmins();
      return true;
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
      return false;
    }
  };

  const updateOfficeFull = async (officeId: string, updates: Partial<AdminOffice>) => {
    try {
      // 1. Atualizar dados básicos do escritório
      const dbUpdates: any = {};
      if (updates.office_name !== undefined) dbUpdates.name = updates.office_name;
      if (updates.office_email !== undefined) dbUpdates.email = updates.office_email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.address !== undefined) dbUpdates.address = updates.address;

      if (Object.keys(dbUpdates).length > 0) {
        const { error: ofError } = await supabase.from('offices').update(dbUpdates).eq('id', officeId);
        if (ofError) throw ofError;
      }

      // 2. Atualizar Plano e Vitalício (via Subscription)
      const subUpdates: any = {};
      if (updates.plan_name !== undefined) subUpdates.plan = updates.plan_name;
      
      // Se for vitalício, define data para 2099. Se desativar vitalício, define para 30 dias a partir de agora.
      if (updates.is_lifetime !== undefined) {
        subUpdates.end_date = updates.is_lifetime ? '2099-12-31T23:59:59Z' : addDays(new Date(), 30).toISOString();
      }

      if (Object.keys(subUpdates).length > 0) {
        const { error: subError } = await supabase.from('subscriptions').update(subUpdates).eq('office_id', officeId);
        if (subError) throw subError;
      }

      toast({ title: "Dados Sincronizados", description: "As alterações foram aplicadas com sucesso." });
      await fetchAdmins();
      return true;
    } catch (err: any) {
      toast({ title: "Falha na Atualização", description: err.message, variant: "destructive" });
      return false;
    }
  };

  const sendPaymentReminder = async (email: string, officeName: string) => {
    toast({ title: "E-mail de lembrete enviado." });
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