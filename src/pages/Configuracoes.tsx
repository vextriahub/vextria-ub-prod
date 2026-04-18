import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { TeamManagement } from "@/components/Settings/TeamManagement";
import { ProcessTypeSimple } from "@/components/Settings/ProcessTypeSimple";
import { DeadlineConfig } from "@/components/Settings/DeadlineConfig";
import { ClientOriginConfig } from "@/components/Settings/ClientOriginConfig";
import { OfficeSettings } from "@/components/Office/OfficeSettings";
import { GoogleCalendarIntegration } from "@/components/Integrations/GoogleCalendarIntegration";
import { useUserRole } from "@/hooks/useUserRole";

interface SettingsFormValues {
  name: string;
  email: string;
  notifications: boolean;
  theme: string;
  language: string;
  timezone: string;
  dateFormat: Date | undefined;
  timeFormat: string;
  privacy: string;
  security: string;
  accessibility: string;
  advanced: string;
}

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState("geral");
  const { canManageOffice, isSuperAdmin } = useUserRole();
  const [formValues, setFormValues] = useState<SettingsFormValues>({
    name: "Usuário",
    email: "usuario@exemplo.com",
    notifications: true,
    theme: "light",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    dateFormat: undefined,
    timeFormat: "12h",
    privacy: "public",
    security: "strong",
    accessibility: "enhanced",
    advanced: "enabled",
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;
    setFormValues({
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormValues({
      ...formValues,
      dateFormat: date,
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Gerencie as configurações do sistema e personalize sua experiência
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className={`grid w-full ${canManageOffice ? 'grid-cols-9' : 'grid-cols-8'}`}>
                <TabsTrigger value="geral" className="cursor-pointer">Geral</TabsTrigger>
                <TabsTrigger value="usuarios" className="cursor-pointer">Usuários</TabsTrigger>
                <TabsTrigger value="permissoes" className="cursor-pointer">Permissões</TabsTrigger>
                <TabsTrigger value="clientes" className="cursor-pointer">Clientes</TabsTrigger>
                <TabsTrigger value="processos" className="cursor-pointer">Processos</TabsTrigger>
                <TabsTrigger value="prazos" className="cursor-pointer">Prazos</TabsTrigger>
                <TabsTrigger value="equipes" className="cursor-pointer">Equipes</TabsTrigger>
                {canManageOffice && (
                  <TabsTrigger value="escritorio" className="cursor-pointer">Escritório</TabsTrigger>
                )}
                <TabsTrigger value="integracao" className="cursor-pointer">Integração</TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Gerais</CardTitle>
                    <CardDescription>
                      Gerencie suas informações pessoais e preferências
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formValues.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formValues.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifications">Notificações</Label>
                        <Switch
                          id="notifications"
                          name="notifications"
                          checked={formValues.notifications}
                          onCheckedChange={(checked) =>
                            setFormValues({ ...formValues, notifications: checked })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Preferências</CardTitle>
                    <CardDescription>
                      Personalize a aparência e o comportamento do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Tema</Label>
                        <Select
                          value={formValues.theme}
                          onValueChange={(value) =>
                            setFormValues({ ...formValues, theme: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tema" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="dark">Escuro</SelectItem>
                            <SelectItem value="system">Sistema</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <Select
                          value={formValues.language}
                          onValueChange={(value) =>
                            setFormValues({ ...formValues, language: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o idioma" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                            <SelectItem value="en-US">Inglês (Estados Unidos)</SelectItem>
                            <SelectItem value="es-ES">Espanhol (Espanha)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Fuso Horário</Label>
                        <Select
                          value={formValues.timezone}
                          onValueChange={(value) =>
                            setFormValues({ ...formValues, timezone: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o fuso horário" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Sao_Paulo">
                              America/Sao_Paulo
                            </SelectItem>
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Formato de Data</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !formValues.dateFormat && "text-muted-foreground"
                              )}
                            >
                              {formValues.dateFormat ? (
                                format(formValues.dateFormat, "PPP")
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formValues.dateFormat}
                              onSelect={handleDateChange}
                              className="rounded-md border"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeFormat">Formato de Hora</Label>
                        <Select
                          value={formValues.timeFormat}
                          onValueChange={(value) =>
                            setFormValues({ ...formValues, timeFormat: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o formato" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12h">12h</SelectItem>
                            <SelectItem value="24h">24h</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usuarios" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Gerenciamento de Usuários</CardTitle>
                    <CardDescription>
                      Adicione, edite e remova usuários do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Em desenvolvimento</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="permissoes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Gerenciamento de Permissões</CardTitle>
                    <CardDescription>
                      Defina as permissões de acesso para cada usuário
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Em desenvolvimento</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="clientes" className="space-y-4">
                <ClientOriginConfig />
              </TabsContent>

              <TabsContent value="processos" className="space-y-4">
                <ProcessTypeSimple />
              </TabsContent>

              <TabsContent value="prazos" className="space-y-4">
                <DeadlineConfig />
              </TabsContent>

              <TabsContent value="equipes" className="space-y-4">
                <TeamManagement />
              </TabsContent>

              {canManageOffice && (
                <TabsContent value="escritorio" className="space-y-4">
                  <OfficeSettings />
                </TabsContent>
              )}

              <TabsContent value="integracao" className="space-y-4">
                <GoogleCalendarIntegration />
              </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
