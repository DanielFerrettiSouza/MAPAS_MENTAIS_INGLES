import type { MetadataRoute } from "next";

// Permite "Adicionar à tela de início" no celular: abre direto no app, sem a barra do navegador.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mapas Falantes",
    short_name: "Mapas Falantes",
    start_url: "/app",
    display: "standalone",
    background_color: "#0b0a0c",
    theme_color: "#0b0a0c",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
