
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
    <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
