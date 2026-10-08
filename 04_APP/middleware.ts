import { NextResponse, type NextRequest } from "next/server";

// Protege o app inteiro com usuário/senha simples (HTTP Basic Auth) quando
// APP_PASSWORD está definido — evita que estranhos gastem os créditos de IA.
// Usuário: qualquer um; senha: APP_PASSWORD. Sem a variável, o app fica aberto.
export function middleware(req: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) return NextResponse.next();

  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    if (decoded.slice(decoded.indexOf(":") + 1) === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Acesso restrito", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Mapas Falantes"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
