import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  RotateCw, 
  ShieldCheck, 
  Gavel, 
  User, 
  Loader2, 
  ChevronRight,
  Database
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const UFs = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

export interface JudicialProcessResult {
  id: string;
  numeroProcesso: string;
  titulo: string;
  partes: string;
  tribunal: string;
  ultimoAndamento: {
    descricao: string;
    data: string;
  } | null;
  faseProcessual: string;
  valorCausa?: number;
  vara?: string;
  comarca?: string;
}

interface JudicialSyncContentProps {
  onImport: (processes: JudicialProcessResult[]) => Promise<void>;
  onCancel?: () => void;
}

export const JudicialSyncContent: React.FC<JudicialSyncContentProps> = ({
  onImport,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [oab, setOab] = useState('');
  const [uf, setUf] = useState('SP');
  const [results, setResults] = useState<JudicialProcessResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!oab) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o número da OAB.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResults([]);
    setSelectedIds(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('fetch-processo', {
        body: { oab, uf }
      });

      if (error) {
        console.error("DEBUG - Erro na Function:", error);
        
        let msg = "Não foi possível conectar ao serviço de busca.";
        
        // Se for erro de rede/CORS
        if (error.message?.includes("Failed to fetch") || !error.status) {
          msg = "Erro de conexão ou bloqueio de segurança (CORS). Verifique sua rede ou tente novamente.";
        } else if (error.status === 403) {
          msg = "Acesso negado pelo tribunal (TJDFT). O tribunal restringiu buscas automáticas por esta OAB.";
        } else if (error.message) {
          msg = error.message;
        }
        
        throw new Error(msg);
      }

      if (!data || data.length === 0) {
        toast({
          title: "Nenhum processo encontrado",
          description: `Não encontramos processos públicos para a OAB ${oab}-${uf} no TJ local.`,
        });
      } else {
        setResults(data);
        toast({
          title: "Busca concluída",
          description: `Encontramos ${data.length} processos vinculados à sua OAB.`,
        });
      }
    } catch (error: any) {
      console.error('Erro na busca por OAB:', error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível conectar ao tribunal nacional. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map(r => r.id)));
    }
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;

    setImporting(true);
    try {
      const selectedProcesses = results.filter(r => selectedIds.has(r.id));
      await onImport(selectedProcesses);
      
      toast({
        title: "Importação concluída",
        description: `${selectedIds.size} processos foram importados para o seu Hub.`,
      });
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar alguns processos.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-transparent">
      {/* Busca */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end p-1">
        <div className="space-y-2">
          <Label className="text-white/60">UF do Tribunal</Label>
          <Select value={uf} onValueChange={setUf}>
            <SelectTrigger className="bg-white/5 border-white/10 h-11">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              {UFs.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label className="text-white/60">Número da OAB (Somente dígitos)</Label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-10 bg-white/5 border-white/10 h-11"
              placeholder="Ex: 123456" 
              value={oab}
              onChange={(e) => setOab(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>
        <Button onClick={handleSearch} disabled={loading} className="gap-2 h-11 bg-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? 'Buscando...' : 'Buscar Processos'}
        </Button>
      </div>

      <Separator className="mb-6 bg-white/10" />

      {/* Resultados */}
      <div className="flex-1 flex flex-col min-h-0 border border-white/5 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md">
        <div className="bg-white/5 p-3 border-b border-white/5 flex items-center justify-between px-6">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-white/90">
            <Gavel className="h-4 w-4 text-primary" />
            Resultados encontrados {results.length > 0 && `(${results.length})`}
          </h4>
          {results.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/40">{selectedIds.size} selecionados</span>
              <Button variant="link" size="sm" onClick={toggleSelectAll} className="h-auto p-0 text-primary hover:text-primary/80">
                {selectedIds.size === results.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </Button>
            </div>
          )}
        </div>
        
        <ScrollArea className="flex-1 h-[300px]">
          {results.length > 0 ? (
            <Table>
              <TableHeader className="bg-white/5 sticky top-0 z-10">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="text-white/60 text-xs uppercase tracking-wider font-bold">Processo / Partes</TableHead>
                  <TableHead className="text-white/60 text-xs uppercase tracking-wider font-bold">Último Andamento</TableHead>
                  <TableHead className="text-white/60 text-xs uppercase tracking-wider font-bold">Fase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((proc) => (
                  <TableRow key={proc.id} className="group border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.has(proc.id)} 
                        onCheckedChange={() => toggleSelect(proc.id)}
                        className="border-white/20 data-[state=checked]:bg-primary"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs font-bold text-primary">{proc.numeroProcesso}</span>
                        <span className="text-sm font-medium line-clamp-1 text-white/90">{proc.partes}</span>
                        <span className="text-[10px] text-white/40">{proc.tribunal}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {proc.ultimoAndamento ? (
                        <div className="flex flex-col gap-1 max-w-[250px]">
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20 w-fit">
                            {new Date(proc.ultimoAndamento.data).toLocaleDateString()}
                          </span>
                          <span className="text-xs line-clamp-2 italic text-white/60">{proc.ultimoAndamento.descricao}</span>
                        </div>
                      ) : <span className="text-white/20 italic">---</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] whitespace-nowrap bg-white/5 border-white/10 text-white/60">
                        {proc.faseProcessual}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-white/20">
              {loading ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                  <p className="text-white/60 animate-pulse">Consultando banco de dados nacional do CNJ...</p>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 mb-4 opacity-10" />
                  <p className="text-lg font-medium text-white/40">Pronto para buscar</p>
                  <p className="text-xs mt-2 max-w-[200px] mx-auto">Informe sua OAB principal e o estado do tribunal para sincronizar processos.</p>
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="mt-8 flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5">
        <Button variant="ghost" onClick={onCancel} disabled={importing} className="text-white/40 hover:text-white">
          Cancelar
        </Button>
        <Button 
          onClick={handleImport} 
          disabled={selectedIds.size === 0 || importing}
          className="gap-2 px-8 bg-primary shadow-lg shadow-primary/20 h-11"
        >
          {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
          {importing ? 'Importando...' : `Importar ${selectedIds.size} Processos Selecionados`}
        </Button>
      </div>
    </div>
  );
};

interface JudicialSyncDialogProps {
  onImport: (processes: JudicialProcessResult[]) => Promise<void>;
  trigger?: React.ReactNode;
}

export const JudicialSyncDialog: React.FC<JudicialSyncDialogProps> = ({
  onImport,
  trigger
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <RotateCw className="h-4 w-4" />
            Sincronizar OAB
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] bg-background/40 backdrop-blur-3xl border-white/5 p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Sincronização Judicial (PJE/CNJ)</DialogTitle>
              <DialogDescription className="text-white/40">
                Busque processos vinculados à sua OAB e importe-os seletivamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pb-10">
          <JudicialSyncContent 
            onImport={async (procs) => {
              await onImport(procs);
              setOpen(false);
            }} 
            onCancel={() => setOpen(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
