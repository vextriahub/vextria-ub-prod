import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const PUBLIC_DATAJUD_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

const UF_TO_TRIBUNAIS: Record<string, string[]> = {
  "AC": ["tjac", "trf1", "trt14"], "AL": ["tjal", "trf5", "trt19"],
  "AM": ["tjam", "trf1", "trt11"], "AP": ["tjap", "trf1", "trt8"],
  "BA": ["tjba", "trf1", "trt5"], "CE": ["tjce", "trf5", "trt7"],
  "DF": ["tjdft", "trf1", "trt10"], "ES": ["tjes", "trf2", "trt17"],
  "GO": ["tjgo", "trf1", "trt18"], "MA": ["tjma", "trf1", "trt16"],
  "MG": ["tjmg", "trf6", "trt3"], "MS": ["tjms", "trf3", "trt24"],
  "MT": ["tjmt", "trf1", "trt23"], "PA": ["tjpa", "trf1", "trt8"],
  "PB": ["tjpb", "trf5", "trt13"], "PE": ["tjpe", "trf5", "trt6"],
  "PI": ["tjpi", "trf1", "trt22"], "PR": ["tjpr", "trf4", "trt9"],
  "RJ": ["tjrj", "trf2", "trt1"], "RN": ["tjrn", "trf5", "trt21"],
  "RO": ["tjro", "trf1", "trt14"], "RR": ["tjrr", "trf1", "trt11"],
  "RS": ["tjrs", "trf4", "trt4"], "SC": ["tjsc", "trf4", "trt12"],
  "SE": ["tjse", "trf5", "trt20"], "SP": ["tjsp", "trf3", "trt2", "trt15"],
  "TO": ["tjto", "trf1", "trt10"],
};

const INACTIVE_TERMS = ["arquivado", "baixado", "extinto", "transitado", "encerrado", "cumprida", "definitiv"];

const isProcessActive = (process: any) => {
  const text = (process.faseProcessual + " " + (process.ultimoAndamento?.descricao || "")).toLowerCase();
  return !INACTIVE_TERMS.some(term => text.includes(term));
};

const mapProcess = (hit: any, tribunalSigla?: string) => {
  const source = hit?._source;
  if (!source) return null;

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
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders, status: 204 });

  try {
    const processKey = Deno.env.get("PROCESSO_API_KEY") || PUBLIC_DATAJUD_KEY;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error("Authentication error");

    const { oab, uf } = await req.json();
    if (!oab || !uf) throw new Error("OAB e UF são obrigatórios");

    const ufUpper = uf.toUpperCase();
    const tribunaisParaBuscar = UF_TO_TRIBUNAIS[ufUpper] || [`tj${uf.toLowerCase()}`];
    
    console.log(`[DEEP-SYNC] OAB ${oab}-${ufUpper} | Filtrando Ativos`);
    
    let allResults: any[] = [];
    const numeroOabPuro = oab.replace(/\D/g, '');
    const numeroOabComZero = numeroOabPuro.padStart(6, '0');

    // 1. DATAJUD (Busca paralela com sort por recência e maior size)
    const searchPromises = tribunaisParaBuscar.map(async (tribunal) => {
      try {
        const searchBody = {
          query: {
            query_string: {
              query: `(partes.advogados.oab: "${numeroOabPuro}" OR partes.advogados.oab: "${numeroOabComZero}") AND partes.advogados.uf: "${ufUpper}"`,
              default_operator: "AND"
            }
          },
          sort: [{ "dataHora": { "order": "desc" } }],
          size: 300
        };

        const response = await fetch(`https://api-publica.datajud.cnj.jus.br/api_publica_${tribunal}/_search`, {
          method: 'POST',
          headers: { 'Authorization': `APIKey ${processKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(searchBody)
        });

        if (response.ok) {
          const data = await response.json();
          return (data.hits?.hits || []).map((hit: any) => mapProcess(hit, tribunal)).filter(Boolean);
        }
      } catch (e) {
        console.error(`[DATAJUD] Erro em ${tribunal}:`, e);
      }
      return [];
    });

    const datajudResults = await Promise.all(searchPromises);
    datajudResults.forEach(batch => allResults = [...allResults, ...batch]);

    // 2. COMUNICA PJE (Deep Sync: 5 páginas com filtro de data)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dateStart = oneYearAgo.toISOString().split('T')[0];

    const pjePromises = [0, 1, 2, 3, 4].map(async (page) => {
      try {
        const pjeUrl = `https://comunicaapi.pje.jus.br/api/v1/comunicacao?numeroOab=${numeroOabPuro}&ufOab=${ufUpper}&itensPorPagina=100&pagina=${page}&dataDisponibilizacaoInicio=${dateStart}`;
        const pjeResponse = await fetch(pjeUrl);
        if (pjeResponse.ok) {
          const pjeData = await pjeResponse.json();
          return (pjeData.items || []).map((item: any) => {
            const numProc = item.numero_processo || item.numeroProcesso;
            if (!numProc) return null;
            return {
              id: item.id || numProc,
              numeroProcesso: numProc,
              titulo: item.titulo_processo || item.tituloProcesso || `Processo ${numProc}`,
              partes: item.partes?.map((p: any) => p.nome).join(' x ') || item.titulo_processo || item.tituloProcesso || 'Não identificado',
              tribunal: item.nome_tribunal || item.sigla_tribunal || item.nomeTribunal || 'PJE',
              ultimoAndamento: {
                descricao: item.texto_comunicacao || item.textoComunicacao || 'Comunicação PJe',
                data: item.data_disponibilizacao || item.dataDisponibilizacao
              },
              faseProcessual: 'Comunicado PJe',
              valorCausa: 0,
              vara: item.nome_orgao || item.nomeOrgao || '',
              comarca: ufUpper
            };
          }).filter(Boolean);
        }
      } catch (e) {
        console.error(`[PJE-PAGE-${page}] Erro:`, e);
      }
      return [];
    });

    const pjeBatchResults = await Promise.all(pjePromises);
    const existingNumbers = new Set(allResults.map(p => p.numeroProcesso));
    
    pjeBatchResults.forEach(batch => {
      batch.forEach((p: any) => {
        if (!existingNumbers.has(p.numeroProcesso)) {
          allResults.push(p);
          existingNumbers.add(p.numeroProcesso);
        }
      });
    });

    // 3. FILTRO FINAL: APENAS ATIVOS
    const activeResults = allResults.filter(isProcessActive);
    
    console.log(`[SYNC-COMPLETED] Totais: ${allResults.length} Encontrados | ${activeResults.length} Ativos`);

    // Deduplicação final por número de processo
    const uniqueResults = Array.from(new Map(activeResults.map(item => [item.numeroProcesso, item])).values());

    return new Response(JSON.stringify(uniqueResults), {
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
