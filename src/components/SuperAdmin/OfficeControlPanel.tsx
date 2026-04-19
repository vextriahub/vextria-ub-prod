import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
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
  MapPin,
  Phone,
  Mail,
  Save,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

export const OfficeControlPanel: React.FC = () => {
  const { admins, loading, error, refresh, updateOfficeStatus, updateOfficeFull } = useSuperAdminOffices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminOffice | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<AdminOffice>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedAdmin) {
      setEditFormData({
        office_name: selectedAdmin.office_name,
        office_email: selectedAdmin.office_email,
        phone: selectedAdmin.phone,
        address: selectedAdmin.address
      });
    }
  }, [selectedAdmin]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin?.office_id) return;

    setIsSubmitting(true);
    const success = await updateOfficeFull(selectedAdmin.office_id, editFormData);
    setIsSubmitting(false);

    if (success) {
      setDialogOpen(false);
    }
  };

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
        <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50/50">
          <Star className="w-3 h-3 mr-1 fill-amber-500" />
          Vitalício
        </Badge>
      );
    }
    
    if (isTrial) {
      return (
        <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-50/50">
          <Clock className="w-3 h-3 mr-1" />
          Trial
        </Badge>
      );
    }

    switch (status) {
      case 'em_dia':
        return (
          <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'vencido':
        return (
          <Badge variant="outline" className="border-rose-500 text-rose-600 bg-rose-50/50">
            <AlertCircle className="w-3 h-3 mr-1" />
            Vencido
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">Pendente</Badge>
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
        <Card className="border-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-bold text-muted-foreground uppercase">Escritórios</p>
              <Users size={14} className="text-primary" />
            </div>
            <div className="text-xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-bold text-emerald-600 uppercase">Ativos</p>
              <CheckCircle size={14} className="text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-emerald-600">{stats.emDia}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-bold text-purple-600 uppercase">Trials</p>
              <Clock size={14} className="text-purple-500" />
            </div>
            <div className="text-xl font-bold text-purple-600">{stats.trial}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-bold text-rose-600 uppercase">Vencidos</p>
              <AlertCircle size={14} className="text-rose-500" />
            </div>
            <div className="text-xl font-bold text-rose-600">{stats.vencidos}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted/20 overflow-hidden">
        <CardHeader className="border-b border-muted/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield className="text-primary h-5 w-5" />
                Gestão de Escritórios
              </CardTitle>
              <CardDescription className="text-xs">Visualize e edite os dados cadastrais.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading} className="h-8">
              <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Escritório ou Administrador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="em_dia">Ativos</SelectItem>
                <SelectItem value="trial">Trials</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/5">
                  <TableHead className="text-[10px] font-bold uppercase py-2 pl-6">Administrador</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase py-2">Escritório</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase py-2 text-center">Pagamento</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase py-2 text-center">Vencimento</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase py-2 pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && admins.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">Processando informações...</TableCell></TableRow>
                ) : filteredAdmins.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="py-3 pl-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{admin.full_name}</span>
                        <span className="text-[10px] text-muted-foreground">{admin.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-sm">{admin.office_name}</span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusBadge(admin.payment_status, admin.is_trial, admin.is_lifetime)}
                        {!admin.active && <Badge variant="destructive" className="text-[9px] px-1 h-4">SUSPENSO</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center font-medium text-sm">
                      {admin.end_date ? format(new Date(admin.end_date), "dd/MM/yyyy") : "---"}
                    </TableCell>
                    <TableCell className="py-3 text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog open={dialogOpen && selectedAdmin?.office_id === admin.office_id} onOpenChange={(open) => {
                          if (open) {
                            setSelectedAdmin(admin);
                            setDialogOpen(true);
                          } else {
                            setDialogOpen(false);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                              <Eye size={16} className="text-muted-foreground" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleSave}>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Building2 className="text-primary" /> Dados do Escritório
                                </DialogTitle>
                                <DialogDescription className="text-xs">Edite as informações cadastrais abaixo.</DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Nome</Label>
                                    <Input 
                                      value={editFormData.office_name || ''} 
                                      onChange={(e) => setEditFormData({...editFormData, office_name: e.target.value})}
                                      className="h-9"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">E-mail</Label>
                                    <Input 
                                      type="email"
                                      value={editFormData.office_email || ''} 
                                      onChange={(e) => setEditFormData({...editFormData, office_email: e.target.value})}
                                      className="h-9"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Telefone</Label>
                                    <Input 
                                      value={editFormData.phone || ''} 
                                      onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                      className="h-9"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Endereço</Label>
                                    <Input 
                                      value={editFormData.address || ''} 
                                      onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                                      className="h-9"
                                    />
                                  </div>
                                </div>
                              </div>

                              <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="w-full gap-2 font-bold">
                                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-muted-foreground"
                        >
                          <CreditCard size={15} />
                        </Button>

                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateOfficeStatus(admin.office_id || '', !admin.active)}
                          className={`h-8 w-8 p-0 rounded-full ${admin.active ? 'text-rose-500' : 'text-emerald-500'}`}
                        >
                          {admin.active ? <UserX size={15} /> : <UserCheck size={15} />}
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

import { Shield } from "lucide-react";