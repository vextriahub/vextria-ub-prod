import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Shield, UserPlus } from "lucide-react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useStripe } from "@/hooks/useStripe";
import { supabase } from '@/integrations/supabase/client';

const Register = () => {
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'básico';
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    oab: "",
    state: "",
    cpfCnpj: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [planData, setPlanData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();
  const { createCheckoutSession } = useStripe();

  // Buscar dados do plano selecionado
  useEffect(() => {
    const fetchPlanData = async () => {
      const { data, error } = await supabase
        .from('plan_configs')
        .select('*')
        .eq('plan_name', selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1))
        .single();
      
      if (data) {
        setPlanData(data);
      }
    };
    
    fetchPlanData();
  }, [selectedPlan]);

  const brasileirianStates = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro no cadastro",
        description: "Nome completo é obrigatório",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Erro no cadastro", 
        description: "E-mail é obrigatório",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.cpfCnpj.trim()) {
      toast({
        title: "Erro no cadastro",
        description: "CPF/CNPJ é obrigatório",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Erro no cadastro",
        description: "Senha deve ter pelo menos 8 caracteres",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "Confirmação de senha não confere",
        variant: "destructive",
      });
      return false;
    }

    if (!acceptTerms) {
      toast({
        title: "Erro no cadastro",
        description: "Você deve aceitar os termos de uso",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      console.log('🚀 Starting registration process for:', formData.email);
      
      // Marcar no localStorage que estamos em processo de checkout para evitar redirecionamento
      localStorage.setItem('checkout_in_progress', 'true');
      
      const { error } = await register(formData.email, formData.password, formData.name);

      if (error) {
        console.error('❌ Register error:', error);
        toast({
          title: "Erro no cadastro",
          description: error.message || "Ocorreu um erro durante o cadastro",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Registration successful, starting checkout process...');
      
      // Fazer login automático após o registro bem-sucedido
      console.log('🔐 Attempting automatic login after registration...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) {
        console.error('❌ Automatic login failed:', loginError);
        toast({
          title: "Cadastro realizado!",
          description: "Faça login para continuar.",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        setIsLoading(false);
        return;
      }

      console.log('✅ Automatic login successful');
      
      // Usuário cadastrado com sucesso, agora criar checkout IMEDIATAMENTE
      toast({
        title: "Cadastro realizado!",
        description: "Criando seu checkout de pagamento...",
      });

      console.log('📦 Creating Stripe checkout for plan:', selectedPlan);

      // Criar checkout session via Stripe
      const checkoutData = await createCheckoutSession(
        selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1),
        planData ? planData.price_cents / 100 : 99
      );

      console.log('📦 Stripe checkout response:', checkoutData);

      if (!checkoutData?.url) {
        console.error('❌ Stripe checkout error: No URL returned');
        
        // Limpar flag de checkout em progresso quando há erro
        localStorage.removeItem('checkout_in_progress');
        
        toast({
          title: "Erro no checkout",
          description: "Erro ao criar sessão de pagamento. Redirecionando para dashboard...",
          variant: "destructive",
        });
        
        // Em caso de erro no checkout, redirecionar para dashboard com trial
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
        return;
      }

      console.log('✅ Stripe checkout created successfully, redirecting to Stripe...');
      
      // Limpar flag de checkout em progresso antes de redirecionar
      localStorage.removeItem('checkout_in_progress');
      
      toast({
        title: "Redirecionando para pagamento",
        description: "Você será redirecionado para o Stripe para completar o pagamento.",
      });
      
      // Redirecionar para Stripe checkout
      window.open(checkoutData.url, '_blank');

    } catch (error) {
      console.error('❌ Unexpected error:', error);
      
      // Limpar flag de checkout em progresso quando há erro inesperado
      localStorage.removeItem('checkout_in_progress');
      
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/vextria-logo.svg" 
              alt="VextriaHub" 
              className="h-16 w-auto"
            />
          </div>
          <p className="text-muted-foreground text-sm">
            Assistente Jurídico Inteligente
          </p>
        </div>

        {/* Register Card */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
              <UserPlus className="h-5 w-5" />
              Começar Teste Grátis
            </CardTitle>
            <CardDescription className="text-center">
              7 dias grátis • Sem compromisso • Cancele quando quiser
            </CardDescription>
            {planData && (
              <div className="text-center">
                <Badge variant="outline" className="text-sm">
                  Plano {planData.plan_name} - R$ {(planData.price_cents / 100).toFixed(2)}/mês
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* CPF/CNPJ Field */}
              <div className="space-y-2">
                <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
                <Input
                  id="cpfCnpj"
                  type="text"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  value={formData.cpfCnpj}
                  onChange={(e) => handleInputChange("cpfCnpj", e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* OAB Field */}
              <div className="space-y-2">
                <Label htmlFor="oab">Número da OAB (opcional)</Label>
                <Input
                  id="oab"
                  type="text"
                  placeholder="Ex: 123456"
                  value={formData.oab}
                  onChange={(e) => handleInputChange("oab", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* State Field */}
              <div className="space-y-2">
                <Label htmlFor="state">Estado de atuação (opcional)</Label>
                <Select onValueChange={(value) => handleInputChange("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {brasileirianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  Aceito os{" "}
                  <a href="#" className="text-primary hover:underline">
                    termos de uso
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-primary hover:underline">
                    política de privacidade
                  </a>
                </Label>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Criar conta e continuar para pagamento"}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Faça login
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Seus dados estão protegidos</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 VextriaHub. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;