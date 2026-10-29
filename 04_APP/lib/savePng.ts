import { toCanvas } from "html-to-image";

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
  // As ilustrações saem da captura do html-to-image (no iPhone, Safari e Chrome, elas
  // somem) e são desenhadas depois, direto no canvas final, nas mesmas posições.
  const ills = await takeIllustrations(node);
  let blob: Blob | null;
  try {
    const w = node.offsetWidth;
    const h = node.scrollHeight;
    const pixelRatio = Math.max(1, Math.min(2, Math.sqrt(14_000_000 / (w * h))));
    const canvas = await toCanvas(node, {
      width: w,
      height: h,
      pixelRatio,
      canvasWidth: w,
      canvasHeight: h,
      backgroundColor: opts.backgroundColor,
      filter: (n: Node) => !(n instanceof HTMLElement && n.dataset.noExport === "true"),
    });
    const ctx = canvas.getContext("2d")!;
    const box = node.getBoundingClientRect();
    const sx = canvas.width / w, sy = canvas.height / h;
    for (const it of ills) {
      const r = it.rect;
      const x = (r.left - box.left) * sx, y = (r.top - box.top) * sy, rw = r.width * sx, rh = r.height * sy;
      ctx.save();
      if (it.round) {
        ctx.beginPath();
        ctx.arc(x + rw / 2, y + rh / 2, rw / 2 - it.border * sx, 0, Math.PI * 2);
        ctx.clip();
      }
      // background-size: contain (ilustrações das seções) ou 130% (emblema central)
      const scale = it.cover ? (rw * it.cover) / it.img.width : Math.min(rw / it.img.width, rh / it.img.height);
      const dw = it.img.width * scale, dh = it.img.height * scale;
      ctx.drawImage(it.img, x + (rw - dw) / 2, y + (rh - dh) / 2, dw, dh);
      ctx.restore();
    }
    blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/png"));
  } finally {
    ills.forEach((it) => it.restore());
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

// Pega as ilustrações (background-image com URL externa), prepara cada uma num canvas já com
// o visual da tela (tinta multiplicada sobre o papel e borda esfumada) e as esconde da captura.
async function takeIllustrations(node: HTMLElement) {
  const els = Array.from(node.querySelectorAll<HTMLElement>("*")).filter((el) =>
    /url\(["']?https?:/.test(getComputedStyle(el).backgroundImage)
  );
  const out = await Promise.all(
    els.map(async (el) => {
      const cs = getComputedStyle(el);
      const url = cs.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
      if (!url) return null;
      try {
        const blob = await fetchBlob(url);
        const bmp = await loadImage(blob);
        const k = Math.min(1, 600 / Math.max(bmp.width, bmp.height));
        const c = document.createElement("canvas");
        c.width = Math.round(bmp.width * k);
        c.height = Math.round(bmp.height * k);
        const ctx = c.getContext("2d")!;
        ctx.drawImage(bmp, 0, 0, c.width, c.height);
        const masked = ((cs as any).webkitMaskImage || cs.maskImage || "none") !== "none";
        const multiply = cs.mixBlendMode === "multiply";
        if (multiply || masked) {
          const d = ctx.getImageData(0, 0, c.width, c.height);
          const [pr, pg, pb] = [243, 234, 216]; // cor do papel
          const cx = c.width / 2, cy = c.height / 2, R = Math.hypot(cx, cy);
          for (let y = 0; y < c.height; y++)
            for (let x = 0; x < c.width; x++) {
              const i = (y * c.width + x) * 4;
              if (multiply) {
                d.data[i] = (d.data[i] * pr) / 255;
                d.data[i + 1] = (d.data[i + 1] * pg) / 255;
                d.data[i + 2] = (d.data[i + 2] * pb) / 255;
              }
              if (masked) {
                const r = Math.hypot(x - cx, y - cy) / R;
                d.data[i + 3] *= r <= 0.5 ? 1 : r >= 0.7 ? 0 : (0.7 - r) / 0.2;
              }
            }
          ctx.putImageData(d, 0, 0);
        }
        const size = parseFloat(cs.backgroundSize);
        const it = {
          el,
          saved: el.style.backgroundImage,
          img: c,
          rect: el.getBoundingClientRect(),
          round: cs.borderTopLeftRadius.endsWith("%") ? parseFloat(cs.borderTopLeftRadius) >= 50 : parseFloat(cs.borderTopLeftRadius) >= el.offsetWidth / 2 - 1,
          border: parseFloat(cs.borderTopWidth) || 0,
          cover: cs.backgroundSize.endsWith("%") ? size / 100 : 0,
        };
        el.style.backgroundImage = "none";
        return { ...it, restore: () => (el.style.backgroundImage = it.saved) };
      } catch {
        return null;
      }
    })
  );
  // Imagens <img> (mapas no layout de caderno): mesmo esquema, desenhadas por cima depois.
  const imgs = await Promise.all(
    Array.from(node.querySelectorAll<HTMLImageElement>("img")).filter((im) => /^https?:/.test(im.src)).map(async (im) => {
      try {
        const blob = await fetchBlob(im.src);
        const bmp = await loadImage(blob);
        const k = Math.min(1, 600 / Math.max(bmp.width, bmp.height));
        const c = document.createElement("canvas");
        c.width = Math.round(bmp.width * k);
        c.height = Math.round(bmp.height * k);
        const ictx = c.getContext("2d")!;
        ictx.drawImage(bmp, 0, 0, c.width, c.height);
        // Algumas ilustrações vêm com fundo cinza-claro: tons de cinza bem claros viram branco.
        const d = ictx.getImageData(0, 0, c.width, c.height);
        for (let i = 0; i < d.data.length; i += 4) {
          const mn = Math.min(d.data[i], d.data[i + 1], d.data[i + 2]);
          const mx = Math.max(d.data[i], d.data[i + 1], d.data[i + 2]);
          if (mx - mn > 18 || mn < 200) continue;
          const t = Math.min(1, (mn - 200) / 30);
          for (let k2 = 0; k2 < 3; k2++) d.data[i + k2] += (255 - d.data[i + k2]) * t;
        }
        ictx.putImageData(d, 0, 0);
        const savedVis = im.style.visibility;
        // Imagem redonda (círculo central): recorta em círculo no canvas, senão o fundo da
        // ilustração sai como um quadrado (no celular o border-radius do <img> não vale na captura).
        const r = parseFloat(getComputedStyle(im).borderTopLeftRadius) || 0;
        const it = { el: im as HTMLElement, saved: "", img: c, rect: im.getBoundingClientRect(), round: r >= im.offsetWidth / 2 - 1, border: 0, cover: 0, restore: () => (im.style.visibility = savedVis) };
        im.style.visibility = "hidden";
        return it;
      } catch {
        return null;
      }
    })
  );
  return [...out, ...imgs].filter((x): x is NonNullable<typeof x> => !!x);
}

function loadImage(blob: Blob) {
  return new Promise<HTMLImageElement>((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = fail;
    img.src = URL.createObjectURL(blob);
  });
}

// Baixa a imagem com CORS. Se a cópia do cache veio de um carregamento sem CORS (o navegador
// a recusa na primeira tentativa), busca de novo direto do servidor, sem cache.
async function fetchBlob(url: string) {
  try {
    const r = await fetch(url, { mode: "cors", cache: "force-cache" });
    if (r.ok) return await r.blob();
  } catch {}
  const r = await fetch(`${url}${url.includes("?") ? "&" : "?"}x=${Date.now()}`, { mode: "cors", cache: "no-store" });
  return await r.blob();
}
