
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
  const { isFirstLogin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [trialInfo, setTrialInfo] = useState<{daysLeft: number; isTrial: boolean} | null>(null);

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
    <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Início</h1>
        <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
          Bem-vindo ao seu assistente jurídico inteligente.
        </p>
      </div>

      {/* Trial Alert */}
      {trialInfo?.isTrial && trialInfo.daysLeft > 0 && (
        <Alert className="bg-muted border-border text-muted-foreground">
          <Clock className="h-4 w-4" />
          <AlertTitle>Período de Teste Ativo</AlertTitle>
          <AlertDescription>
            Você tem {trialInfo.daysLeft} dia{trialInfo.daysLeft > 1 ? 's' : ''} restante{trialInfo.daysLeft > 1 ? 's' : ''} no seu período de teste gratuito. 
            Após este período, você precisará fornecer os dados de pagamento para continuar usando o sistema.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <StatsCards />

      {/* Layout responsivo - Mobile: Stack vertical, Desktop: Grid otimizado */}
      {isMobile ? (
        /* Layout Mobile - Tudo empilhado verticalmente */
        <div className="space-y-4">
          <RecentActivity />
          <CalendarWidget />
          <HearingsCard />
          <PriorityTasks />
          <DeadlinesCard />
          <ScoreCard
            userName="Usuário"
            totalScore={0}
            monthlyScore={0}
            weeklyScore={0}
            rank={0}
            completedTasks={0}
            totalTasks={0}
          />
        </div>
      ) : (
        /* Layout Desktop - Grid otimizado com altura uniforme */
        <div className="grid gap-6">
          {/* Primeira linha - Agenda ao lado de Audiências, Prioridades e Prazos */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
            <div className="h-full">
              <CalendarWidget />
            </div>
            <div className="h-full">
              <HearingsCard />
            </div>
            <div className="h-full">
              <PriorityTasks />
            </div>
            <div className="h-full">
              <DeadlinesCard />
            </div>
          </div>

          {/* Segunda linha - Atividades Recentes ao lado de Produtividade */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
            <div className="h-full">
              <RecentActivity />
            </div>
            <div className="h-full flex items-center justify-center">
              <div className="w-full max-w-md h-full">
                <ScoreCard
                  userName="Usuário"
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
        </div>
      )}
    </div>
  );
};

export default Index;
