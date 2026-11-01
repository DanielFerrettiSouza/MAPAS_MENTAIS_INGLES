"use client";

import ErrorScreen from "@/components/ErrorScreen";

// Erro no próprio layout (fora das páginas): precisa ter html e body.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="pt-BR">
      <body>
        <ErrorScreen error={error} />
      </body>
    </html>
  );
}
