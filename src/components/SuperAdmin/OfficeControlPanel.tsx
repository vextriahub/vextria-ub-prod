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
  Percent,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * PAINEL DE CONTROLE DE ESCRITÓRIOS - Versão 1.2
 * Inclui: Cálculo de data de Trial, Detecção de Vitalício Legacy (2099) e Perfil Rico.
 */
export const OfficeControlPanel: React.FC = () => {
  const { admins, loading, error, refresh, updateOfficeStatus, sendPaymentReminder, isEmpty } = useSuperAdminOffices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminOffice | null>(null);

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

  const getStatusBadge = (status: string, isTrial?: boolean, isLifetime?: boolean) => {
    if (isLifetime) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 shadow-sm">
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Escritórios</p>
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary"><Users size={16} /></div>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ativos</p>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600"><CheckCircle size={16} /></div>
            </div>
            <div className="text-2xl font-bold mt-2 text-green-600">{stats.emDia}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trials</p>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><Clock size={16} /></div>
            </div>
            <div className="text-2xl font-bold mt-2 text-purple-600">{stats.trial}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Vencidos</p>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600"><AlertCircle size={16} /></div>
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
                <Building2 className="h-5 w-5 text-primary" /> Controle de Escritórios
              </CardTitle>
              <CardDescription>Gestão em tempo real de acessos e vencimentos</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Sincronizar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Escritório ou Administrador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 ring-offset-background"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-10"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="em_dia">Ativos</SelectItem>
                <SelectItem value="trial">Trials</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Administrador</TableHead>
                  <TableHead className="font-bold">Escritório</TableHead>
                  <TableHead className="font-bold">Pagamento</TableHead>
                  <TableHead className="font-bold">Data Vencimento</TableHead>
                  <TableHead className="text-right font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && admins.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 opacity-60">Buscando dados funcionais...</TableCell></TableRow>
                ) : filteredAdmins.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{admin.full_name}</span>
                        <span className="text-[10px] text-muted-foreground">{admin.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{admin.office_name}</span>
                        {admin.manual_discount_percent > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold">
                            <Percent size={10} /> {admin.manual_discount_percent}% de desconto
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(admin.payment_status, admin.is_trial, admin.is_lifetime)}
                      {!admin.active && <Badge variant="destructive" className="ml-2 text-[8px] py-0 px-1">SUSPENSO</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium text-sm">
                        {admin.is_lifetime ? (
                          <span className="text-amber-600 flex items-center gap-1">
                            <Star size={12} className="fill-amber-600" /> Vitalício
                          </span>
                        ) : admin.end_date ? (
                          <span className={admin.is_trial ? 'text-purple-600' : ''}>
                            {format(new Date(admin.end_date), "dd/MM/yyyy")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">A definir</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedAdmin(admin)} className="h-8 w-8 p-0"><Eye size={16} /></Button>
                          </DialogTrigger>
                          {selectedAdmin && (
                            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                  <Building2 className="text-primary" /> Perfil Institucional
                                </DialogTitle>
                                <DialogDescription>Dados completos para gestão e faturamento</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6 mt-4">
                                <div className="p-4 bg-muted/30 rounded-2xl flex items-center gap-4">
                                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary"><Users size={24} /></div>
                                  <div>
                                    <p className="font-bold text-lg leading-tight">{selectedAdmin.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedAdmin.email}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 border rounded-xl bg-card">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Mail size={10} /> E-mail Escritório</p>
                                    <p className="text-sm font-medium mt-1 truncate">{selectedAdmin.office_email || 'N/A'}</p>
                                  </div>
                                  <div className="p-3 border rounded-xl bg-card">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Phone size={10} /> Telefone</p>
                                    <p className="text-sm font-medium mt-1">{selectedAdmin.phone || 'N/A'}</p>
                                  </div>
                                  <div className="p-3 border rounded-xl bg-card col-span-2">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><MapPin size={10} /> Endereço</p>
                                    <p className="text-sm font-medium mt-1">{selectedAdmin.address || 'Não informado'}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 border rounded-xl bg-background">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Plano Atual</p>
                                    <p className="text-sm font-bold mt-1">{selectedAdmin.plan_name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedAdmin.price)}/mês</p>
                                  </div>
                                  <div className="p-3 border rounded-xl bg-background">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Expiração</p>
                                    <p className="text-sm font-bold mt-1">
                                      {selectedAdmin.is_lifetime ? 'Vitalício' : selectedAdmin.end_date ? format(new Date(selectedAdmin.end_date), 'dd/MM/yyyy') : 'N/A'}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground italic mt-0.5">Ciclo de cobrança</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                        <Button variant="ghost" size="sm" onClick={() => sendPaymentReminder(admin.email || '', admin.office_name || '')} className="h-8 w-8 p-0 text-blue-500"><CreditCard size={16} /></Button>
                        <Button variant="ghost" size="sm" onClick={() => updateOfficeStatus(admin.office_id || '', !admin.active)} className={`h-8 w-8 p-0 ${admin.active ? 'text-red-500' : 'text-green-500'}`}>
                          {admin.active ? <UserX size={16} /> : <UserCheck size={16} />}
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
      <div className="text-[10px] text-muted-foreground text-center opacity-30">Admin Sync v1.2 | Data Jud Integration Active</div>
    </div>
  );
};