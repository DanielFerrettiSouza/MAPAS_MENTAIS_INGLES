import { toBlob } from "html-to-image";

type Opts = { width?: number; backgroundColor?: string; style?: Partial<CSSStyleDeclaration> };

// Salva um elemento como PNG, funcionando também no celular.
// - Limita o tamanho da imagem (o Safari do iPhone falha com canvas muito grande).
// - No celular abre o menu de compartilhar ("Salvar imagem"); se não der,
//   mostra a imagem na tela para a pessoa tocar e segurar para salvar.
export async function savePng(node: HTMLElement, fileName: string, opts: Opts = {}) {
  // O html-to-image copia os estilos já calculados; por isso, para exportar no layout de
  // computador, o próprio mapa fica com a largura fixa durante a captura e depois volta.
  const prev = node.getAttribute("style");
  if (opts.width) {
    Object.assign(node.style, { width: `${opts.width}px`, maxWidth: "none" }, opts.style ?? {});
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }
  let blob: Blob | null;
  try {
    const w = node.offsetWidth;
    const h = node.scrollHeight;
    const pixelRatio = Math.max(1, Math.min(2, Math.sqrt(14_000_000 / (w * h))));
    const base = {
      width: w,
      height: h,
      backgroundColor: opts.backgroundColor,
      filter: (n: Node) => !(n instanceof HTMLElement && n.dataset.noExport === "true"),
    };
    // O Safari (iPhone) costuma deixar as ilustrações de fora na primeira captura:
    // uma passada pequena antes carrega tudo, e a segunda sai completa.
    await toBlob(node, { ...base, pixelRatio: 0.2 }).catch(() => null);
    blob = await toBlob(node, { ...base, pixelRatio });
  } finally {
    if (prev === null) node.removeAttribute("style");
    else node.setAttribute("style", prev);
  }
  if (!blob) throw new Error("Não foi possível gerar a imagem.");

  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1;
  const file = new File([blob], fileName, { type: "image/png" });
  if (mobile && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: fileName });
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") return; // a pessoa fechou o menu
    }
  }

  const url = URL.createObjectURL(blob);
  if (!mobile) {
    const a = document.createElement("a");
    a.download = fileName;
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return;
  }
  showImage(url);
}

function showImage(url: string) {
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.88);display:flex;flex-direction:column;align-items:center;padding:16px;overflow:auto";
  wrap.innerHTML = `<p style="color:#fff;font:600 16px system-ui;text-align:center;margin:8px 0 12px">Toque e segure na imagem e escolha <b>Salvar imagem</b></p>
<img src="${url}" style="max-width:100%;height:auto;border-radius:8px" alt="Mapa" />
<button style="margin:16px 0;padding:12px 28px;border:0;border-radius:8px;font:700 16px system-ui">Fechar</button>`;
  wrap.querySelector("button")!.onclick = () => {
    wrap.remove();
    URL.revokeObjectURL(url);
  };
  document.body.appendChild(wrap);
}
