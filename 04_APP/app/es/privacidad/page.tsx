import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Política de Privacidad · Mapas Parlantes" };

export default function Privacidad() {
  return (
    <LegalPage title="Política de Privacidad" lang="es">
      <h2>1. Quiénes somos</h2>
      <p>Mapas Parlantes es una aplicación para estudiar inglés con mapas mentales con audio y mapas creados con inteligencia artificial. Contacto: mapasmentaisfalantes@gmail.com.</p>
      <h2>2. Datos que recopilamos</h2>
      <ul>
        <li><b>Cuenta:</b> correo electrónico y nombre (o los datos básicos de tu perfil de Google, si entras con Google).</li>
        <li><b>Uso:</b> los temas que buscas, los mapas creados, tu progreso y las respuestas del test de nivel.</li>
        <li><b>Pago:</b> procesado por Stripe. No guardamos datos de tarjeta; recibimos solo la confirmación de la compra, tu correo y, si lo informas, tu nombre y teléfono.</li>
      </ul>
      <h2>3. Para qué los usamos</h2>
      <ul>
        <li>Crear y guardar tus mapas y controlar tu acceso y tus créditos.</li>
        <li>Personalizar el contenido según tu nivel y objetivo.</li>
        <li>Enviarte comunicaciones sobre tu cuenta y, si lo autorizas, novedades del producto.</li>
        <li>Medir el resultado de nuestros anuncios (por ejemplo, con Meta).</li>
      </ul>
      <h2>4. Con quién los compartimos</h2>
      <p>Usamos proveedores para operar el servicio: Supabase (base de datos e inicio de sesión), Vercel (alojamiento), Anthropic y Google Gemini (generación de contenido e ilustraciones), ElevenLabs (audio), Stripe (pagos), Klaviyo (correos) y Meta (medición de anuncios). Reciben solo lo necesario para prestar el servicio. No vendemos tus datos.</p>
      <h2>5. Tus derechos</h2>
      <p>Puedes pedir acceso, corrección o eliminación de tus datos y de tu cuenta en cualquier momento, y oponerte a recibir comunicaciones de marketing, escribiendo a mapasmentaisfalantes@gmail.com. Respetamos los derechos que te otorgan las leyes de protección de datos de tu país (incluido el RGPD, si estás en la Unión Europea).</p>
      <h2>6. Seguridad y conservación</h2>
      <p>Los datos se guardan en servidores con cifrado y acceso restringido. Conservamos tus mapas mientras exista tu cuenta; al eliminarla, los datos se borran.</p>
    </LegalPage>
  );
}
