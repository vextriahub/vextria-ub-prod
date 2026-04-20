
import { FileText, Users, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRole } from "@/hooks/useUserRole";

const getStatsData = () => {
  return [
    {
      title: "Processos Ativos",
      value: "0",
      change: "Nenhum processo cadastrado",
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Clientes",
      value: "0",
      change: "Nenhum cliente cadastrado",
      icon: Users,
      color: "text-secondary",
    },
    {
      title: "Tarefas Pendentes",
      value: "0",
      change: "Nenhuma tarefa pendente",
      icon: Clock,
      color: "text-accent",
    },
    {
      title: "Concluídas",
      value: "0",
      change: "Nenhuma tarefa concluída",
      icon: CheckCircle,
      color: "text-green-500",
    },
  ];
};

export function StatsCards() {
  const stats = getStatsData();

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="hover-lift overflow-hidden group border-white/5 bg-card/40"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
            <CardTitle className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-background/50 ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight">{stat.value}</div>
            <p className="text-xs font-medium text-muted-foreground mt-1 opacity-70">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
