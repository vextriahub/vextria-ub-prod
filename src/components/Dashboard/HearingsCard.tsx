
import { Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HearingsCard() {
  const audiencias = []; // Mock ou vindo de hook futuramente

  return (
    <Card className="h-full flex flex-col border-white/5 bg-card/40 backdrop-blur-xl rounded-[2rem] overflow-hidden group">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight">Audiências</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/10 rounded-xl">
            Ver todas
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center p-8 text-center space-y-4">
        {audiencias.length === 0 ? (
          <div className="animate-in fade-in zoom-in duration-700">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full" />
              <div className="relative p-6 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500">
                <Calendar className="h-12 w-12 opacity-80" />
              </div>
            </div>
            <h4 className="text-lg font-bold">Nenhuma audiência hoje</h4>
            <p className="text-sm text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
              As audiências dos seus processos aparecerão aqui automaticamente.
            </p>
            <Button variant="outline" className="mt-4 rounded-xl border-white/10 hover:bg-white/5 font-bold text-xs h-10">
              Agendar Manualmente
            </Button>
          </div>
        ) : (
          <div className="w-full space-y-3">
            {/* Iterar audiências aqui */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
