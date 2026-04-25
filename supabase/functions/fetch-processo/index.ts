import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const PUBLIC_DATAJUD_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";
// v13.1 - Manual JWT Auth Fix

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
};

// -------- Helpers de extração de partes (Expert Edition) --------
const ATIVO = [
  "REQUERENTE", "AUTOR", "AUTORA", "EXEQUENTE", "RECLAMANTE",
  "APELANTE", "AGRAVANTE", "EMBARGANTE", "RECORRENTE", "IMPETRANTE", "POLO ATIVO",
];
const PASSIVO = [
  "REQUERIDO", "REQUERIDA", "RÉU", "REU", "EXECUTADO", "RECLAMADO",
  "APELADO", "AGRAVADO", "EMBARGADO", "RECORRIDO", "IMPETRIDO", "POLO PASSIVO",
];
const TERMINADORES = [
  ...ATIVO, ...PASSIVO,
  "ADVOGADO", "ADVOGADA", "ADVOGADO\\(A\\)", "CLASSE", "ASSUNTO",
  "SENTENÇA", "DECISÃO", "DESPACHO", "CERTIDÃO", "FINALIDADE",
  "DESTINAT", "OBSERVAÇÃO", "OBSERVACAO", "ATO ORDINATÓRIO", "EMENTA",
];

// -------- Classificador de fase processual (Expert Edition) --------
const FASES: Array<[RegExp, string]> = [
  [/ARQUIVAD[OA]\b|BAIXA\s+DEFINITIVA/i, "Arquivado"],
  [/CUMPRIMENTO\s+DE\s+SENTEN[ÇC]A/i, "Cumprimento de sentença"],
  [/EXECU[ÇC][ÃA]O\s+FISCAL/i, "Execução fiscal"],
  [/EXECU[ÇC][ÃA]O/i, "Execução"],
  [/RECURSO\s+ESPECIAL|AGRAVO\s+EM\s+RECURSO\s+ESPECIAL/i, "Recurso especial"],
  [/RECURSO\s+EXTRAORDIN[ÁA]RIO/i, "Recurso extraordinário"],
  [/APELA[ÇC][ÃA]O/i, "Recurso (apelação)"],
  [/AGRAVO\s+DE\s+INSTRUMENTO/i, "Recurso (agravo)"],
  [/EMBARGOS\s+DE\s+DECLARA[ÇC][ÃA]O/i, "Embargos de declaração"],
  [/SENTEN[ÇC]A/i, "Sentenciado"],
  [/AUDI[ÊE]NCIA/i, "Audiência designada"],
  [/DESPACHO|DECIS[ÃA]O\s+INTERLOCUT[ÓO]RIA/i, "Em andamento (decisão)"],
  [/ATO\s+ORDINAT[ÓO]RIO|INTIMA[ÇC][ÃA]O/i, "Em andamento (intimação)"],
  [/CONCLUS[ÃA]O/i, "Concluso"],
  [/CITA[ÇC][ÃA]O/i, "Citação"],
];

function classifyFase(text: string): string {
  if (!text) return "Não identificada";
  for (const [re, label] of FASES) if (re.test(text)) return label;
  return "Em andamento";
}

function summarize(descricao: string, max = 160): string {
  if (!descricao) return "";
  const clean = descricao.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s\S*$/, "") + "…";
}

