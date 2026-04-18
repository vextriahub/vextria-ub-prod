import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const processKey = Deno.env.get("PROCESSO_API_KEY");
    if (!processKey) throw new Error("PROCESSO_API_KEY is not set");

    // Obter o token de autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    // Verificar o usuário se necessário (opcional para busca pública, mas bom para segurança)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error("Authentication error");

    const { numeroProcesso, tribunal } = await req.json();
    if (!numeroProcesso) throw new Error("Número do processo é obrigatório");

    // URL da API de busca de processos (CNJ ou similar)
    const apiUrl = `https://api.cnj.jus.br/v1/processo/${numeroProcesso}`;
    
    console.log(`[FETCH-PROCESSO] Buscando processo: ${numeroProcesso}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${processKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
