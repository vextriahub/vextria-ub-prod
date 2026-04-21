import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Plus, FileText, Scale, User, Gavel, ShieldCheck, Info, RotateCw, Search, Loader2 } from 'lucide-react';
import { usePlanLimits } from '@/hooks/usePlanFeatures';
import { useToast } from '@/hooks/use-toast';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';
import { useOfficeUsers } from '@/hooks/useOfficeUsers';
import { useAuth } from '@/contexts/AuthContext';
import { NovoProcessoForm, tiposProcesso, statusProcesso, fasesProcessuais } from '@/types/processo';
import { Separator } from '@/components/ui/separator';
import { formatCNJ, unformatCNJ } from '@/lib/formatters';
import { JudicialSyncDialog, JudicialSyncContent } from './JudicialSyncDialog';

interface NovoProcessoDialogProps {
  onAddProcesso: (processo: any) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const NovoProcessoDialog: React.FC<NovoProcessoDialogProps> = ({
  onAddProcesso,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { limits } = usePlanLimits();
  const { users: teamMembers } = useOfficeUsers();
  const isLimitReached = limits.processes.isReached;
  
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;
  const [step, setStep] = useState<'choice' | 'oab' | 'cnj' | 'form'>('choice');
  const [isLoading, setIsLoading] = useState(false);
  const [cnjInput, setCnjInput] = useState('');
  
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

  const resetForm = () => {
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
    setStep('choice');
    setCnjInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) return;
    
    setIsLoading(true);
    try {
      const novoProcesso = {
        ...formData,
        id: Date.now().toString(),
        dataInicio: new Date().toISOString().split('T')[0],
        valorCausa: formData.valorCausa || 0
      };

      onAddProcesso(novoProcesso);
      resetForm();
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

  const handleCnjSearch = async () => {
    if (!cnjInput) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-processo', {
        body: { numeroProcesso: cnjInput }
      });

      if (error) throw error;
      if (data) {
        setFormData(prev => ({
          ...prev,
          titulo: data.titulo || '',
          numeroProcesso: data.numeroProcesso || cnjInput,
          tribunal: data.tribunal || '',
          vara: data.vara || '',
          valorCausa: data.valorCausa || 0,
          faseProcessual: data.faseProcessual || 'Fase Inicial',
          descricao: `Auto-preenchido via CNJ. Última movimentação: ${data.ultimoAndamento?.descricao || 'N/A'}`
        }));
        setStep('form');
        toast({
          title: "Processo encontrado!",
          description: "Os dados básicos foram preenchidos automaticamente.",
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar CNJ:', error);
      toast({
        title: "Não encontrado",
        description: "Não conseguimos localizar este processo no DataJud. Você pode cadastrar manualmente.",
        variant: "destructive"
      });
      setStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportedSync = async (processes: any[]) => {
    try {
      for (const proc of processes) {
        await onAddProcesso({
          titulo: proc.titulo,
          cliente: proc.clienteDestaque || 'Importado via OAB',
          clienteId: proc.clienteId,
          status: 'Em andamento',
          numeroProcesso: proc.numeroProcesso,
          tribunal: proc.tribunal,
          vara: proc.vara || '',
          faseProcessual: proc.faseProcessual,
          valorCausa: proc.valorCausa || 0,
          descricao: `Importado via OAB. Último andamento: ${proc.ultimoAndamento?.descricao || 'N/A'}`
        });
      }
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao importar processos da OAB:', error);
      throw error; // Propagar para JudicialSyncDialog resetar o loading
    }
  };

  const handleChange = (field: keyof NovoProcessoForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const defaultTrigger = (
    <Button className="h-12 px-6 rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
      <Plus className="h-5 w-5" />
      Novo Processo
    </Button>
  );

  return (
    <PermissionGuard permissions={['admin', 'owner', 'super_admin']}>
      <Dialog open={open} onOpenChange={(v) => { if(!v) resetForm(); setOpen(v); }}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        
        <DialogContent className={`sm:max-w-[800px] bg-background/40 backdrop-blur-3xl border-white/5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] p-0 overflow-hidden flex flex-col transition-all duration-300 ${step === 'oab' ? 'h-[90vh] max-h-[90vh]' : 'max-h-[95vh]'}`}>
          <DialogHeader className="p-8 pb-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  Novo Processo
                </DialogTitle>
                <DialogDescription className="text-white/40">
                  {step === 'choice' ? 'Escolha como deseja iniciar o cadastro.' : 'Preencha as informações do processo.'}
                </DialogDescription>
              </div>
              {step !== 'choice' && (
                <Button variant="ghost" size="sm" onClick={() => setStep('choice')} className="text-white/40 hover:text-white">
                  Voltar
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {step === 'oab' ? (
              <div className="flex-1 overflow-hidden flex flex-col px-8 pb-6">
                <JudicialSyncContent 
                  onImport={handleImportedSync}
                  onCancel={() => setStep('choice')}
                />
              </div>
            ) : (
              <ScrollArea className="flex-1 px-8">
                <div className="py-8">
                  {step === 'choice' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <Card 
                        className="group cursor-pointer bg-white/5 border-white/5 hover:bg-primary/10 hover:border-primary/20 transition-all p-6 text-center space-y-4 rounded-3xl"
                        onClick={() => setStep('oab')}
                      >
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                          <RotateCw className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-white/90">Sincronizar OAB</h4>
                          <p className="text-xs text-white/40">Busca automática em tribunais via número OAB</p>
                        </div>
                      </Card>

                      <Card 
                        className="group cursor-pointer bg-white/5 border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all p-6 text-center space-y-4 rounded-3xl"
                        onClick={() => setStep('cnj_search')}
                      >
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                          <Search className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-white/90">Buscar por CNJ</h4>
                          <p className="text-xs text-white/40">Digitar o número e preencher capa do processo</p>
                        </div>
                      </Card>

                      <Card 
                        className="group cursor-pointer bg-white/5 border-white/5 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all p-6 text-center space-y-4 rounded-3xl"
                        onClick={() => setStep('form')}
                      >
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                          <Plus className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-white/90">Cadastro Manual</h4>
                          <p className="text-xs text-white/40">Preencher cada informação manualmente</p>
                        </div>
                      </Card>
                    </div>
                  )}

                  {step === 'cnj_search' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="text-center space-y-2">
                         <h3 className="text-xl font-bold">Busca Automática CNJ</h3>
                         <p className="text-sm text-white/40">Informe o número do processo para preenchimento inteligente</p>
                      </div>
                      
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="space-y-2">
                          <Label className="text-white/60">Número do Processo (CNJ)</Label>
                          <Input 
                            placeholder="0000000-00.0000.0.00.0000"
                            value={cnjInput}
                            onChange={(e) => setCnjInput(formatCNJ(e.target.value))}
                            className="h-12 bg-white/5 border-white/10 rounded-xl font-mono text-center tracking-widest text-lg"
                          />
                        </div>
                        <Button 
                          className="w-full h-12 rounded-xl font-bold" 
                          onClick={handleCnjSearch}
                          disabled={isLoading || cnjInput.length < 15}
                        >
                          {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Search className="h-5 w-5 mr-2" />}
                          {isLoading ? "Buscando dados..." : "Buscar e Avançar"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 'form' && (
                    <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
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
                              className="bg-white/5 border-white/10 h-11"
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
                              className="bg-white/5 border-white/10 h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="numeroProcesso" className="text-white/60">Número do Processo (CNJ)</Label>
                            <Input
                              id="numeroProcesso"
                              value={formData.numeroProcesso || ''}
                              onChange={(e) => handleChange('numeroProcesso', formatCNJ(e.target.value))}
                              placeholder="0000000-00.0000.0.00.0000"
                              className="font-mono bg-white/5 border-white/10 h-11"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Seção 2: Capa Jurídica */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <Gavel className="h-5 w-5 text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white/90">Capa Jurídica</h3>
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
                              className="bg-white/5 border-white/10 h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="vara" className="text-white/60">Vara / Secretaria</Label>
                            <Input
                              id="vara"
                              value={formData.vara || ''}
                              onChange={(e) => handleChange('vara', e.target.value)}
                              className="bg-white/5 border-white/10 h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="requerido" className="text-white/60">Parte Contraria (Requerido)</Label>
                            <Input
                              id="requerido"
                              value={formData.requerido || ''}
                              onChange={(e) => handleChange('requerido', e.target.value)}
                              className="bg-white/5 border-white/10 h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="valorCausa" className="text-white/60">Valor da Causa</Label>
                            <Input
                              id="valorCausa"
                              type="number"
                              value={formData.valorCausa || 0}
                              onChange={(e) => handleChange('valorCausa', Number(e.target.value))}
                              className="bg-white/5 border-white/10 h-11"
                            />
                          </div>
                        </div>
                      </div>

                      <DialogFooter className="bg-white/5 p-6 rounded-2xl border border-white/5">
                        <Button variant="ghost" type="button" onClick={() => setStep('choice')}>Cancelar</Button>
                        <Button type="submit" disabled={isLoading || isLimitReached} className="px-8 bg-primary">
                          {isLoading ? "Salvando..." : "Finalizar Cadastro"}
                        </Button>
                      </DialogFooter>
                    </form>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  );
};
