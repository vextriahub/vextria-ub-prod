import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { addDays } from 'date-fns';

export interface AdminOffice {
  id: string;
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
  manageAccess: (
    officeId: string,
    action: 'apply_discount' | 'grant_lifetime' | 'revoke_lifetime',
    options?: { discount_percent?: number; reason?: string }
  ) => Promise<boolean>;
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

      const { data: offices, error: officesError } = await supabase
        .from('offices')
        .select('*')
        .order('created_at', { ascending: false });
      if (officesError) throw officesError;

      const officeIds = (offices || []).map((o: any) => o.id);

      const { data: userData, error: userError } = await supabase
        .from('office_users')
        .select('office_id, role, user_id')
        .in('office_id', officeIds);
      if (userError) throw userError;

      const userIds = [...new Set((userData || []).map((u: any) => u.user_id))];
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      if (profileError) {
        console.warn('Aviso: Falha ao carregar perfis.', profileError);
      }

      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .in('office_id', officeIds);
      if (subError) throw subError;

      const adminList: AdminOffice[] = (offices || []).map((office: any) => {
        const officeUser =
          (userData || []).find((u: any) => u.office_id === office.id && u.role === 'admin') ||
          (userData || []).find((u: any) => u.office_id === office.id);
        const profile = (profileData || []).find((p: any) => p.id === officeUser?.user_id);
        const sub = (subscriptions || []).find((s: any) => s.office_id === office.id);

        const isLegacyLifetime =
          office.is_lifetime === true ||
          sub?.end_date?.includes('2099') ||
          office.plan === 'lifetime';
        const isTrial =
          office.plan === 'trial' || sub?.status === 'trial' || sub?.status === 'trialing';

        let payment_status: AdminOffice['payment_status'] = 'pendente';
        let plan_display_name = office.plan || sub?.plan || 'Free';

        if (isTrial) {
