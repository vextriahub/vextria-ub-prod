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
import { useProcessosV2 } from '@/hooks/useProcessosV2';
import { supabase } from '@/integrations/supabase/client';

interface NovoProcessoDialogProps {
  onAddProcesso: (processo: any) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: Partial<NovoProcessoForm>;
}

export const NovoProcessoDialog: React.FC<NovoProcessoDialogProps> = ({
  onAddProcesso,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  initialData
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { limits } = usePlanLimits();
  const { users: teamMembers } = useOfficeUsers();
  const { addMovimentacao } = useProcessosV2();
  const isLimitReached = limits.processes.isReached;
  
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;
  const [step, setStep] = useState<'choice' | 'oab' | 'cnj' | 'form'>('choice');
  const [isLoading, setIsLoading] = useState(false);
  const [cnjInput, setCnjInput] = useState('');
  
  const [formData, setFormData] = useState<NovoProcessoForm>({
    titulo: initialData?.titulo || '',
    cliente: initialData?.cliente || '',
    status: initialData?.status || 'Em andamento',
    proximoPrazo: initialData?.proximoPrazo || '',
    descricao: initialData?.descricao || '',
    valorCausa: initialData?.valorCausa || 0,
    numeroProcesso: initialData?.numeroProcesso || '',
    tipoProcesso: initialData?.tipoProcesso || '',
    faseProcessual: initialData?.faseProcessual || 'Fase Inicial',
    responsavelId: user?.id || '',
    tribunal: initialData?.tribunal || '',
    vara: initialData?.vara || '',
    comarca: initialData?.comarca || '',
    requerido: initialData?.requerido || '',
    segredoJustica: false,
    justicaGratuita: false
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        responsavelId: prev.responsavelId || user?.id || ''
      }));
      setStep('form'); // Pula direto pro form se tiver dados iniciais
    }
  }, [initialData, user?.id]);

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

      const createdProc = await onAddProcesso(novoProcesso);
      
      // Sincronizar movimentações se vierem do CNJ
      if (createdProc?.id && Array.isArray((formData as any).andamentos)) {
        const andamentos = (formData as any).andamentos;
        console.log(`📥 Salvando ${andamentos.length} movimentos pré-carregados`);
        for (const and of andamentos) {
          await addMovimentacao(createdProc.id, {
            data: and.data,
            descricao: and.resumo || and.descricao,
            tipo: 'andamento'
          });
        }
      }

      resetForm();
      setOpen(false);
      
      toast({
        title: "Processo criado",
        description: "O novo processo e seu histórico foram salvos.",
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
          andamentos: data.andamentos || [], // Guardar andamentos para o save
          descricao: `Auto-preenchido via CNJ. Última movimentação: ${data.ultimoAndamento?.descricao || 'N/A'}`
        }));
        setStep('form');
        toast({
          title: "Processo encontrado!",
          description: "Os dados básicos e histórico foram recuperados.",
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
        const createdProc = await onAddProcesso({
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

        // Sincronizar movimentações se existirem
        if (createdProc?.id && Array.isArray(proc.andamentos)) {
          console.log(`📥 Sincronizando ${proc.andamentos.length} movimentos para ${proc.numeroProcesso}`);
          for (const and of proc.andamentos) {
            await addMovimentacao(createdProc.id, {
              data: and.data,
              descricao: and.resumo || and.descricao,
              tipo: 'andamento'
            });
          }
        }
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
        
        <DialogContent className={`sm:max-w-[800px] bg-background/40 backdrop-blur-3xl border-white/5 shadow-2xl p-0 overflow-hidden rounded-[2.5rem] flex flex-col transition-all duration-300 ${step === 'oab' ? 'h-[90vh] max-h-[90vh]' : 'max-h-[95vh]'}`}>
          <DialogHeader className="p-10 pb-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Gavel className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Novo Processo
                  </DialogTitle>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
                    {step === 'choice' ? 'Selecione o método de entrada' : 
                     step === 'oab' ? 'Sincronização via OAB' : 
                     step === 'cnj_search' ? 'Busca Inteligente DataJud' : 'Cadastro Detalhado'}
                  </p>
                </div>
              </div>
              {step !== 'choice' && (
                <Button variant="ghost" size="sm" onClick={() => setStep('choice')} className="rounded-xl h-10 px-4 font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 p-2">
                      <Card 
                        className="group cursor-pointer bg-white/5 border-white/5 hover:bg-primary/10 hover:border-primary/20 transition-all p-8 text-center space-y-6 rounded-[2rem] border-2 border-transparent"
                        onClick={() => setStep('oab')}
                      >
                        <div className="mx-auto w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-indigo-500/5">
                          <RotateCw className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-black text-lg text-white group-hover:text-primary transition-colors">Sincronizar OAB</h4>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">Automação Completa via Tribunais</p>
                        </div>
                      </Card>

                      <Card 
                        className="group cursor-pointer bg-white/5 border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all p-8 text-center space-y-6 rounded-[2rem] border-2 border-transparent"
                        onClick={() => setStep('cnj_search')}
                      >
                        <div className="mx-auto w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shadow-lg shadow-emerald-500/5">
                          <Search className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-black text-lg text-white group-hover:text-emerald-400 transition-colors">Buscar por CNJ</h4>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">Extração de Capa via DataJud</p>
                        </div>
                      </Card>

                      <Card 
                        className="group cursor-pointer bg-white/5 border-white/5 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all p-8 text-center space-y-6 rounded-[2rem] border-2 border-transparent"
                        onClick={() => setStep('form')}
                      >
                        <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-amber-500/5">
                          <Plus className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-black text-lg text-white group-hover:text-amber-400 transition-colors">Manual</h4>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">Preenchimento Personalizado</p>
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
                    <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700 pb-10">
                      {/* Seção 1: Identificação Básica */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                            <Info className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-white/90 tracking-tight">Identificação Básica</h3>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Informações essenciais de registro</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-[2rem] bg-white/5 border border-white/5">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="titulo" className="text-white/60 ml-1 font-bold">Título do Processo *</Label>
                            <Input
                              id="titulo"
                              required
                              value={formData.titulo}
                              onChange={(e) => handleChange('titulo', e.target.value)}
                              placeholder="Ex: Ação Trabalhista - Cliente X"
                              className="bg-white/5 border-white/10 h-12 rounded-xl font-bold focus:ring-primary/20 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cliente" className="text-white/60 ml-1 font-bold">Cliente / Autor *</Label>
                            <Input
                              id="cliente"
                              required
                              value={formData.cliente}
                              onChange={(e) => handleChange('cliente', e.target.value)}
                              placeholder="Nome do cliente"
                              className="bg-white/5 border-white/10 h-12 rounded-xl font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="numeroProcesso" className="text-white/60 ml-1 font-bold">Número do Processo (CNJ)</Label>
                            <Input
                              id="numeroProcesso"
                              value={formData.numeroProcesso || ''}
                              onChange={(e) => handleChange('numeroProcesso', formatCNJ(e.target.value))}
                              placeholder="0000000-00.0000.0.00.0000"
                              className="font-mono bg-white/5 border-white/10 h-12 rounded-xl text-primary font-bold"
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
