import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, Play, RefreshCw } from 'lucide-react';
import { runStripeDiagnostic, checkStripeConfig, testCreateCheckout } from '@/utils/stripeDebug';

interface DiagnosticResult {
  config: any;
  connection: any;
  checkout: any;
  overall: boolean;
}

export const StripeDebugPanel: React.FC = () => {
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testingCheckout, setTestingCheckout] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const result = await runStripeDiagnostic();
      setDiagnostic(result);
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCheckoutFlow = async () => {
    setTestingCheckout(true);
    try {
      const result = await testCreateCheckout('Básico', 99);
      console.log('Resultado do teste de checkout:', result);
      
      if (result.success && result.data?.checkoutUrl) {
        // Abrir em nova aba para teste
        window.open(result.data.checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error('Erro no teste de checkout:', error);
    } finally {
      setTestingCheckout(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? 'default' : 'destructive'}>
        {success ? 'OK' : 'ERRO'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔍 Debug Stripe</span>
            <Button
              variant="outline"
              size="sm"
              onClick={runDiagnostic}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Atualizar
            </Button>
          </CardTitle>
          <CardDescription>
            Diagnóstico da integração Stripe para identificar problemas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {diagnostic && (
            <>
              {/* Status Geral */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Status Geral</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostic.overall)}
                  {getStatusBadge(diagnostic.overall)}
                </div>
              </div>

              <Separator />

              {/* Configuração Frontend */}
              <div className="space-y-2">
                <h4 className="font-medium">Configuração Frontend</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Publishable Key</span>
                    {getStatusIcon(diagnostic.config.frontend.publishableKey)}
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Secret Key</span>
                    {diagnostic.config.frontend.secretKey ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Webhook Secret</span>
                    {getStatusIcon(diagnostic.config.frontend.webhookSecret)}
                  </div>
                </div>
              </div>

              {/* Erros e Avisos */}
              {diagnostic.config.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Erros:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {diagnostic.config.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {diagnostic.config.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Avisos:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {diagnostic.config.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Teste de Conexão */}
              <div className="space-y-2">
                <h4 className="font-medium">Conexão com Stripe</h4>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Status da Conexão</span>
                    {diagnostic.connection.data && (
                      <p className="text-sm text-muted-foreground">
                        Tipo: {diagnostic.connection.data.keyType} | 
                        Chave: {diagnostic.connection.data.keyPrefix}
                      </p>
                    )}
                    {diagnostic.connection.error && (
                      <p className="text-sm text-red-500">
                        Erro: {diagnostic.connection.error}
                      </p>
                    )}
                  </div>
                  {getStatusIcon(diagnostic.connection.success)}
                </div>
              </div>

              <Separator />

              {/* Teste de Checkout */}
              <div className="space-y-2">
                <h4 className="font-medium">Função Create-Checkout</h4>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Status da Função Edge</span>
                    {diagnostic.checkout.error && (
                      <p className="text-sm text-red-500">
                        Erro: {diagnostic.checkout.error}
                      </p>
                    )}
                    {diagnostic.checkout.data?.checkoutUrl && (
                      <p className="text-sm text-green-600">
                        ✅ URL de checkout gerada
                      </p>
                    )}
                  </div>
                  {getStatusIcon(diagnostic.checkout.success)}
                </div>
              </div>

              <Separator />

              {/* Ações de Teste */}
              <div className="space-y-2">
                <h4 className="font-medium">Testes</h4>
                <div className="flex gap-2">
                  <Button
                    onClick={testCheckoutFlow}
                    disabled={testingCheckout || !diagnostic.overall}
                    variant="outline"
                  >
                    {testingCheckout ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Testar Checkout
                  </Button>
                </div>
              </div>

              {/* Instruções */}
              <Alert>
                <AlertDescription>
                  <strong>Como resolver problemas:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Configure as variáveis no arquivo <code>.env.local</code></li>
                    <li>Verifique se as chaves Stripe estão corretas no dashboard</li>
                    <li>Confirme se as funções edge do Supabase estão deployadas</li>
                    <li>Teste o fluxo completo de checkout</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeDebugPanel;