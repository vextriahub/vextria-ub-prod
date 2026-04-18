
import { Bell, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { NotificationCenter } from "@/components/Notifications/NotificationCenter";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    console.log("Logout clicado - AppHeader");
    
    // Usar a função logout do contexto
    logout();
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  const handlePlanClick = () => {
    toast({
      title: "Plano Atual",
      description: "Você está no plano Premium - Funcionalidade em desenvolvimento",
    });
  };

  return (
    <header className="h-12 md:h-14 lg:h-16 border-b border-border bg-card flex items-center justify-between px-3 md:px-4 lg:px-6">
      {/* Sidebar Trigger - Always visible */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-7 w-7 md:h-8 md:w-8" />
      </div>

      {/* Search Bar - Hidden on mobile, shown on md+ */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar casos, clientes, tarefas..."
            className="pl-8 md:pl-10 bg-background text-sm md:text-base h-8 md:h-10"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 md:gap-2 lg:gap-4">
        {/* Mobile Search Button */}
        <Button variant="ghost" size="icon" className="md:hidden h-7 w-7">
          <Search className="h-3.5 w-3.5" />
        </Button>

        {/* Notifications */}
        <NotificationCenter />

        {/* Theme Selector */}
        <div className="h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 flex items-center justify-center">
          <ThemeSelector />
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10">
              <User className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 md:w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-xs md:text-sm font-medium">{user?.name || "Usuário"}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">{user?.email || "email@exemplo.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-xs md:text-sm cursor-pointer"
              onClick={() => navigate("/perfil")}
            >
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-xs md:text-sm cursor-pointer"
              onClick={() => navigate("/configuracoes")}
            >
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-xs md:text-sm cursor-pointer"
              onClick={handlePlanClick}
            >
              Plano Atual
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive text-xs md:text-sm cursor-pointer"
              onClick={handleLogout}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
