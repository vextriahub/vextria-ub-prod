import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserCheck, Building2, Phone, Mail, MapPin, Target } from "lucide-react";

interface Lead {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  cpf_cnpj?: string;
  tipo_pessoa: "fisica" | "juridica";
  origem: string;
  endereco?: string;
  observacoes?: string;
  status: "lead" | "quente" | "morno" | "frio";
  interesse?: string;
}

interface NovoLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (lead: Lead) => void;
}

const origensLead = [
  "Site",
  "Redes Sociais", 
  "Google Ads",
  "Facebook Ads",
  "Indicação",
  "Networking",
  "WhatsApp",
  "Telefone",
  "Email Marketing",
  "Evento/Palestra",
  "Marketing de Conteúdo",
  "Outros"
];

const interessesLead = [
  "Direito Trabalhista",
  "Direito Civil",
  "Direito Criminal",
  "Direito de Família",
  "Direito Empresarial",
  "Direito Imobiliário",
  "Direito Previdenciário",
  "Direito Tributário",
  "Direito do Consumidor",
  "Outros"
];

const statusLead = [
  { value: "lead", label: "Lead", color: "gray" },
  { value: "frio", label: "Frio", color: "blue" },
  { value: "morno", label: "Morno", color: "yellow" },
  { value: "quente", label: "Quente", color: "red" }
];

export const NovoLeadDialog = ({ open, onOpenChange, onSave }: NovoLeadDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Lead>({
    nome: "",
    email: "",
    telefone: "",
    cpf_cnpj: "",
    tipo_pessoa: "fisica",
    origem: "",
    endereco: "",
    observacoes: "",
    status: "lead",
    interesse: ""
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      cpf_cnpj: "",
      tipo_pessoa: "fisica",
      origem: "",
      endereco: "",
      observacoes: "",
      status: "lead",
      interesse: ""
    });
  };

  const handleInputChange = (field: keyof Lead, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do lead.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.telefone.trim() && !formData.email.trim()) {
      toast({
        title: "Contato obrigatório", 
        description: "Por favor, informe pelo menos um telefone ou email.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.email && !formData.email.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Por favor, informe um email válido.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          user_id: user.id,
          nome: formData.nome.trim(),
          email: formData.email.trim() || null,
          telefone: formData.telefone.trim() || null,
          cpf_cnpj: formData.cpf_cnpj?.trim() || null,
          tipo_pessoa: formData.tipo_pessoa,
          origem: formData.origem || null,
          endereco: formData.endereco?.trim() || null,
          status: formData.status
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Lead criado com sucesso!",
        description: `O lead ${formData.nome} foi adicionado ao CRM.`,
      });

      // Criar objeto Lead compatível para o callback
      const leadData: Lead = {
        id: data.id,
        nome: data.nome,
        email: data.email || "",
        telefone: data.telefone || "",
        cpf_cnpj: data.cpf_cnpj,
        tipo_pessoa: data.tipo_pessoa as "fisica" | "juridica",
        origem: data.origem || "",
        endereco: data.endereco,
        status: data.status as "lead" | "quente" | "morno" | "frio",
        interesse: formData.interesse,
        observacoes: formData.observacoes
      };

      onSave?.(leadData);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro ao criar lead",
        description: "Ocorreu um erro ao salvar o lead. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Novo Lead
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <UserCheck className="h-4 w-4" />
              Informações Básicas
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de pessoa</Label>
                <RadioGroup
                  value={formData.tipo_pessoa}
                  onValueChange={(value) => handleInputChange("tipo_pessoa", value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fisica" id="fisica" />
                    <Label htmlFor="fisica">Pessoa Física</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="juridica" id="juridica" />
                    <Label htmlFor="juridica">Pessoa Jurídica</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj">
                {formData.tipo_pessoa === "fisica" ? "CPF" : "CNPJ"}
              </Label>
              <Input
                id="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={(e) => handleInputChange("cpf_cnpj", e.target.value)}
                placeholder={formData.tipo_pessoa === "fisica" ? "000.000.000-00" : "00.000.000/0001-00"}
              />
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Phone className="h-4 w-4" />
              Informações de Contato
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="joao@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange("endereco", e.target.value)}
                placeholder="Rua, número, bairro, cidade - UF"
              />
            </div>
          </div>

          {/* CRM */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4" />
              Informações de CRM
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origem">Origem do Lead</Label>
                <Select value={formData.origem} onValueChange={(value) => handleInputChange("origem", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Como chegou até nós?" />
                  </SelectTrigger>
                  <SelectContent>
                    {origensLead.map((origem) => (
                      <SelectItem key={origem} value={origem}>
                        {origem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status do Lead</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusLead.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${status.color}-500`} />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interesse">Área de Interesse</Label>
              <Select value={formData.interesse} onValueChange={(value) => handleInputChange("interesse", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Qual área jurídica?" />
                </SelectTrigger>
                <SelectContent>
                  {interessesLead.map((interesse) => (
                    <SelectItem key={interesse} value={interesse}>
                      {interesse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange("observacoes", e.target.value)}
                placeholder="Informações adicionais sobre o lead..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Criar Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 