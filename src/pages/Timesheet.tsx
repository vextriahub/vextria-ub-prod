import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Play, Pause, Square, Timer, Plus, AlertCircle, ArrowUpRight, TrendingUp } from "lucide-react";
import { useTimesheet } from "@/hooks/useTimesheet";
import { TIMESHEET_CATEGORIAS, type TimesheetCategoria } from "@/types/timesheet";

export default function Timesheet() {
  // Estado para controlar se o componente foi montado
  const [mounted, setMounted] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Tentar usar hook real, com fallback para funcionalidade local
  const hookResult = useTimesheet();
  const { 
    data: timesheets = [], 
    loading = false, 
    error = null,
    activeTimer, 
    startTimer,
    stopTimer,
    getTodayStats,
    getWeekStats
  } = hookResult || {};

  // Estados locais para fallback
  const [isNewTimerDialogOpen, setIsNewTimerDialogOpen] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [formData, setFormData] = useState({
    descricao: "",
    categoria: "" as TimesheetCategoria | ""
  });

  // Marcar como montado após a primeira renderização
  useEffect(() => {
    setMounted(true);
    console.log('⏰ Timesheet: Componente montado');
  }, []);

  // Timeout de segurança para carregamento
  useEffect(() => {
    if (loading && mounted) {
      console.log('⏰ Timesheet: Loading started, setting 10s timeout');
      const timeout = setTimeout(() => {
        console.log('⏰ Timesheet: Loading timeout reached');
        setLoadingTimeout(true);
      }, 10000); // 10 segundos

      return () => {
        clearTimeout(timeout);
        setLoadingTimeout(false);
      };
    }
  }, [loading, mounted]);

  // Log para debug de estados
  useEffect(() => {
    if (mounted) {
      console.log('⏰ Timesheet: Estados atuais', {
        loading,
        loadingTimeout,
        error,
        timesheetsCount: timesheets?.length || 0,
        activeTimer: !!activeTimer,
        mounted
      });
    }
  }, [mounted, loading, loadingTimeout, error, timesheets?.length, activeTimer]);

  // Usar timer ativo do hook ou local como fallback
  const timerAtivo = activeTimer || (isTimerActive ? { tarefa_descricao: formData.descricao } : null);

  // Calcular tempo decorrido (hook real ou local)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeTimer && activeTimer.status === 'ativo') {
      // Timer real do banco
      interval = setInterval(() => {
        const startTime = new Date(activeTimer.data_inicio);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else if (isTimerActive) {
      // Timer local como fallback
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeTimer, isTimerActive]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = async () => {
    if (!formData.descricao || !formData.categoria) return;
    
    try {
      // Tentar usar hook real
      if (startTimer && formData.categoria) {
        const result = await startTimer(
          formData.descricao,
          formData.categoria as TimesheetCategoria
        );
        
        if (result) {
          console.log('Timer iniciado via Supabase:', result.id);
          setFormData({ descricao: "", categoria: "" });
          setIsNewTimerDialogOpen(false);
          return;
        }
      }
    } catch (error) {
      console.warn('Erro ao usar Supabase, usando fallback local:', error);
    }

    // Fallback: usar timer local
    console.log('Usando timer local como fallback');
    setIsTimerActive(true);
    setElapsedTime(0);
    setIsNewTimerDialogOpen(false);
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    (window as any).timerInterval = interval;
  };

  const handleStopTimer = async () => {
    try {
      // Tentar usar hook real
      if (activeTimer && stopTimer) {
        const result = await stopTimer(activeTimer.id);
        if (result) {
          console.log('Timer parado via Supabase');
          return;
        }
      }
    } catch (error) {
      console.warn('Erro ao usar Supabase, usando fallback local:', error);
    }

    // Fallback: parar timer local
    console.log('Parando timer local');
    setIsTimerActive(false);
    setElapsedTime(0);
    if ((window as any).timerInterval) {
      clearInterval((window as any).timerInterval);
    }
  };

  // Estatísticas reais ou fallback
  const todayStats = getTodayStats ? getTodayStats() : { totalMinutos: 0, totalRegistros: 0 };
  const weekStats = getWeekStats ? getWeekStats() : { totalMinutos: 0, totalRegistros: 0 };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Mostrar carregamento apenas se realmente carregando e montado (com timeout)
  if (!mounted || (loading && mounted && !loadingTimeout)) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando timesheet...</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {mounted ? 'Conectando com banco de dados...' : 'Inicializando componente...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {/* Mostrar erro se houver ou se timeout */}
        {(error || loadingTimeout) && (
          <Card className="border-destructive bg-destructive/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">
                  {loadingTimeout ? 
                    'Timeout de carregamento - Usando modo offline' : 
                    `Modo offline: ${error}`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header com Visual Moderno */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <div className="p-3 bg-primary rounded-2xl shadow-lg">
                <Clock className="h-8 w-8 text-primary-foreground" />
              </div>
              Timesheet {(error || loadingTimeout) ? '(Modo Offline)' : ''}
            </h1>
            <p className="text-lg text-muted-foreground">
              Controle e acompanhe o tempo gasto em suas atividades jurídicas
            </p>
          </div>
          
          <Dialog open={isNewTimerDialogOpen} onOpenChange={setIsNewTimerDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3 rounded-xl" 
                disabled={!!timerAtivo}
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Novo Timer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Iniciar Novo Timer</DialogTitle>
                <DialogDescription>
                  Descreva a atividade que você vai realizar e selecione a categoria
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tarefa" className="text-sm font-medium">Descrição da Tarefa *</Label>
                  <Input
                    id="tarefa"
                    placeholder="Ex: Elaboração de petição inicial..."
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-sm font-medium">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value as TimesheetCategoria | "" }))}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMESHEET_CATEGORIAS.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleStartTimer} 
                  disabled={!formData.descricao || !formData.categoria}
                  className="rounded-xl"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Timer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Timer Ativo com Design Premium */}
        <Card className="bg-card/80 backdrop-blur-md border shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className={`p-2 rounded-full ${timerAtivo ? 'bg-green-500/20 text-green-600' : 'bg-slate-500/20 text-slate-600'}`}>
                <Timer className="h-6 w-6" />
              </div>
              Timer Ativo {activeTimer ? '(Supabase)' : isTimerActive ? '(Local)' : ''}
            </CardTitle>
            <CardDescription className="text-lg">
              {timerAtivo ? "Timer em execução" : "Nenhum timer ativo no momento"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {timerAtivo ? (
              <>
                <div className="text-center py-8">
                  <div className="text-6xl md:text-8xl font-mono font-bold text-foreground tracking-wider">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="mt-4 p-4 bg-muted/60 rounded-2xl backdrop-blur-sm">
                    <p className="text-lg font-semibold text-foreground">
                      {activeTimer?.tarefa_descricao || formData.descricao}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    variant="destructive" 
                    onClick={handleStopTimer}
                    className="px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    size="lg"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Finalizar
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="p-6 bg-slate-100/80 dark:bg-slate-700/80 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Timer className="h-12 w-12 text-slate-400" />
                </div>
                <p className="text-xl text-muted-foreground mb-6">Nenhum timer ativo</p>
                <Button 
                  onClick={() => setIsNewTimerDialogOpen(true)} 
                  className="px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Iniciar Novo Timer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas Modernas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tempo Hoje</CardTitle>
              <div className="p-2 bg-primary/20 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{formatMinutes(todayStats.totalMinutos)}</div>
              <div className="flex items-center pt-1 text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span>{todayStats.totalRegistros} registros</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Esta Semana</CardTitle>
              <div className="p-2 bg-primary/20 rounded-lg">
                <Timer className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{formatMinutes(weekStats.totalMinutos)}</div>
              <div className="flex items-center pt-1 text-xs text-muted-foreground">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                <span>{weekStats.totalRegistros} registros</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Média Diária</CardTitle>
              <div className="p-2 bg-primary/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {weekStats.totalRegistros > 0 ? formatMinutes(Math.round(weekStats.totalMinutos / 7)) : "0m"}
              </div>
              <div className="flex items-center pt-1 text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <span>Últimos 7 dias</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Registros com Design Moderno */}
        <Card className="bg-card/80 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl">Registros Recentes</CardTitle>
            <CardDescription className="text-lg">
              Últimos 7 dias de atividades registradas ({timesheets.length} encontrados)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timesheets.length > 0 ? (
              <div className="space-y-4">
                {timesheets.map((timesheet) => (
                  <div key={timesheet.id} className="flex items-center justify-between p-6 bg-muted/50 border rounded-2xl hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
                    <div className="space-y-2">
                      <p className="font-semibold text-lg text-foreground">{timesheet.tarefa_descricao}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                          {timesheet.categoria}
                        </span>
                        <span className={`px-3 py-1 rounded-full ${
                          timesheet.status === 'finalizado' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {timesheet.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <p className="font-mono font-bold text-xl text-foreground">
                        {timesheet.duracao_minutos ? formatMinutes(timesheet.duracao_minutos) : 'Em andamento'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(timesheet.data_inicio).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="p-8 bg-muted/80 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                  <Clock className="h-16 w-16 text-muted-foreground" />
                </div>
                <p className="text-xl font-semibold text-foreground mb-2">Nenhum registro encontrado</p>
                <p className="text-muted-foreground">Inicie o timer para começar a registrar suas atividades</p>
              </div>
            )}
          </CardContent>
        </