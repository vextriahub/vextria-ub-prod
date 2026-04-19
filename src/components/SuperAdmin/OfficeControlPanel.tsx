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
  Star,
  MapPin,
  Phone,
  Tag,
  Calendar,
  Percent
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
  const getStatusBadge = (status: string, isTrial?: boolean, isLifetime?: boolean) => {
    if (isLifetime) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Star className="w-3 h-3 mr-1 fill-amber-500" />
          Vitalício
        </Badge>
      );
    }
    
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
            Ativo
          </Badge>
        );
      case 'proximo_vencimento':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
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
        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Escritórios</p>
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Users size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Clientes Ativos</p>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold mt-2 text-green-600">{stats.emDia}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Em Trial</p>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold mt-2 text-purple-600">{stats.trial}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Vencidos</p>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <AlertCircle size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold mt-2 text-red-600">{stats.vencidos}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Building2 className="h-5 w-5 text-primary" />
                Controle de Escritórios
              </CardTitle>
              <CardDescription>Gerenciamento completo de acessos e perfil institucional</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por escritório ou administrador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="em_dia">Ativos</SelectItem>
                <SelectItem value="trial">Trials</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-xl overflow-hidden scrollbar-hide">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Administrador</TableHead>
                  <TableHead className="font-bold">Escritório</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Vencimento</TableHead>
                  <TableHead className="text-right font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && admins.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 opacity-60">Sincronizando dados...</TableCell></TableRow>
                ) : filteredAdmins.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{admin.full_name}</span>
                        <span className="text-[11px] text-muted-foreground">{admin.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{admin.office_name}</span>
                        {admin.manual_discount_percent > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Tag size={10} className="text-blue-500" />
                            <span className="text-[10px] font-bold text-blue-500">{admin.manual_discount_percent}% de desconto</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(admin.payment_status, admin.is_trial, admin.is_lifetime)}
                      {!admin.active && <Badge variant="destructive" className="ml-2 text-[9px] py-0">SUSPENSO</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium text-sm">
                        {admin.is_lifetime ? (
                          <span className="text-amber-600 flex items-center gap-1">
                            <Star size={12} className="fill-amber-600" /> Vitalício
                          </span>
                        ) : admin.end_date ? (
                          <span>{format(new Date(admin.end_date), "dd/MM/yyyy")}</span>
                        ) : admin.is_trial ? (
                            <span className="text-purple-600 italic">Trial Ativo</span>
                        ) : (
                          <span className="text-muted-foreground italic">Pendente</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedAdmin(admin)} className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {selectedAdmin && (
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-xl">
                                  <Building2 className="h-6 w-6 text-primary" />
                                  Perfil do Escritório
                                </DialogTitle>
                                <DialogDescription>Dados institucionais e financeiros</DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-5 mt-4">
                                <div className="p-4 bg-muted/40 rounded-xl space-y-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                      <Users size={20} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold">{selectedAdmin.full_name}</p>
                                      <p className="text-xs text-muted-foreground">{selectedAdmin.email}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Mail size={14} className="text-muted-foreground" />
                                      <span>{selectedAdmin.office_email || 'E-mail não cadastrado'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Phone size={14} className="text-muted-foreground" />
                                      <span>{selectedAdmin.phone || 'Telefone não cadastrado'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm col-span-2">
                                      <MapPin size={14} className="text-muted-foreground shrink-0" />
                                      <span className="line-clamp-1">{selectedAdmin.address || 'Endereço não informado'}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 border rounded-xl bg-card space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                      <DollarSign size={10} /> Plano e Valor
                                    </p>
                                    <p className="text-sm font-bold">{selectedAdmin.plan_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedAdmin.price)}
                                    </p>
                                  </div>
                                  
                                  <div className="p-3 border rounded-xl bg-card space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                      <Calendar size={10} /> Ciclo de Vida
                                    </p>
                                    <p className="text-sm font-bold">
                                      {selectedAdmin.is_lifetime ? 'Vitalício' : format(new Date(selectedAdmin.created_at), 'dd/MM/yyyy')}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground italic">Data de adesão</p>
                                  </div>

                                  {selectedAdmin.manual_discount_percent > 0 && (
                                    <div className="p-3 border-blue-200 bg-blue-50/50 rounded-xl col-span-2 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Percent size={14} className="text-blue-600" />
                                        <span className="text-xs font-bold text-blue-800 uppercase tracking-tighter">Desconto Especial Aplicado</span>
                                      </div>
                                      <Badge className="bg-blue-600">{selectedAdmin.manual_discount_percent}%</Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>

                        <Button variant="ghost" size="sm" onClick={() => sendPaymentReminder(admin.email || '', admin.office_name || '')} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                          <CreditCard className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost" 
                          size="sm"
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
        </CardContent>
      </Card>
    </div>
  );
};