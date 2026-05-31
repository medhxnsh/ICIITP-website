/**
 * Keyword-matching engine for the DISHA chatbot.
 * Scores each FAQ by keyword overlap and returns the best-matching answer.
 */
import { FAQS, FALLBACK, type FAQ } from "@/config/chatbot-faq";

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s₹]/g, " ").trim();
}

export function findAnswer(query: string): { answer: string; followUps: string[] } {
  const q = normalize(query);
  const words = q.split(/\s+/).filter(Boolean);

  let best: FAQ | null = null;
  let bestScore = 0;

  for (const faq of FAQS) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (q.includes(kw)) score += kw.split(" ").length * 2;
    }
    for (const word of words) {
      if (faq.keywords.some((kw) => kw.includes(word) && word.length > 2)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }

  if (!best || bestScore === 0) {
    return { answer: FALLBACK, followUps: [] };
  }

  return { answer: best.answer, followUps: best.followUps ?? [] };
}
