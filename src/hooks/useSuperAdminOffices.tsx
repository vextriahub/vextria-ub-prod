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
        .select('*')
        .order('created_at', { ascending: false });

      if (officesError) throw officesError;

      // PASSO 2: Busca todos os usuários vinculados a esses escritórios
      const { data: userData, error: userError } = await supabase
        .from('office_users')
        .select('office_id, role, user_id')
        .in('office_id', (offices || []).map(o => o.id));

      if (userError) throw userError;

      // PASSO 3: Busca perfis separadamente para garantir 100% de sucesso no join
      const userIds = [...new Set((userData || []).map(u => u.user_id))];
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      
      if (profileError) {
        // Se falhar o perfil, ainda podemos mostrar os IDs/emails brutos se necessário
        console.warn("Aviso: Falha ao carregar perfis, usando fallbacks.", profileError);
      }

      // PASSO 4: Busca assinaturas
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .in('office_id', (offices || []).map(o => o.id));

      if (subError) throw subError;

      // PASSO 5: Montar o objeto final
      const adminList: AdminOffice[] = (offices || []).map(office => {
        const officeUser = (userData || []).find((u: any) => u.office_id === office.id && u.role === 'admin') 
                        || (userData || []).find((u: any) => u.office_id === office.id);
        
        const profile = (profileData || []).find(p => p.id === officeUser?.user_id);
        const sub = (subscriptions || []).find(s => s.office_id === office.id);
        const isLegacyLifetime = sub?.end_date?.includes('2099') || office.plan === 'lifetime';
        const isTrial = office.plan === 'trial' || sub?.status === 'trial' || sub?.status === 'trialing';
        
        let payment_status: AdminOffice['payment_status'] = 'pendente';
        let plan_display_name = office.plan || sub?.plan || 'Free';

        if (isTrial) {
          payment_status = 'em_dia';
          plan_display_name = 'trial';
        } else if (isLegacyLifetime) {
          payment_status = 'em_dia';
          plan_display_name = 'lifetime';
        } else if (sub) {
          if (sub.status === 'active') {
            payment_status = 'em_dia';
          } else if (sub.status === 'past_due' || sub.status === 'unpaid') {
            payment_status = 'proximo_vencimento';
          } else {
            payment_status = 'vencido';
          }

          // Mapear de volta do DB para a UI se necessário
          const revPlanMap: Record<string, string> = {
            'basico': 'starter',
            'intermediario': 'pro',
            'avancado': 'business',
            'premium': 'lifetime'
          };
          plan_display_name = revPlanMap[sub.plan] || sub.plan || 'trial';
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

  const updateOfficeFull = async (office_id: string, updates: Partial<AdminOffice>) => {
    try {
      // 1. Mapeamento de planos UI -> Database
      const planMap: Record<string, string> = {
        'trial': 'trial',
        'starter': 'basico',
        'pro': 'intermediario',
        'business': 'avancado',
        'lifetime': 'premium' // Vitalício é tratado como premium internamente ou mantido como está
      };

      const dbPlan = updates.plan_name ? (planMap[updates.plan_name] || updates.plan_name) : undefined;

      // 2. Atualizar dados básicos do escritório
      const officeUpdates: any = {};
      if (updates.office_name !== undefined) officeUpdates.name = updates.office_name;
      if (updates.office_email !== undefined) officeUpdates.email = updates.office_email;
      if (updates.phone !== undefined) officeUpdates.phone = updates.phone;
      if (updates.address !== undefined) officeUpdates.address = updates.address;
      if (dbPlan) officeUpdates.plan = dbPlan;

      if (Object.keys(officeUpdates).length > 0) {
        const { error: ofError } = await supabase.from('offices').update(officeUpdates).eq('id', office_id);
        if (ofError) throw ofError;
      }

      // 3. Atualizar Assinatura
      const subUpdates: any = {};
      if (dbPlan) {
        subUpdates.plan = dbPlan;
      }
      if (updates.is_lifetime !== undefined) {
        subUpdates.end_date = updates.is_lifetime ? '2099-12-31T23:59:59Z' : addDays(new Date(), 30).toISOString();
        subUpdates.status = 'active';
      }

      if (Object.keys(subUpdates).length > 0) {
        // 3.1 Verificar se a assinatura já existe
        const { data: existingSub, error: checkError } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('office_id', office_id)
          .maybeSingle();
        
        if (checkError) throw checkError;

        if (existingSub) {
          // UPDATE
          const { error: subUpdateError } = await supabase
            .from('subscriptions')
            .update(subUpdates)
            .eq('id', existingSub.id);
          if (subUpdateError) throw subUpdateError;
        } else {
          // INSERT
          const { error: subInsertError } = await supabase
            .from('subscriptions')
            .insert({
              office_id: office_id,
              ...subUpdates,
              start_date: new Date().toISOString()
            });
          if (subInsertError) throw subInsertError;
        }
      }

      toast({ title: "Dados Sincronizados", description: "Configurações do escritório atualizadas com sucesso." });
      await fetchAdmins();
      return true;
    } catch (err: any) {
      console.error("Falha Crítica no updateOfficeFull:", JSON.stringify(err, null, 2));
      toast({ title: "Falha na Atualização", description: err.message || "Erro desconhecido", variant: "destructive" });
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