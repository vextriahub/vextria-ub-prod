
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
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PermissionGuard permission="canViewFinanceiro" showDeniedMessage>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Controle financeiro do escritório
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 28.500</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% do mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Receber</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 9.300</div>
              <p className="text-xs text-muted-foreground">
                3 faturas pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 1.550</div>
              <p className="text-xs text-muted-foreground">
                2 contas pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 26.950</div>
              <p className="text-xs text-muted-foreground">
                Margem de 94.6%
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
                <Card key={conta.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{conta.cliente}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Vencimento: {conta.vencimento}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold">R$ {conta.valor.toLocaleString()}</span>
                        <Badge className={getStatusColor(conta.status)}>
                          {conta.status === 'vencido' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {conta.status.charAt(0).toUpperCase() + conta.status.slice(1)}
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
                <Card key={conta.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{conta.fornecedor}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Vencimento: {conta.vencimento}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold">R$ {conta.valor.toLocaleString()}</span>
                        <Badge className={getStatusColor(conta.status)}>
                          {conta.status.charAt(0).toUpperCase() + conta.status.slice(1)}
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
