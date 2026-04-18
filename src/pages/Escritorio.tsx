import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionGuard } from "@/components/Auth/PermissionGuard";
import { OfficeSettings } from "@/components/Office/OfficeSettings";
import { UserManagement } from "@/components/Office/UserManagement";
import { Building2, Users, Settings } from "lucide-react";

const Escritorio = () => {
  return (
    <PermissionGuard permission="canManageOffice">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Gerenciar Escritório
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Gerencie as configurações e usuários do seu escritório
                </p>
              </div>

              <Tabs defaultValue="configuracoes" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="configuracoes" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configurações
                  </TabsTrigger>
                  <TabsTrigger value="usuarios" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Usuários
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="configuracoes" className="space-y-6">
                  <OfficeSettings />
                </TabsContent>

                <TabsContent value="usuarios" className="space-y-6">
                  <UserManagement />
                </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
};

export default Escritorio;