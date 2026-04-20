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
  ultimoAndamento?: {
    descricao: string;
    data: string;
  };
  faseProcessual: string;
  valorCausa: number;
  vara?: string;
  comarca?: string;
  clienteDestaque?: string;
}

interface JudicialSyncContentProps {
  onImport: (processes: JudicialProcessResult[]) => Promise<void>;
  onCancel: () => void;
}

export const JudicialSyncContent: React.FC<JudicialSyncContentProps> = ({
  onImport,
  onCancel
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [oab, setOab] = useState('');
  const [uf, setUf] = useState('DF');
  const [results, setResults] = useState<JudicialProcessResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clients, setClients] = useState<any[]>([]);

  // Carregar clientes para o seletor
  React.useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('office_id', user.office_id)
        .eq('deletado', false)
        .order('nome');
      if (data) setClients(data);
    };
    fetchClients();
  }, [user]);

  const handleSearch = async () => {
    if (!oab || !uf) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, informe a OAB e o Estado.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResults([]);
    setSelectedIds(new Set());

    try {
      console.log(`🔍 Iniciando busca direta no PJe Communica: OAB ${oab}-${uf}`);
      const response = await fetch(`https://comunicaapi.pje.jus.br/api/v1/comunicacao?numeroOab=${oab}&ufOab=${uf}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API do PJe (${response.status})`);
      }

      const data = await response.json();
      const items = data.items || [];
      
      const toProperCase = (str: string) => {
        if (!str) return '';
        return str.toLowerCase().trim().replace(/(^|\s)\S/g, (L) => L.toUpperCase());
      };

      const mappedResults = items.map((item: any) => {
        let constructedTitle = '';
        const clientName = item.destinatarios?.[0]?.nome || '';
        
        // Tentativa 1: Extrair do Texto (Regex)
        const text = item.texto || '';
        const autorMatch = text.match(/AUTOR(?:A)?:\s*([^<]+)/i);
        const reuMatch = text.match(/R(?:É|E)U:\s*([^<]+)/i);

        if (autorMatch && reuMatch) {
          constructedTitle = `${toProperCase(autorMatch[1])} vs ${toProperCase(reuMatch[1])}`;
        } else if (autorMatch) {
          constructedTitle = toProperCase(autorMatch[1]);
        } else if (reuMatch) {
          constructedTitle = toProperCase(reuMatch[1]);
        } else if (clientName) {
          constructedTitle = toProperCase(clientName);
        } else {
          constructedTitle = toProperCase(item.tipoComunicacao || 'Processo sem título');
        }

        return {
          id: item.id || item.numero_processo,
          numeroProcesso: item.numero_processo || item.numeroprocessocommascara,
          titulo: constructedTitle,
          partes: constructedTitle,
          tribunal: item.nomeTribunal || 'PJE',
          ultimoAndamento: {
            descricao: (item.textoComunicacao || item.tipoComunicacao || '').substring(0, 200),
            data: item.data_disponibilizacao || item.datadisponibilizacao
          },
          faseProcessual: 'Comunicado PJe',
          valorCausa: 0,
          vara: item.nomeOrgao || '',
          comarca: uf,
          clienteDestaque: toProperCase(clientName)
        };
      });

      // Remover duplicados
      const uniqueProcesses = mappedResults.filter((p: any, index: number, self: any[]) => 
        index === self.findIndex((t) => t.numeroProcesso === p.numeroProcesso)
      );

      if (uniqueProcesses.length === 0) {
        toast({
          title: "Nenhum processo encontrado",
          description: `Não encontramos comunicações recentes no PJe para a OAB ${oab}-${uf}.`,
        });
      } else {
        setResults(uniqueProcesses);
        toast({
          title: "Busca concluída",
          description: `Encontramos ${uniqueProcesses.length} processos vinculados à sua OAB no PJe.`,
        });
      }
    } catch (error: any) {
      console.error("DEBUG - Erro na Busca Direta:", error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível conectar ao serviço nacional do PJe. Tente novamente.",
        variant: "destructive",
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
    
    // Se não selecionou cliente, avisamos mas permitimos
    setImporting(true);
    try {
      const selectedProcesses = results
        .filter(r => selectedIds.has(r.id))
        .map(p => ({ 
          ...p, 
          clienteId: selectedClientId || null // Permitir nulo se não houver cliente ainda
        }));

      await onImport(selectedProcesses);
      
      toast({
        title: "Importação concluída",
        description: `${selectedIds.size} processos foram salvos com segurança no seu escritório.`,
      });
    } catch (error) {
      console.error('Erro na importação:', error);
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar alguns processos. Verifique sua conexão.",
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

      <div className="bg-white/5 border border-white/5 p-6 rounded-2xl mb-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h5 className="text-sm font-semibold text-white/90">Vincular a um Cliente (Opcional)</h5>
            <p className="text-[10px] text-white/40">Opcional: vincule agora ou deixe para depois. O processo ficará seguro em seu escritório.</p>
          </div>
        </div>
        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
          <SelectTrigger className="bg-white/5 border-white/10 h-11">
            <SelectValue placeholder="Selecione um cliente..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10">
            {clients.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="mb-6 bg-white/10" />

      {/* Resultados */}
      <div className="flex-1 flex flex-col min-h-0 border border-white/5 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md relative">
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
        
        <ScrollArea className="h-[400px] w-full">
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
                        <div className="text-sm font-medium line-clamp-1 text-white/90">
                          {proc.clienteDestaque && proc.partes.includes(proc.clienteDestaque) ? (
                            <>
                              {proc.partes.split(proc.clienteDestaque).map((segment, i, array) => (
                                <React.Fragment key={i}>
                                  {segment}
                                  {i < array.length - 1 && (
                                    <span className="text-primary font-bold">{proc.clienteDestaque}</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </>
                          ) : (
                            proc.partes
                          )}
                        </div>
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

      <div className="sticky bottom-0 mt-auto pt-6 border-t border-white/5 bg-slate-950/80 backdrop-blur-md p-6 -mx-8 -mb-8 rounded-b-2xl flex items-center justify-between z-20">
        <Button variant="ghost" onClick={onCancel} disabled={importing} className="text-white/40 hover:text-white">
          Cancelar
        </Button>
        <Button 
          onClick={handleImport} 
          disabled={selectedIds.size === 0 || importing}
          className="gap-2 px-8 bg-primary shadow-lg shadow-primary/20 h-11"
        >
          {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
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

        <div className="flex-1 overflow-hidden flex flex-col px-8 pb-8">
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
