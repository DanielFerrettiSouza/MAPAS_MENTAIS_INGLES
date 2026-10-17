"use client";

export default function PrintButton() {
  return <button className="primary-btn grad-btn" onClick={() => window.print()}>🖨️ Imprimir ou salvar em PDF</button>;
}
