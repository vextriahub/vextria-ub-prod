
import { FileText, Users, Clock, TrendingUp, DollarSign, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useStats } from "@/hooks/useStats";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function StatsCards() {
  const { stats, loading } = useStats();

  const cards = [
    {
      title: "Processos Ativos",
      value: stats.processosAtivos.toString(),
      description: "Em andamento no escritório",
      icon: FileText,
      gradient: "from-orange-500/20 to-orange-500/5",
      iconColor: "text-orange-500",
      borderColor: "border-orange-500/20",
    },
    {
      title: "Clientes Totais",
      value: stats.clientes.toString(),
      description: "Base de contatos e CRM",
      icon: Users,
      gradient: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Tarefas Pendentes",
      value: stats.tarefasPendentes.toString(),
      description: "Entregas críticas para hoje",
      icon: Clock,
      gradient: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-500",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Faturamento (Mês)",
      value: formatCurrency(stats.receitaMensal),
      description: "Receita bruta acumulada",
      icon: TrendingUp,
      gradient: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Despesas (Mês)",
      value: formatCurrency(stats.despesaMensal),
      description: "Custos operacionais",
      icon: DollarSign,
      gradient: "from-red-500/20 to-red-500/5",
      iconColor: "text-red-500",
      borderColor: "border-red-500/20",
    },
    {
      title: "Saldo Operacional",
      value: formatCurrency(stats.receitaMensal - stats.despesaMensal),
      description: "Lucro líquido do período",
      icon: Wallet,
      gradient: "from-cyan-500/20 to-cyan-500/5",
      iconColor: "text-cyan-500",
      borderColor: "border-cyan-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-3xl bg-card/20 animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className={cn(
            "relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-white/5 bg-card/40 backdrop-blur-xl rounded-3xl",
            "hover-lift"
          )}
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", card.gradient)} />
          
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col gap-4">
              <div className={cn("p-2.5 rounded-2xl w-fit bg-background/50 backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-sm", card.iconColor)}>
                <card.icon className="h-5 w-5" />
              </div>
              
              <div className="space-y-1">
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity">
                  {card.title}
                </p>
                <div className="text-xl md:text-2xl font-black tracking-tight group-hover:translate-x-1 transition-transform duration-500">
                  {card.value}
                </div>
                <p className="text-[10px] md:text-[11px] font-medium text-muted-foreground line-clamp-1 opacity-60 group-hover:opacity-90">
                  {card.description}
                </p>
              </div>
            </div>
          </CardContent>

          {/* Decorative element */}
          <div className={cn("absolute -bottom-4 -right-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full", card.gradient)} />
        </Card>
      ))}
    </div>
  );
}
