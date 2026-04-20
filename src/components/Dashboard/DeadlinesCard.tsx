
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
  const prazos = []; // Mock ou vindo de hook futuramente

  return (
    <Card className="h-full flex flex-col border-white/5 bg-card/40 backdrop-blur-xl rounded-[2rem] overflow-hidden group">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
              <AlertCircle className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight">Prazos</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/10 rounded-xl">
            Ver todos
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center p-8 text-center space-y-4">
        {prazos.length === 0 ? (
          <div className="animate-in fade-in zoom-in duration-700 delay-100">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full" />
              <div className="relative p-6 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
                <FileText className="h-12 w-12 opacity-80" />
              </div>
            </div>
            <h4 className="text-lg font-bold">Nenhum prazo urgente</h4>
            <p className="text-sm text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
              Prazos de processos e tarefas aparecerão aqui para sua atenção.
            </p>
            <Button variant="outline" className="mt-4 rounded-xl border-white/10 hover:bg-white/5 font-bold text-xs h-10">
              Novo Prazo
            </Button>
          </div>
        ) : (
          <div className="w-full space-y-3">
            {/* Iterar prazos aqui */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
