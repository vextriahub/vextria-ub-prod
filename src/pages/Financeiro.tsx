
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
    <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-12 overflow-x-hidden animate-in">
      {/* Page Header Moderno */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 drop-shadow-sm">
              Gestão Financeira
            </h1>
          </div>
          <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-2xl">
            Visualize o fluxo de caixa, honários e a saúde financeira estratégica do seu escritório.
          </p>
        </div>
        
        <div className="flex items-center gap-3 glass-morphism p-2 rounded-2xl">
          <Button 
            size="lg"
            className="rounded-xl shadow-premium h-12 px-6 font-bold"
          >
            <TrendingUp className="mr-2 h-5 w-5" />
            Exportar Fluxo
          </Button>
        </div>
      </div>

      {/* Cards de Resumo Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-3xl shadow-premium border-white/10 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Receita Mensal</p>
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground">R$ 28.500</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">+12% vs mês anterior</span>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-3xl shadow-premium border-white/10 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">A Receber</p>
            <div className="p-2 bg-primary/10 rounded-xl">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground">R$ 9.300</p>
          <p className="text-xs font-medium text-muted-foreground mt-2">3 faturas pendentes</p>
        </div>

        <div className="glass-card p-6 rounded-3xl shadow-premium border-white/10 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">A Pagar</p>
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <TrendingDown className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground">R$ 1.550</p>
          <p className="text-xs font-medium text-muted-foreground mt-2">2 vencimentos próximos</p>
        </div>

        <div className="glass-card p-6 rounded-3xl shadow-premium border-white/10 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Saldo Líquido</p>
            <div className="p-2 bg-primary/10 rounded-xl">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground text-gradient">R$ 26.950</p>
          <p className="text-xs font-medium text-primary mt-2">Eficiência de 94.6%</p>
        </div>
      </div>

      {/* Tabs para Contas */}
      <Tabs defaultValue="receber" className="w-full space-y-8">
        <div className="glass-card p-2 rounded-3xl inline-flex h-auto">
          <TabsList className="bg-transparent h-auto p-0 gap-1">
            <TabsTrigger value="receber" className="rounded-2xl px-8 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium transition-all">
              Contas a Receber
            </TabsTrigger>
            <TabsTrigger value="pagar" className="rounded-2xl px-8 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium transition-all">
              Contas a Pagar
            </TabsTrigger>
          </TabsList>
        </div>

          <TabsContent value="receber" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-2xl font-extrabold">Contas a Receber</h3>
              <Button className="rounded-xl font-bold px-6 h-11 bg-emerald-500 hover:bg-emerald-600 text-white shadow-premium transition-all">
                Nova Cobrança
              </Button>
            </div>
            
            <div className="grid gap-6">
              {contasReceber.map((conta) => (
                <div key={conta.id} className="glass-card hover-lift p-8 rounded-[2.5rem] border-white/5 shadow-premium group">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                        <TrendingUp className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-extrabold text-2xl group-hover:text-primary transition-colors duration-500">{conta.cliente}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                          <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg">
                            <Calendar className="h-4 w-4" />
                            Vence {conta.vencimento}
                          </span>
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                          <span className="uppercase tracking-widest text-[10px] font-black opacity-60">Honorários Contratuais</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between w-full lg:w-auto gap-10 border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
                      <div className="text-right">
                        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-50">Valor Total</p>
                        <p className="text-3xl font-black tracking-tighter">R$ {conta.valor.toLocaleString()}</p>
                      </div>
                      <Badge className={cn("px-6 py-2 rounded-2xl font-extrabold text-[11px] uppercase tracking-widest", getStatusColor(conta.status))}>
                        {conta.status === 'vencido' && <AlertCircle className="h-4 w-4 mr-2" />}
                        {conta.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pagar" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-2xl font-extrabold">Contas a Pagar</h3>
              <Button className="rounded-xl font-bold px-6 h-11 bg-orange-500 hover:bg-orange-600 text-white shadow-premium transition-all">
                Nova Despesa
              </Button>
            </div>
            
            <div className="grid gap-6">
              {contasPagar.map((conta) => (
                <div key={conta.id} className="glass-card hover-lift p-8 rounded-[2.5rem] border-white/5 shadow-premium group">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                        <TrendingDown className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-extrabold text-2xl group-hover:text-primary transition-colors duration-500">{conta.fornecedor}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                          <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg">
                            <Calendar className="h-4 w-4" />
                            Vence {conta.vencimento}
                          </span>
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                          <span className="uppercase tracking-widest text-[10px] font-black opacity-60">Custos Operacionais</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between w-full lg:w-auto gap-10 border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
                      <div className="text-right">
                        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-50">Valor Saída</p>
                        <p className="text-3xl font-black tracking-tighter text-orange-500">- R$ {conta.valor.toLocaleString()}</p>
                      </div>
                      <Badge className={cn("px-6 py-2 rounded-2xl font-extrabold text-[11px] uppercase tracking-widest", getStatusColor(conta.status))}>
                        {conta.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
};

export default Financeiro;
