import Link from "next/link";
import Logo from "./Logo";

// Na página do método (buy), o botão do menu desce até a oferta: sem "testar grátis" nem preços das assinaturas.
// minimal: só o logo e "Entrar" (página pública dos planos).
export default function SiteNav({ buy = false, minimal = false }: { buy?: boolean; minimal?: boolean }) {
  return (
    <header className="site-nav">
      <Link href="/" className="logo" aria-label="Mapas Falantes">
        <Logo size={30} />
      </Link>
      {minimal ? (
        <nav>
          <Link href="/entrar">Entrar</Link>
        </nav>
      ) : buy ? (
        <nav>
          <Link href="/entrar">Entrar</Link>
          <a href="#oferta" className="primary-btn grad-btn">Quero o Método</a>
        </nav>
      ) : (
        <nav>
          <Link href="/#oferta">Preço</Link>
          <Link href="/entrar">Entrar</Link>
          <Link href="/quiz" className="primary-btn">Testar grátis</Link>
        </nav>
      )}
    </header>
  );
}
