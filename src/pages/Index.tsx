
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { RecentActivity } from "@/components/Dashboard/RecentActivity";
import { PriorityTasks } from "@/components/Dashboard/PriorityTasks";
import { DeadlinesCard } from "@/components/Dashboard/DeadlinesCard";
import { HearingsCard } from "@/components/Dashboard/HearingsCard";
import { ScoreCard } from "@/components/Gamification/ScoreCard";
import { CalendarWidget } from "@/components/Dashboard/CalendarWidget";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const isMobile = useIsMobile();
  const { isFirstLogin, isSuperAdmin, validatePayment, profile } = useAuth();
  const navigate = useNavigate();
  const [trialInfo, setTrialInfo] = useState<{daysLeft: number; isTrial: boolean} | null>(null);

  // Verificar se o usuário voltou de um pagamento bem-sucedido
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      // Pequeno atraso para garantir que o webhook do Stripe possa ter sido processado
      setTimeout(async () => {
        await validatePayment();
        console.log('✅ Pagamento validado após retorno do Stripe');
      }, 1000);
      
      // Limpar os parâmetros da URL para manter a interface limpa
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [validatePayment]);

  // Redirecionar Super Admins para o painel administrativo imediatamente
  // Usamos useEffect e também um retorno antecipado para garantir que nada de advogado seja renderizado
  useEffect(() => {
    if (isSuperAdmin) {
      console.log('🛡️ Super Admin detectado no dashboard comum, redirecionando para /admin');
      navigate('/admin', { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  // Se for super admin, não renderiza o conteúdo de advogado
  if (isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-3 text-muted-foreground">Redirecionando para Administração Global...</p>
      </div>
    );
  }

  useEffect(() => {
    // Verificar informações do período de trial
    const checkTrialStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        const user = data?.user;
        if (user) {
          // Simplified trial check - 7 days from user creation
          const createdAt = new Date(user.created_at);
          const trialEndDate = new Date(createdAt);
          trialEndDate.setDate(trialEndDate.getDate() + 7);
          const now = new Date();
          const diffMs = trialEndDate.getTime() - now.getTime();
          const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          setTrialInfo({ daysLeft: Math.max(0, daysLeft), isTrial: true });
        }
      } catch (error) {
        console.error('Error checking trial status:', error);
      }
    };

    checkTrialStatus();
  }, []);

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-12 overflow-x-hidden animate-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 drop-shadow-sm">
            {profile?.full_name ? `Olá, ${profile.full_name.split(' ')[0]}!` : 'Seu Assistente Jurídico'}
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-2xl">
            Aqui está o panorama estratégico do seu escritório para hoje.
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-premium">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Ecosistema Vextria Ativo</span>
        </div>
      </div>

      {/* Trial Alert Premium */}
      {trialInfo?.isTrial && trialInfo.daysLeft > 0 && (
        <Alert className="bg-primary/5 border-primary/20 text-foreground py-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50 transition-all group-hover:opacity-100" />
          <Clock className="h-5 w-5 text-primary" />
          <AlertTitle className="text-lg font-bold">Período de Teste Ativo</AlertTitle>
          <AlertDescription className="text-muted-foreground mt-1">
            Você tem <span className="font-bold text-primary">{trialInfo.daysLeft} dia{trialInfo.daysLeft > 1 ? 's' : ''}</span> restante{trialInfo.daysLeft > 1 ? 's' : ''} no seu período premium. 
            Aproveite todas as funcionalidades exclusivas.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent blur opacity-25 group-hover:opacity-40 transition duration-1000" />
        <StatsCards />
      </div>

      {/* Main Grid Content */}
      {isMobile ? (
        <div className="space-y-6">
          <RecentActivity />
          <CalendarWidget />
          <HearingsCard />
          <PriorityTasks />
          <DeadlinesCard />
          <ScoreCard
            userName="Membro"
            totalScore={0}
            monthlyScore={0}
            weeklyScore={0}
            rank={0}
            completedTasks={0}
            totalTasks={0}
          />
        </div>
      ) : (
        <div className="grid gap-8">
          {/* Top Row: Strategic View */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[550px]">
            <div className="h-full hover-lift">
              <CalendarWidget />
            </div>
            <div className="h-full hover-lift">
              <HearingsCard />
            </div>
            <div className="h-full hover-lift">
              <PriorityTasks />
            </div>
            <div className="h-full hover-lift">
              <DeadlinesCard />
            </div>
          </div>

          {/* Bottom Row: Operations & Gamification */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-full hover-lift">
              <RecentActivity />
            </div>
            <div className="h-full hover-lift">
              <ScoreCard
                userName="Membro"
                totalScore={0}
                monthlyScore={0}
                weeklyScore={0}
                rank={0}
                completedTasks={0}
                totalTasks={0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
