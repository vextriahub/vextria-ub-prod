/**
 * Utilitário para debug e diagnóstico da integração Stripe
 */

export interface StripeConfigStatus {
  frontend: {
    publishableKey: boolean;
    secretKey: boolean;
    webhookSecret: boolean;
  };
  environment: string;
  errors: string[];
  warnings: string[];
}

/**
 * Verifica o status da configuração Stripe
 */
export const checkStripeConfig = (): StripeConfigStatus => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar chaves do frontend
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const secretKey = import.meta.env.VITE_STRIPE_SECRET_KEY; // Não deveria estar no frontend
  const webhookSecret = import.meta.env.VITE_STRIPE_WEBHOOK_SECRET;

  if (!publishableKey) {
    errors.push('VITE_STRIPE_PUBLISHABLE_KEY não configurada');
  } else if (!publishableKey.startsWith('pk_')) {
    errors.push('VITE_STRIPE_PUBLISHABLE_KEY deve começar com "pk_"');
  }

  if (secretKey) {
    warnings.push('VITE_STRIPE_SECRET_KEY não deveria estar disponível no frontend');
  }

  if (!webhookSecret) {
    warnings.push('VITE_STRIPE_WEBHOOK_SECRET não configurado (necessário para webhooks)');
  }

  // Verificar ambiente
  const environment = import.meta.env.VITE_STRIPE_ENVIRONMENT || 'test';
  if (environment !== 'test' && environment !== 'production') {
    warnings.push('VITE_STRIPE_ENVIRONMENT deve ser "test" ou "production"');
  }

  return {
    frontend: {
      publishableKey: !!publishableKey,
      secretKey: !!secretKey,
      webhookSecret: !!webhookSecret,
    },
    environment,
    errors,
    warnings,
  };
};

/**
 * Testa a conectividade com a API Stripe
 */
export const testStripeConnection = async (): Promise<{
  success: boolean;
  error?: string;
  data?: any;
}> => {
  try {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      return {
        success: false,
        error: 'Chave pública do Stripe não configurada'
      };
    }

    // Teste simples: verificar se a chave é válida
    // Em um ambiente real, você faria uma chamada para a API Stripe
    const isValidKey = publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_');
    
    if (!isValidKey) {
      return {
        success: false,
        error: 'Formato da chave pública inválido'
      };
    }

    return {
      success: true,
      data: {
        keyType: publishableKey.startsWith('pk_test_') ? 'test' : 'live',
        keyPrefix: publishableKey.substring(0, 12) + '...'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

/**
 * Testa a função edge create-checkout
 */
export const testCreateCheckout = async (planName: string = 'Básico', planPrice: number = 99): Promise<{
  success: boolean;
  error?: string;
  data?: any;
}> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Obter o token de autenticação do usuário
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return {
        success: false,
        error: 'Usuário não autenticado - faça login para testar o checkout'
      };
    }
    
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: { planName, planPrice }
    });

    if (error) {
      return {
        success: false,
        error: `Erro na função edge: ${error.message}`
      };
    }

    if (!data?.url) {
      return {
        success: false,
        error: 'Função retornou sucesso mas sem URL de checkout'
      };
    }

    return {
      success: true,
      data: {
        checkoutUrl: data.url,
        urlValid: data.url.includes('checkout.stripe.com')
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

/**
 * Executa diagnóstico completo
 */
export const runStripeDiagnostic = async () => {
  console.group('🔍 Diagnóstico Stripe');
  
  // 1. Verificar configuração
  console.log('1. Verificando configuração...');
  const config = checkStripeConfig();
  console.log('Configuração:', config);
  
  if (config.errors.length > 0) {
    console.error('❌ Erros encontrados:', config.errors);
  }
  
  if (config.warnings.length > 0) {
    console.warn('⚠️ Avisos:', config.warnings);
  }
  
  // 2. Testar conexão
  console.log('2. Testando conexão...');
  const connection = await testStripeConnection();
  console.log('Conexão:', connection);
  
  // 3. Testar função edge
  console.log('3. Testando função create-checkout...');
  const checkout = await testCreateCheckout();
  console.log('Checkout:', checkout);
  
  console.groupEnd();
  
  return {
    config,
    connection,
    checkout,
    overall: config.errors.length === 0 && connection.success && checkout.success
  };
};