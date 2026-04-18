
import { Calendar, Clock, AlertTriangle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const samplePrazos = {
  hoje: [],
  semana: []
};

const getPriorityColor = (prioridade: string) => {
  switch (prioridade) {
    case "alta":
      return "bg-red-100 text-red-800";
    case "media":
      return "bg-yellow-100 text-yellow-800";
    case "baixa":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function DeadlinesCard() {
  const prazos = { hoje: [], semana: [] };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-accent" />
          Prazos Importantes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 p-4 pt-0">
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum prazo cadastrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Os prazos dos seus processos aparecerão aqui
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
