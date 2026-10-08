import { redirect } from "next/navigation";

// Raiz do site redireciona pro idioma padrão. Quando validar e quiser
// detectar idioma do navegador automaticamente, é aqui que entra essa lógica.
export default function RootPage() {
  redirect("/pt/criar");
}
