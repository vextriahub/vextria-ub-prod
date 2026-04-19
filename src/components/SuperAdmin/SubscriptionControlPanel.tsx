import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSuperAdminOffices } from '@/hooks/useSuperAdminOffices';
import { 
  CreditCard, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Users, 
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SubscriptionControlPanel: React.FC = () => {
  const { admins, loading, refresh } = useSuperAdminOffices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtrar dados
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = !searchTerm || 
      admin.office_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || admin.payment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Cálculos de métricas reais
  const metrics = {
    totalOffices: admins.length,
    activeOffices: admins.filter(a => a.payment_status === 'em_dia').length,
    blockedOffices: admins.filter(a => a.payment_status === 'vencido').length,
    revenue: admins.reduce((acc, a) => acc + (a.payment_status === 'em_dia' ? a.price : 0), 0)
  };

  const getStatusBadge = (status: string, isTrial?: boolean) => {
    if (isTrial) {
      return (
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
          <Clock className="w-3 h-3 mr-1" /> Trial
        </Badge>
      );
    }

    switch (status) {
      case 'em_dia':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Ativo
          </Badge>
        );
      case 'proximo_vencimento':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" /> Pendente
          </Badge>
        );
      case 'vencido':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" /> Vencido
          </Badge>
        );
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total de Escritórios</p>
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.totalOffices}</div>
            <p className="text-xs text-muted-foreground mt-1">Cadastrados no Hub</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Assinaturas Ativas</p>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold mt-2 text-green-600">{metrics.activeOffices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalOffices > 0 ? ((metrics.activeOffices / metrics.totalOffices) * 100).toFixed(1) : 0}% da base
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Assinaturas Vencidas</p>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold mt-2 text-red-600">{metrics.blockedOffices}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando renovação</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">MRR (Estimado)</p>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold mt-2 text-blue-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.revenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Faturamento mensal recorrente
              <ArrowUpRight className="h-3 w-3 text-green-500" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Controle */}
      <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestão de Assinaturas</CardTitle>
            <CardDescription>Monitoramento global de pagamentos e prazos</CardDescription>
          </div>
          <Button onClick={refresh} variant="outline" size="sm" className="gap-2 h-9">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Sincronizando..." : "Sincronizar Dados"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por escritório ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[220px] h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="em_dia">Ativo (Em dia)</SelectItem>
                  <SelectItem value="proximo_vencimento">Pendente (A vencer)</SelectItem>
                  <SelectItem value="vencido">Bloqueado (Vencido)</SelectItem>
                  <SelectItem value="trial">Em Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-border/40 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">Escritório / Admin</TableHead>
                    <TableHead className="font-semibold">Plano</TableHead>
                    <TableHead className="font-semibold">Valor</TableHead>
                    <TableHead className="font-semibold">Vencimento</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="h-8 w-8 animate-spin text-primary/50" />
                          <p className="text-muted-foreground">Buscando dados financeiros...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAdmins.map((admin) => (
                    <TableRow key={admin.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="font-medium text-foreground">{admin.office_name}</div>
                        <div className="text-xs text-muted-foreground">{admin.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal capitalize border-border/60">
                          {admin.plan_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(admin.price)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {admin.end_date ? format(new Date(admin.end_date), "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(admin.payment_status, admin.is_trial)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loading && filteredAdmins.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2 opacity-60">
                          <Search className="h-8 w-8" />
                          <p>Nenhum registro encontrado para esta busca.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
