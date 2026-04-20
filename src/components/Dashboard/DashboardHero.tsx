
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileText, Calendar, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DashboardHero() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Doutor(a)';

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-card/80 via-card/40 to-background border border-white/10 p-8 md:p-12 shadow-premium animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-secondary/10 rounded-full blur-[80px]" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest animate-bounce">
            <Sparkles className="h-3 w-3" />
            Vextria AI Hub Ativo
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            Bem-vindo de volta,<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-secondary drop-shadow-sm">
              {firstName}!
            </span>
          </h1>
          
          <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-lg leading-relaxed">
            Seu escritório está operando em alta performance hoje. Organizamos suas prioridades para que você foque no que importa: <span className="text-foreground font-semibold">a vitória dos seus clientes.</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => navigate('/processos')}
            className="rounded-2xl h-14 px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-bold"
          >
            <Plus className="h-5 w-5" />
            Novo Processo
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/clientes')}
            className="rounded-2xl h-14 px-6 glass-morphism border-white/10 hover:bg-white/5 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-bold"
          >
            <Users className="h-5 w-5" />
            Cadastrar Cliente
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/agenda')}
            className="rounded-2xl h-14 px-6 glass-morphism border-white/10 hover:bg-white/5 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-bold"
          >
            <Calendar className="h-5 w-5" />
            Agenda
          </Button>
        </div>
      </div>
    </div>
  );
}
