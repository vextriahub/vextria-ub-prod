import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  Save,
  Star,
  Shield,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
        address: selectedAdmin.address,
        plan_name: selectedAdmin.plan_name as any,
        is_lifetime: selectedAdmin.is_lifetime
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
        <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-transparent font-bold">
          <Star className="w-3 h-3 mr-1 fill-amber-500" />
          Vitalício
        </Badge>
      );
    }
    
    if (isTrial) {
      return (
        <Badge variant="outline" className="border-purple-500/50 text-purple-500 bg-transparent font-bold">
          <Clock className="w-3 h-3 mr-1" />
          Trial
        </Badge>
      );
    }

    switch (status) {
      case 'em_dia':
        return (
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-transparent font-bold">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'vencido':
        return (
          <Badge variant="outline" className="border-rose-500/50 text-rose-500 bg-transparent font-bold">
            <AlertCircle className="w-3 h-3 mr-1" />
            Vencido
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">Pendente</Badge>
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
        <Card className="border-muted/10 bg-card/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between pb-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Escritórios</p>
              <Users size={12} className="text-primary opacity-50" />
            </div>
            <div className="text-xl font-black">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/10 bg-card/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between pb-1">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ativos</p>
              <CheckCircle size={12} className="text-emerald-500 opacity-50" />
            </div>
            <div className="text-xl font-black text-emerald-500">{stats.emDia}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/10 bg-card/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between pb-1">
              <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Trials</p>
              <Clock size={12} className="text-purple-500 opacity-50" />
            </div>
            <div className="text-xl font-black text-purple-500">{stats.trial}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/10 bg-card/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between pb-1">
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Vencidos</p>
              <AlertCircle size={12} className="text-rose-500 opacity-50" />
            </div>
            <div className="text-xl font-black text-rose-500">{stats.vencidos}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted/10 overflow-hidden bg-transparent">
        <CardHeader className="border-b border-muted/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield className="text-primary h-5 w-5" />
                Administração Global
              </CardTitle>
              <CardDescription className="text-xs">Visualize e edite os dados institucionais dos escritórios.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading} className="h-8 hover:bg-muted/10">
              <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Escritório ou Administrador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 bg-muted/5 border-muted/10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 bg-muted/5 border-muted/10">
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
                <TableRow className="bg-muted/5 hover:bg-muted/5 border-none">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-3 pl-6">Administrador</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-3">Escritório</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-3 text-center">Cadastro</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-3 text-center">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-3 text-center">Vencimento</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest py-3 pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && admins.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-24 text-muted-foreground italic text-xs">Sincronizando base de dados...</TableCell></TableRow>
                ) : filteredAdmins.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-muted/5 border-muted/5 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight">{admin.office_name}</span>
                        <span className="text-[10px] text-muted-foreground tracking-tight">{admin.office_email || admin.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm font-medium text-muted-foreground/60">{admin.full_name}</span>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                        <Calendar size={12} />
                        <span className="text-xs">{admin.created_at ? format(new Date(admin.created_at), "dd/MM/yyyy") : "--/--/----"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusBadge(admin.payment_status, admin.is_trial, admin.is_lifetime)}
                        {!admin.active && <Badge variant="destructive" className="text-[9px] px-1 h-4 font-bold">SUSPENSO</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center font-black text-sm">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase text-primary/50 font-bold mb-1">
                          {admin.plan_name === 'trial' ? 'Trial' :
                           admin.plan_name === 'starter' ? 'Starter' :
                           admin.plan_name === 'pro' ? 'Pro' :
                           admin.plan_name === 'business' ? 'Business' :
                           admin.plan_name === 'lifetime' ? 'Vitalício' : admin.plan_name}
                        </span>
                        <span>{admin.end_date ? format(new Date(admin.end_date), "dd/MM/yyyy") : "---"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right pr-6">
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
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted/10">
                              <Eye size={16} className="text-primary/70" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[550px] overflow-hidden border-none shadow-2xl">
                            <form onSubmit={handleSave}>
                              <div className="p-6 bg-muted/20 border-b border-muted/10">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2 text-xl font-black">
                                    <Building2 className="text-primary" /> Editar Escritório
                                  </DialogTitle>
                                  <DialogDescription className="text-xs">Ajuste os dados cadastrais e as configurações de plano.</DialogDescription>
                                </DialogHeader>
                              </div>
                              
                              <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 border-b border-muted/20 pb-1">Perfil do Escritório</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Nome Fantasia</Label>
                                      <Input 
                                        value={editFormData.office_name || ''} 
                                        onChange={(e) => setEditFormData({...editFormData, office_name: e.target.value})}
                                        className="h-10 bg-muted/20 border-none rounded-xl"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">E-mail para Contato</Label>
                                      <Input 
                                        type="email"
                                        value={editFormData.office_email || ''} 
                                        onChange={(e) => setEditFormData({...editFormData, office_email: e.target.value})}
                                        className="h-10 bg-muted/20 border-none rounded-xl"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Telefone</Label>
                                      <Input 
                                        value={editFormData.phone || ''} 
                                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                        className="h-10 bg-muted/20 border-none rounded-xl"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Endereço Completo</Label>
                                      <Input 
                                        value={editFormData.address || ''} 
                                        onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                                        className="h-10 bg-muted/20 border-none rounded-xl"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 border-b border-muted/20 pb-1">Controle de Assinatura</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Plano Atual</Label>
                                        <Select 
                                          value={editFormData.plan_name} 
                                          onValueChange={(val) => {
                                            const isLifetime = val === 'lifetime';
                                            setEditFormData({
                                              ...editFormData, 
                                              plan_name: val as any,
                                              is_lifetime: isLifetime || editFormData.is_lifetime
                                            });
                                          }}
                                        >
                                          <SelectTrigger className="h-10 bg-muted/20 border-none rounded-xl">
                                            <SelectValue placeholder="Selecione o plano" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="trial">Trial (7 dias)</SelectItem>
                                            <SelectItem value="starter">Starter</SelectItem>
                                            <SelectItem value="pro">Pro</SelectItem>
                                            <SelectItem value="business">Business</SelectItem>
                                            <SelectItem value="lifetime">Vitalício</SelectItem>
                                          </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="p-4 bg-muted/10 rounded-2xl flex items-center justify-between border border-muted/10 h-[58px] mt-4 sm:mt-0">
                                      <div className="space-y-0.5">
                                        <Label className="text-xs font-bold">Vitalício Manual</Label>
                                        <p className="text-[9px] text-muted-foreground leading-tight uppercase">Ativa data de 2099</p>
                                      </div>
                                      <Checkbox 
                                        checked={editFormData.is_lifetime || false}
                                        onCheckedChange={(checked) => setEditFormData({...editFormData, is_lifetime: !!checked})}
                                        className="h-5 w-5 rounded-md border-primary/50"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <DialogFooter className="p-6 pt-2">
                                <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-2xl font-black bg-primary text-primary-foreground gap-2 shadow-lg shadow-primary/10">
                                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save size={18} />}
                                  {isSubmitting ? 'Atualizando Banco...' : 'Publicar Alterações'}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => sendPaymentReminder(admin.email || '', admin.office_name || '')} 
                          className="h-8 w-8 p-0 text-blue-500/60 hover:text-blue-500 hover:bg-blue-500/5 transition-colors"
                        >
                          <CreditCard size={15} />
                        </Button>

                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateOfficeStatus(admin.office_id || '', !admin.active)}
                          className={`h-8 w-8 p-0 rounded-full transition-colors ${admin.active ? 'text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/5' : 'text-emerald-500/60 hover:text-emerald-500 hover:bg-emerald-500/5'}`}
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