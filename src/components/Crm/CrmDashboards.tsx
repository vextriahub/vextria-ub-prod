import { ArrowLeft, UserCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "./CrmUtils";

interface BaseProps {
  onBack: () => void;
}

export function CrmRelatorios({ onBack }: BaseProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao CRM
        </Button>
        <div className="w-full sm:w-auto">
          <h2 className="text-xl md:text-2xl font-bold">Relatórios</h2>
          <p className="text-sm md:text-base text-muted-foreground">Análises detalhadas de performance</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Performance Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-600">127%</div>
            <p className="text-xs md:text-sm text-muted-foreground">da meta atingida</p>
            <div className="mt-2 text-xs text-muted-foreground">
              {0} leads ativos • {0} clientes
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Tempo Médio de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-blue-600">15</div>
            <p className="text-xs md:text-sm text-muted-foreground">dias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-purple-600">340%</div>
            <p className="text-xs md:text-sm text-muted-foreground">retorno sobre investimento</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Desempenho por Lead</CardTitle>
          <CardDescription className="text-sm">Análise individual dos leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[].map((lead: any) => (
              <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{lead.name}</div>
                    <div className="text-xs text-muted-foreground">{lead.company}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                  <span className="text-sm font-medium">{lead.value}</span>
                  <span className="text-xs text-muted-foreground">Último contato: {lead.lastContact}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CrmMetas({ onBack }: BaseProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao CRM
        </Button>
        <div className="w-full sm:w-auto">
          <h2 className="text-xl md:text-2xl font-bold">Metas</h2>
          <p className="text-sm md:text-base text-muted-foreground">Acompanhe o progresso das metas</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Metas do Mês</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm md:text-base">
              <span>Novos Leads</span>
              <span>15/20</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm md:text-base">
              <span>Conversões</span>
              <span>8/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CrmEmailMarketing({ onBack }: BaseProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao CRM
        </Button>
        <div className="w-full sm:w-auto">
          <h2 className="text-xl md:text-2xl font-bold">E-mail Marketing</h2>
          <p className="text-sm md:text-base text-muted-foreground">Campanhas automatizadas</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Campanhas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
              <div className="flex-1">
                <div className="font-medium text-sm md:text-base">Campanha de Nutrição</div>
                <div className="text-xs md:text-sm text-muted-foreground">Taxa de abertura: 24%</div>
              </div>
              <Badge className="bg-green-100 text-green-800 w-fit">Ativo</Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
              <div className="flex-1">
                <div className="font-medium text-sm md:text-base">Newsletter Semanal</div>
                <div className="text-xs md:text-sm text-muted-foreground">Taxa de abertura: 18%</div>
              </div>
              <Badge className="bg-blue-100 text-blue-800 w-fit">Agendado</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CrmFollowUp({ onBack }: BaseProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao CRM
        </Button>
        <div className="w-full sm:w-auto">
          <h2 className="text-xl md:text-2xl font-bold">Follow-up</h2>
          <p className="text-sm md:text-base text-muted-foreground">Lembretes automáticos</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Próximos Follow-ups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
              <div className="flex-1">
                <div className="font-medium text-sm md:text-base">João Silva - Tech Corp</div>
                <div className="text-xs md:text-sm text-muted-foreground">Agendar reunião de apresentação</div>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Hoje, 14:00</div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
              <div className="flex-1">
                <div className="font-medium text-sm md:text-base">Maria Santos - Legal Firm</div>
                <div className="text-xs md:text-sm text-muted-foreground">Enviar proposta comercial</div>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Amanhã, 09:00</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
