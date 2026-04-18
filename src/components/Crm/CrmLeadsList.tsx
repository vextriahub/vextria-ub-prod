import { ArrowLeft, UserCheck, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "./CrmUtils";

interface Props {
  onBack: () => void;
  tipo: "todos" | "quentes";
}

export function CrmLeadsList({ onBack, tipo }: Props) {
  const isQuentes = tipo === "quentes";

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao CRM
        </Button>
        <div className="w-full sm:w-auto">
          <h2 className="text-xl md:text-2xl font-bold">
            {isQuentes ? 'Leads Quentes' : 'Todos os Leads'}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {isQuentes ? 'Leads com alta probabilidade de conversão' : 'Lista completa de leads'}
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            {isQuentes ? 'Leads Quentes' : 'Todos os Leads'} (0)
          </CardTitle>
          <CardDescription className="text-sm">
            {isQuentes ? 'Leads prioritários para acompanhamento' : 'Gerencie todos os seus leads'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[].map((lead: any) => (
              <div key={lead.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isQuentes ? 'bg-red-100' : 'bg-primary/10'}`}>
                    <UserCheck className={`h-5 w-5 ${isQuentes ? 'text-red-600' : 'text-primary'}`} />
                  </div>
                  <div>
                    <div className="font-medium text-sm md:text-base">{lead.name}</div>
                    <div className="text-xs md:text-sm text-gray-500">{lead.company}</div>
                    <div className="text-xs text-gray-400">Último contato: {lead.lastContact}</div>
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:text-right">
                    <div className="flex items-center text-xs md:text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-1" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    <div className="flex items-center text-xs md:text-sm text-gray-500">
                      <Phone className="h-4 w-4 mr-1" />
                      {lead.phone}
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end gap-2">
                    <Badge className={isQuentes ? "bg-red-100 text-red-800" : getStatusColor(lead.status)}>
                      {isQuentes ? "Quente" : lead.status}
                    </Badge>
                    <span className="text-sm font-medium text-green-600">{lead.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
