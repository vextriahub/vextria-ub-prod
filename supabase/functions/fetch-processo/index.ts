import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
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
  "SP": "tjsp", "TO": "tjto",

const mapProcess = (hit: any, tribunalSigla?: string) => {
  const source = hit?._source;
  if (!source) {
    return {
      id: hit?._id || 'unknown',
      numeroProcesso: 'Não ident.',
      titulo: 'Processo sem dados',
      partes: 'Não ident.',
      tribunal: tribunalSigla?.toUpperCase() || '---',
      ultimoAndamento: null,
      faseProcessual: '---',
      valorCausa: 0
    };
  }

  const autores = source.partes?.filter((p: any) => p.tipo === 'Ativa' || p.tipo === 'Requerente')?.map((p: any) => p.nome)?.join(', ') || 'Não identificado';
  const reus = source.partes?.filter((p: any) => p.tipo === 'Passiva' || p.tipo === 'Requerido')?.map((p: any) => p.nome)?.join(', ') || 'Não identificado';
  const lastMovement = source.movimentacoes?.[0] || null;

  return {
    id: hit._id,
    numeroProcesso: source.numeroProcesso || 'N/A',
    titulo: `${autores} x ${reus}`,
    partes: `${autores} x ${reus}`,
    tribunal: source.tribunal || tribunalSigla?.toUpperCase() || 'Não ident.',
    ultimoAndamento: lastMovement ? {
      descricao: lastMovement.descricao,
      data: lastMovement.dataHora
    } : null,
    faseProcessual: source.classe?.nome || 'Não identificada',
    valorCausa: source.valorCausa || 0,
    vara: source.orgaoJulgador?.nome || '',
    comarca: source.orgaoJulgador?.codigoMunicipioIBGE || '',
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
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

    // BUSCA POR OAB (HÍBRIDA: DATAJUD + COMUNICA PJE)
    if (oab && uf) {
      console.log(`[FETCH-PROCESSO-OAB] Iniciando busca híbrida: OAB ${oab}-${uf}`);
      const tribunalSigla = UF_TO_TRIBUNAL[uf.toUpperCase()] || `tj${uf.toLowerCase()}`;
      
      let allResults: any[] = [];

      // 1. TENTAR DATAJUD (E-SAJ/PJE METADATA)
      try {
        const searchBody = {
          query: {
            query_string: {
              query: `partes.advogados.oab: "${oab}" AND partes.advogados.uf: "${uf.toUpperCase()}"`,
              default_operator: "AND"
            }
          },
          size: 50
        };

        const djResponse = await fetch(`https://api-publica.datajud.cnj.jus.br/api_publica_${tribunalSigla}/_search`, {
          method: 'POST',
          headers: {
            'Authorization': `APIKey ${processKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(searchBody)
        });

        if (djResponse.ok) {
          const djData = await djResponse.json();
          const djProcesses = (djData.hits?.hits || []).map((hit: any) => mapProcess(hit, tribunalSigla));
          allResults = [...allResults, ...djProcesses];
          console.log(`[DATAJUD] Encontrados: ${djProcesses.length}`);
        }
      } catch (e) {
        console.error("[DATAJUD] Falha na busca:", e);
      }

      // 2. TENTAR COMUNICA PJE API (FALLBACK PODEROSO)
      if (allResults.length === 0 || uf === 'DF') {
        try {
          console.log(`[COMUNICA-PJE] Consultando fallback para OAB ${oab}-${uf}`);
          const pjeResponse = await fetch(`https://comunicaapi.pje.jus.br/api/v1/comunicacao?numeroOab=${oab}&ufOab=${uf}`);
          if (pjeResponse.ok) {
            const pjeData = await pjeResponse.json();
            const pjeItems = pjeData.items || [];
            
            const pjeProcesses = pjeItems.map((item: any) => ({
              id: item.id || item.numeroProcesso,
              numeroProcesso: item.numeroProcesso,
              titulo: item.tituloProcesso || `Processo ${item.numeroProcesso}`,
              partes: item.partes?.map((p: any) => p.nome).join(' x ') || item.tituloProcesso || 'Não identificado',
              tribunal: item.nomeTribunal || tribunalSigla?.toUpperCase() || 'PJE',
              ultimoAndamento: {
                descricao: item.textoComunicacao || 'Comunicação PJe',
                data: item.dataDisponibilizacao
              },
              faseProcessual: 'Comunicado PJe',
              valorCausa: 0,
              vara: item.nomeOrgao || '',
              comarca: uf
            }));

            // Evitar duplicados por número de processo
            const existingNumbers = new Set(allResults.map(p => p.numeroProcesso));
            pjeProcesses.forEach((p: any) => {
              if (!existingNumbers.has(p.numeroProcesso)) {
                allResults.push(p);
                existingNumbers.add(p.numeroProcesso);
              }
            });
            console.log(`[COMUNICA-PJE] Encontrados após merge: ${allResults.length}`);
          }
        } catch (e) {
          console.error("[COMUNICA-PJE] Falha na busca:", e);
        }
      }

      return new Response(JSON.stringify(allResults), {
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
      const hits = data.hits?.hits || [];
      
      if (hits.length === 0) {
        return new Response(JSON.stringify({ error: "Processo não encontrado no DataJud." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      // Retorna apenas o primeiro resultado mapeado
      return new Response(JSON.stringify(mapProcess(hits[0], tribunalSigla)), {
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
