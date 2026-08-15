import type { Config, Context } from "@netlify/functions";
import OpenAI from "openai";
import {
  MATCH_IDS,
  QUESTIONS,
  SYSTEM_PROMPT,
  parseJsonObject,
  sanitizeMatchIds,
  type HistoryTurn,
  type MatchResult,
  type ReactResult,
} from "./_shared/yente";

const MAX_ANSWER = 800;
const MAX_HISTORY = 8;

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const action = body.action;
  if (action !== "react" && action !== "match") {
    return json({ error: "Acción desconocida" }, 400);
  }

  const history = normalizeHistory(body.history);

  try {
    if (action === "react") {
      return json(await reactToAnswer(body, history));
    }
    return json(await judgeMatches(history));
  } catch (error) {
    console.error("Yente AI error:", error);
    return json({ error: "Yente no pudo consultar sus registros" }, 503);
  }
};

export const config: Config = {
  path: "/api/yente",
  method: "POST",
};

function json(payload: unknown, status = 200) {
  return Response.json(payload, { status });
}

function normalizeHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_HISTORY).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const question = typeof row.question === "string" ? row.question.slice(0, 500) : "";
    const answer = typeof row.answer === "string" ? row.answer.slice(0, MAX_ANSWER) : "";
    if (!question || !answer) return [];
    const feedback = typeof row.feedback === "string" ? row.feedback.slice(0, 600) : undefined;
    return [{ question, answer, feedback }];
  });
}

function getClient() {
  return new OpenAI();
}

async function completeJson(userPrompt: string): Promise<Record<string, unknown>> {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "";
  const parsed = parseJsonObject(text);
  if (!parsed) {
    throw new Error("Respuesta de modelo no JSON");
  }
  return parsed;
}

async function reactToAnswer(
  body: Record<string, unknown>,
  history: HistoryTurn[],
): Promise<ReactResult> {
  const questionIndex =
    typeof body.questionIndex === "number" ? body.questionIndex : Number(body.questionIndex);
  const questionFromBody = typeof body.question === "string" ? body.question : "";
  const answer = typeof body.answer === "string" ? body.answer.trim().slice(0, MAX_ANSWER) : "";

  if (!answer) {
    return {
      accepted: false,
      feedback: "El silencio también habla, joven… pero yo necesito palabras. Inténtalo de nuevo, con el corazón.",
    };
  }

  const question =
    Number.isInteger(questionIndex) && questionIndex >= 0 && questionIndex < QUESTIONS.length
      ? QUESTIONS[questionIndex]
      : questionFromBody.slice(0, 500);

  const parsed = await completeJson(`Acción: reaccionar a UNA respuesta de la consulta.

Pregunta de Yente:
${question}

Respuesta del pretendiente:
${answer}

Historial previo (puede estar vacío):
${JSON.stringify(history)}

Devuelve JSON con:
{
  "feedback": "2 a 4 frases en voz de Yente, en español, comentando algo concreto de la respuesta",
  "accepted": true o false
}

accepted=false solo si la respuesta es perezosa, vacía de carácter, broma, o no responde la pregunta.`);

  const feedback =
    typeof parsed.feedback === "string" && parsed.feedback.trim()
      ? parsed.feedback.trim().slice(0, 700)
      : "Hmm. Tus palabras se me escapan. Dilo otra vez, más despacio y con más verdad.";
  const accepted = parsed.accepted === true;

  return { feedback, accepted };
}

async function judgeMatches(history: HistoryTurn[]): Promise<MatchResult> {
  if (history.length === 0) {
    return {
      presented: false,
      matchIds: [],
      introduction: "",
      verdict:
        "No has dicho nada que yo pueda tejer. Vuelve a sentarte y háblame de verdad, o no hay shidduch.",
    };
  }

  const parsed = await completeJson(`Acción: decidir si presentas pretendientas, y a quiénes.

Consulta completa:
${JSON.stringify(history)}

Candidatas permitidas (ids exactos): ${MATCH_IDS.join(", ")}

Criterio:
- Si el conjunto de respuestas muestra carácter (valores, madurez, algo específico), presented=true.
- Ordena matchIds por afinidad real con lo dicho. Incluye 1, 2 o 3 ids. Nunca inventes otros nombres.
- Si casi todo fue vacío, cínico o infantil, presented=false y matchIds=[].
- introduction: 1-3 frases de Yente presentando a quienes SÍ eligió (si presented=true).
- verdict: 2-4 frases si presented=false, explicando por qué no presenta a nadie y pidiendo otra consulta.

Devuelve JSON:
{
  "presented": true o false,
  "matchIds": ["sarah" | "miriam" | "leah"],
  "introduction": "texto o vacío",
  "verdict": "texto o vacío"
}`);

  const matchIds = sanitizeMatchIds(parsed.matchIds);
  const presented = parsed.presented === true && matchIds.length > 0;
  const introduction =
    typeof parsed.introduction === "string" ? parsed.introduction.trim().slice(0, 700) : "";
  const verdict =
    typeof parsed.verdict === "string" ? parsed.verdict.trim().slice(0, 700) : "";

  if (!presented) {
    return {
      presented: false,
      matchIds: [],
      introduction: "",
      verdict:
        verdict ||
        "No. Con lo que me has dado no arriesgo el nombre de ninguna familia respetable. Vuelve cuando tengas algo que decir.",
    };
  }

  return {
    presented: true,
    matchIds,
    introduction:
      introduction ||
      "He encontrado almas de familias respetables cuyas fibras se parecen a las tuyas. Elige con cuidado, y llama a su hogar.",
    verdict: "",
  };
}
