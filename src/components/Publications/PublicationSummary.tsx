import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, 
  AlertCircle, 
  Link2Off, 
  FilePlus,
  TrendingUp,
  Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

const SummaryCard = ({ title, value, description, icon: Icon, color, trend }: SummaryCardProps) => (
  <Card className="border-white/10 bg-[#0c1117] hover:border-primary/30 transition-all duration-300 shadow-xl rounded-3xl">
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-2xl bg-opacity-10", color.replace('text-', 'bg-'))}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        {trend && (
          <Badge variant="outline" className="text-[9px] font-black text-emerald-500 border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded-lg">
            {trend}
          </Badge>
        )}
      </div>
      
      <div className="space-y-0.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
          {title}
        </p>
        <h3 className="text-3xl font-black tracking-tighter text-white">
          {value}
        </h3>
        <p className="text-[11px] text-muted-foreground/60 font-semibold leading-tight pt-1">
          {description}
        </p>
      </div>
    </CardContent>
  </Card>
);

interface PublicationSummaryProps {
  stats: {
    prazosSemana: number;
    naoTratadas: number;
    semVinculo: number;
    novosAndamentos: number;
  };
}

export const PublicationSummary = ({ stats }: PublicationSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SummaryCard
        title="Prazos da Semana"
        value={stats.prazosSemana}
        description="Vencimentos críticos detectados"
        icon={Clock}
        color="text-red-500"
        trend="+2 hoje"
      />
      <SummaryCard
        title="Publicações Novas"
        value={stats.naoTratadas}
        description="Aguardando ciência ou tratamento"
        icon={Inbox}
        color="text-primary"
      />
      <SummaryCard
        title="Sem Vínculo"
        value={stats.semVinculo}
        description="Não associadas a processos/clientes"
        icon={Link2Off}
        color="text-orange-500"
      />
      <SummaryCard
        title="Próximos Andamentos"
        value={stats.novosAndamentos}
        description="Atualizações capturadas no diário"
        icon={FilePlus}
        color="text-emerald-500"
        trend="8 novos"
      />
    </div>
  );
};
