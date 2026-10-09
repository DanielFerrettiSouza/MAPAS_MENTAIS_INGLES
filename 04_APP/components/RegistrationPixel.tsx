"use client";

import { useEffect } from "react";
import { track } from "@/lib/pixel";

// Dispara CompleteRegistration uma única vez, quando a conta acabou de ser criada
// (funciona para cadastro por e-mail e pelo Google).
export default function RegistrationPixel({ userId, isNew }: { userId: string; isNew: boolean }) {
  useEffect(() => {
    if (!isNew) return;
    const key = `mf-reg-${userId}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {}
    setTimeout(() => track("CompleteRegistration"), 800);
  }, [userId, isNew]);
  return null;
}
