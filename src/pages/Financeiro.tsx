
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  FileText,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getInitialData } from "@/utils/initialData";

import { PermissionGuard } from "@/components/Auth/PermissionGuard";

const Financeiro = () => {
  const { isFirstLogin } = useAuth();
  
  const mockContasReceber = [
    { id: 1, cliente: "João Silva", valor: 2500, vencimento: "2025-01-15", status: "pendente" },
    { id: 2, cliente: "Maria Santos", valor: 1800, vencimento: "2025-01-20", status: "vencido" },
    { id: 3, cliente: "Empresa ABC", valor: 5000, vencimento: "2025-01-25", status: "pendente" },
  ];

  const mockContasPagar = [
    { id: 1, fornecedor: "Escritório Virtual", valor: 800, vencimento: "2025-01-10", status: "pago" },
    { id: 2, fornecedor: "Material de Escritório", valor: 350, vencimento: "2025-01-18", status: "pendente" },
    { id: 3, fornecedor: "Software Jurídico", valor: 1200, vencimento: "2025-01-22", status: "pendente" },
  ];

  const contasReceber = getInitialData(mockContasReceber, isFirstLogin);
  const contasPagar = getInitialData(mockContasPagar, isFirstLogin);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10 font-bold';
      case 'pendente': return 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10 font-bold';
      case 'vencido': return 'border-red-500/50 text-red-500 bg-red-500/10 font-bold';
      default: return 'border-muted/30 text-muted-foreground bg-muted/10';
    }
  };

  return (
    <PermissionGuard permission="canViewFinanceiro" showDeniedMessage>
      <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-10 overflow-x-hidden animate-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Gestão Financeira
              </h1>
            </div>
            <p className="text-sm md:text-lg text-muted-foreground font-medium">
              Controle fluxos de caixa, honorários e despesas do seu escritório.
            </p>
          </div>
          <div className="flex items-center gap-2 glass-morphism p-2 rounded-2xl">
            <Button size="lg" className="rounded-xl shadow-premium">
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-lift border-white/5 bg-card/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Receita Mensal</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight">R$ 28.500</div>
              <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-white/5 bg-card/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">A Receber</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight">R$ 9.300</div>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                3 faturas pendentes este mês
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-white/5 bg-card/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">A Pagar</CardTitle>
              <div className="p-2 rounded-lg bg-orange-500/10">
                <TrendingDown className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight">R$ 1.550</div>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                2 contas com vencimento próximo
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-white/5 bg-card/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Saldo Líquido</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight">R$ 26.950</div>
              <p className="text-xs font-medium text-primary mt-1">
                Eficiência operacional de 94.6%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para Contas */}
        <Tabs defaultValue="receber" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
            <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
          </TabsList>

          <TabsContent value="receber" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Contas a Receber</h3>
              <Button>Nova Cobrança</Button>
            </div>
            
            <div className="space-y-4">
              {contasReceber.map((conta) => (
                <Card key={conta.id} className="hover-lift border-white/5 bg-card/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-lg">{conta.cliente}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Vence {conta.vencimento}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <span className="uppercase tracking-widest text-[10px] font-bold">Honorários</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                        <div className="text-right">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1">Valor</p>
                          <p className="text-xl font-black">R$ {conta.valor.toLocaleString()}</p>
                        </div>
                        <Badge className={cn("px-4 py-1.5 rounded-full", getStatusColor(conta.status))}>
                          {conta.status === 'vencido' && <AlertCircle className="h-3 w-3 mr-1" />}
                          <span className="uppercase tracking-tighter text-[11px]">{conta.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pagar" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Contas a Pagar</h3>
              <Button>Nova Despesa</Button>
            </div>
            
            <div className="space-y-4">
              {contasPagar.map((conta) => (
                <Card key={conta.id} className="hover-lift border-white/5 bg-card/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                          <TrendingDown className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-lg">{conta.fornecedor}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Vence {conta.vencimento}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <span className="uppercase tracking-widest text-[10px] font-bold">Operacional</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                        <div className="text-right">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1">Valor</p>
                          <p className="text-xl font-black text-orange-500">- R$ {conta.valor.toLocaleString()}</p>
                        </div>
                        <Badge className={cn("px-4 py-1.5 rounded-full", getStatusColor(conta.status))}>
                          <span className="uppercase tracking-tighter text-[11px]">{conta.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
};

export default Financeiro;
