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
  Star,
  MapPin,
  Phone,
  Mail,
  Save,
  Percent
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const OfficeControlPanel: React.FC = () => {
  const { admins, loading, error, refresh, updateOfficeStatus, updateOfficeFull, sendPaymentReminder, isEmpty } = useSuperAdminOffices();
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
        is_lifetime: selectedAdmin.is_lifetime,
        manual_discount_percent: selectedAdmin.manual_discount_percent
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
        <Badge variant="secondary" className="bg-[#FEF3C7] text-[#92400E] border-none px-2 py-0.5 font-bold uppercase text-[10px] shadow-sm">
          <Star className="w-3 h-3 mr-1 fill-[#F59E0B]" />
          Vitalício
        </Badge>
      );
    }
    
    if (isTrial) {
      return (
        <Badge variant="secondary" className="bg-[#F3E8FF] text-[#6B21A8] border-none px-2 py-0.5 font-bold uppercase text-[10px] shadow-sm">
          <Clock className="w-3 h-3 mr-1" />
          Trial
        </Badge>
      );
    }

    switch (status) {
      case 'em_dia':
        return (
          <Badge variant="secondary" className="bg-[#DCFCE7] text-[#166534] border-none px-2 py-0.5 font-bold uppercase text-[10px] shadow-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'vencido':
        return (
          <Badge variant="secondary" className="bg-[#FEE2E2] text-[#991B1B] border-none px-2 py-0.5 font-bold uppercase text-[10px] shadow-sm">
            <AlertCircle className="w-3 h-3 mr-1" />
            Vencido
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-slate-300 text-slate-800 border-none px-2 py-0.5 font-bold uppercase text-[10px]">
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
        <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-[#94a3b8]">Escritórios</p>
              <Users size={14} className="text-primary" />
            </div>
            <div className="text-2xl font-black">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-bold text-[#166534] uppercase tracking-widest">Ativos</p>
              <CheckCircle size={14} className="text-[#166534]" />
            </div>
            <div className="text-2xl font-black text-[#166534]">{stats.emDia}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-bold text-[#6B21A8] uppercase tracking-widest">Trials</p>
              <Clock size={14} className="text-[#6B21A8]" />
            </div>
            <div className="text-2xl font-black text-[#6B21A8]">{stats.trial}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-bold text-[#991B1B] uppercase tracking-widest">Vencidos</p>
              <AlertCircle size={14} className="text-[#991B1B]" />
            </div>
            <div className="text-2xl font-black text-[#991B1B]">{stats.vencidos}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Building2 className="text-primary h-6 w-6" />
                GESTÃO VEXTRIA HUB (V1.4)
              </CardTitle>
              <CardDescription className="text-xs">Controle total de escritórios e faturamento.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Sincronizar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 pb-6">
          <div className="p-4 flex flex-col sm:flex-row gap-4 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Buscar por escritório ou administrador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-muted/20 border-none rounded-lg"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-10 bg-muted/20 border-none rounded-lg">
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

          <div className="overflow-x-auto scrollbar-hide">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-3 pl-6">Administrador</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-3">Escritório</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-3 text-center">Status Pagamento</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-3 text-center">Vencimento</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest py-3 pr-6">Gerenciar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && admins.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground text-xs italic">Sincronizando dados...</TableCell></TableRow>
                ) : filteredAdmins.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-muted/10 border-muted/5 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight">{admin.full_name}</span>
                        <span className="text-[10px] text-muted-foreground/80">{admin.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="font-medium text-sm">{admin.office_name}</span>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusBadge(admin.payment_status, admin.is_trial, admin.is_lifetime)}
                        {!admin.active && <Badge className="bg-rose-600 text-[10px] font-bold px-1.5 h-5 shadow-sm">SUSPENSO</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-bold text-sm text-center">
                      {admin.end_date ? format(new Date(admin.end_date), "dd/MM/yyyy") : <span className="text-muted-foreground italic font-normal text-xs">---</span>}
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
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted/50 transition-colors">
                              <Eye size={16} className="text-muted-foreground" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[550px] border-none shadow-2xl p-0 overflow-hidden bg-background">
                            <form onSubmit={handleSave}>
                              <div className="p-6 bg-muted/20 border-b border-muted/10">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2 text-xl font-black">
                                    <Building2 className="text-primary" /> Editar Escritório
                                  </DialogTitle>
                                  <DialogDescription className="text-xs">Atualize os parâmetros institucionais e financeiros do escritório.</DialogDescription>
                                </DialogHeader>
                              </div>
                              
                              <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 border-b border-muted/20 pb-1">Perfil Institucional</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Nome do Escritório</Label>
                                      <Input 
                                        value={editFormData.office_name || ''} 
                                        onChange={(e) => setEditFormData({...editFormData, office_name: e.target.value})}
                                        className="h-10 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/30"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">E-mail de Contato</Label>
                                      <Input 
                                        type="email"
                                        value={editFormData.office_email || ''} 
                                        onChange={(e) => setEditFormData({...editFormData, office_email: e.target.value})}
                                        className="h-10 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/30"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Telefone</Label>
                                      <Input 
                                        value={editFormData.phone || ''} 
                                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                        className="h-10 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/30"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Endereço</Label>
                                      <Input 
                                        value={editFormData.address || ''} 
                                        onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                                        className="h-10 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/30"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 border-b border-muted/20 pb-1">Gestão Financeira</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/10 rounded-2xl flex items-center justify-between border border-muted/10">
                                      <div className="space-y-0.5">
                                        <Label className="text-xs font-bold">Plano Vitalício</Label>
                                        <p className="text-[9px] text-muted-foreground uppercase font-medium">Bypassa travas de pagamento</p>
                                      </div>
                                      <Checkbox 
                                        checked={editFormData.is_lifetime || false}
                                        onCheckedChange={(checked) => setEditFormData({...editFormData, is_lifetime: !!checked})}
                                        className="h-5 w-5 rounded-md border-primary/50"
                                      />
                                    </div>
                                    <div className="p-4 bg-muted/10 rounded-2xl space-y-2 border border-muted/10">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Desconto Manual (%)</Label>
                                      <div className="flex items-center gap-2">
                                        <Input 
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={editFormData.manual_discount_percent || 0}
                                          onChange={(e) => setEditFormData({...editFormData, manual_discount_percent: parseFloat(e.target.value) || 0})}
                                          className="h-8 bg-transparent border-none p-0 text-sm font-black focus-visible:ring-0"
                                        />
                                        <Percent size={14} className="text-muted-foreground opacity-50" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <DialogFooter className="p-6 pt-2 bg-muted/10">
                                <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-2xl font-black bg-primary text-primary-foreground gap-2 shadow-lg shadow-primary/20">
                                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save size={18} />}
                                  {isSubmitting ? 'PERSISTINDO NO BANCO...' : 'SALVAR ALTERAÇÕES'}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => sendPaymentReminder(admin.email || '', admin.office_name || '')} 
                          className="h-8 w-8 p-0 text-blue-500/80 hover:text-blue-500 hover:bg-blue-500/5 transition-colors"
                        >
                          <CreditCard size={15} />
                        </Button>

                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateOfficeStatus(admin.office_id || '', !admin.active)}
                          className={`h-8 w-8 p-0 rounded-full transition-colors ${admin.active ? 'text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/5' : 'text-emerald-500/80 hover:text-emerald-500 hover:bg-emerald-500/5'}`}
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