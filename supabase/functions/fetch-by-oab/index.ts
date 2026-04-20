import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Chave pública do DataJud (CNJ) como fallback
const PUBLIC_DATAJUD_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

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

    const { oab, uf } = await req.json();
    if (!oab || !uf) throw new Error("OAB e UF são obrigatórios");

    const tribunalSigla = `tj${uf.toLowerCase()}`;
    const apiUrl = `https://api-publica.datajud.cnj.jus.br/api_publica_${tribunalSigla}/_search`;
    
    console.log(`[FETCH-BY-OAB] Buscando no tribunal: ${tribunalSigla} para OAB: ${oab}-${uf}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `APIKey ${processKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: {
          bool: {
            must: [
              {
                "match": {
                  "partes.advogados.oab": oab
                }
              },
              {
                "match": {
                  "partes.advogados.uf": uf.toUpperCase()
                }
              }
            ]
          }
        },
        size: 50 // Limite de resultados para MVP
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro DataJud (${response.status}): ${errorText}`);
    }

    const rawData = await response.json();
    
    // Transformação dos dados para facilitar no frontend
    const processes = rawData.hits.hits.map((hit: any) => {
        const source = hit._source;
        
        // Resumo das partes (Autor x Réu)
        const autores = source.partes
            ?.filter((p: any) => p.tipo === 'Ativa' || p.tipo === 'Requerente')
            ?.map((p: any) => p.nome)
            ?.join(', ') || 'Não identificado';
            
        const reus = source.partes
            ?.filter((p: any) => p.tipo === 'Passiva' || p.tipo === 'Requerido')
            ?.map((p: any) => p.nome)
            ?.join(', ') || 'Não identificado';

        // Último andamento
        const lastMovement = source.movimentacoes?.[0] || null;

        return {
            id: hit._id,
            numeroProcesso: source.numeroProcesso,
            titulo: `${autores} x ${reus}`,
            partes: `${autores} x ${reus}`,
            tribunal: source.tribunal || tribunalSigla.toUpperCase(),
            grau: source.grau,
            dataUltimaAtualizacao: source.dataHoraUltimaAtualizacao,
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
  } catch (error) {
    console.error(`[FETCH-BY-OAB-ERROR] ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
