
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Trash2, TrendingUp, DollarSign } from "lucide-react";
import { useState } from "react";

type MetaDemanda = {
  id: number;
  tipo: string;
  metaProcessos: number;
  processosAtuais: number;
  metaFaturamento: number;
  faturamentoAtual: number;
  cor: string;
};

export function DemandGoalsConfig() {
  const [metasDemanda, setMetasDemanda] = useState<MetaDemanda[]>([]);

  const [novaMeta, setNovaMeta] = useState({
    tipo: "",
    metaProcessos: 0,
    metaFaturamento: 0,
    cor: "bg-blue-500"
  });

  const cores = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
    "bg-red-500", "bg-yellow-500", "bg-pink-500", "bg-indigo-500"
  ];

  const adicionarMeta = () => {
    if (novaMeta.tipo.trim() && novaMeta.metaProcessos > 0) {
      setMetasDemanda([
        ...metasDemanda,
        {
          id: metasDemanda.length + 1,
          ...novaMeta,
          processosAtuais: 0,
          faturamentoAtual: 0
        }
      ]);
      setNovaMeta({ tipo: "", metaProcessos: 0, metaFaturamento: 0, cor: "bg-blue-500" });
    }
  };

  const removerMeta = (id: number) => {
    setMetasDemanda(metasDemanda.filter(meta => meta.id !== id));
  };

  const atualizarMeta = (id: number, campo: keyof MetaDemanda, valor: any) => {
    setMetasDemanda(metasDemanda.map(meta => 
      meta.id === id ? { ...meta, [campo]: valor } : meta
    ));
  };

  const calcularPercentual = (atual: number, meta: number) => {
    return meta > 0 ? Math.round((atual / meta) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Metas por Demanda - Resumo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metasDemanda.map((meta) => (
              <div key={meta.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{meta.tipo}</h4>
                  <div className={`w-3 h-3 rounded-full ${meta.cor}`}></div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Processos</span>
                    <span>{meta.processosAtuais}/{meta.metaProcessos}</span>
                  </div>
                  <Progress value={calcularPercentual(meta.processosAtuais, meta.metaProcessos)} className="h-1" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Faturamento</span>
                    <span>R$ {meta.faturamentoAtual.toLocaleString()}/R$ {meta.metaFaturamento.toLocaleString()}</span>
                  </div>
                  <Progress value={calcularPercentual(meta.faturamentoAtual, meta.metaFaturamento)} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuração Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Metas por Demanda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {metasDemanda.map((meta) => (
            <div key={meta.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${meta.cor}`}></div>
                  <h4 className="font-medium">{meta.tipo}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removerMeta(meta.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Meta de Processos</Label>
                  <Input
                    type="number"
                    value={meta.metaProcessos}
                    onChange={(e) => atualizarMeta(meta.id, 'metaProcessos', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Processos Atuais</Label>
                  <Input
                    type="number"
                    value={meta.processosAtuais}
                    onChange={(e) => atualizarMeta(meta.id, 'processosAtuais', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Meta de Faturamento (R$)</Label>
                  <Input
                    type="number"
                    value={meta.metaFaturamento}
                    onChange={(e) => atualizarMeta(meta.id, 'metaFaturamento', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Faturamento Atual (R$)</Label>
                  <Input
                    type="number"
                    value={meta.faturamentoAtual}
                    onChange={(e) => atualizarMeta(meta.id, 'faturamentoAtual', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-6">
            <h5 className="font-medium mb-4">Adicionar Nova Meta</h5>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <Label htmlFor="tipoMeta">Tipo de Demanda</Label>
                <Input
                  id="tipoMeta"
                  value={novaMeta.tipo}
                  onChange={(e) => setNovaMeta({...novaMeta, tipo: e.target.value})}
                  placeholder="Ex: Pensão por Morte"
                />
              </div>
              <div>
                <Label htmlFor="metaProc">Meta Processos</Label>
                <Input
                  id="metaProc"
                  type="number"
                  value={novaMeta.metaProcessos}
                  onChange={(e) => setNovaMeta({...novaMeta, metaProcessos: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="metaFat">Meta Faturamento</Label>
                <Input
                  id="metaFat"
                  type="number"
                  value={novaMeta.metaFaturamento}
                  onChange={(e) => setNovaMeta({...novaMeta, metaFaturamento: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Cor</Label>
                <div className="flex space-x-1 mt-1">
                  {cores.slice(0, 4).map((cor) => (
                    <button
                      key={cor}
                      className={`w-6 h-6 rounded-full ${cor} ${novaMeta.cor === cor ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                      onClick={() => setNovaMeta({...novaMeta, cor})}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={adicionarMeta} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
