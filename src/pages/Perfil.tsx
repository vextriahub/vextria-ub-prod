

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  UserCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Award,
  Briefcase,
  Edit,
  Save
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Perfil = () => {
  const { user, profile, session, isLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    nome: "Carregando...",
    email: "Carregando...",
    telefone: "(xx) xxxxx-xxxx",
    endereco: "Não informado",
    cargo: "Não informado",
    oab: "Não informado",
    especializacao: "Não informado",
  });

  // Preenche dados reais da Sessão Pessoal logada assim que carregar
  useEffect(() => {
    if (user || profile) {
      setUserInfo(prev => ({
        ...prev,
        nome: profile?.full_name || user?.name || "Usuário",
        email: profile?.email || user?.email || "email@exemplo.com",
        telefone: profile?.phone || prev.telefone,
        endereco: profile?.address || prev.endereco,
        cargo: profile?.position || (profile?.role === 'super_admin' ? 'CEO / Super Admin' : 
               profile?.role === 'admin' ? 'Administrador' : 'Membro Comum'),
        oab: profile?.oab || prev.oab,
        especializacao: profile?.specialization || prev.especializacao
      }));
    }
  }, [user, profile]);

  const estatisticas = {
    processosAtivos: 0,
    processosFinalizados: 0,
    clientesAtendidos: 0,
    pontuacaoTotal: 0,
    ranking: "--"
  };

  const handleSave = async () => {
    try {
      if (!user?.id && !profile?.id) {
        toast({ title: "Aviso", description: "Dados da sessão ainda carregando. Tente novamente." });
        return;
      }
      
      setIsSaving(true);
      console.log('Tentando atualizar perfil do usuário:', user?.id || profile?.id);

      const updatePayload = { 
        full_name: userInfo.nome,
        phone: userInfo.telefone,
        address: userInfo.endereco,
        specialization: userInfo.especializacao,
        oab: userInfo.oab,
        position: userInfo.cargo
      };
      
      // Update explícito via chave primária (fallback pra .eq('user_id')) se a PK id falhar
      const targetId = profile?.id || user?.id;
      const targetColumn = profile?.id ? 'id' : 'user_id';
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq(targetColumn, targetId)
        .select()
        .single();

      if (error) {
        console.error("Erro do supabase:", error);
        throw error;
      }

      console.log("Sucesso ao atualizar:", data);
      
      // Atualizar o estado global imediatamente para mudar o menu lateral
      if (refreshProfile) await refreshProfile();

      toast({
        title: "Sucesso",
        description: "Nome de usuário alterado com sucesso!",
      });
      setEditMode(false);
    } catch (err: any) {
      console.error("Erro no catch do update:", err);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: err?.message || "Houve uma falha oculta ao se comunicar com o banco de dados.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 md:space-y-12 overflow-x-hidden animate-in">
      {/* Page Header Moderno */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <UserCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 drop-shadow-sm">
              Meu Perfil
            </h1>
          </div>
          <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-2xl">
            Gerencie sua identidade digital e acompanhe sua jornada profissional no Hub.
          </p>
        </div>
        
        <div className="flex items-center gap-3 glass-morphism p-2 rounded-2xl shadow-premium">
          <Button 
            variant={editMode ? "default" : "outline"}
            size="lg"
            className={cn(
              "rounded-xl h-12 font-bold px-8 transition-all",
              editMode ? "bg-primary text-white shadow-premium" : "bg-white/5 border-white/5 hover:bg-white/10"
            )}
            onClick={() => editMode ? handleSave() : setEditMode(true)}
            disabled={isSaving}
          >
            {editMode ? <Save className="h-5 w-5 mr-2" /> : <Edit className="h-5 w-5 mr-2" />}
            {editMode ? (isSaving ? "Gravando..." : "Salvar") : "Editar Perfil"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:gap-10 grid-cols-1 lg:grid-cols-3">
        {/* Informações Pessoais Premium Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/5 shadow-premium space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <UserCircle className="h-40 w-40" />
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
              <div className="avatar-premium-wrapper p-1 rounded-[2rem] bg-gradient-to-br from-primary to-primary/30 shadow-premium">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-[1.8rem] border-4 border-background">
                  <AvatarImage src="/placeholder.svg" className="object-cover" />
                  <AvatarFallback className="text-3xl font-black bg-muted text-primary">
                    {userInfo.nome?.substring(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="text-center md:text-left space-y-4">
                <div className="space-y-1">
                  {editMode ? (
                    <Input
                      className="text-2xl md:text-3xl font-black bg-white/5 border-white/10 rounded-xl px-4 py-6 h-auto md:w-[400px]"
                      value={userInfo.nome}
                      onChange={(e) => setUserInfo({...userInfo, nome: e.target.value})}
                      placeholder="Nome Completo"
                    />
                  ) : (
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter">{userInfo.nome}</h2>
                  )}
                  <p className="text-primary font-bold tracking-widest uppercase text-xs opacity-80">{userInfo.cargo}</p>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <Badge className="bg-white/5 hover:bg-white/10 text-muted-foreground border-white/5 font-bold px-4 py-1.5 rounded-xl uppercase text-[10px] tracking-widest transition-all">
                    OAB {userInfo.oab}
                  </Badge>
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-4 py-1.5 rounded-xl uppercase text-[10px] tracking-widest">
                    Verificado
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 relative z-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 px-1">Endereço de E-mail</Label>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Mail className="h-5 w-5" />
                  </div>
                  {editMode ? (
                    <Input
                      variant="ghost"
                      className="bg-transparent border-none p-0 h-auto font-bold shadow-none focus-visible:ring-0"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                    />
                  ) : (
                    <span className="font-bold truncate">{userInfo.email}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 px-1">Telefone / WhatsApp</Label>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Phone className="h-5 w-5" />
                  </div>
                  {editMode ? (
                    <Input
                      variant="ghost"
                      className="bg-transparent border-none p-0 h-auto font-bold shadow-none focus-visible:ring-0"
                      value={userInfo.telefone}
                      onChange={(e) => setUserInfo({...userInfo, telefone: e.target.value})}
                    />
                  ) : (
                    <span className="font-bold">{userInfo.telefone}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 px-1">Localização</Label>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <MapPin className="h-5 w-5" />
                  </div>
                  {editMode ? (
                    <Input
                      variant="ghost"
                      className="bg-transparent border-none p-0 h-auto font-bold shadow-none focus-visible:ring-0"
                      value={userInfo.endereco}
                      onChange={(e) => setUserInfo({...userInfo, endereco: e.target.value})}
                    />
                  ) : (
                    <span className="font-bold truncate">{userInfo.endereco}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 px-1">Área de Atuação</Label>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  {editMode ? (
                    <Input
                      variant="ghost"
                      className="bg-transparent border-none p-0 h-auto font-bold shadow-none focus-visible:ring-0"
                      value={userInfo.especializacao}
                      onChange={(e) => setUserInfo({...userInfo, especializacao: e.target.value})}
                    />
                  ) : (
                    <span className="font-bold truncate">{userInfo.especializacao}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Premium Card */}
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] border-white/5 shadow-premium space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold flex items-center gap-3">
                <Award className="h-6 w-6 text-primary" />
                Performance Hub
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all text-center">
                <p className="text-4xl font-black text-primary mb-1">{estatisticas.pontuacaoTotal}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Pontuação Meritocrática</p>
              </div>

              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-center">
                <p className="text-4xl font-black mb-1">#{estatisticas.ranking}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Ranking Global Hub</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Processos Ativos</span>
                <span className="text-lg font-black">{estatisticas.processosAtivos}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Concluídos (MTD)</span>
                <span className="text-lg font-black">{estatisticas.processosFinalizados}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Clientes Geridos</span>
                <span className="text-lg font-black">{estatisticas.clientesAtendidos}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Perfil;
