import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Play, Pause, Square, Timer, Plus } from "lucide-react";

export default function Timesheet() {
  const [isNewTimerDialogOpen, setIsNewTimerDialogOpen] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [formData, setFormData] = useState({
    descricao: "",
    categoria: ""
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    if (!formData.descricao || !formData.categoria) return;
    
    setIsTimerActive(true);
    setElapsedTime(0);
    setIsNewTimerDialogOpen(false);
    
    // Simular timer
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Salvar interval para poder parar depois
    (window as any).timerInterval = interval;
  };

  const handleStopTimer = () => {
    setIsTimerActive(false);
    setElapsedTime(0);
    if ((window as any).timerInterval) {
      clearInterval((window as any).timerInterval);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6 md:h-8 md:w-8" />
            Timesheet
          </h1>
          <p className="text-muted-foreground">
            Controle e acompanhe o tempo gasto em suas atividades jurídicas
          </p>
        </div>
        
        <Dialog open={isNewTimerDialogOpen} onOpenChange={setIsNewTimerDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={isTimerActive}>
              <Plus className="h-4 w-4" />
              Novo Timer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Iniciar Novo Timer</DialogTitle>
              <DialogDescription>
                Descreva a atividade que você vai realizar e selecione a categoria
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tarefa">Descrição da Tarefa *</Label>
                <Input
                  id="tarefa"
                  placeholder="Ex: Elaboração de petição inicial..."
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atendimento">Atendimento</SelectItem>
                    <SelectItem value="processo">Processo</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="administrativa">Administrativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleStartTimer} disabled={!formData.descricao || !formData.categoria}>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Timer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timer Ativo */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Timer Ativo
          </CardTitle>
          <CardDescription>
            {isTimerActive ? "Timer em execução" : "Nenhum timer ativo no momento"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isTimerActive ? (
            <>
              <div className="text-center">
                <div className="text-4xl md:text-6xl font-mono font-bold text-primary">
                  {formatTime(elapsedTime)}
                </div>
                <p className="text-sm font-medium mt-2">{formData.descricao}</p>
              </div>

              <div className="flex justify-center gap-3">
                <Button 
                  variant="destructive" 
                  onClick={handleStopTimer}
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Finalizar
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Timer className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Nenhum timer ativo</p>
              <Button onClick={() => setIsNewTimerDialogOpen(true)} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Iniciar Novo Timer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h 0m</div>
            <p className="text-xs text-muted-foreground">0 registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h 0m</div>
            <p className="text-xs text-muted-foreground">0 registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h 0m</div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Registros */}
      <Card>
        <CardHeader>
          <CardTitle>Registros Recentes</CardTitle>
          <CardDescription>
            Últimos 7 dias de atividades registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum registro encontrado</p>
            <p className="text-sm">Inicie o timer para começar a registrar suas atividades</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 