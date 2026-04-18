
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { Profile, OfficeUser, Office } from '@/types/database';
import { useStripe } from '@/hooks/useStripe';

interface PaymentValidationResult {
  needsPayment: boolean;
  daysRegistered: number;
  hasActiveSubscription: boolean;
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'canceled' | 'unknown' | 'trial';
  message?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  office_id?: string | null;
  office_role?: 'user' | 'admin' | 'super_admin' | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  office: Office | null;
  officeUser: OfficeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirstLogin: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isOfficeAdmin: boolean;
  paymentValidation: PaymentValidationResult | null;
  showPaymentModal: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  resetFirstLogin: () => void;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  loginAsSuperAdmin: (email: string, password: string) => Promise<{ error: any }>;
  updateUserRole: (userId: string, newRole: 'user' | 'admin' | 'super_admin') => Promise<{ data?: any; error?: any }>;
  debugUserStatus: () => void;
  getRedirectPath: (userRole: string | undefined, userEmail: string | undefined) => string;
  validatePayment: (userId?: string) => Promise<PaymentValidationResult>;
  setShowPaymentModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [office, setOffice] = useState<Office | null>(null);
  const [officeUser, setOfficeUser] = useState<OfficeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [paymentValidation, setPaymentValidation] = useState<PaymentValidationResult | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{ subscribed: boolean; subscription_tier?: string; subscription_end?: string } | null>(null);
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);
  const loginInProgressRef = useRef(false);
  const { checkSubscription } = useStripe();

  // Fetch user profile from database with timeout
  const fetchProfile = useCallback(async (userId: string) => {
    if (!mountedRef.current) return null;
    
    try {
      console.log('🔍 Fetching profile for user:', userId);
      console.log('🔍 Supabase client ready:', !!supabase);
      
      const { data, error } = await Promise.race([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        )
      ]) as any;

      console.log('🔍 Raw query result:', { data, error, userId });

      if (error) {
        console.error('❌ Error fetching profile:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return null;
      }

      console.log('✅ Profile fetched successfully:', data);
      console.log('✅ Profile role:', data?.role);
      return data;
    } catch (error) {
      console.error('❌ Error in fetchProfile:', error);
      return null;
    }
  }, []);

  // Função para validar pagamento do usuário
  const validatePayment = useCallback(async (userId?: string): Promise<PaymentValidationResult> => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      return {
        needsPayment: false,
        daysRegistered: 0,
        hasActiveSubscription: false,
        paymentStatus: 'unknown',
        message: 'Usuário não encontrado'
      };
    }

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
      
      // Verificar assinatura via banco de dados local primeiro (para Vitalício e Descontos manuais)
      let hasValidSubscription = false;
      let isLifetime = false;
      
      try {
        const { data: officeData } = await supabase
          .from('offices')
          .select('is_lifetime, manual_discount_percent')
          .eq('id', profile.office_id)
          .maybeSingle();

        if (officeData?.is_lifetime) {
          isLifetime = true;
          hasValidSubscription = true;
        }
      } catch (subErr) {
        console.error('Erro ao verificar status vitalício no escritório:', subErr);
      }

      // Se for Vitalício, liberar na hora
      if (isLifetime) {
        return {
          needsPayment: false,
          daysRegistered,
          hasActiveSubscription: true,
          paymentStatus: 'paid',
          message: 'Acesso Vitalício Ativado'
        };
      }
      
      // Verificar assinatura via Stripe se não tiver local garantido
      if (!hasValidSubscription) {
        try {
          const stripeSubscription = await checkSubscription();
          setSubscriptionInfo(stripeSubscription);
          hasValidSubscription = stripeSubscription.subscribed;
        } catch (error) {
          console.error('Erro ao verificar assinatura Stripe:', error);
          setSubscriptionInfo({ subscribed: false });
        }
      }

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

      // Se já tem assinatura ativa (local ou Stripe)
      if (hasValidSubscription) {
        return {
          needsPayment: false,
          daysRegistered,
          hasActiveSubscription: true,
          paymentStatus: 'paid',
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
    }
  }, [user]);

  // Create user profile in database
  const createProfile = useCallback(async (userId: string, email: string, fullName: string) => {
    if (!mountedRef.current) return null;
    
    try {
      console.log('🔧 Creating profile for user:', userId, email);
      
      // Lista de emails que devem ter role super_admin
      const superAdminEmails = [
        'contato@vextriahub.com.br',
        '1266jp@gmail.com',
        'joao.pedro@vextriahub.com.br',
        'dev.jp.991@gmail.com',
        'vextriahubv1@gmail.com',
        'ceo@gustavodantas.adv.br'
      ];
      
      const role = superAdminEmails.includes(email) ? 'super_admin' : 'user';
      console.log('🔧 Assigning role:', role, 'for email:', email);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: email,
          full_name: fullName,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating profile:', error);
        return null;
      }

      console.log('✅ Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in createProfile:', error);
      return null;
    }
  }, []);

  // Fetch office data for user
  const fetchOfficeData = useCallback(async (userId: string) => {
    if (!mountedRef.current) return { officeUser: null, office: null };
    
    try {
      // Buscar office_user
      const { data: officeUserData, error: officeUserError } = await supabase
        .from('office_users')
        .select(`
          *,
          office:offices(
            *,
            is_lifetime,
            manual_discount_percent
          )
        `)
        .eq('user_id', userId)
        .eq('active', true)
        .single();

      if (officeUserError || !officeUserData) {
        return { officeUser: null, office: null };
      }

      return { 
        officeUser: officeUserData, 
        office: officeUserData.office 
      };
    } catch (error) {
      console.error('Error fetching office data:', error);
      return { officeUser: null, office: null };
    }
  }, []);

  // Process user data after authentication
  const processUserData = useCallback(async (sessionUser: SupabaseUser) => {
    if (!mountedRef.current || initializingRef.current) return;
    
    try {
      console.log('🔐 Processing user data for:', sessionUser.email, 'User ID:', sessionUser.id);
      console.log('🔐 Session user metadata:', sessionUser.user_metadata);
      
      // Lista de emails super admin para verificação
      const superAdminEmails = [
        'contato@vextriahub.com.br',
        '1266jp@gmail.com',
        'joao.pedro@vextriahub.com.br',
        'dev.jp.991@gmail.com',
        'vextriahubv1@gmail.com',
        'ceo@gustavodantas.adv.br'
      ];
      
      const shouldBeSuperAdmin = superAdminEmails.includes(sessionUser.email || '');
      console.log('🔐 Should be super admin:', shouldBeSuperAdmin, 'for email:', sessionUser.email);
      
      // Fetch user profile
      let profileData = await fetchProfile(sessionUser.id);
      console.log('🔐 Profile fetch result:', profileData);
      console.log('🔐 Profile exists:', !!profileData);
      console.log('🔐 Profile role:', profileData?.role);
      
      if (!mountedRef.current) return;
      
      // If profile doesn't exist, create it (fallback for trigger failure)
      if (!profileData && sessionUser.email) {
        console.log('🔐 Profile not found, creating new profile for:', sessionUser.email);
        const fullName = sessionUser.user_metadata?.full_name || 
                        sessionUser.user_metadata?.name ||
                        sessionUser.email.split('@')[0];
        
        profileData = await createProfile(
          sessionUser.id, 
          sessionUser.email, 
          fullName
        );
        console.log('🔐 Profile creation result:', profileData);
      }
      
      // EMERGENCY: If still no profile data, force create one for super admin emails
      if (!profileData && shouldBeSuperAdmin && sessionUser.email) {
        console.log('🚨 EMERGENCY: Force creating profile for super admin email:', sessionUser.email);
        try {
          const { data: emergencyProfile, error: emergencyError } = await supabase
            .from('profiles')
            .upsert({
              user_id: sessionUser.id,
              email: sessionUser.email,
              full_name: sessionUser.user_metadata?.full_name || sessionUser.email.split('@')[0],
              role: 'super_admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (!emergencyError && emergencyProfile) {
            console.log('🚨 Emergency profile created:', emergencyProfile);
            profileData = emergencyProfile;
          } else {
            console.error('🚨 Emergency profile creation failed:', emergencyError);
          }
        } catch (emergencyErr) {
          console.error('🚨 Emergency profile creation exception:', emergencyErr);
        }
      }
      
      // Check if profile exists but has wrong role for super admin emails
      if (profileData && shouldBeSuperAdmin && profileData.role !== 'super_admin') {
        console.log('🔐 Profile exists but role is incorrect. Updating to super_admin...');
        console.log('🔐 Current role:', profileData.role, '-> Should be: super_admin');
        
        try {
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: 'super_admin',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', sessionUser.id)
            .select()
            .single();

          if (updateError) {
            console.error('❌ Error updating profile role:', updateError);
          } else {
            console.log('✅ Profile role updated successfully:', updatedProfile);
            profileData = updatedProfile;
          }
        } catch (updateErr) {
          console.error('❌ Exception updating profile role:', updateErr);
        }
      }
      
      // Double-check: verify profile directly from database after any updates
      if (shouldBeSuperAdmin) {
        try {
          console.log('🔍 Double-checking profile in database for super admin...');
          const { data: verifyProfile, error: verifyError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', sessionUser.email)
            .single();
            
          console.log('🔍 Database verification result:', { verifyProfile, verifyError });
          
          if (!verifyError && verifyProfile) {
            console.log('🔍 Profile verified from DB:', verifyProfile);
            console.log('🔍 Verified role:', verifyProfile.role);
            // Use the verified profile data
            profileData = verifyProfile;
          }
        } catch (verifyErr) {
          console.error('❌ Error verifying profile:', verifyErr);
        }
      }
      
      // Final check: if STILL no profile data but should be super admin, create a basic one
      if (!profileData && shouldBeSuperAdmin) {
        console.log('🚨 FINAL FALLBACK: Creating minimal profile for super admin');
        profileData = {
          user_id: sessionUser.id,
          email: sessionUser.email,
          full_name: sessionUser.email?.split('@')[0] || 'Super Admin',
          role: 'super_admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          office_id: null
        };
      }
      
      if (!mountedRef.current || !profileData) {
        console.log('🔐 No profile data available, aborting user data processing');
        return;
      }
      
      console.log('🔐 Setting profile data:', profileData);
      
      // Fetch office data
      const { officeUser, office } = await fetchOfficeData(sessionUser.id);
      
      if (!mountedRef.current) return;
      
      // Create user object for compatibility with emergency fallback
      let finalRole = profileData.role;
      
      // Emergency fallback: if email should be super admin but role isn't, override it
      if (shouldBeSuperAdmin && finalRole !== 'super_admin') {
        console.log('🚨 EMERGENCY FALLBACK: Overriding role to super_admin for email:', sessionUser.email);
        console.log('🚨 Profile role was:', finalRole, '-> Forcing to: super_admin');
        finalRole = 'super_admin';
      }
      
      const userData: User = {
        id: sessionUser.id,
        name: profileData.full_name || sessionUser.email?.split('@')[0] || 'Usuário',
        email: sessionUser.email || '',
        role: finalRole,
        office_id: profileData.office_id,
        office_role: officeUser?.role || null
      };
      
      console.log('🔐 Setting user data:', userData);
      console.log('🔐 Final role assigned:', finalRole);
      console.log('🔐 Is super admin:', finalRole === 'super_admin');
      
      // Log detailed role information before setting state
      console.log('🔍 DETAILED ROLE DEBUG:', {
        'profileData': profileData,
        'profileData.role': profileData?.role,
        'finalRole': finalRole,
        'userData.role': userData.role,
        'shouldBeSuperAdmin': shouldBeSuperAdmin,
        'sessionUser.email': sessionUser.email
      });
      
      // Set all state in the correct order
      setProfile(profileData);
      setOfficeUser(officeUser);
      setOffice(office);
      setUser(userData);
      
      // Verify state was set correctly
      console.log('🔐 State update completed. Verifying...');
      setTimeout(() => {
        console.log('🔐 State verification after 100ms:', {
          profileSet: !!profileData,
          userSet: !!userData,
          userRole: userData.role,
          profileRole: profileData?.role,
          isSuperAdmin: userData.role === 'super_admin'
        });
      }, 100);
      
      // Check if it's first login (profile just created)
      const profileAge = Date.now() - new Date(profileData.created_at).getTime();
      const isNewProfile = profileAge < 60000; // Less than 1 minute old
      setIsFirstLogin(isNewProfile && profileData.role !== 'super_admin');
      
    } catch (error) {
      console.error('Error processing user data:', error);
    }
  }, [fetchProfile, createProfile, fetchOfficeData]);

  // Handle auth state change
  const handleAuthStateChange = useCallback(async (event: string, newSession: Session | null) => {
    if (!mountedRef.current) return;
    
    console.log('🔐 Auth state changed:', event, newSession?.user?.email);
    console.log('🔐 Previous session:', !!session);
    console.log('🔐 New session:', !!newSession);
    
    setSession(newSession);
    
    if (newSession?.user) {
      console.log('🔐 Processing user data for:', newSession.user.email);
      await processUserData(newSession.user);
      console.log('🔐 User data processed, isAuthenticated should be true');
    } else {
      console.log('🔐 No session, clearing user data');
      setUser(null);
      setProfile(null);
      setOffice(null);
      setOfficeUser(null);
      setIsFirstLogin(false);
    }
    
    if (mountedRef.current) {
      setIsLoading(false);
      console.log('🔐 Auth loading set to false');
    }
  }, [processUserData, session]);

  // Initialize auth state
  useEffect(() => {
    if (initializingRef.current) return;
    
    initializingRef.current = true;
    mountedRef.current = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        const { data: { session: currentSession } } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session fetch timeout')), 3000)
          )
        ]) as any;
        
        if (!mountedRef.current) return;
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('Session found:', currentSession.user.email);
          await processUserData(currentSession.user);
        } else {
          console.log('No session found');
        }
        
        if (mountedRef.current) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Initialize auth
    initializeAuth();

    // Cleanup old localStorage data
    const oldKeys = [
      'authToken', 'userData', 'loginTimestamp', 'isFirstLogin',
      'nublex_token', 'nublex_user', 'nublex_data'
    ];
    oldKeys.forEach(key => localStorage.removeItem(key));

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  const login = async (email: string, password: string) => {
    // Prevent concurrent login attempts
    if (loginInProgressRef.current) {
      console.log('🚫 Login already in progress, skipping duplicate attempt');
      return { error: { message: 'Login já em andamento' } };
    }
    
    try {
      loginInProgressRef.current = true;
      console.log('🔐 Attempting login for:', email);
      console.log('🔐 Login request payload:', { email, password: '***' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔐 Raw login response:', {
        data: data ? {
          user: data.user ? {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            user_metadata: data.user.user_metadata,
            app_metadata: data.user.app_metadata
          } : null,
          session: data.session ? {
            access_token: data.session.access_token ? 'exists' : 'missing',
            user: data.session.user ? {
              id: data.session.user.id,
              email: data.session.user.email,
              role: data.session.user.role,
              user_metadata: data.session.user.user_metadata,
              app_metadata: data.session.user.app_metadata
            } : null
          } : null
        } : null,
        error: error ? {
          message: error.message,
          status: error.status
        } : null
      });

      if (error) {
        console.error('❌ Login error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        // Se for erro 400, pode ser problema de credenciais ou formato
        if (error.status === 400) {
          console.error('❌ 400 Bad Request - possível problema de credenciais ou formato');
        }
        
        return { error };
      }

      console.log('✅ Login successful for:', email);
      console.log('✅ User data from login:', data.user);
      console.log('✅ Session data from login:', data.session);
      
      // Aguardar um pouco para garantir que o auth state change seja processado
      if (data.session) {
        console.log('🔐 Session established, processing user data...');
        
        // Processar dados do usuário imediatamente
        await processUserData(data.user);
        
        // Aguardar confirmação de que o estado foi atualizado
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts && !session && !user) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        console.log('✅ Login process completed after', attempts * 100, 'ms');
        
        // Validar pagamento após login bem-sucedido
        console.log('💳 Validating payment status...');
        const paymentResult = await validatePayment(data.user.id);
        setPaymentValidation(paymentResult);
        
        // Se precisa de pagamento, mostrar modal
        if (paymentResult.needsPayment) {
          console.log('⚠️ Payment required for user:', email);
          setShowPaymentModal(true);
        } else {
          console.log('✅ Payment validation passed for user:', email);
        }
      }

      return { error: null };
    } catch (err) {
      console.error('❌ Unexpected login error:', err);
      return { error: err };
    } finally {
      // Reset the flag after a small delay to prevent immediate re-attempts
      setTimeout(() => {
        loginInProgressRef.current = false;
      }, 1000);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    console.log('Attempting registration for:', email);
    
    // Get current URL for redirect
    const currentUrl = window.location.origin;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${currentUrl}/dashboard`
      }
    });

    if (error) {
      console.error('Registration error:', error);
    } else {
      console.log('Registration successful for:', email);
      console.log('Confirmation email should be sent to:', email);
    }

    return { error };
  };

  const resendConfirmation = async (email: string) => {
    console.log('Resending confirmation email for:', email);
    
    const currentUrl = window.location.origin;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${currentUrl}/dashboard`
      }
    });

    if (error) {
      console.error('Resend confirmation error:', error);
    } else {
      console.log('Confirmation email resent to:', email);
    }

    return { error };
  };

  const loginAsSuperAdmin = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting super admin login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Super admin login error:', error);
        return { error };
      }

      console.log('✅ Super admin login successful');
      return { error: null };
    } catch (error) {
      console.error('❌ Super admin login exception:', error);
      return { error };
    }
  };

  // Função para forçar atualização do role do usuário
  const updateUserRole = useCallback(async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    try {
      console.log('🔧 Updating user role:', userId, 'to:', newRole);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user role:', error);
        return { error };
      }

      console.log('✅ User role updated successfully:', data);
      
      // Recarregar dados do usuário
      if (user?.id === userId) {
        const updatedProfile = await fetchProfile(userId);
        if (updatedProfile) {
          setProfile(updatedProfile);
          setUser(prev => prev ? { ...prev, role: newRole } : null);
        }
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error in updateUserRole:', error);
      return { error };
    }
  }, [user?.id, fetchProfile]);

  // Função de debug para verificar status do usuário
  const debugUserStatus = useCallback(() => {
    const isUserSuperAdmin = user?.role === 'super_admin' || profile?.role === 'super_admin';
    console.log('🔍 Debug User Status:', {
      user,
      profile,
      session,
      isAuthenticated: !!session,
      isSuperAdmin: isUserSuperAdmin,
      userRole: user?.role,
      profileRole: profile?.role
    });
  }, [user, profile, session]);

  // Função para determinar redirecionamento baseado no role do usuário
  const getRedirectPath = useCallback((userRole: string | undefined, userEmail: string | undefined) => {
    console.log('🔄 Determining redirect path:', { userRole, userEmail });
    
    // Verificar se é admin do sistema (baseado em email)
    const systemAdminEmails = [
      'contato@vextriahub.com.br', 
      '1266jp@gmail.com', 
      'joao.pedro@vextriahub.com.br', 
      'dev.jp.991@gmail.com'
    ];
    const isSystemAdmin = userEmail && systemAdminEmails.map(e => e.toLowerCase().trim()).includes(userEmail.toLowerCase().trim());
    
    if (isSystemAdmin) {
      console.log('🔄 Redirecting to global admin panel');
      return '/admin';
    }
    
    // Redirecionamento baseado no role normal
    switch (userRole) {
      case 'admin':
        console.log('🔄 Redirecting to admin panel');
        return '/admin';
      case 'user':
      default:
        console.log('🔄 Redirecting to dashboard');
        return '/dashboard';
    }
  }, []);

  const logout = async () => {
    console.log('Logging out user');
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      setUser(null);
      setProfile(null);
      setSession(null);
      setOffice(null);
      setOfficeUser(null);
      setIsFirstLogin(false);
      navigate('/login', { replace: true });
    }
  };

  const resetFirstLogin = useCallback(() => {
    setIsFirstLogin(false);
  }, []);

  // Verificação robusta de super_admin com fallback por email (case-insensitive e trim)
  const superAdminEmailsList = [
    'contato@vextriahub.com.br', 
    '1266jp@gmail.com', 
    'joao.pedro@vextriahub.com.br', 
    'dev.jp.991@gmail.com'
  ].map(e => e.toLowerCase().trim());

  const currentEmail = user?.email?.toLowerCase().trim() || session?.user?.email?.toLowerCase().trim();
  const isEmailAdmin = currentEmail ? superAdminEmailsList.includes(currentEmail) : false;

  const isUserSuperAdmin = Boolean(
    user?.role === 'super_admin' || 
    profile?.role === 'super_admin' || 
    isEmailAdmin
  );

  // Debug logging for authentication values
  console.log('🔐 AuthContext Values:', {
    userExists: !!user,
    userEmail: user?.email,
    userRole: user?.role,
    profileExists: !!profile,
    profileRole: profile?.role,
    isAuthenticated: !!session,
    isLoading,
    isSuperAdmin: isUserSuperAdmin,
    emailInSuperAdminList: isEmailAdmin
  });

  console.log('🔐 Super Admin Check:', {
    userRole: user?.role,
    profileRole: profile?.role,
    userEmail: user?.email,
    emailMatch: user?.email ? superAdminEmails.includes(user.email) : false,
    finalResult: isUserSuperAdmin
  });

  const value = {
    user,
    profile,
    session,
    office,
    officeUser,
    isAuthenticated: !!session,
    isLoading,
    isFirstLogin,
    isSuperAdmin: isUserSuperAdmin,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin' || profile?.role === 'admin' || profile?.role === 'super_admin',
    isOfficeAdmin: user?.office_role === 'admin' || user?.office_role === 'super_admin' || user?.role === 'super_admin' || profile?.role === 'super_admin',
    paymentValidation,
    showPaymentModal,
    setShowPaymentModal,
    login,
    register,
    logout,
    resetFirstLogin,
    resendConfirmation,
    loginAsSuperAdmin,
    updateUserRole,
    debugUserStatus,
    getRedirectPath,
    validatePayment,
    subscriptionInfo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
