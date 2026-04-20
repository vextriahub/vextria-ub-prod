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
        
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Novo Processo</DialogTitle>
            <DialogDescription>
              Crie um novo processo jurídico preenchendo as informações abaixo.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto px-6">
            <form onSubmit={handleSubmit} className="space-y-8 py-4">
              {/* Seção 1: Identificação Básica */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                  <Info className="h-4 w-4" />
                  <span>Identificação Básica</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="titulo">Título do Processo *</Label>
                    <Input
                      id="titulo"
                      required
                      value={formData.titulo}
                      onChange={(e) => handleChange('titulo', e.target.value)}
                      placeholder="Ex: Ação Trabalhista - Cliente X"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cliente">Cliente *</Label>
                    <Input
                      id="cliente"
                      required
                      value={formData.cliente}
                      onChange={(e) => handleChange('cliente', e.target.value)}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numeroProcesso">Número do Processo (CNJ)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="numeroProcesso"
                        value={formData.numeroProcesso || ''}
                        onChange={(e) => handleChange('numeroProcesso', formatCNJ(e.target.value))}
                        placeholder="0000000-00.0000.0.00.0000"
                        className="font-mono"
                      />
                      <JudicialSyncDialog 
                        onImport={handleImportedSync}
                        trigger={
                          <Button type="button" variant="outline" size="icon" title="Sincronizar via OAB">
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Capa Jurídica */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                  <Gavel className="h-4 w-4" />
                  <span>Capa Jurídica</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tribunal">Tribunal / Instância</Label>
                    <Input
                      id="tribunal"
                      value={formData.tribunal || ''}
                      onChange={(e) => handleChange('tribunal', e.target.value)}
                      placeholder="Ex: TJSP, TRT2..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comarca">Comarca / Foro</Label>
                    <Input
                      id="comarca"
                      value={formData.comarca || ''}
                      onChange={(e) => handleChange('comarca', e.target.value)}
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vara">Vara / Secretaria</Label>
                    <Input
                      id="vara"
                      value={formData.vara || ''}
                      onChange={(e) => handleChange('vara', e.target.value)}
                      placeholder="Ex: 2ª Vara Cível"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requerido">Parte Contraria (Requerido)</Label>
                    <Input
                      id="requerido"
                      value={formData.requerido || ''}
                      onChange={(e) => handleChange('requerido', e.target.value)}
                      placeholder="Nome do réu/oponente"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Gestão Processual */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                  <Scale className="h-4 w-4" />
                  <span>Gestão e Prazos</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: any) => handleChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusProcesso.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fase Processual</Label>
                    <Select 
                      value={formData.faseProcessual} 
                      onValueChange={(value) => handleChange('faseProcessual', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a fase" />
                      </SelectTrigger>
                      <SelectContent>
                        {fasesProcessuais.map(f => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo do Processo / Área</Label>
                    <Select 
                      value={formData.tipoProcesso} 
                      onValueChange={(value) => handleChange('tipoProcesso', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposProcesso.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Responsável</Label>
                    <Select 
                      value={formData.responsavelId} 
                      onValueChange={(value) => handleChange('responsavelId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar responsável" />
                      </SelectTrigger>
                      <SelectContent>
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
                    <Label htmlFor="proximoPrazo">Próximo Prazo</Label>
                    <Input
                      id="proximoPrazo"
                      type="date"
                      value={formData.proximoPrazo || ''}
                      onChange={(e) => handleChange('proximoPrazo', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valorCausa">Valor da Causa (R$)</Label>
                    <Input
                      id="valorCausa"
                      type="number"
                      step="0.01"
                      value={formData.valorCausa || ''}
                      onChange={(e) => handleChange('valorCausa', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 4: Opções e Observações */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Configurações Extras</span>
                </div>
                <div className="flex flex-wrap gap-6 py-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="segredoJustica" 
                      checked={formData.segredoJustica}
                      onCheckedChange={(checked) => handleChange('segredoJustica', !!checked)}
                    />
                    <Label htmlFor="segredoJustica" className="cursor-pointer">Segredo de Justiça</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="justicaGratuita" 
                      checked={formData.justicaGratuita}
                      onCheckedChange={(checked) => handleChange('justicaGratuita', !!checked)}
                    />
                    <Label htmlFor="justicaGratuita" className="cursor-pointer">Justiça Gratuita</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição / Observações</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao || ''}
                    onChange={(e) => handleChange('descricao', e.target.value)}
                    placeholder="Notas adicionais sobre o processo..."
                    rows={3}
                  />
                </div>
              </div>

              {isLimitReached && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md text-amber-800 text-sm">
                  <p className="font-semibold flex items-center gap-2">
                    ⚠️ Limite de processos atingido
                  </p>
                  <p>Seu plano atual permite até {limits.processes.max} processos. Faça um upgrade para continuar.</p>
                </div>
              )}

              <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-2 mt-4 z-10 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading || isLimitReached}>
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
