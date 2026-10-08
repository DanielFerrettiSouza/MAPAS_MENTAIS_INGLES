import Link from "next/link";
import Logo from "./Logo";

export default function SiteNav() {
  return (
    <header className="site-nav">
      <Link href="/" className="logo" aria-label="Mapas Falantes">
        <Logo size={30} />
      </Link>
      <nav>
        <Link href="/#planos">Preços</Link>
        <Link href="/entrar">Entrar</Link>
        <Link href="/quiz" className="primary-btn">Testar grátis</Link>
      </nav>
    </header>
  );
}
