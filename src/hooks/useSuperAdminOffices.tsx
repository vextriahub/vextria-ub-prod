import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdminOffice {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  office_id: string | null;
  office_name: string | null;
  created_at: string;
  stripe_customer_id?: string | null;
  payment_status: 'em_dia' | 'proximo_vencimento' | 'vencido'; // Mock status
}

interface UseSuperAdminOfficesResult {
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

      // Buscar perfis de administradores com informações do escritório
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
            name
          )
        `)
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Erro ao buscar administradores:', fetchError);
        setError('Erro ao carregar dados dos administradores.');
        return;
      }

      // Transformar dados e adicionar status mockado
      const transformedAdmins: AdminOffice[] = (data || []).map((admin) => {
        // Mock de status de pagamento baseado no ID (para demonstração)
        const statusOptions: AdminOffice['payment_status'][] = ['em_dia', 'proximo_vencimento', 'vencido'];
        const mockStatus = statusOptions[admin.id.length % 3];

        return {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email,
          role: admin.role,
          office_id: admin.office_id,
          office_name: (admin.offices as any)?.name || null,
          created_at: admin.created_at,
          stripe_customer_id: null,
          payment_status: mockStatus,
        };
      });

      setAdmins(transformedAdmins);
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const refresh = useCallback(async () => {
    await fetchAdmins();
  }, [fetchAdmins]);

  return {
    admins,
    loading,
    error,
    refresh,
    isEmpty: admins.length === 0,
  };
};