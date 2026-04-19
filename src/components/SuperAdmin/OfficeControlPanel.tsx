import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSuperAdminOffices, AdminOffice } from '@/hooks/useSuperAdminOffices';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Building2, 
  Search, 
  Eye, 
  UserX, 
  UserCheck,
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Users,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const OfficeControlPanel: React.FC = () => {
  const { admins, loading, error, refresh, updateOfficeStatus, sendPaymentReminder, isEmpty } = useSuperAdminOffices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminOffice | null>(null);

  // Filtrar administradores baseado na busca e status
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = !searchTerm || 
      admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.office_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = statusFilter === 'all';
    if (statusFilter === 'trial') matchesStatus = admin.is_trial;
    if (statusFilter === 'em_dia') matchesStatus = admin.payment_status === 'em_dia' && !admin.is_trial;
    if (statusFilter === 'vencido') matchesStatus = admin.payment_status === 'vencido';
    
    return matchesSearch && matchesStatus;
  });

  // Função para obter badge de status
  const getStatusBadge = (status: string, isTrial?: boolean) => {
    if (isTrial) {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Clock className="w-3 h-3 mr-1" />
          Trial
        </Badge>
      );
    }

    switch (status) {
      case 'em_dia':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Em dia
          </Badge>
        );
      case 'proximo_vencimento':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Próximo do vencimento
          </Badge>
        );
      case 'vencido':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Vencido
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Pendente
          </Badge>
        );
    }
  };

  // Estatísticas para os cards superiores
  const stats = {
    total: admins.length,
    emDia: admins.filter(a => a.payment_status === 'em_dia' && !a.is_trial).length,
    trial: admins.filter(a => a.is_trial).length,
    vencidos: admins.filter(a => a.payment_status === 'vencido').length,
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Escritórios</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.emDia}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Trial</p>
                <p className="text-2xl font-bold text-purple-600">{stats.trial}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{stats.vencidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Filtro */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building2 className="h-5 w-5" />
                Controle de Escritórios
              </CardTitle>
              <CardDescription>
                Gerencie o status de pagamento e acesso dos escritórios em tempo real
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou escritório..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-10">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="em_dia">Clientes Ativos</SelectItem>
                <SelectItem value="trial">Em Trial</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          {loading && admins.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando dados reais...</span>
            </div>
          ) : isEmpty ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Nenhum escritório cadastrado</h3>
            </div>
          ) : (
            <div className="border rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">Administrador</TableHead>
                    <TableHead className="font-semibold">Escritório</TableHead>
                    <TableHead className="font-semibold">Status Pagamento</TableHead>
                    <TableHead className="font-semibold">Data Vencimento</TableHead>
                    <TableHead className="font-semibold">Cadastrado em</TableHead>
                    <TableHead className="text-right font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{admin.full_name || 'Admin Principal'}</span>
                          <span className="text-xs text-muted-foreground">{admin.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{admin.office_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(admin.payment_status, admin.is_trial)}
                        {!admin.active && (
                          <Badge variant="destructive" className="ml-2 text-[10px] py-0">SUSPENSO</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {admin.end_date ? format(new Date(admin.end_date), "dd/MM/yyyy", { locale: ptBR }) : 'Permanente'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(admin.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedAdmin(admin)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {selectedAdmin && (
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Detalhes do Escritório
                                  </DialogTitle>
                                  <DialogDescription>
                                    Visão completa dos dados de {selectedAdmin.office_name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="flex items-center gap-4 p-3 bg-muted/40 rounded-lg">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold">{selectedAdmin.full_name}</p>
                                      <p className="text-xs text-muted-foreground">{selectedAdmin.email}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 border rounded-lg bg-background">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Plano Atual</p>
                                      <p className="text-sm font-medium mt-1">{selectedAdmin.plan_name}</p>
                                    </div>
                                    <div className="p-3 border rounded-lg bg-background">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Valor Mensal</p>
                                      <p className="text-sm font-medium mt-1">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedAdmin.price)}
                                      </p>
                                    </div>
                                    <div className="p-3 border rounded-lg bg-background">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Vencimento</p>
                                      <p className="text-sm font-medium mt-1">
                                        {selectedAdmin.end_date ? format(new Date(selectedAdmin.end_date), "dd/MM/yyyy") : 'N/A'}
                                      </p>
                                    </div>
                                    <div className="p-3 border rounded-lg bg-background">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Status</p>
                                      <div className="mt-1">{getStatusBadge(selectedAdmin.payment_status, selectedAdmin.is_trial)}</div>
                                    </div>
                                  </div>

                                  {!selectedAdmin.active && (
                                    <Alert variant="destructive" className="py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription className="text-xs">
                                        Acesso suspenso pelo administrador.
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Enviar Cobrança"
                            onClick={() => sendPaymentReminder(admin.email || '', admin.office_name || '')}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            title={admin.active ? "Suspender Acesso" : "Retomar Acesso"}
                            onClick={() => updateOfficeStatus(admin.office_id || '', !admin.active)}
                            className={`h-8 w-8 p-0 ${admin.active ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'}`}
                          >
                            {admin.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};