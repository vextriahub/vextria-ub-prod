

import { Bell, Clock, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const notifications: any[] = [];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "urgent":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "warning":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5 text-blue-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "urgent":
      return "border-l-red-500 bg-red-50/50";
    case "warning":
      return "border-l-yellow-500 bg-yellow-50/50";
    case "success":
      return "border-l-green-500 bg-green-50/50";
    default:
      return "border-l-blue-500 bg-blue-50/50";
  }
};

const Notificacoes = () => {
  const [notificationList, setNotificationList] = useState(notifications);

  const markAsRead = (id: number) => {
    setNotificationList(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const removeNotification = (id: number) => {
    setNotificationList(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notificationList.filter(n => !n.read).length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
            {/* Page Header */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                <Bell className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Acompanhe intimações, prazos e atualizações importantes dos seus processos.
              </p>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {notificationList.length === 0 ? (
                <Card className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma notificação no momento</p>
                </Card>
              ) : (
                notificationList.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`border-l-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'shadow-md' : ''}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <CardTitle className={`text-base ${!notification.read ? 'font-bold' : 'font-medium'}`}>
                              {notification.title}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <span>{notification.time}</span>
                              <span>•</span>
                              <span>Processo: {notification.process}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 px-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeNotification(notification.id)}
                            className="h-8 px-2 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{notification.message}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
      </div>
    );
};

export default Notificacoes;
