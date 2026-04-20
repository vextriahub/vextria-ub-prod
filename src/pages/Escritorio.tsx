import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionGuard } from "@/components/Auth/PermissionGuard";
import { OfficeSettings } from "@/components/Office/OfficeSettings";
import { UserManagement } from "@/components/Office/UserManagement";
import { Building2, Users, Settings } from "lucide-react";

const Escritorio = () => {
  return (
    <PermissionGuard permission="canManageOffice">
      <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-10 overflow-x-hidden entry-animate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Gestão do Escritório
              </h1>
            </div>
            <p className="text-sm md:text-lg text-muted-foreground font-medium">
              Ajuste as configurações globais e controle o acesso de usuários.
            </p>
          </div>
        </div>

        <Tabs defaultValue="configuracoes" className="space-y-8">
          <div className="border-b border-white/5 bg-background/30 backdrop-blur-sm p-1 rounded-2xl w-fit">
            <TabsList className="h-11 gap-1 bg-transparent border-none">
              <TabsTrigger value="configuracoes" className="rounded-xl px-6 data-[state=active]:bg-primary/20 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 font-bold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="rounded-xl px-6 data-[state=active]:bg-primary/20 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 font-bold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários
              </TabsTrigger>
            </TabsList>
          </div>

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
