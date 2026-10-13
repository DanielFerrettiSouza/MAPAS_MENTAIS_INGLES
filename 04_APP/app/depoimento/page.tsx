import SiteNav from "@/components/SiteNav";
import TestimonialForm from "@/components/TestimonialForm";

export const metadata = { title: "Conte como está sendo · Mapas Falantes", robots: { index: false } };

export default function DepoimentoPage() {
  return (
    <>
      <SiteNav />
      <main className="container" style={{ maxWidth: 620 }}>
        <h1 className="app-hello">Como estão sendo os <span className="grad-text">seus estudos?</span></h1>
        <p className="app-sub">Conte com sinceridade o que você achou dos mapas. Pode ser curto. Sua opinião ajuda a melhorar o método e outras pessoas a decidir.</p>
        <TestimonialForm />
      </main>
    </>
  );
}
