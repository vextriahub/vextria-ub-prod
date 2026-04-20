
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
      <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-10 overflow-x-hidden animate-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Target className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Metas & Objetivos
              </h1>
            </div>
            <p className="text-sm md:text-lg text-muted-foreground font-medium">
              Defina, acompanhe e supere seus desafios profissionais.
            </p>
          </div>
          <div className="flex items-center gap-3 glass-morphism p-2 rounded-2xl">
            <Button 
              onClick={() => setCreateGoalOpen(true)}
              size="lg"
              className="rounded-xl shadow-premium h-10 md:h-12 px-4 md:px-6"
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Nova Meta
            </Button>
          </div>
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

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {metas.map((meta) => {
                const percentage = Math.round((meta.valorAtual / meta.valorMeta) * 100);
                
                return (
                  <Card key={meta.id} className="hover-lift border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    <CardHeader className="pb-3 border-b border-white/5 bg-muted/5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{meta.titulo}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0 border-white/10 bg-muted/20">
                              {meta.periodo}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0 border-white/10 bg-muted/20">
                              {meta.tipo}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleDeleteGoal(meta.id)}
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold uppercase tracking-wider opacity-60">Status de Entrega</span>
                          <span className={`text-sm font-extrabold ${getProgressColor(percentage)}`}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-muted/50 rounded-full h-3 p-1 border border-white/5">
                          <div 
                            className="bg-gradient-to-r from-primary to-primary/60 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-3xl font-extrabold tracking-tight">
                            {formatValue(meta.valorAtual, meta.tipo)}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground opacity-70">
                            Objetivo: {formatValue(meta.valorMeta, meta.tipo)}
                          </p>
                        </div>
                        <div className="text-right p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">Gap Restante</p>
                          <p className="font-extrabold text-primary">
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
