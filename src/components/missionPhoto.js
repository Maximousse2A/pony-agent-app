export const SAMPLE_PHOTO = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560"><rect width="900" height="560" fill="#e8eeea"/><path d="M0 310H900V560H0Z" fill="#c9d1cb"/><path d="M0 355H900M0 445H900M100 310V560M310 310V560M550 310V560M790 310V560" stroke="#b4bdb6" stroke-width="3"/><rect x="60" y="50" width="250" height="260" rx="8" fill="#d4ded4"/><rect x="80" y="70" width="210" height="200" rx="5" fill="#a4bba9"/><rect x="650" y="70" width="45" height="245" fill="#819c84"/><circle cx="675" cy="75" r="80" fill="#a0b79f"/><circle cx="320" cy="370" r="85" fill="none" stroke="#243a32" stroke-width="13"/><circle cx="610" cy="370" r="85" fill="none" stroke="#243a32" stroke-width="13"/><path d="M320 370L404 252L492 370H320L433 297H588L610 370M404 252L387 222H352M588 297L566 212L611 198M492 370L535 246" fill="none" stroke="#321ed3" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M365 220H421" stroke="#243a32" stroke-width="15" stroke-linecap="round"/><rect x="431" y="282" width="76" height="36" rx="12" fill="#00ffff"/><path d="M534 370L535 456" stroke="#243a32" stroke-width="8"/><rect x="30" y="490" width="840" height="42" rx="10" fill="#321e64"/><text x="450" y="518" font-family="Arial,sans-serif" font-size="20" fill="white" text-anchor="middle">ILLUSTRATION DE DÉMONSTRATION · PHOTO SIMULÉE</text></svg>')}`;

export async function preparePhoto(file) {
  if (!file.type.startsWith("image/"))
    throw new Error("Choisissez un fichier image (JPEG, PNG ou WebP).");
  if (file.size > 15 * 1024 * 1024)
    throw new Error(
      "Cette photo est trop volumineuse. Choisissez une image de moins de 15 Mo.",
    );
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("La photo n’a pas pu être lue. Réessayez."));
    reader.readAsDataURL(file);
  });
  const img = await new Promise((resolve, reject) => {
    const loadedImage = new Image();
    loadedImage.onload = () => resolve(loadedImage);
    loadedImage.onerror = () =>
      reject(
        new Error(
          "Cette image n’a pas pu être ouverte. Essayez une photo JPEG ou PNG.",
        ),
      );
    loadedImage.src = dataUrl;
  });
  const scale = Math.min(
    1,
    960 / Math.max(img.naturalWidth, img.naturalHeight),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("La photo n’a pas pu être préparée sur cet appareil.");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.72),
    name: file.name,
    simulated: false,
  };
}
