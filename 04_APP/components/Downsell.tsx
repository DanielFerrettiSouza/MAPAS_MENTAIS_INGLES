import { EXTRAS, checkoutUrl } from "@/lib/plans";

// Opções sem assinatura, discretas, abaixo dos planos na oferta do app.
export default function Downsell({ email }: { email?: string | null }) {
  const items = (["biblioteca", "pacote"] as const)
    .map((id) => ({ id, ...EXTRAS[id], url: checkoutUrl(id, email) }))
    .filter((i) => i.url);
  if (!items.length) return null;
  return (
    <div className="downsell">
      <p className="downsell-title">Não quer assinatura agora?</p>
      <div className="downsell-items">
        {items.map((i) => (
          <a key={i.id} href={i.url!} className="downsell-item">
            <b>{i.name} · {i.price}</b>
            <span>{i.text}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
