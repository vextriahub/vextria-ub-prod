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

// -------- Helpers de extração de partes (Expert Edition) --------
const ATIVO = [
  "REQUERENTE", "AUTOR", "AUTORA", "EXEQUENTE", "RECLAMANTE",
  "APELANTE", "AGRAVANTE", "EMBARGANTE", "RECORRENTE", "IMPETRANTE", "POLO ATIVO",
];
const PASSIVO = [
  "REQUERIDO", "REQUERIDA", "RÉU", "REU", "EXECUTADO", "RECLAMADO",
  "APELADO", "AGRAVADO", "EMBARGADO", "RECORRIDO", "IMPETRADO", "POLO PASSIVO",
];
const TERMINADORES = [
  ...ATIVO, ...PASSIVO,
  "ADVOGADO", "ADVOGADA", "ADVOGADO\\(A\\)", "CLASSE", "ASSUNTO",
  "SENTENÇA", "DECISÃO", "DESPACHO", "CERTIDÃO", "FINALIDADE",
  "DESTINAT", "OBSERVAÇÃO", "OBSERVACAO", "ATO ORDINATÓRIO", "EMENTA",
];

function makeRoleRegex(roles: string[]): RegExp {
  const terms = roles.join("|");
  const stops = TERMINADORES.join("|");
  return new RegExp(
    `(?:${terms})\\s*:?\\s+([^\\n\\r]{2,400}?)(?=\\s+(?:${stops})\\s*:|\\s+(?:${stops})\\b|\\s{2,}|$)`,
    "i",
  );
}

const RE_ATIVO   = makeRoleRegex(ATIVO);
const RE_PASSIVO = makeRoleRegex(PASSIVO);

function cleanName(raw: string | null | undefined): string {
  if (!raw) return "";
  let s = raw.replace(/\s+/g, " ").trim();
  s = s.replace(/\s*-\s*(OAB|CPF|CNPJ).*/i, "")
       .replace(/\s*\(.*?\)\s*/g, " ")
       .replace(/\s+e\s+outros\s*$/i, "")
       .replace(/[;,.\s]+$/g, "")
       .trim();
  if (s.split(" ").length > 12) return "";
  if (s.length < 2) return "";
  return s;
}

function extractPartes(text: string): { autor: string; reu: string } {
  if (!text) return { autor: "", reu: "" };
  const mA = text.match(RE_ATIVO);
  const mP = text.match(RE_PASSIVO);
  return {
    autor: cleanName(mA?.[1]),
    reu: cleanName(mP?.[1]),
  };
}

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
    .slice(0, 15)
    .map((a: any) => ({
      data: a?.dataHora ?? a?.data ?? a?.dt ?? null,
      resumo: summarize(a?.descricao ?? a?.titulo ?? a?.nome ?? a?.texto ?? "", 300),
      fase: classifyFase(a?.descricao ?? a?.titulo ?? a?.texto ?? ""),
    }))
    .filter((a) => a.resumo.length > 0);
}

