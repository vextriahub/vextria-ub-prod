import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PaymentValidationResult {
  needsPayment: boolean;
  daysRegistered: number;
  hasActiveSubscription: boolean;
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'canceled' | 'unknown' | 'trial';
  message?: string;
}

export const usePaymentValidation = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const validateUserPayment = useCallback(async (userId?: string): Promise<PaymentValidationResult> => {
    if (!userId && !user?.id) {
      return {
        needsPayment: false,
        daysRegistered: 0,
        hasActiveSubscription: false,
        paymentStatus: 'unknown',
        message: 'Usuário não encontrado'
      };
    }

    const targetUserId = userId || user!.id;
    setLoading(true);

    try {
      // Buscar dados do perfil do usuário para verificar data de criação
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('created_at, role, office_id')
        .eq('user_id', targetUserId)
        .single();

      if (profileError || !profile) {
        console.error('Erro ao buscar perfil:', profileError);
        return {
          needsPayment: false,
          daysRegistered: 0,
          hasActiveSubscription: false,
          paymentStatus: 'unknown',
          message: 'Erro ao verificar dados do usuário'
        };
      }

      // Se for super admin, não precisa validar pagamento
      if (profile.role === 'super_admin') {
        return {
          needsPayment: false,
          daysRegistered: 0,
          hasActiveSubscription: true,
          paymentStatus: 'paid',
          message: 'Super admin - sem necessidade de pagamento'
        };
      }

      // Calcular dias desde o cadastro
      const createdAt = new Date(profile.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
      const daysRegistered = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Período de teste de 7 dias
      const trialDays = 7;
      const isTrialActive = daysRegistered <= trialDays;
      
      // Verificar se o usuário já tem uma assinatura ativa
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, payment_confirmed, is_trial, trial_end_date')
        .eq('office_id', profile.office_id)
        .single();

      const hasValidSubscription = subscription && 
        (subscription.status === 'active' || 
         (subscription.is_trial && subscription.trial_end_date && new Date(subscription.trial_end_date) >= now));

      // Se está no período de trial, permitir acesso
      if (isTrialActive && !hasValidSubscription) {
        return {
          needsPayment: false,
          daysRegistered,
          hasActiveSubscription: true,
          paymentStatus: 'trial',
          message: `Período de teste: ${trialDays - daysRegistered} dias restantes`
        };
      }

      // Se já tem assinatura ativa
      if (hasValidSubscription) {
        return {
          needsPayment: false,
          daysRegistered,
          hasActiveSubscription: true,
          paymentStatus: subscription?.payment_confirmed ? 'paid' : 'pending',
          message: 'Assinatura ativa'
        };
      }

      // Se já passou do período de trial e não tem assinatura
      if (daysRegistered > trialDays && !hasValidSubscription) {
        return {
          needsPayment: true,
          daysRegistered,
          hasActiveSubscription: false,
          paymentStatus: 'overdue',
          message: 'Período de teste expirado. Realize o pagamento para continuar usando o sistema.'
        };
      }

      // Caso padrão - usuário novo
      return {
        needsPayment: false,
        daysRegistered,
        hasActiveSubscription: true,
        paymentStatus: 'trial',
        message: `Período de teste: ${trialDays - daysRegistered} dias restantes`
      };

    } catch (error) {
      console.error('Erro na validação de pagamento:', error);
      return {
        needsPayment: false,
        daysRegistered: 0,
        hasActiveSubscription: false,
        paymentStatus: 'unknown',
        message: 'Erro ao validar status de pagamento'
      };
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    validateUserPayment,
    loading
  };
};