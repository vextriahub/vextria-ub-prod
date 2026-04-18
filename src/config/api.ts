// Configurações de API
export const API_CONFIG = {
  // API Key para busca de processos jurídicos
  PROCESSO_API_KEY: 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==',
  
  // Base URLs das APIs
  PROCESSO_API_BASE_URL: 'https://api.cnj.jus.br/v1',
  
  // Configurações Stripe
  STRIPE: {
    PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    SECRET_KEY: import.meta.env.VITE_STRIPE_SECRET_KEY || '',
    WEBHOOK_SECRET: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || '',
    WEBHOOK_URL: 'https://rceixowecqpiotophyku.supabase.co/functions/v1/stripe-webhook',
  },
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Função para verificar se Stripe está configurado
export const isStripeConfigured = () => {
  return !!(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && import.meta.env.STRIPE_SECRET_KEY);
};

// Função para criar headers com autenticação
export const createAuthHeaders = () => ({
  ...API_CONFIG.DEFAULT_HEADERS,
  'Authorization': `Bearer ${API_CONFIG.PROCESSO_API_KEY}`
});

// Função para fazer requisições autenticadas
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.PROCESSO_API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...createAuthHeaders(),
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
};