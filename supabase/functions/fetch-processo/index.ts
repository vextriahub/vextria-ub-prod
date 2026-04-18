import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Chave pública do DataJud (CNJ) como fallback
const PUBLIC_DATAJUD_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

// Mapeamento de J.RR para Sigla do Tribunal (Apenas os mais comuns para MVP)
const TRIBUNAL_MAP: Record<string, string> = {
  "8.01": "tjac", "8.02": "tjal", "8.03": "tjam", "8.04": "tjap", "8.05": "tjba",
  "8.06": "tjce", "8.07": "tjdft", "8.08": "tjes", "8.09": "tjgo", "8.10": "tjma",
  "8.11": "tjmt", "8.12": "tjms", "8.13": "tjmg", "8.14": "tjpa", "8.15": "tjpb",
  "8.16": "tjpr", "8.17": "tjpe", "8.18": "tjpi", "8.19": "tjrj", "8.20": "tjrn",
  "8.21": "tjrs", "8.22": "tjro", "8.23": "tjrr", "8.24": "tjsc", "8.25": "tjse",
  "8.26": "tjsp", "8.27": "tjtq",
  "4.01": "trf1", "4.02": "trf2", "4.03": "trf3", "4.04": "trf4", "4.05": "trf5", "4.06": "trf6",
  "5.01": "trt1", "5.02": "trt2", "5.03": "trt3", "5.04": "trt4", "5.05": "trt5",
  "1.00": "stf", "3.00": "stj"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const processKey = Deno.env.get("PROCESSO_API_KEY") || PUBLIC_DATAJUD_KEY;

    // Obter o token de autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    // Verificar o usuário no Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error("Authentication error");

    const { numeroProcesso } = await req.json();
    if (!numeroProcesso) throw new Error("Número do processo é obrigatório");

    // Limpar o número (remover pontos e traços)
    const cleanNumber = numeroProcesso.replace(/[.-]/g, "");

    // Extrair J.RR (7º e 8º dígitos após o ano ou posições fixas no CNJ)
    // Formato: NNNNNNN-DD.YYYY.J.RR.EEEE -> NNNNNNNDDYYYYJRR EEEE
    // Posições (0-indexed): N(0-6), D(7-8), Y(9-12), J(13), R(14-15)
    const j = cleanNumber.substring(13, 14);
    const rr = cleanNumber.substring(14, 16);
    const tribunalCode = `${j}.${rr}`;
    const tribunalSigla = TRIBUNAL_MAP[tribunalCode] || "tjsp"; // Default tjsp se não encontrar

    const apiUrl = `https://api-publica.datajud.cnj.jus.br/api_publica_${tribunalSigla}/_search`;
    
    console.log(`[FETCH-PROCESSO] Buscando no tribunal: ${tribunalSigla} (${tribunalCode})`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `APIKey ${processKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: {
          match: {
            numeroProcesso: cleanNumber
          }
        }
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro DataJud (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`[FETCH-PROCESSO-ERROR] ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
