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
  const { toast } = useToast();

  const handleCnjSearch = async () => {
    if (!cnjInput) return;
    setCnjLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const { data, error } = await supabase.functions.invoke('fetch-processo', {
        body: { numeroProcesso: cnjInput },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (error) throw error;
      if (data) {
        // Mapear para o formato que onAddProcesso espera ou abrir o form manual pré-preenchido
        // Para simplificar agora, vamos direto para o formulário manual mas com os dados injetados
        // No futuro, isso pode ser integrado melhor
        toast({
          title: "Processo encontrado!",
          description: "Dados básicos capturados. Finalize o cadastro manualmente.",
        });
        setMode('manual');
      }
    } catch (error: any) {
      console.error('Erro ao buscar CNJ:', error);
      toast({
        title: "Não encontrado",
        description: "Não conseguimos localizar este processo no DataJud. Você pode cadastrar manualmente.",
        variant: "destructive"
      });
      setMode('manual');
    } finally {
      setCnjLoading(false);
    }
  };

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
