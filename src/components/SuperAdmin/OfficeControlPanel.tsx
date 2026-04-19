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
  Tag,
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

  // Inicializa o formulário de edição quando um administrador é selecionado
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

  // Função para obter badge de status - Visual Clean (sem bordas pesadas)
  const getStatusBadge = (status: string, isTrial?: boolean, isLifetime?: boolean) => {
    if (isLifetime) {
      return (
        <Badge variant="secondary" className="bg-amber-100/80 text-amber-700 border-none px-2 py-0.5 font-medium">
          <Star className="w-3 h-3 mr-1 fill-amber-500" />
          Vitalício
        </Badge>
      );
    }
    
    if (isTrial) {
      return (
        <Badge variant="secondary" className="bg-purple-100/80 text-purple-700 border-none px-2 py-0.5 font-medium">
          <Clock className="w-3 h-3 mr-1" />
          Trial
        </Badge>
      );
    }

    switch (status) {
      case 'em_dia':
        return (
          <Badge variant="secondary" className="bg-emerald-100/80 text-emerald-700 border-none px-2 py-0.5 font-medium">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'vencido':
        return (
          <Badge variant="secondary" className="bg-rose-100/80 text-rose-700 border-none px-2 py-0.5 font-medium">
            <AlertCircle className="w-3 h-3 mr-1" />
            Vencido
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-slate-100/80 text-slate-700 border-none px-2 py-0.5 font-medium">
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
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Escritórios</p>
              <Users size={14} className="text-primary" />
            </div>
            <div className="text-2xl font-black">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ativos</p>
              <CheckCircle size={14} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{stats.emDia}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Trials</p>
              <Clock size={14} className="text-purple-500" />
            </div>
            <div className="text-2xl font-black text-purple-600">{stats.trial}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Vencidos</p>
              <AlertCircle size={14} className="text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600">{stats.vencidos}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Building2 className="text-primary h-5 w-5" />
                Painel Administrativo
              </CardTitle>
              <CardDescription className="text-xs">Edite dados e controle acessos globais</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading} className="rounded-full h-8 px-3 text-[10px] font-bold uppercase tracking-tighter">
              <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sincronizar
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
                className="pl-10 h-9 bg-muted/20 border-none rounded-lg"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 bg-muted/20 border-none rounded-lg">
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

          <div className="overflow-x-auto scrollbar-hide">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-2">Administrador</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-2">Escritório</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-2">Status Pagamento</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-2">Data Vencimento</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-2 px-6">Edição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && admins.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground/40 text-xs italic font-medium tracking-tight">Solicitando autorização ao banco...</TableCell></TableRow>
                ) : filteredAdmins.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-muted/10 border-muted/10 transition-colors">
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight">{admin.full_name}</span>
                        <span className="text-[10px] text-muted-foreground/60 leading-none">{admin.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <span>{admin.office_name}</span>
                        {admin.manual_discount_percent > 0 && <Badge variant="outline" className="text-[9px] h-4 px-1 border-blue-200 text-blue-500 font-bold">-{admin.manual_discount_percent}%</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(admin.payment_status, admin.is_trial, admin.is_lifetime)}
                        {!admin.active && <Badge className="bg-rose-500 text-[9px] px-1 h-4 rounded-sm">SUSPENSO</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-sm font-bold opacity-80">
                      {admin.end_date ? format(new Date(admin.end_date), "dd/MM/yyyy") : <span className="text-muted-foreground italic text-xs font-normal">Pendente</span>}
                    </TableCell>
                    <TableCell className="py-3 text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog open={dialogOpen && selectedAdmin?.office_id === admin.office_id} onOpenChange={(open) => {
                          if (open) {
                            setSelectedAdmin(admin);
                            setDialogOpen(true);
                          } else {
                            setDialogOpen(false);
                            // Limpar o cache após fechar se não salvou
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/80 rounded-full">
                              <Eye size={16} className="text-muted-foreground" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[550px] border-none shadow-2xl p-0 overflow-hidden bg-card/60 backdrop-blur-2xl">
                            <form onSubmit={handleSave}>
                              <div className="p-6 pb-2">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2 text-xl font-black">
                                    <Building2 className="text-primary" /> Editar Escritório
                                  </DialogTitle>
                                  <DialogDescription className="text-xs">Modifique as configurações institucionais e financeiras.</DialogDescription>
                                </DialogHeader>
                              </div>
                              
                              <div className="p-6 space-y-6">
                                {/* Dados Institucionais */}
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 border-b border-primary/10 pb-1">Perfil Institucional</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Nome do Escritório</Label>
                                      <Input 
                                        value={editFormData.office_name || ''} 
                                        onChange={(e) => setEditFormData({...editFormData, office_name: e.target.value})}
                                        className="h-9 bg-muted/30 border-none rounded-lg focus-visible:ring-primary/40"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">E-mail Institucional</Label>
                                      <Input 
                                        type="email"
                                        value={editFormData.office_email || ''} 
                                        onChange={(e) => setEditFormData({...editFormData, office_email: e.target.value})}
                                        className="h-9 bg-muted/30 border-none rounded-lg focus-visible:ring-primary/40"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Telefone</Label>
                                      <Input 
                                        value={editFormData.phone || ''} 
                                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                        className="h-9 bg-muted/30 border-none rounded-lg focus-visible:ring-primary/40"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Endereço Completo</Label>
                                      <Input 
                                        value={editFormData.address || ''} 
                                        onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                                        className="h-9 bg-muted/30 border-none rounded-lg focus-visible:ring-primary/40"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Regras Financeiras */}
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 border-b border-primary/10 pb-1">Faturamento e Cobrança</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-primary/5 rounded-xl flex items-center justify-between border border-primary/10">
                                      <div className="space-y-0.5">
                                        <Label className="text-xs font-bold leading-tight">Plano Vitalício</Label>
                                        <p className="text-[9px] text-muted-foreground">Ignora bloqueios de assinatura.</p>
                                      </div>
                                      <Checkbox 
                                        checked={editFormData.is_lifetime || false}
                                        onCheckedChange={(checked) => setEditFormData({...editFormData, is_lifetime: !!checked})}
                                        className="border-primary/40"
                                      />
                                    </div>
                                    <div className="p-3 bg-muted/20 rounded-xl space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Desconto (%)</Label>
                                      <div className="relative">
                                        <Input 
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={editFormData.manual_discount_percent || 0}
                                          onChange={(e) => setEditFormData({...editFormData, manual_discount_percent: parseFloat(e.target.value) || 0})}
                                          className="h-8 bg-transparent border-none p-0 text-sm focus-visible:ring-0"
                                        />
                                        <Percent size={12} className="absolute right-0 top-1.5 text-muted-foreground opacity-50" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <DialogFooter className="p-6 pt-2 bg-muted/10">
                                <Button type="submit" disabled={isSubmitting} className="w-full h-10 rounded-xl font-bold gap-2">
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
                          onClick={() => sendPaymentReminder(admin.email || '', admin.office_name || '')} 
                          className="h-8 w-8 p-0 text-blue-500/60 hover:text-blue-500 hover:bg-blue-50/10 rounded-full"
                        >
                          <CreditCard size={15} />
                        </Button>

                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateOfficeStatus(admin.office_id || '', !admin.active)}
                          className={`h-8 w-8 p-0 rounded-full ${admin.active ? 'hover:bg-rose-50/10 text-rose-500/60 hover:text-rose-500' : 'hover:bg-emerald-50/10 text-emerald-500/60 hover:text-emerald-500'}`}
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
      <div className="footer-meta text-[9px] font-bold text-muted-foreground/30 text-center uppercase tracking-[0.3em] pb-10">
        Vextria Panel Stable v1.3 • Data Sync: {format(new Date(), 'HH:mm')}
      </div>
    </div>
  );
};