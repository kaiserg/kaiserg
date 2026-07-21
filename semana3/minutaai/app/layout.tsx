import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

/**
 * Inter self-hosted vía @fontsource (en lugar de next/font/google): la fuente
 * se sirve desde el propio deploy sin depender de Google Fonts ni en build ni
 * en runtime — build reproducible y cero requests a terceros (coherente con
 * el posicionamiento de privacidad del producto).
 */

export const metadata: Metadata = {
  title: "MinutaAI — Minutas de reunión con IA",
  description:
    "Convierte notas crudas o transcripts de reuniones en una minuta estructurada y lista para compartir. Tus notas no se guardan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
