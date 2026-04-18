import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Star,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';

interface DashboardWidget {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  requiredRole?: 'user' | 'admin' | 'super_admin';
}

const createWidgets = (userRole: any): DashboardWidget[] => [
  // Widgets para todos os usuários
  {
    id: 'quick-stats',
    title: 'Resumo Rápido',
    description: 'Suas estatísticas principais',
    icon: <BarChart3 className="h-5 w-5" />,
    content: (
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">12</p>
          <p className="text-xs text-muted-foreground">Processos Ativos</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">8</p>
          <p className="text-xs text-muted-foreground">Tarefas Pendentes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">3</p>
          <p className="text-xs text-muted-foreground">Prazos Próximos</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">15</p>
          <p className="text-xs text-muted-foreground">Clientes Ativos</p>
        </div>
      </div>
    ),
    size: 'medium',
    visible: true
  },
  {
    id: 'urgent-tasks',
    title: 'Tarefas Urgentes',
    description: 'Itens que precisam de atenção imediata',
    icon: <AlertTriangle className="h-5 w-5" />,
    content: (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm">Resposta à contestação</span>
          </div>
          <Badge variant="destructive" className="text-xs">2 dias</Badge>
        </div>
        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">Audiência preparação</span>
          </div>
          <Badge variant="secondary" className="text-xs">5 dias</Badge>
        </div>
        <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Relatório mensal</span>
          </div>
          <Badge variant="outline" className="text-xs">1 semana</Badge>
        </div>
      </div>
    ),
    size: 'medium',
    visible: true
  },
  {
    id: 'recent-activity',
    title: 'Atividade Recente',
    description: 'Últimas ações no sistema',
    icon: <Clock className="h-5 w-5" />,
    content: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <div className="flex-1">
            <p>Processo 1234567 atualizado</p>
            <p className="text-xs text-muted-foreground">2 horas atrás</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Users className="h-4 w-4 text-blue-500" />
          <div className="flex-1">
            <p>Novo cliente cadastrado</p>
            <p className="text-xs text-muted-foreground">4 horas atrás</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="h-4 w-4 text-purple-500" />
          <div className="flex-1">
            <p>Audiência agendada</p>
            <p className="text-xs text-muted-foreground">1 dia atrás</p>
          </div>
        </div>
      </div>
    ),
    size: 'medium',
    visible: true
  },
  {
    id: 'productivity',
    title: 'Produtividade',
    description: 'Sua performance esta semana',
    icon: <TrendingUp className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Tarefas Concluídas</span>
            <span>8/12</span>
          </div>
          <Progress value={67} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Processos Atualizados</span>
            <span>15/20</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Clientes Atendidos</span>
            <span>6/8</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>Excelente performance esta semana!</span>
        </div>
      </div>
    ),
    size: 'medium',
    visible: true
  },
  // Widgets específicos para administradores
  {
    id: 'team-overview',
    title: 'Visão Geral da Equipe',
    description: 'Status da equipe do escritório',
    icon: <Users className="h-5 w-5" />,
    content: (
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">8</p>
          <p className="text-xs text-muted-foreground">Membros Ativos</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">95%</p>
          <p className="text-xs text-muted-foreground">Taxa Atividade</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">24</p>
          <p className="text-xs text-muted-foreground">Tarefas Pendentes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">156</p>
          <p className="text-xs text-muted-foreground">Processos Total</p>
        </div>
      </div>
    ),
    size: 'medium',
    visible: true,
    requiredRole: 'admin'
  },
  {
    id: 'office-metrics',
    title: 'Métricas do Escritório',
    description: 'KPIs principais do mês',
    icon: <BarChart3 className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">Novos Clientes</span>
          <Badge className="bg-green-100 text-green-800">+12</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Processos Concluídos</span>
          <Badge className="bg-blue-100 text-blue-800">8</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Faturamento</span>
          <Badge className="bg-purple-100 text-purple-800">R$ 45.2k</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Satisfação Cliente</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">4.8</span>
          </div>
        </div>
      </div>
    ),
    size: 'medium',
    visible: true,
    requiredRole: 'admin'
  },
  // Widget específico para super admin
  {
    id: 'global-stats',
    title: 'Estatísticas Globais',
    description: 'Visão geral de todos os escritórios',
    icon: <TrendingUp className="h-5 w-5" />,
    content: (
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">25</p>
          <p className="text-xs text-muted-foreground">Escritórios Ativos</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">1.2k</p>
          <p className="text-xs text-muted-foreground">Usuários Total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">89%</p>
          <p className="text-xs text-muted-foreground">Taxa Utilização</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">R$ 250k</p>
          <p className="text-xs text-muted-foreground">MRR</p>
        </div>
      </div>
    ),
    size: 'large',
    visible: true,
    requiredRole: 'super_admin'
  }
];

export const PersonalizedDashboard: React.FC = () => {
  const userRole = useUserRole();
  const [widgets, setWidgets] = useState(() => createWidgets(userRole));
  const [isCustomizing, setIsCustomizing] = useState(false);

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, visible: !widget.visible }
        : widget
    ));
  };

  const getGridClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'medium':
        return 'col-span-1 md:col-span-1';
      case 'large':
        return 'col-span-1 md:col-span-2';
      default:
        return 'col-span-1';
    }
  };

  const filteredWidgets = widgets.filter(widget => {
    if (!widget.requiredRole) return true;
    
    if (widget.requiredRole === 'super_admin') {
      return userRole.isSuperAdmin;
    }
    
    if (widget.requiredRole === 'admin') {
      return userRole.isOfficeAdmin || userRole.isSuperAdmin;
    }
    
    return true;
  });

  const visibleWidgets = filteredWidgets.filter(widget => widget.visible);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Dashboard Personalizado
          </h2>
          <p className="text-muted-foreground">
            {userRole.isSuperAdmin && 'Visão global do sistema'}
            {userRole.isOfficeAdmin && !userRole.isSuperAdmin && 'Gestão do seu escritório'}
            {!userRole.isOfficeAdmin && !userRole.isSuperAdmin && 'Suas atividades e tarefas'}
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          {isCustomizing ? 'Finalizar' : 'Personalizar'}
        </Button>
      </div>

      {isCustomizing && (
        <Card>
          <CardHeader>
            <CardTitle>Personalizar Dashboard</CardTitle>
            <CardDescription>
              Escolha quais widgets você quer ver no seu dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWidgets.map(widget => (
                <div
                  key={widget.id}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg",
                    widget.visible ? "bg-muted/50" : "bg-background"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {widget.icon}
                    <div>
                      <p className="font-medium text-sm">{widget.title}</p>
                      <p className="text-xs text-muted-foreground">{widget.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWidgetVisibility(widget.id)}
                  >
                    {widget.visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleWidgets.map(widget => (
          <Card 
            key={widget.id} 
            className={cn("transition-all duration-200", getGridClass(widget.size))}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {widget.icon}
                {widget.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {widget.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {widget.content}
            </CardContent>
          </Card>
        ))}
      </div>

      {visibleWidgets.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum widget selecionado</h3>
              <p className="text-muted-foreground mb-4">
                Personalize seu dashboard escolhendo os widgets que você quer ver
              </p>
              <Button onClick={() => setIsCustomizing(true)}>
                Personalizar Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};