
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Plus, Edit, Trash2 } from "lucide-react";
import { DemandGoalsConfig } from "@/components/Goals/DemandGoalsConfig";
import { CreateGoalDialog } from "@/components/Goals/CreateGoalDialog";
import { useToast } from "@/hooks/use-toast";
import { PermissionGuard } from "@/components/Auth/PermissionGuard";

const Metas = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("individuais");
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [metas, setMetas] = useState([
    {
      id: 1,
      titulo: "Meta de Receita Mensal",
      tipo: "receita",
      periodo: "mensal",
      valorMeta: 15000,
      valorAtual: 8500,
      status: "ativa",
      dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      dataFim: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    },
    {
      id: 2,
      titulo: "Novos Clientes",
      tipo: "clientes",
      periodo: "mensal",
      valorMeta: 10,
      valorAtual: 6,
      status: "ativa",
      dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      dataFim: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    },
    {
      id: 3,
      titulo: "Processos Finalizados",
      tipo: "processos",
      periodo: "mensal",
      valorMeta: 15,
      valorAtual: 12,
      status: "ativa",
      dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      dataFim: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    }
  ]);

  const handleCreateGoal = (novaMeta: any) => {
    setMetas([...metas, novaMeta]);
  };

  const handleDeleteGoal = (goalId: number) => {
    setMetas(metas.filter(m => m.id !== goalId));
    toast({
      title: "Meta excluída",
      description: "A meta foi excluída com sucesso.",
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const formatValue = (value: number, tipo: string) => {
    if (tipo === "receita") {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    return value.toString();
  };

  return (
    <PermissionGuard permission="canViewMetas" showDeniedMessage>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Metas</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Defina e acompanhe suas metas profissionais
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="individuais" className="cursor-pointer">Individuais</TabsTrigger>
            <TabsTrigger value="demandas" className="cursor-pointer">Por Demanda</TabsTrigger>
            <TabsTrigger value="escritorio" className="cursor-pointer">Escritório</TabsTrigger>
          </TabsList>

          <TabsContent value="individuais" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Suas Metas Pessoais</h3>
              <Button onClick={() => setCreateGoalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
              {metas.map((meta) => {
                const percentage = Math.round((meta.valorAtual / meta.valorMeta) * 100);
                
                return (
                  <Card key={meta.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{meta.titulo}</CardTitle>
                          <CardDescription className="capitalize">
                            Meta {meta.periodo} • {meta.tipo}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteGoal(meta.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Progresso</span>
                          <span className={`text-sm font-medium ${getProgressColor(percentage)}`}>
                            {percentage}%
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold">
                            {formatValue(meta.valorAtual, meta.tipo)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            de {formatValue(meta.valorMeta, meta.tipo)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Faltam</p>
                          <p className="font-medium">
                            {formatValue(meta.valorMeta - meta.valorAtual, meta.tipo)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {metas.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma meta criada</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Crie suas primeira meta para começar a acompanhar seu progresso.
                    </p>
                    <Button onClick={() => setCreateGoalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Meta
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="demandas" className="space-y-4">
            <DemandGoalsConfig />
          </TabsContent>

          <TabsContent value="escritorio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Metas do Escritório
                </CardTitle>
                <CardDescription>
                  Objetivos gerais e indicadores de desempenho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Indicadores Financeiros</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Faturamento Mensal</span>
                          <span>R$ 180.000 / R$ 200.000</span>
                        </div>
                        <Progress value={90} className="mt-1" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Margem de Lucro</span>
                          <span>68% / 70%</span>
                        </div>
                        <Progress value={97} className="mt-1" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Indicadores Operacionais</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Novos Processos</span>
                          <span>45 / 50</span>
                        </div>
                        <Progress value={90} className="mt-1" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Satisfação Clientes</span>
                          <span>92% / 95%</span>
                        </div>
                        <Progress value={97} className="mt-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CreateGoalDialog
          open={createGoalOpen}
          onOpenChange={setCreateGoalOpen}
          onSave={handleCreateGoal}
        />
      </div>
    </PermissionGuard>
  );
};

export default Metas;
