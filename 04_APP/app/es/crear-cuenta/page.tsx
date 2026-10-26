import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Crear cuenta · Mapas Parlantes" };

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="signup" lang="es" />
    </Suspense>
  );
}
