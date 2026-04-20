import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, FileText, Scale, User, Gavel, ShieldCheck, Info, RotateCw } from 'lucide-react';
import { usePlanLimits } from '@/hooks/usePlanFeatures';
import { useToast } from '@/hooks/use-toast';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';
import { useOfficeUsers } from '@/hooks/useOfficeUsers';
import { useAuth } from '@/contexts/AuthContext';
import { NovoProcessoForm, tiposProcesso, statusProcesso, fasesProcessuais } from '@/types/processo';
import { Separator } from '@/components/ui/separator';
import { formatCNJ, unformatCNJ } from '@/lib/formatters';
import { JudicialSyncDialog } from './JudicialSyncDialog';

interface NovoProcessoDialogProps {
  onAddProcesso: (processo: any) => void;
  trigger?: React.ReactNode;
}

export const NovoProcessoDialog: React.FC<NovoProcessoDialogProps> = ({
  onAddProcesso,
  trigger
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { limits } = usePlanLimits();
  const { users: teamMembers } = useOfficeUsers();
  const isLimitReached = limits.processes.isReached;
  
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<NovoProcessoForm>({
    titulo: '',
    cliente: '',
    status: 'Em andamento',
    proximoPrazo: '',
    descricao: '',
    valorCausa: 0,
    numeroProcesso: '',
    tipoProcesso: '',
    faseProcessual: 'Fase Inicial',
    responsavelId: user?.id || '',
    tribunal: '',
    vara: '',
    comarca: '',
    requerido: '',
    segredoJustica: false,
    justicaGratuita: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) return;
    
    setIsLoading(true);
    try {
      // Simulação de criação (na verdade o hook useProcessos lida com isso em produção)
      const novoProcesso = {
        ...formData,
        id: Date.now().toString(), // ID temporário
        dataInicio: new Date().toISOString().split('T')[0],
        valorCausa: formData.valorCausa || 0
      };

      onAddProcesso(novoProcesso);
      
      // Resetar formulário
      setFormData({
        titulo: '',
        cliente: '',
        status: 'Em andamento',
        proximoPrazo: '',
        descricao: '',
        valorCausa: 0,
        numeroProcesso: '',
        tipoProcesso: '',
        faseProcessual: 'Fase Inicial',
        responsavelId: user?.id || '',
        tribunal: '',
        vara: '',
        comarca: '',
        requerido: '',
        segredoJustica: false,
        justicaGratuita: false
      });
      
      setOpen(false);
      
      toast({
        title: "Processo criado",
        description: "O novo processo foi criado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      toast({
        title: "Erro ao criar",
        description: "Ocorreu um erro ao criar o processo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportedSync = async (processes: any[]) => {
    try {
      for (const proc of processes) {
        await onAddProcesso({
          titulo: proc.titulo,
          cliente: 'Importado via OAB', // Nome padrão ou extrair do título
          status: 'Em andamento',
          numeroProcesso: proc.numeroProcesso,
          tribunal: proc.tribunal,
          vara: proc.ultimoAndamento?.descricao || '', // Mapear algo útil
          faseProcessual: proc.faseProcessual,
          valorCausa: proc.valorCausa || 0,
          descricao: `Importado via OAB. Último andamento: ${proc.ultimoAndamento?.descricao || 'N/A'}`
        });
      }
    } catch (error) {
      console.error('Erro ao importar processos da OAB:', error);
    }
  };

  const handleChange = (field: keyof NovoProcessoForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Nova Processo
    </Button>
  );

  return (
    <PermissionGuard permissions={['admin', 'owner', 'super_admin']}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[800px] bg-background/40 backdrop-blur-3xl border-white/5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="p-8 pb-4 border-b border-white/5">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Novo Processo
            </DialogTitle>
            <DialogDescription className="text-white/40">
              Crie um novo processo jurí­dico preenchendo as informações abaixo.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto px-8">
            <form onSubmit={handleSubmit} className="space-y-10 py-6">
              {/* Seção 1: Identificação Básica */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white/90">Identificação Básica</h3>
                    <p className="text-xs text-white/40">Informações principais do processo</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="titulo" className="text-white/60">Título do Processo *</Label>
                    <Input
                      id="titulo"
                      required
                      value={formData.titulo}
                      onChange={(e) => handleChange('titulo', e.target.value)}
                      placeholder="Ex: Ação Trabalhista - Cliente X"
                      className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cliente" className="text-white/60">Cliente *</Label>
                    <Input
                      id="cliente"
                      required
                      value={formData.cliente}
                      onChange={(e) => handleChange('cliente', e.target.value)}
                      placeholder="Nome do cliente"
                      className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numeroProcesso" className="text-white/60">Número do Processo (CNJ)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="numeroProcesso"
                        value={formData.numeroProcesso || ''}
                        onChange={(e) => handleChange('numeroProcesso', formatCNJ(e.target.value))}
                        placeholder="0000000-00.0000.0.00.0000"
                        className="font-mono bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-11 flex-1"
                      />
                      <JudicialSyncDialog 
                        onImport={handleImportedSync}
                        trigger={
                          <Button type="button" variant="outline" size="icon" title="Sincronizar via OAB" className="h-11 w-11 border-white/10 hover:bg-white/5">
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Capa Jurí­dica */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <Gavel className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white/90">Capa Jurí­dica</h3>
                    <p className="text-xs text-white/40">Dados de localização do processo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                  <div className="space-y-2">
                    <Label htmlFor="tribunal" className="text-white/60">Tribunal / Instância</Label>
                    <Input
                      id="tribunal"
                      value={formData.tribunal || ''}
                      onChange={(e) => handleChange('tribunal', e.target.value)}
                      placeholder="Ex: TJSP, TRT2..."
                      className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comarca" className="text-white/60">Comarca / Foro</Label>
                    <Input
                      id="comarca"
                      value={formData.comarca || ''}
                      onChange={(e) => handleChange('comarca', e.target.value)}
                      placeholder="Ex: São Paulo"
                      className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vara" className="text-white/60">Vara / Secretaria</Label>
                    <Input
                      id="vara"
                      value={formData.vara || ''}
                      onChange={(e) => handleChange('vara', e.target.value)}
                      placeholder="Ex: 2ª Vara Cí­vel"
                      className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requerido" className="text-white/60">Parte Contraria (Requerido)</Label>
                    <Input
                      id="requerido"
                      value={formData.requerido || ''}
                      onChange={(e) => handleChange('requerido', e.target.value)}
                      placeholder="Nome do réu/oponente"
                      className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Gestão Processual */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Scale className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white/90">Gestão e Prazos</h3>
                    <p className="text-xs text-white/40">Status, fase e responsabilidades</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                  <div className="space-y-2">
                    <Label className="text-white/60">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: any) => handleChange('status', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 h-11">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        {statusProcesso.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/60">Fase Processual</Label>
                    <Select 
                      value={formData.faseProcessual} 
                      onValueChange={(value) => handleChange('faseProcessual', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 h-11">
                        <SelectValue placeholder="Selecione a fase" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        {fasesProcessuais.map(f => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/60">Responsável</Label>
                    <Select 
                      value={formData.responsavelId} 
                      onValueChange={(value) => handleChange('responsavelId', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 h-11">
                        <SelectValue placeholder="Selecionar responsável" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        {teamMembers.length > 0 ? (
                          teamMembers.map((member) => (
                            <SelectItem key={member.user_id} value={member.user_id || ''}>
                              {member.profile?.full_name || member.profile?.email || 'Membro sem nome'}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value={user?.id || 'none'} disabled>
                            {user?.full_name || 'Carregando membros...'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proximoPrazo" className="text-white/60">Próximo Prazo</Label>
                    <Input
                      id="proximoPrazo"
                      type="date"
                      value={formData.proximoPrazo || ''}
                      onChange={(e) => handleChange('proximoPrazo', e.target.value)}
                      className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-11 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 4: Configurações Extras */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <ShieldCheck className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white/90">Configurações Extras</h3>
                    <p className="text-xs text-white/40">Opções adicionais do processo</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-6">
                  <div className="flex flex-wrap gap-10">
                    <div className="flex items-center space-x-3 group cursor-pointer">
                      <Checkbox 
                        id="segredoJustica" 
                        checked={formData.segredoJustica}
                        onCheckedChange={(checked) => handleChange('segredoJustica', !!checked)}
                        className="border-white/20 data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor="segredoJustica" className="cursor-pointer text-white/70 group-hover:text-white transition-colors">Segredo de Justiça</Label>
                    </div>
                    <div className="flex items-center space-x-3 group cursor-pointer">
                      <Checkbox 
                        id="justicaGratuita" 
                        checked={formData.justicaGratuita}
                        onCheckedChange={(checked) => handleChange('justicaGratuita', !!checked)}
                        className="border-white/20 data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor="justicaGratuita" className="cursor-pointer text-white/70 group-hover:text-white transition-colors">Justiça Gratuita</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descricao" className="text-white/60">Descrição / Observações</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao || ''}
                      onChange={(e) => handleChange('descricao', e.target.value)}
                      placeholder="Notas adicionais sobre o processo..."
                      rows={4}
                      className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {isLimitReached && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-400 text-sm">
                  <p className="font-semibold flex items-center gap-2">
                    ⚠️ Limite de processos atingido
                  </p>
                  <p className="mt-1">Seu plano atual permite até {limits.processes.max} processos. Faça um upgrade para continuar.</p>
                </div>
              )}

              <DialogFooter className="sticky bottom-0 bg-background/80 backdrop-blur-md pt-6 pb-2 mt-4 z-10 border-t border-white/5">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                  className="text-white/60 hover:text-white hover:bg-white/5"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || isLimitReached}
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-8"
                >
                  {isLoading ? "Criando..." : "Criar Processo"}
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  );
};
