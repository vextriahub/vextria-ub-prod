
import { Clock, FileText, Upload, User, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/useUserRole";

const sampleActivities: any[] = [];

export function RecentActivity() {
  const activities = sampleActivities;

  return (
    <Card className="h-full flex flex-col animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma atividade recente</p>
            <p className="text-sm text-muted-foreground mt-1">
              As atividades aparecerão aqui conforme você usar o sistema
            </p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mt-1 p-2 rounded-full bg-primary/10">
                <activity.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <Badge className={`text-xs ${activity.badgeColor}`}>
                    {activity.badge}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.time}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
