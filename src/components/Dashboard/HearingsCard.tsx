
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const sampleAudiencias = {
  hoje: [],
  semana: []
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmada":
      return "bg-green-100 text-green-800";
    case "pendente":
      return "bg-yellow-100 text-yellow-800";
    case "cancelada":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function HearingsCard() {
  const audiencias = { hoje: [], semana: [] };

  return (
    <Card className="h-full flex flex-col animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          Audiências
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma audiência agendada</p>
          <p className="text-sm text-muted-foreground mt-1">
            As audiências dos seus processos aparecerão aqui
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
