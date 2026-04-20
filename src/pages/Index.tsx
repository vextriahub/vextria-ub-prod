
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { RecentActivity } from "@/components/Dashboard/RecentActivity";
import { PriorityTasks } from "@/components/Dashboard/PriorityTasks";
import { DeadlinesCard } from "@/components/Dashboard/DeadlinesCard";
import { HearingsCard } from "@/components/Dashboard/HearingsCard";
import { ScoreCard } from "@/components/Gamification/ScoreCard";
import { CalendarWidget } from "@/components/Dashboard/CalendarWidget";
import { DashboardHero } from "@/components/Dashboard/DashboardHero";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const isMobile = useIsMobile();
  const { isSuperAdmin, validatePayment } = useAuth();
  const navigate = useNavigate();
  const [trialInfo, setTrialInfo] = useState<{daysLeft: number; isTrial: boolean} | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      setTimeout(async () => {
        await validatePayment();
      }, 1000);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [validatePayment]);

  useEffect(() => {
    if (isSuperAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (user) {
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

  if (isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-3 text-muted-foreground">Redirecionando para Administração Global...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-10 space-y-10 md:space-y-14 overflow-x-hidden animate-in fade-in duration-1000">
      
      {/* 1. Hero Section */}
      <DashboardHero />

      {/* 2. Trial Alert (If applicable) */}
      {trialInfo?.isTrial && trialInfo.daysLeft > 0 && (
        <Alert className="bg-primary/5 border-primary/20 text-foreground py-6 rounded-[2rem] shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
          <Clock className="h-5 w-5 text-primary" />
          <AlertTitle className="text-lg font-bold">Período de Teste Ativo</AlertTitle>
          <AlertDescription className="text-muted-foreground mt-1 text-base">
            Você tem <span className="font-bold text-primary">{trialInfo.daysLeft} dia{trialInfo.daysLeft > 1 ? 's' : ''}</span> restante{trialInfo.daysLeft > 1 ? 's' : ''} no seu período premium. 
          </AlertDescription>
        </Alert>
      )}

      {/* 3. Strategy KPIs Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black tracking-tight">Panorama Estratégico</h2>
        </div>
        <StatsCards />
      </div>

      {/* 4. Main Operative Grid (Bento Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        
        {/* Left Column: Feed & Operations (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div className="h-full hover-lift">
              <HearingsCard />
            </div>
            <div className="h-full hover-lift">
              <DeadlinesCard />
            </div>
          </div>

          <div className="hover-lift">
            <RecentActivity />
          </div>
          
          <div className="hover-lift">
            <PriorityTasks />
          </div>
        </div>

        {/* Right Column: Management & Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-10">
          <div className="sticky top-24 space-y-10">
            <div className="hover-lift glass-morphism rounded-[2rem] overflow-hidden shadow-premium">
              <CalendarWidget />
            </div>
            
            <div className="hover-lift">
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

            {/* AI Assistant Insight Card */}
            <Card className="bg-gradient-to-br from-primary/20 to-secondary/10 border-primary/20 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10 space-y-4">
                <div className="p-3 bg-primary text-white rounded-2xl w-fit shadow-lg px-4 font-bold text-xs">VEXTRIA AI</div>
                <h3 className="text-xl font-black leading-tight">Insight de Hoje</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "Detectamos um padrão de produtividade alto nas manhãs de terça. Que tal agendar seus peticionamentos mais complexos para esse período?"
                </p>
                <Button variant="link" className="p-0 text-primary font-bold h-auto hover:no-underline flex items-center gap-2 group/btn">
                  Ver Análise Completa 
                  <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