function buildAndamentos(rawMovs: any[]): Array<{ data: string | null; resumo: string; fase: string }> {
  if (!Array.isArray(rawMovs)) return [];
  return rawMovs
    .slice(0, 30) // Pegamos mais no CNJ
    .map((a: any) => ({
      data: a?.dataHora ?? a?.data ?? a?.dt ?? null,
      resumo: summarize(a?.descricao ?? a?.titulo ?? a?.nome ?? a?.texto ?? "", 400),
      fase: classifyFase(a?.descricao ?? a?.titulo ?? a?.texto ?? ""),
    }))
    .filter((a) => a.resumo.length > 0);
}

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
      andamentos: [],
      faseProcessual: '---',
      valorCausa: 0
    };
  }

  const autores = source.partes?.filter((p: any) => p.tipo === 'Ativa' || p.tipo === 'Requerente')?.map((p: any) => p.nome)?.join(', ') || 'Não identificado';
  const reus = source.partes?.filter((p: any) => p.tipo === 'Passiva' || p.tipo === 'Requerido')?.map((p: any) => p.nome)?.join(', ') || 'Não identificado';
  
  const andamentos = buildAndamentos(source.movimentacoes || []);

  return {
    id: hit._id,
    numeroProcesso: source.numeroProcesso || 'N/A',
    titulo: `${autores} x ${reus}`,
    partes: `${autores} x ${reus}`,
    autor: autores,
    reu: reus,
    tribunal: source.tribunal || tribunalSigla?.toUpperCase() || 'Não ident.',
    ultimoAndamento: andamentos[0] ? {
      descricao: andamentos[0].resumo,
      data: andamentos[0].data
    } : null,
    andamentos,
    faseProcessual: andamentos[0]?.fase ?? source.classe?.nome || 'Não identificada',
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

    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    console.log(`[AUTH-DEBUG] Authorization header: ${authHeader ? 'Present (' + authHeader.substring(0, 20) + '...)' : 'MISSING'}`);

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Sessão não identificada. Por favor, faça login novamente." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error(`[AUTH-ERROR] getUser failed: ${userError?.message}`);
      return new Response(JSON.stringify({ error: "Falha na validação do usuário. Tente deslogar e logar novamente." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const payload = await req.json();
    const { numeroProcesso, oab, uf } = payload;
    
    console.log(`[FETCH-PROCESSO] Request received: ${JSON.stringify({ numeroProcesso: !!numeroProcesso, oab: !!oab, uf })}`);

    // BUSCA POR OAB (HÍBRIDA: DATAJUD + COMUNICA PJE)
    if (oab && uf) {
      console.log(`[FETCH-PROCESSO-OAB] Iniciando busca híbrida: OAB ${oab}-${uf}`);
      const ufUpper = uf.toUpperCase();
      const tribunalSigla = UF_TO_TRIBUNAL[ufUpper] || `tj${uf.toLowerCase()}`;
      
      let allResults: any[] = [];

      // 1. TENTAR DATAJUD (E-SAJ/PJE METADATA)
      try {
        const searchBody = {
          query: {
            query_string: {
              query: `partes.advogados.oab: "${oab}" AND partes.advogados.uf: "${ufUpper}"`,
              default_operator: "AND"
            }
          },
          size: 100
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
          console.log(`[DATAJUD] Encontrados: ${djProcesses.length} em ${tribunalSigla}`);
        } else {
          console.error(`[DATAJUD] Erro HTTP ${djResponse.status} em ${tribunalSigla}`);
        }
      } catch (e) {
        console.error("[DATAJUD] Falha na busca:", e);
      }

      // 2. TENTAR COMUNICA PJE API (FALLBACK PODEROSO)
      try {
        console.log(`[COMUNICA-PJE] Consultando fallback para OAB ${oab}-${uf}`);
        const pjeResponse = await fetch(`https://comunicaapi.pje.jus.br/api/v1/comunicacao?numeroOab=${oab}&ufOab=${ufUpper}`);
        if (pjeResponse.ok) {
          const pjeData = await pjeResponse.json();
          const pjeItems = pjeData.items || [];
          
          const pjeProcesses = pjeItems.map((item: any) => ({
            id: item.id || item.numeroProcesso,
            numeroProcesso: item.numero_processo || item.numeroProcesso,
            titulo: item.titulo_processo || item.tituloProcesso || `Processo ${item.numero_processo || item.numeroProcesso}`,
            partes: item.texto_comunicacao?.substring(0, 500) || 'Não identificado',
            tribunal: item.nome_tribunal || item.nomeTribunal || 'PJE',
            ultimoAndamento: {
              descricao: (item.texto_comunicacao || 'Comunicação PJe').substring(0, 200),
              data: item.data_disponibilizacao || item.dataDisponibilizacao
            },
            faseProcessual: item.nome_classe || 'Comunicado PJe',
            valorCausa: 0,
            vara: item.nome_orgao || item.nomeOrgao || '',
            comarca: ufUpper
          }));

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

      return new Response(JSON.stringify(allResults), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // BUSCA INDIVIDUAL POR CNJ
    if (numeroProcesso) {
      const cleanNumber = numeroProcesso.replace(/[.-]/g, "");
      if (cleanNumber.length < 14) throw new Error("Número CNJ incompleto");

      const j = cleanNumber.substring(13, 14);
      const rr = cleanNumber.substring(14, 16);
      const tribunalCode = `${j}.${rr}`;
      const tribunalSigla = TRIBUNAL_MAP[tribunalCode] || "tjsp";

      console.log(`[FETCH-PROCESSO-CNJ] Buscando: ${cleanNumber} (${tribunalSigla})`);

      const response = await fetch(`https://api-publica.datajud.cnj.jus.br/api_publica_${tribunalSigla}/_search`, {
        method: 'POST',
        headers: {
          'Authorization': `APIKey ${processKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: { match: { numeroProcesso: cleanNumber } }
        })
      });

      if (!response.ok) {
          const errorText = await response.text();
          console.error(`[DATAJUD-ERROR] ${response.status}: ${errorText}`);
          return new Response(JSON.stringify({ error: `Tribunal ${tribunalSigla.toUpperCase()} indisponível no momento.` }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: response.status,
          });
      }

      const data = await response.json();
      const hits = data.hits?.hits || [];
      
      if (hits.length === 0) {
        return new Response(JSON.stringify({ error: "Processo não encontrado. Verifique o número e o tribunal." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      return new Response(JSON.stringify(mapProcess(hits[0], tribunalSigla)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Informe o Número CNJ ou OAB para realizar a busca.");
  } catch (error: any) {
    console.error(`[FETCH-PROCESSO-CRITICAL] ${error.message}`);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Tente novamente ou cadastre o processo manualmente se o tribunal estiver fora do ar."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error.status || 500,
    });
  }
});
