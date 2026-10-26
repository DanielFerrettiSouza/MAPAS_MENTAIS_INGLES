"use client";

import { useState } from "react";
import type { GeneratedMap } from "@/lib/mapSchema";

export default function ReviewQuiz({ quiz, lang = "pt" }: { quiz: GeneratedMap["quiz"]; lang?: "pt" | "es" }) {
  const t = (pt: string, es: string) => (lang === "es" ? es : pt);
  const [answers, setAnswers] = useState<(number | null)[]>(quiz.map(() => null));
  const score = answers.filter((a, i) => a === quiz[i].answer_index).length;
  const done = answers.every((a) => a !== null);

  return (
    <section className="quiz">
      <h3>🧠 {t("Revisão rápida", "Repaso rápido")}</h3>
      {quiz.map((q, i) => (
        <div key={i} className="quiz-question">
          <p>{q.question_pt}</p>
          {q.options.map((opt, j) => {
            const chosen = answers[i] === j;
            const answered = answers[i] !== null;
            const correct = j === q.answer_index;
            const cls = answered && correct ? "correct" : chosen ? "wrong" : "";
            return (
              <button
                key={j}
                className={`quiz-option ${cls}`}
                disabled={answered}
                onClick={() =>
                  setAnswers((prev) => prev.map((a, k) => (k === i ? j : a)))
                }
              >
                {opt}
              </button>
            );
          })}
        </div>
      ))}
      {done && (
        <p className="quiz-score">
          {t(`Você acertou ${score} de ${quiz.length}.`, `Acertaste ${score} de ${quiz.length}.`)}
        </p>
      )}
    </section>
  );
}
