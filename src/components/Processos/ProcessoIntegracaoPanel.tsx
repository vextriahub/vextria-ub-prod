import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw, Search, Plus, ArrowLeft, Loader2, Info, Gavel } from 'lucide-react';
import { JudicialSyncContent } from './JudicialSyncDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCNJ } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProcessoIntegracaoPanelProps {
  onAddProcesso: (processo: any) => Promise<void>;
  onSuccess: () => void;
}

export const ProcessoIntegracaoPanel: React.FC<ProcessoIntegracaoPanelProps> = ({
  onAddProcesso,
  onSuccess
}) => {
  const [mode, setMode] = useState<'choice' | 'oab' | 'cnj' | 'manual'>('choice');
  const [cnjLoading, setCnjLoading] = useState(false);
  const [cnjInput, setCnjInput] = useState('');
  const [capturedData, setCapturedData] = useState<any>(null);
  const { toast } = useToast();

  const handleCnjSearch = async () => {
    if (!cnjInput) return;
    setCnjLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(`https://xrtmyhuqbbtaelczemag.supabase.co/functions/v1/fetch-processo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': 'sb_publishable_RQVoreC1A29Ix5EtrxsB7A_nkvwR7xQ'
        },
        body: JSON.stringify({ numeroProcesso: cnjInput })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Erro ${response.status}: Processo não localizado.`);
      }

      const data = await response.json();
      if (data) {
        console.log('📋 Dados capturados CNJ:', data);
        setCapturedData(data);
        toast({
          title: "Processo encontrado!",
          description: "Dados básicos capturados. Finalize o cadastro abaixo.",
        });
        setMode('manual');
      } else {
        throw new Error("Dados não retornados pela API.");
      }
    } catch (error: any) {
      console.error('Erro ao buscar CNJ:', error);
      toast({
        title: "Não encontrado",
        description: error.message || "Não conseguimos localizar este processo. Verifique o número ou cadastre manualmente.",
        variant: "destructive"
      });
      // Mesmo com erro, permite ir pro manual se quiser
      if (error.message?.includes('não localizado')) {
          setMode('manual');
      }
    } finally {
      setCnjLoading(false);
    }
  };

  if (mode === 'manual') {
    return (
      <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => {
            setMode('choice');
            setCapturedData(null);
          }} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">Finalizar Cadastro</h2>
            <p className="text-white/40 text-sm">Revise os dados capturados e complete o registro</p>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto w-full">
          <ManualProcessoForm 
            initialData={capturedData} 
            onSave={async (data) => {
              await onAddProcesso(data);
              onSuccess();
            }}
            onCancel={() => {
              setMode('choice');
              setCapturedData(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (mode === 'oab') {
    return (
      <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setMode('choice')} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">Sincronização via OAB</h2>
            <p className="text-white/40 text-sm">Busca automática em tribunais (PJE/DataJud)</p>
          </div>
        </div>
        <div className="flex-1 bg-white/5 rounded-3xl border border-white/5 p-8 backdrop-blur-3xl overflow-hidden min-h-[600px] flex flex-col">
          <JudicialSyncContent 
            onImport={async (procs) => {
              await onAddProcesso(procs);
              onSuccess();
            }}
            onCancel={() => setMode('choice')}
          />
        </div>
      </div>
    );
  }

  if (mode === 'cnj') {
    return (
      <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setMode('choice')} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">Busca Inteligente CNJ</h2>
            <p className="text-white/40 text-sm">Preenchimento automático via número do processo</p>
          </div>
        </div>
        
        <Card className="max-w-2xl mx-auto w-full p-12 bg-white/5 border-white/5 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl">
          <div className="space-y-8 text-center">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Search className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Informe o número CNJ</h3>
              <p className="text-sm text-white/40">Buscaremos os dados da capa do processo para você.</p>
            </div>
            
            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2 text-left">
                <Label className="text-white/60 ml-1">Número do Processo</Label>
                <Input 
                  placeholder="0000000-00.0000.0.00.0000"
                  value={cnjInput}
                  onChange={(e) => setCnjInput(formatCNJ(e.target.value))}
                  className="h-14 bg-white/10 border-white/10 rounded-2xl font-mono text-center tracking-widest text-xl"
                />
              </div>
              <Button 
                className="w-full h-14 rounded-2xl font-bold text-lg bg-emerald-600 hover:bg-emerald-500" 
                onClick={handleCnjSearch}
                disabled={cnjLoading || cnjInput.length < 15}
              >
                {cnjLoading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Search className="h-6 w-6 mr-2" />}
                {cnjLoading ? "Consultando..." : "Consultar e Avançar"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-10 animate-in fade-in duration-700">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-4xl font-black bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
          Como deseja iniciar?
        </h2>
        <p className="text-white/40 text-lg">
          Escolha uma das opções abaixo para adicionar processos ao seu escritório.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {/* Card OAB */}
        <Card 
          className="group relative overflow-hidden cursor-pointer bg-white/5 border-white/5 hover:bg-primary/20 hover:border-primary/30 transition-all p-10 space-y-6 rounded-[3rem] shadow-xl hover:-translate-y-2"
          onClick={() => setMode('oab')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <RotateCw className="h-24 w-24 -mr-8 -mt-8" />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <RotateCw className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-bold text-white">Sincronismo OAB</h4>
            <p className="text-sm text-white/40 leading-relaxed">
              Busca automática e inteligente em diversos tribunais simultaneamente através do seu número OAB. Ideal para importação em massa.
            </p>
          </div>
          <div className="pt-4">
            <Button className="w-full rounded-2xl font-bold group-hover:bg-primary group-hover:text-white transition-colors" variant="outline">
              Iniciar Sincronismo
            </Button>
          </div>
        </Card>

        {/* Card CNJ */}
        <Card 
          className="group relative overflow-hidden cursor-pointer bg-white/5 border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all p-10 space-y-6 rounded-[3rem] shadow-xl hover:-translate-y-2"
          onClick={() => setMode('cnj')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Search className="h-24 w-24 -mr-8 -mt-8" />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Search className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-bold text-white">Busca por CNJ</h4>
            <p className="text-sm text-white/40 leading-relaxed">
              Informe o número CNJ e deixe que nossa IA busque o processo nos tribunais e preencha todos os dados básicos da capa automaticamente.
            </p>
          </div>
          <div className="pt-4">
            <Button className="w-full rounded-2xl font-bold group-hover:bg-emerald-500 group-hover:text-white transition-colors" variant="outline">
              Buscar Processo
            </Button>
          </div>
        </Card>

        {/* Card Manual */}
        <Card 
          className="group relative overflow-hidden cursor-pointer bg-white/5 border-white/10 hover:bg-amber-500/20 hover:border-amber-500/30 transition-all p-10 space-y-6 rounded-[3rem] shadow-xl hover:-translate-y-2"
          onClick={() => {
            toast({
              title: "Funcionalidade em breve",
              description: "O cadastro manual completo está sendo movido para esta aba. Por enquanto utilize o botão 'Novo Processo' acima.",
            });
          }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Plus className="h-24 w-24 -mr-8 -mt-8" />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <Plus className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-bold text-white">Cadastro Manual</h4>
            <p className="text-sm text-white/40 leading-relaxed">
              Prefere controle total? Insira cada detalhe do processo manualmente, desde a vara até o valor da causa e observações.
            </p>
          </div>
          <div className="pt-4">
            <Button className="w-full rounded-2xl font-bold group-hover:bg-amber-500 group-hover:text-white transition-colors" variant="outline">
              Cadastrar Manual
            </Button>
          </div>
        </Card>
      </div>

      <div className="max-w-xl mx-auto p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 flex items-center gap-4 text-sm text-blue-300">
        <Info className="h-6 w-6 shrink-0" />
        <p>A sincronização judicial consome créditos do seu plano. Novos advogados possuem limites diferenciados para a busca profunda da OAB.</p>
      </div>
    </div>
  );
};

interface ManualProcessoFormProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const ManualProcessoForm: React.FC<ManualProcessoFormProps> = ({ initialData, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: initialData?.titulo || '',
    numeroProcesso: initialData?.numeroProcesso || '',
    status: 'Em andamento',
    tipoProcesso: initialData?.classeNome || 'Cível',
    tribunal: initialData?.tribunal || '',
    comarca: initialData?.comarca || '',
    vara: initialData?.vara || '',
    requerido: initialData?.partes?.[1]?.nome || initialData?.requerido || '',
    valorCausa: initialData?.valorCausa || 0,
    descricao: initialData?.descricao || initialData?.movimentacoes?.[0]?.descricao || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 bg-white/5 border-white/5 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-white/60 ml-1">Título do Processo / Autor *</Label>
            <Input 
              required
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              placeholder="Ex: João da Silva x Banco SA"
              className="h-12 bg-white/10 border-white/10 rounded-xl focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/60 ml-1">Número do Processo (CNJ)</Label>
            <Input 
              value={formData.numeroProcesso}
              onChange={(e) => setFormData({...formData, numeroProcesso: formatCNJ(e.target.value)})}
              placeholder="0000000-00.0000.0.00.0000"
              className="h-12 bg-white/10 border-white/10 rounded-xl font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/60 ml-1">Tipo / Classe Processual</Label>
            <Input 
              value={formData.tipoProcesso}
              onChange={(e) => setFormData({...formData, tipoProcesso: e.target.value})}
              placeholder="Ex: Procedimento Comum Cível"
              className="h-12 bg-white/10 border-white/10 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/60 ml-1">Tribunal</Label>
            <Input 
              value={formData.tribunal}
              onChange={(e) => setFormData({...formData, tribunal: e.target.value})}
              placeholder="Ex: TJSP"
              className="h-12 bg-white/10 border-white/10 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/60 ml-1">Vara / Secretaria</Label>
            <Input 
              value={formData.vara}
              onChange={(e) => setFormData({...formData, vara: e.target.value})}
              placeholder="Ex: 2ª Vara Cível"
              className="h-12 bg-white/10 border-white/10 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/60 ml-1">Comarca</Label>
            <Input 
              value={formData.comarca}
              onChange={(e) => setFormData({...formData, comarca: e.target.value})}
              placeholder="Ex: São Paulo"
              className="h-12 bg-white/10 border-white/10 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/60 ml-1">Parte Ré / Requerido</Label>
            <Input 
              value={formData.requerido}
              onChange={(e) => setFormData({...formData, requerido: e.target.value})}
              placeholder="Ex: Empresa de Energia S.A."
              className="h-12 bg-white/10 border-white/10 rounded-xl"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-white/60 ml-1">Observações / Último Andamento</Label>
            <Textarea 
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Informações adicionais sobre o processo..."
              className="bg-white/10 border-white/10 rounded-xl min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/5"
          >
            Cancelar
          </Button>
          <Button 
            disabled={loading}
            type="submit" 
            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/80 font-bold"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Concluir Cadastro"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
