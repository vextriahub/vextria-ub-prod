import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PUBLIC_DATAJUD_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

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

const UF_TO_TRIBUNAL: Record<string, string> = {
  "AC": "tjac", "AL": "tjal", "AM": "tjam", "AP": "tjap", "BA": "tjba",
  "CE": "tjce", "DF": "tjdft", "ES": "tjes", "GO": "tjgo", "MA": "tjma",
  "MG": "tjmg", "MS": "tjms", "MT": "tjmt", "PA": "tjpa", "PB": "tjpb",
  "PE": "tjpe", "PI": "tjpi", "PR": "tjpr", "RJ": "tjrj", "RN": "tjrn",
  "RO": "tjro", "RR": "tjrr", "RS": "tjrs", "SC": "tjsc", "SE": "tjse",
  "SP": "tjsp", "TO": "tjtq"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const processKey = Deno.env.get("PROCESSO_API_KEY") || PUBLIC_DATAJUD_KEY;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error("Authentication error");

    const payload = await req.json();
    const { numeroProcesso, oab, uf } = payload;

    // BUSCA POR OAB
    if (oab && uf) {
      const tribunalSigla = UF_TO_TRIBUNAL[uf.toUpperCase()] || `tj${uf.toLowerCase()}`;
      const apiUrl = `https://api-publica.datajud.cnj.jus.br/api_publica_${tribunalSigla}/_search`;
      
      console.log(`[FETCH-PROCESSO-OAB] Iniciando busca no tribunal: ${tribunalSigla} | OAB: ${oab} | UF: ${uf}`);

      const searchBody = {
        query: {
          query_string: {
            query: `partes.advogados.oab: "${oab}" AND partes.advogados.uf: "${uf.toUpperCase()}"`,
            default_operator: "AND"
          }
        },
        size: 50
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `APIKey ${processKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[FETCH-PROCESSO-OAB] Erro na API do DataJud: ${response.status} - ${errorText}`);
        
        let userMessage = "Erro ao consultar o tribunal nacional.";
        if (response.status === 403) userMessage = "Acesso negado pelo tribunal. Alguns tribunais restringem buscas em massa por OAB via API pública.";
        if (response.status === 404) userMessage = `Tribunal ${tribunalSigla.toUpperCase()} não encontrado ou indisponível.`;
        
        return new Response(JSON.stringify({ error: userMessage, status: response.status, details: errorText }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status,
        });
      }

      const rawData = await response.json();
      console.log(`[FETCH-PROCESSO-OAB] Resultados encontrados para OAB ${oab}: ${rawData.hits?.total?.value || 0}`);
      
      const processes = (rawData.hits?.hits || []).map((hit: any) => {
          const source = hit._source;
          const autores = source.partes?.filter((p: any) => p.tipo === 'Ativa' || p.tipo === 'Requerente')?.map((p: any) => p.nome)?.join(', ') || 'Não identificado';
          const reus = source.partes?.filter((p: any) => p.tipo === 'Passiva' || p.tipo === 'Requerido')?.map((p: any) => p.nome)?.join(', ') || 'Não identificado';
          const lastMovement = source.movimentacoes?.[0] || null;

          return {
              id: hit._id,
              numeroProcesso: source.numeroProcesso,
              titulo: `${autores} x ${reus}`,
              partes: `${autores} x ${reus}`,
              tribunal: source.tribunal || tribunalSigla.toUpperCase(),
              ultimoAndamento: lastMovement ? {
                  descricao: lastMovement.descricao,
                  data: lastMovement.dataHora
              } : null,
              faseProcessual: source.classe?.nome || 'Não identificada',
              valorCausa: source.valorCausa
          };
      });

      return new Response(JSON.stringify(processes), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // BUSCA INDIVIDUAL
    if (numeroProcesso) {
      const cleanNumber = numeroProcesso.replace(/[.-]/g, "");
      const j = cleanNumber.substring(13, 14);
      const rr = cleanNumber.substring(14, 16);
      const tribunalCode = `${j}.${rr}`;
      const tribunalSigla = TRIBUNAL_MAP[tribunalCode] || "tjsp";

      console.log(`[FETCH-PROCESSO] Individual: ${cleanNumber} no tribunal: ${tribunalSigla}`);

      const response = await fetch(`https://api-publica.datajud.cnj.jus.br/api_publica_${tribunalSigla}/_search`, {
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
          return new Response(JSON.stringify({ error: `Erro no tribunal: ${response.status}`, details: errorText }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: response.status,
          });
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Parâmetros inválidos.");
  } catch (error) {
    console.error(`[FETCH-PROCESSO-CRITICAL-ERROR] ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