const mapProcess = (hit: any, tribunalSigla?: string) => {
  const source = hit?._source;
  if (!source) return null;

  const fullTextForExtraction = [
    source.classe?.nome,
    source.movimentacoes?.[0]?.descricao,
    ...(source.partes?.map((p: any) => p.nome) || [])
  ].filter(Boolean).join(" \n ");

  const { autor: extAutor, reu: extReu } = extractPartes(fullTextForExtraction);
  const andamentos = buildAndamentos(source.movimentacoes || []);

  const autoresList: string[] = [];
  const reusList: string[] = [];

  const processPart = (p: any) => {
    const nome = p.nome || p.pessoa?.nome || '';
    if (!nome || nome.length < 3) return;
    const tipo = (p.tipo || p.tipoParte || '').toLowerCase();
    const polo = p.polo || p.poloParte;
    if (tipo.includes('ativa') || tipo.includes('autor') || polo === 1 || polo === "1") {
      if (!autoresList.includes(nome)) autoresList.push(nome);
    } else if (tipo.includes('passiva') || tipo.includes('réu') || polo === 2 || polo === "2") {
      if (!reusList.includes(nome)) reusList.push(nome);
    }
  };

  source.partes?.forEach(processPart);
  
  const autores = autoresList.length > 0 ? autoresList.join(', ') : (extAutor || 'Não identificado');
  const reus = reusList.length > 0 ? reusList.join(', ') : (extReu || 'Não identificado');
  
  return {
    id: hit._id,
    numeroProcesso: source.numeroProcesso || 'N/A',
    titulo: `${autores} x ${reus}`,
    partes: `${autores} x ${reus}`,
    autor: autores,
    reu: reus,
    tribunal: source.tribunal || tribunalSigla?.toUpperCase() || 'Justiça',
    ultimoAndamento: andamentos[0] ? {
      descricao: andamentos[0].resumo,
      data: andamentos[0].data
    } : null,
    andamentos,
    faseProcessual: andamentos[0]?.fase ?? classifyFase(fullTextForExtraction),
    valorCausa: source.valorCausa || 0,
    vara: source.orgaoJulgador?.nome || '',
    comarca: source.orgaoJulgador?.codigoMunicipioIBGE || '',
    conteudo: andamentos[0]?.resumo || ''
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders, status: 204 });

  try {
    const processKey = Deno.env.get("PROCESSO_API_KEY") || PUBLIC_DATAJUD_KEY;
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    console.log(`[AUTH-DEBUG] Authorization header: ${authHeader ? 'Present (' + authHeader.substring(0, 20) + '...)' : 'MISSING'}`);
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Sua sessão expirou ou é inválida. Por favor, faça login novamente." }), {
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
      return new Response(JSON.stringify({ error: "Falha na autenticação do usuário. Sessão corrompida." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { oab, uf, days } = await req.json();
    if (!oab || !uf) throw new Error("OAB e UF são obrigatórios");

    const ufUpper = uf.toUpperCase();
    const tribunaisParaBuscar = UF_TO_TRIBUNAIS[ufUpper] || [`tj${uf.toLowerCase()}`];
    
    console.log(`[FETCH-BY-OAB-REQ] OAB: ${oab}, UF: ${ufUpper}, Days: ${days}`);
    
    let allResults: any[] = [];
    const numeroOabPuro = oab.replace(/\D/g, '');
    const numeroOabComZero = numeroOabPuro.padStart(6, '0');

    // 1. DATAJUD
    const searchPromises = tribunaisParaBuscar.map(async (tribunal) => {
      try {
        // Query mais abrangente tentando vários formatos de OAB
        const queryString = `(partes.advogados.oab: "${numeroOabPuro}" OR partes.advogados.oab: "${numeroOabComZero}" OR partes.advogados.oab: "${numeroOabPuro}${ufUpper}") AND partes.advogados.uf: "${ufUpper}"`;
        
        const searchBody = {
          query: {
            query_string: {
              query: queryString,
              default_operator: "AND"
            }
          },
          sort: [{ "dataHora": { "order": "desc" } }],
          size: 150
        };

        const response = await fetch(`https://api-publica.datajud.cnj.jus.br/api_publica_${tribunal}/_search`, {
          method: 'POST',
          headers: { 'Authorization': `APIKey ${processKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(searchBody)
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`[DATAJUD] ${tribunal}: ${data.hits?.total?.value || 0} hits`);
          return (data.hits?.hits || []).map((hit: any) => mapProcess(hit, tribunal)).filter(Boolean);
        }
      } catch (e) {
        console.error(`[DATAJUD] Erro em ${tribunal}:`, e);
      }
      return [];
    });

    const datajudResults = await Promise.all(searchPromises);
    datajudResults.forEach(batch => allResults = [...allResults, ...batch]);

    // 2. COMUNICA PJE
    const searchDays = days || 365;
    const intervalDate = new Date();
    intervalDate.setDate(intervalDate.getDate() - searchDays);
    const dateStart = intervalDate.toISOString().split('T')[0];

    const pjePromises = [0, 1].map(async (page) => {
      try {
        const pjeUrl = `https://comunicaapi.pje.jus.br/api/v1/comunicacao?numeroOab=${numeroOabPuro}&ufOab=${ufUpper}&itensPorPagina=100&pagina=${page}&dataDisponibilizacaoInicio=${dateStart}`;
        const pjeResponse = await fetch(pjeUrl);
        if (pjeResponse.ok) {
          const pjeData = await pjeResponse.json();
          console.log(`[PJE] Página ${page}: ${pjeData.items?.length || 0} itens`);
          return (pjeData.items || []).map((item: any) => {
            const numProc = item.numero_processo || item.numeroProcesso;
            if (!numProc) return null;
            
            const rawContent = item.texto_comunicacao || item.texto || item.textoComunicacao || '';
            const { autor, reu } = extractPartes(rawContent);
            const andamentos = buildAndamentos([{
               data: item.data_disponibilizacao || item.dataDisponibilizacao,
               descricao: rawContent
            }]);

            const tribunalReal = item.nome_tribunal || item.sigla_tribunal || 'TJ';
            
            return {
              id: item.id || numProc,
              numeroProcesso: numProc,
              titulo: autor && reu ? `${autor} x ${reu}` : formatCNJ(numProc),
              partes: autor && reu ? `${autor} x ${reu}` : "",
              autor: autor || '',
              reu: reu || '',
              tribunal: tribunalReal,
              ultimoAndamento: andamentos[0] ? {
                descricao: andamentos[0].resumo,
                data: andamentos[0].data
              } : null,
              andamentos,
              faseProcessual: classifyFase(rawContent),
              valorCausa: 0,
              vara: item.nome_orgao || '',
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

    console.log(`[FETCH-BY-OAB-TOTAL] Encontrados ${allResults.length} processos únicos (antes do filtro ativo)`);
    
    // Filtro ativo mais permissivo para não ocultar processos legítimos
    const uniqueResults = Array.from(new Map(allResults.map(item => [item.numeroProcesso, item])).values());
    
    console.log(`[FETCH-BY-OAB-SUCCESS] Retornando ${uniqueResults.length} resultados.`);

    return new Response(JSON.stringify({ status: "ok", items: uniqueResults }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error(`[FETCH-BY-OAB-ERROR] ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
