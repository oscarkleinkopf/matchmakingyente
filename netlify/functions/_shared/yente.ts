export const MATCH_IDS = ["sarah", "miriam", "leah"] as const;
export type MatchId = (typeof MATCH_IDS)[number];

export const QUESTIONS = [
  "Shalom, joven. Pasa, siéntate. Soy Yente. El amor no es un juego de azar, es un tejido sagrado. Dime... ¿Qué buscas realmente en un alma gemela? ¿Alguien que te complemente con dulzura, o alguien que te desafíe a ser mejor?",
  "Dime ahora, con la mano en el corazón: ¿cuál es el valor más sagrado que aprendiste de tu familia y que jamás estarías dispuesto a negociar en tu propio hogar?",
  "Imagina que la vejez nos ha alcanzado. El vigor de la juventud se ha desvanecido y la belleza física es solo un recuerdo lejano. Sentados frente al fuego... ¿qué conversación te gustaría seguir teniendo con ella?",
  "La belleza exterior es como la flor del campo: hoy florece y mañana se marchita. ¿Qué es aquello en el carácter de una mujer que consideras que nunca perderá su perfume?",
] as const;

export const SYSTEM_PROMPT = `Eres Yente, casamentera tradicional judía de principios del siglo XX. Hablas español con formalidad cálida, aforismos y un humor seco. No eres un chatbot amable: eres exigente. Evalúas carácter, no hobbies de moda.

Reglas:
- Nunca inventes perfiles. Solo existen Sarah, Miriam y Leah.
- Sarah: alma tranquila, jalá, Spinoza, conversaciones profundas y silencios cálidos.
- Miriam: intelecto vivaz, poesía, historia, principios, debate apasionado con respeto, familia.
- Leah: alegría, violín, música clásica, lealtad, risas, valores tradicionales, espíritu noble.
- Si la respuesta es vaga, de una palabra, memes, "asdf", seducción vacía o evasiva, recházala (accepted=false) y exige sinceridad. Máximo un regaño breve.
- Si hay sustancia (aunque imperfecta), accepted=true y comenta algo concreto de LO QUE DIJO.
- Responde SIEMPRE en JSON válido. Sin markdown.`;

export type HistoryTurn = {
  question: string;
  answer: string;
  feedback?: string;
};

export type ReactResult = {
  feedback: string;
  accepted: boolean;
};

export type MatchResult = {
  presented: boolean;
  matchIds: MatchId[];
  introduction: string;
  verdict: string;
};

export function isMatchId(value: string): value is MatchId {
  return (MATCH_IDS as readonly string[]).includes(value);
}

export function sanitizeMatchIds(raw: unknown): MatchId[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<MatchId>();
  const ids: MatchId[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const id = item.trim().toLowerCase();
    if (isMatchId(id) && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

export function parseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        const parsed = JSON.parse(trimmed.slice(start, end + 1));
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        return null;
      }
    }
  }
  return null;
}
