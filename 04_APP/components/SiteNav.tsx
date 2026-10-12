import Link from "next/link";
import Logo from "./Logo";
import BuyButton from "./BuyButton";

// Na página do método (buy), o menu leva só à compra: sem "testar grátis" nem preços das assinaturas.
export default function SiteNav({ buy = false }: { buy?: boolean }) {
  return (
    <header className="site-nav">
      <Link href="/" className="logo" aria-label="Mapas Falantes">
        <Logo size={30} />
      </Link>
      {buy ? (
        <nav>
          <Link href="/entrar">Entrar</Link>
          <BuyButton label="Quero o Método" />
        </nav>
      ) : (
        <nav>
          <Link href="/#planos">Preços</Link>
          <Link href="/entrar">Entrar</Link>
          <Link href="/quiz" className="primary-btn">Testar grátis</Link>
        </nav>
      )}
    </header>
  );
}
