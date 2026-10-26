import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Términos de Uso · Mapas Falantes" };

export default function Terminos() {
  return (
    <LegalPage title="Términos de Uso" lang="es">
      <h2>1. El servicio</h2>
      <p>Mapas Falantes es una aplicación para estudiar inglés con mapas mentales con audio. Incluye mapas listos y mapas creados con inteligencia artificial. El contenido creado por IA se genera automáticamente y puede contener imprecisiones; úsalo como material de estudio.</p>
      <h2>2. Cuenta</h2>
      <p>Eres responsable de los datos que informas y de la seguridad de tu acceso. Cada cuenta es personal.</p>
      <h2>3. Compra y pagos</h2>
      <ul>
        <li>El Método Mapas Falantes es un pago único, sin mensualidad, con acceso de por vida al contenido incluido. Los kits y el paquete de mapas con IA son compras opcionales, también de pago único.</li>
        <li>Los pagos son procesados por Stripe, en la moneda de tu país cuando está disponible.</li>
        <li>Los mapas con IA incluidos (créditos) se usan una vez cada uno.</li>
        <li>Garantía de 7 días: si no te gusta, pide el reembolso dentro de los 7 días posteriores a la compra por el correo mapasmentaisfalantes@gmail.com y te devolvemos el 100% del valor. Con el reembolso, se retira el acceso a lo comprado.</li>
      </ul>
      <h2>4. Uso permitido</h2>
      <p>No está permitido usar el servicio para generar contenido ilegal u ofensivo, ni compartir tu acceso o intentar evadir los límites de tu compra. Los mapas son para tu estudio personal.</p>
      <h2>5. Cambios</h2>
      <p>Podemos actualizar estos términos y te avisaremos sobre cambios relevantes.</p>
      <p>Contacto: mapasmentaisfalantes@gmail.com</p>
    </LegalPage>
  );
}
