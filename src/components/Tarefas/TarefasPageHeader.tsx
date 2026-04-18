import React from 'react';
import { Plus, Trash2, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';

interface TarefasPageHeaderProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  onNewTarefa: () => void;
  isNoneSelected: boolean;
  stats: {
    total: number;
    completed: number;
    pending: number;
    totalPoints: number;
    earnedPoints: number;
    completionRate: number;
  };
}

export const TarefasPageHeader: React.FC<TarefasPageHeaderProps> = ({
  selectedCount,
  onDeleteSelected,
  onNewTarefa,
  isNoneSelected,
  stats
}) => {
  return (
    <div className="space-y-4">
      {/* Header principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie suas tarefas e prazos com sistema de pontuação.
          </p>
        </div>
        
        <div className="flex gap-2">
          <PermissionGuard permission="canManageTarefas">
            {!isNoneSelected && (
              <Button
                variant="destructive"
                onClick={onDeleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir Selecionadas ({selectedCount})
              </Button>
            )}
          </PermissionGuard>
          
          <Button onClick={onNewTarefa}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total de Tarefas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-green-600 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full" />
              </div>
              <div>
                <p className="text-sm font-medium">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-orange-600 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full" />
              </div>
              <div>
                <p className="text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pontuação</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.earnedPoints}/{stats.totalPoints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Taxa de Conclusão</span>
            <Badge variant="outline">
              {stats.completionRate.toFixed(1)}%
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};