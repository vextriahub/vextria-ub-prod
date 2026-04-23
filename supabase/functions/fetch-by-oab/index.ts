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

/**
 * Tenta extrair nomes das partes de um texto HTML vindo do PJe
 */
const extractPartesFromTexto = (html: string): { autor: string | null; reu: string | null } | null => {
  if (!html) return null;
  
  // Limpar tags HTML básicas para facilitar a busca
  // Limpar tags HTML e converter entidades comuns
  const cleanText = html.replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Padrão comum: Polo Ativo: NOME Polo Passivo: NOME
  const ativoMatch = cleanText.match(/Polo Ativo:\s*([^Polo]+)/i);
  const passivoMatch = cleanText.match(/Polo Passivo:\s*([^<]+)/i);
  
  if (ativoMatch && passivoMatch) {
    const autor = ativoMatch[1].split('Advogado')[0].split('Polo')[0].trim();
    const reu = passivoMatch[1].split('Advogado')[0].split('Polo')[0].trim();
    if (autor && reu) return { autor, reu };
  }
  
  // Padrão alternativo: REQUERENTE: ... REQUERIDO: ...
  const reqMatch = cleanText.match(/REQUERENTE:\s*([^REQUERIDO]+)/i);
  const respMatch = cleanText.match(/REQUERIDO:\s*([^<]+)/i);
  
  if (reqMatch && respMatch) {
    return { autor: reqMatch[1].trim(), reu: respMatch[1].trim() };
  }

  // Padrão: "proposta por NOME" / "em face de NOME"
  const propostaMatch = cleanText.match(/proposta por\s+([A-Z\u00C0-\u00DC][A-Z\u00C0-\u00DC\s]+?)(?:\s*,|\s+em face|\s+contra|\.|$)/i);
  const emFaceMatch = cleanText.match(/em face de\s+([A-Z\u00C0-\u00DC][A-Z\u00C0-\u00DC\s]+?)(?:\s*,|\.|$)/i);
  
  if (propostaMatch && emFaceMatch) {
    return { autor: propostaMatch[1].trim(), reu: emFaceMatch[1].trim() };
  }

  return null;
};

/**
 * Limpa título removendo texto de SENTENÇA, decisão, etc.
 */
const cleanTitle = (title: string): string => {
  if (!title) return '';
  // Remove tudo a partir de SENTENÇA, DECISÃO, Vistos, DESPACHO, Trata-se
  let cleaned = title;
  cleaned = cleaned.replace(/\bSENTENÇA\b.*/i, '').trim();
  cleaned = cleaned.replace(/\bDECISÃO\b.*/i, '').trim();
  cleaned = cleaned.replace(/\bVistos\b.*/i, '').trim();
  cleaned = cleaned.replace(/\bDESPACHO\b.*/i, '').trim();
  cleaned = cleaned.replace(/\bTrata-se\b.*/i, '').trim();
  // Remove vírgula final
  cleaned = cleaned.replace(/,\s*$/, '').trim();
  // Limita a 120 caracteres
  if (cleaned.length > 120) {
    cleaned = cleaned.substring(0, 120).trim() + '...';
  }
  return cleaned || title.substring(0, 80);
};

/**
 * Formata número de processo no padrão CNJ: NNNNNNN-DD.YYYY.J.TR.OOOO
 */
const formatCNJ = (num: string): string => {
  const clean = num.replace(/[.-]/g, '');
  if (clean.length !== 20) return num;
  return `${clean.substring(0,7)}-${clean.substring(7,9)}.${clean.substring(9,13)}.${clean.substring(13,14)}.${clean.substring(14,16)}.${clean.substring(16,20)}`;
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
    autor: autores,
    reu: reus,
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

    const { oab, uf, days } = await req.json();
    if (!oab || !uf) throw new Error("OAB e UF são obrigatórios");

    const ufUpper = uf.toUpperCase();
    const tribunaisParaBuscar = UF_TO_TRIBUNAIS[ufUpper] || [`tj${uf.toLowerCase()}`];
    
    console.log(`[DEEP-SYNC] OAB ${oab}-${ufUpper} | Filtrando Ativos`);
    
    let allResults: any[] = [];
    const numeroOabPuro = oab.replace(/\D/g, '');
    const numeroOabComZero = numeroOabPuro.padStart(6, '0');

    // 1. DATAJUD (Busca paralela)
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

    // 2. COMUNICA PJE (Deep Sync: 5 páginas)
    const searchDays = days || 365;
    const intervalDate = new Date();
    intervalDate.setDate(intervalDate.getDate() - searchDays);
    const dateStart = intervalDate.toISOString().split('T')[0];

    const pjePromises = [0, 1, 2, 3, 4].map(async (page) => {
      try {
        const pjeUrl = `https://comunicaapi.pje.jus.br/api/v1/comunicacao?numeroOab=${numeroOabPuro}&ufOab=${ufUpper}&itensPorPagina=100&pagina=${page}&dataDisponibilizacaoInicio=${dateStart}`;
        const pjeResponse = await fetch(pjeUrl);
        if (pjeResponse.ok) {
          const pjeData = await pjeResponse.json();
          return (pjeData.items || []).map((item: any) => {
            const numProc = item.numero_processo || item.numeroProcesso;
            if (!numProc) return null;
            
            // Tenta extrair nomes do texto se o título for genérico
            const extractedPartesInfo = extractPartesFromTexto(item.texto_comunicacao || item.texto || '');
            const combinedExtracted = extractedPartesInfo ? `${extractedPartesInfo.autor} x ${extractedPartesInfo.reu}` : null;
            const formattedNum = formatCNJ(numProc);
            const rawTitle = item.titulo_processo || item.tituloProcesso || combinedExtracted || formattedNum;
            const finalTitle = cleanTitle(rawTitle);

            // Determinar tribunal real pela sigla/nome ou pelo número do processo
            const cleanNum = numProc.replace(/[.-]/g, '');
            const j = cleanNum.length >= 14 ? cleanNum.substring(13, 14) : '';
            const rr = cleanNum.length >= 16 ? cleanNum.substring(14, 16) : '';
            let tribunalReal = item.nome_tribunal || item.sigla_tribunal || item.nomeTribunal || '';
            if (!tribunalReal || tribunalReal === 'PJE' || tribunalReal === 'PJe') {
              // Deduzir tribunal do número do processo
              if (j === '8' && rr === '07') tribunalReal = 'TJDFT';
              else if (j === '8') tribunalReal = `TJ${ufUpper}`;
              else if (j === '4') tribunalReal = `TRF${rr.replace(/^0/, '')}`;
              else if (j === '5') tribunalReal = `TRT${rr.replace(/^0/, '')}`;
              else tribunalReal = `TJ${ufUpper}`;
            }

            return {
              id: item.id || numProc,
              numeroProcesso: numProc,
              titulo: finalTitle || `Publicação no ${tribunalReal}`,
              partes: combinedExtracted || finalTitle,
              autor: extractedPartesInfo?.autor || '',
              reu: extractedPartesInfo?.reu || '',
              tribunal: tribunalReal,
              ultimoAndamento: {
                descricao: item.texto || item.texto_comunicacao || item.textoComunicacao || item.meio_comunicacao || 'Comunicação PJe',
                data: item.data_disponibilizacao || item.dataDisponibilizacao || item.data_comunicacao
              },
              faseProcessual: item.nome_classe || 'Não identificada',
              conteudo: cleanText, // Texto já limpo de HTML
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

    const activeResults = allResults.filter(isProcessActive);
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
