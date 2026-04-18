
import { useState } from "react";
import { Calendar, AlertTriangle, User, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";

const sampleTasks: any[] = [];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "alta":
      return "bg-destructive text-destructive-foreground";
    case "media":
      return "bg-accent text-accent-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function PriorityTasks() {
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const tasks = sampleTasks;

  const toggleTask = (taskId: number) => {
    setCompletedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  return (
    <Card className="h-full flex flex-col animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-accent" />
          Prioridades do Dia (IA)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma tarefa prioritária</p>
            <p className="text-sm text-muted-foreground mt-1">
              A IA irá sugerir tarefas prioritárias baseadas nos seus dados
            </p>
          </div>
        ) : (
          tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              completedTasks.includes(task.id)
                ? "bg-muted/50 opacity-75"
                : "bg-card hover:bg-muted/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={completedTasks.includes(task.id)}
                onCheckedChange={() => toggleTask(task.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`font-medium ${
                    completedTasks.includes(task.id) ? "line-through text-muted-foreground" : ""
                  }`}>
                    {task.title}
                  </h4>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {task.dueDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {task.client}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {task.case}
                  </div>
                </div>
                
                <div className="bg-primary/10 border border-primary/20 rounded-md p-2">
                  <p className="text-sm text-primary font-medium">
                    {task.aiSuggestion}
                  </p>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
        
        {tasks.length > 0 && (
          <Button className="w-full" variant="outline">
            Ver Todas as Tarefas
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
