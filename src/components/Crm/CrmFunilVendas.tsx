import { ArrowLeft, UserCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "./CrmUtils";

interface Props {
  onBack: () => void;
}

export function CrmFunilVendas({ onBack }: Props) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao CRM
        </Button>
        <div className="w-full sm:w-auto">
          <h2 className="text-xl md:text-2xl font-bold">Funil de Vendas</h2>
          <p className="text-sm md:text-base text-muted-foreground">Visualize o pipeline completo de vendas</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Pipeline de Conversão</CardTitle>
          <CardDescription className="text-sm">Acompanhe o progresso dos leads pelo funil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 md:p-6 border rounded-lg bg-blue-50 text-center">
              <h4 className="font-medium text-blue-800 text-sm md:text-base">Prospecção</h4>
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">{0}</div>
              <p className="text-xs md:text-sm text-blue-600">leads novos</p>
            </div>
            <div className="p-4 md:p-6 border rounded-lg bg-indigo-50 text-center">
              <h4 className="font-medium text-indigo-800 text-sm md:text-base">Qualificação</h4>
              <div className="text-2xl md:text-3xl font-bold text-indigo-600 mt-2">{0}</div>
              <p className="text-xs md:text-sm text-indigo-600">leads qualificados</p>
            </div>
            <div className="p-4 md:p-6 border rounded-lg bg-yellow-50 text-center">
              <h4 className="font-medium text-yellow-800 text-sm md:text-base">Proposta</h4>
              <div className="text-2xl md:text-3xl font-bold text-yellow-600 mt-2">{0}</div>
              <p className="text-xs md:text-sm text-yellow-600">propostas enviadas</p>
            </div>
            <div className="p-4 md:p-6 border rounded-lg bg-orange-50 text-center">
              <h4 className="font-medium text-orange-800 text-sm md:text-base">Negociação</h4>
              <div className="text-2xl md:text-3xl font-bold text-orange-600 mt-2">{0}</div>
              <p className="text-xs md:text-sm text-orange-600">em negociação</p>
            </div>
            <div className="p-4 md:p-6 border rounded-lg bg-green-50 text-center">
              <h4 className="font-medium text-green-800 text-sm md:text-base">Fechamento</h4>
              <div className="text-2xl md:text-3xl font-bold text-green-600 mt-2">{0}</div>
              <p className="text-xs md:text-sm text-green-600">vendas fechadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Leads por Estágio</CardTitle>
          <CardDescription className="text-sm">Detalhamento dos leads em cada fase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {['prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechamento'].map((stage) => {
              const stageLeads: any[] = [];
              const stageNames: Record<string, string> = {
                prospeccao: 'Prospecção',
                qualificacao: 'Qualificação',
                proposta: 'Proposta',
                negociacao: 'Negociação',
                fechamento: 'Fechamento'
              };
              
              if (stageLeads.length > 0) {
                return (
                  <div key={stage} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">{stageNames[stage]} ({stageLeads.length})</h4>
                    <div className="space-y-2">
                      {stageLeads.map((lead: any) => (
                        <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded gap-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <UserCheck className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{lead.name}</div>
                              <div className="text-xs text-gray-500">{lead.company}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status}
                            </Badge>
                            <span className="text-sm font-medium text-green-600">{lead.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
