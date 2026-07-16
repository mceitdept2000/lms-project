const THUMBNAIL_TARGET_WIDTH = 600;

/** Best-effort: renders page 1 of a PDF to a PNG blob, or null if anything goes wrong. */
export async function renderPdfFirstPageFromArrayBuffer(
  data: ArrayBuffer,
): Promise<Blob | null> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();

    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const page = await pdf.getPage(1);

    const unscaledViewport = page.getViewport({ scale: 1 });
    const scale = THUMBNAIL_TARGET_WIDTH / unscaledViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvas, viewport }).promise;

    return await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  } catch {
    return null;
  }
}

/** Best-effort: renders page 1 of a PDF File to a PNG blob, or null if anything goes wrong. */
export async function renderPdfFirstPageToBlob(
  file: File,
): Promise<Blob | null> {
  return renderPdfFirstPageFromArrayBuffer(await file.arrayBuffer());
}
