import jsPDF from "jspdf";
import CocoSharpRegularUrl from "../assets/font/Coco-Sharp-Regular-trial.ttf?url";
import CocoSharpBoldUrl from "../assets/font/Coco-Sharp-Bold-trial.ttf?url";
import CocoSharpItalicUrl from "../assets/font/Coco-Sharp-Italic-trial.ttf?url";

export interface FactureLigne {
  livrable: string;
  specifications: string;
  qte: string;
  montant: number;
}

export interface FactureData {
  numeroAffiche: string;
  typePrestation: string;
  dateEmission: string;

  emetteurNom: string;
  emetteurActivite: string;
  emetteurVille: string;
  emetteurContact: string;

  clientNom: string;
  clientSousTitre: string;
  clientContact: string;

  kitTitre: string;
  kitSousTitre: string;

  lignes: FactureLigne[];
  total: number;

  delaiLivraison: string;
  livraison: string;
  propriete: string;

  acompte: string;
  solde: string;
  modePaiement: string;
}

const GOLD: [number, number, number] = [242, 204, 106];
const ORANGE: [number, number, number] = [242, 165, 0];
const BLACK: [number, number, number] = [12, 12, 12];
const GRAY_LIGHT: [number, number, number] = [245, 245, 245];
const GRAY_BORDER: [number, number, number] = [225, 225, 225];
const GRAY_TEXT: [number, number, number] = [95, 95, 95];
const WHITE: [number, number, number] = [255, 255, 255];

const fmtFCFA = (n: number) => {
  const rounded = Math.round(n);
  const withSpaces = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${withSpaces} FCFA`;
};

async function loadLogoBase64(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch("/logoblanc.png", { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const blob = await res.blob();

    const rawDataUrl: string | null = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
    if (!rawDataUrl) return null;

    // Redimensionne/compresse via canvas : le PNG source peut être en haute
    // résolution (plusieurs Mo) alors qu'il n'est affiché qu'à 16mm dans le
    // PDF. Sans ça, jsPDF embarque l'image native et le PDF explose (ex: 24 Mo).
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const targetSize = 128; // px, largement suffisant pour un logo de 16mm
        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, targetSize, targetSize);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
      img.src = rawDataUrl;
    });
  } catch (e) {
    console.warn("Logo non chargé pour le PDF (on continue sans) :", e);
    return null;
  }
}

// Charge un fichier de police via fetch (Vite nous donne une URL fiable
// grâce au suffixe ?url) et le convertit en base64 pur, sans préfixe
// data:..., car c'est ce que jsPDF attend dans addFileToVFS.
async function loadFontBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();

    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000; // évite un stack overflow sur les gros fichiers
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  } catch (e) {
    console.warn("Police non chargée pour le PDF :", e);
    return null;
  }
}

// Charge les 3 variantes en parallèle plutôt qu'en séquence
async function loadCocoSharpFonts(): Promise<{
  regular: string | null;
  bold: string | null;
  italic: string | null;
}> {
  const [regular, bold, italic] = await Promise.all([
    loadFontBase64(CocoSharpRegularUrl),
    loadFontBase64(CocoSharpBoldUrl),
    loadFontBase64(CocoSharpItalicUrl),
  ]);
  return { regular, bold, italic };
}

export async function generateFacturePdf(data: FactureData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const marginX = 15;
  const contentWidth = pageWidth - marginX * 2;

  // ── CHARGEMENT LOGO + POLICES (en parallèle) ────────────
  const [logo, fonts] = await Promise.all([
    loadLogoBase64(),
    loadCocoSharpFonts(),
  ]);

  // Enregistre chaque variante réelle si elle a pu être chargée ;
  // sinon on retombe sur la police par défaut de jsPDF pour ce style
  // au lieu de planter.
  let fontFamily = "helvetica";
  if (fonts.regular || fonts.bold || fonts.italic) {
    fontFamily = "helvetica";
    if (fonts.regular) {
      doc.addFileToVFS("CocoSharp-Regular.ttf", fonts.regular);
      doc.addFont("CocoSharp-Regular.ttf", "CocoSharp", "normal");
    }
    if (fonts.bold) {
      doc.addFileToVFS("CocoSharp-Bold.ttf", fonts.bold);
      doc.addFont("CocoSharp-Bold.ttf", "CocoSharp", "bold");
    }
    if (fonts.italic) {
      doc.addFileToVFS("CocoSharp-Italic.ttf", fonts.italic);
      doc.addFont("CocoSharp-Italic.ttf", "CocoSharp", "italic");
    }
  } else {
    console.warn("Aucune variante CocoSharp chargée, fallback sur helvetica");
  }

  // ── HEADER ──────────────────────────────────────────────
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, pageWidth, 34, "F");

  if (logo) {
    try {
      doc.addImage(logo, "PNG", marginX, 6, 16, 16);
    } catch {
      /* ignore broken image */
    }
  }

  doc.setTextColor(...GOLD);
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(9);
  doc.text("jp", marginX + 8, 15, { align: "center" });

  doc.setTextColor(...WHITE);
  doc.setFont(fontFamily, "italic");
  doc.setFontSize(8);
  doc.text("Créateur d'identité visuelle", marginX, 30);

  const rightX = pageWidth - marginX;
  doc.setTextColor(...GOLD);
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(20);
  doc.text("FACTURE", rightX, 13, { align: "right" });

  doc.setTextColor(...WHITE);
  doc.setFont(fontFamily, "normal");
  doc.setFontSize(9);
  doc.text(`${data.emetteurNom} - ${data.emetteurVille}`, rightX, 19, { align: "right" });

  doc.setFont(fontFamily, "bold");
  doc.setFontSize(10);
  doc.text(`N° ${data.numeroAffiche}`, rightX, 25, { align: "right" });

  doc.setTextColor(...GOLD);
  doc.setFontSize(9);
  doc.text(data.typePrestation.toUpperCase(), rightX, 30, { align: "right" });

  // ── ÉMETTEUR / DATES / CLIENT ───────────────────────────
  const colW = contentWidth / 3;
  const col1 = marginX;
  const col2 = marginX + colW;
  const col3 = marginX + colW * 2;
  let y = 44;

  doc.setTextColor(...BLACK);
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(9);
  doc.text("ÉMETTEUR", col1, y);
  doc.text("DATES", col2, y);
  doc.text("CLIENT", col3, y);

  y += 5;
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(9);
  doc.text(data.emetteurNom, col1, y);
  doc.text(data.clientNom, col3, y);
  doc.setFont(fontFamily, "normal");
  doc.setFontSize(8.5);
  doc.text(`Émission : ${data.dateEmission}`, col2, y);

  y += 4.5;
  doc.text(data.emetteurActivite, col1, y);
  if (data.clientSousTitre) {
    const lines = doc.splitTextToSize(data.clientSousTitre, colW - 2);
    doc.text(lines, col3, y);
    y += (lines.length - 1) * 4;
  }

  y += 4.5;
  doc.text(data.emetteurVille, col1, y);

  y += 4.5;
  doc.text(`Contact : ${data.emetteurContact}`, col1, y);
  if (data.clientContact) {
    doc.text(`Contact : ${data.clientContact}`, col3, y);
  }

  y += 6;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(marginX, y, pageWidth - marginX, y);

  // ── KIT / TITRE PRESTATION ──────────────────────────────
  y += 8;
  doc.setFillColor(...GOLD);
  doc.rect(marginX, y - 4, 1.2, 5.5, "F");
  doc.setTextColor(...BLACK);
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(11);
  doc.text(data.kitTitre, marginX + 4, y);

  if (data.kitSousTitre) {
    y += 5;
    doc.setFont(fontFamily, "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY_TEXT);
    doc.text(data.kitSousTitre, marginX + 4, y);
  }

  // ── TABLEAU ──────────────────────────────────────────────
  y += 8;
  const cLivrable = 45;
  const cSpec = 70;
  const cQte = 20;
  const cMontant = contentWidth - cLivrable - cSpec - cQte;
  const xLivrable = marginX;
  const xSpec = xLivrable + cLivrable;
  const xQte = xSpec + cSpec;
  const xMontant = xQte + cQte;

  const headerH = 8;
  doc.setFillColor(...ORANGE);
  doc.rect(marginX, y, contentWidth, headerH, "F");
  doc.setTextColor(...WHITE);
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(8.5);
  doc.text("LIVRABLE", xLivrable + 2, y + 5.5);
  doc.text("SPÉCIFICATIONS", xSpec + 2, y + 5.5);
  doc.text("QTÉ", xQte + cQte - 2, y + 5.5, { align: "right" });
  doc.text("MONTANT", xMontant + cMontant - 2, y + 5.5, { align: "right" });
  y += headerH;

  const pageBottomLimit = 265;

  data.lignes.forEach((ligne, idx) => {
    doc.setFont(fontFamily, "normal");
    doc.setFontSize(8.5);
    const specLines = doc.splitTextToSize(ligne.specifications || "-", cSpec - 4);
    const rowH = Math.max(10, specLines.length * 4 + 4);

    if (y + rowH > pageBottomLimit) {
      doc.addPage();
      y = 15;
      doc.setFillColor(...ORANGE);
      doc.rect(marginX, y, contentWidth, headerH, "F");
      doc.setTextColor(...WHITE);
      doc.setFont(fontFamily, "bold");
      doc.setFontSize(8.5);
      doc.text("LIVRABLE", xLivrable + 2, y + 5.5);
      doc.text("SPÉCIFICATIONS", xSpec + 2, y + 5.5);
      doc.text("QTÉ", xQte + cQte - 2, y + 5.5, { align: "right" });
      doc.text("MONTANT", xMontant + cMontant - 2, y + 5.5, { align: "right" });
      y += headerH;
    }

    doc.setFillColor(...(idx % 2 === 0 ? GRAY_LIGHT : WHITE));
    doc.rect(marginX, y, contentWidth, rowH, "F");

    doc.setTextColor(...BLACK);
    doc.setFont(fontFamily, "bold");
    doc.setFontSize(8.5);
    const livrableLines = doc.splitTextToSize(ligne.livrable || "-", cLivrable - 4);
    doc.text(livrableLines, xLivrable + 2, y + 5.5);

    doc.setFont(fontFamily, "normal");
    doc.setTextColor(...GRAY_TEXT);
    doc.text(specLines, xSpec + 2, y + 5.5);

    doc.setTextColor(...BLACK);
    doc.text(String(ligne.qte || "-"), xQte + cQte - 2, y + 5.5, { align: "right" });

    doc.setFont(fontFamily, "bold");
    doc.text(fmtFCFA(ligne.montant || 0), xMontant + cMontant - 2, y + 5.5,{ align: "right" });

    y += rowH;
  });

  // TOTAL
  const totalH = 9;
  if (y + totalH > pageBottomLimit) {
    doc.addPage();
    y = 15;
  }
  doc.setFillColor(...BLACK);
  doc.rect(marginX, y, contentWidth, totalH, "F");
  doc.setTextColor(...WHITE);
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(9.5);
  doc.text("TOTAL", xQte + cQte - 2, y + 6, { align: "right" });
  doc.setTextColor(...GOLD);
  doc.text(fmtFCFA(data.total), xMontant + cMontant - 2, y + 6, { align: "right" });
  y += totalH + 8;

  // ── NOTES ────────────────────────────────────────────────
  const notes = [
    data.delaiLivraison ? `Délai de livraison : ${data.delaiLivraison}` : null,
    data.livraison ? `Livraison : ${data.livraison}` : null,
    data.propriete ? `Propriété intellectuelle : ${data.propriete}` : null,
  ].filter(Boolean) as string[];

  if (notes.length) {
    const notesH = notes.length * 6 + 6;
    if (y + notesH > pageBottomLimit) {
      doc.addPage();
      y = 15;
    }
    doc.setFillColor(...GRAY_LIGHT);
    doc.rect(marginX, y, contentWidth, notesH, "F");
    doc.setFont(fontFamily, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...BLACK);
    notes.forEach((n, i) => {
      doc.text(n, marginX + 4, y + 6 + i * 6);
    });
    y += notesH + 10;
  } else {
    y += 4;
  }

  // ── ACOMPTE / SOLDE / MODE DE PAIEMENT ──────────────────
  if (y + 20 > pageBottomLimit) {
    doc.addPage();
    y = 15;
  }
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...BLACK);
  doc.text("ACOMPTE AU DÉMARRAGE", col1, y);
  doc.text("SOLDE À LA LIVRAISON", col2, y);
  doc.text("MODE DE PAIEMENT", col3, y);

  y += 5;
  doc.setFontSize(9);
  doc.text(data.acompte || "-", col1, y);
  doc.text(data.solde || "-", col2, y);
  doc.text(data.modePaiement || "-", col3, y);

  y += 16;

  // ── SIGNATURES ───────────────────────────────────────────
  if (y + 24 > pageBottomLimit) {
    doc.addPage();
    y = 15;
  }
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(9);
  doc.text(`Le Prestataire - ${data.emetteurNom}`, col1, y);
  doc.text(`Le Client - ${data.clientNom}`, col3, y);

  y += 5;
  doc.setFont(fontFamily, "normal");
  doc.setFontSize(8.5);
  doc.text("Lu et approuvé", col1, y);
  doc.text("Bon pour accord", col3, y);

  y += 14;
  doc.text("Signature & Date", col1, y);
  doc.text("Signature & Date", col3, y);

  // ── FOOTER (dernière page) ──────────────────────────────
  const pageCount = doc.getNumberOfPages();
  doc.setPage(pageCount);
  doc.setDrawColor(...GRAY_BORDER);
  doc.setLineWidth(0.2);
  doc.line(marginX, 282, pageWidth - marginX, 282);
  doc.setFont(fontFamily, "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY_TEXT);
  doc.text(`${data.emetteurNom} — Votre vision, notre création.`, marginX, 288);
  doc.text(
    `Facture N° ${data.numeroAffiche} — Confidentiel — Réservé au client`,
    pageWidth - marginX,
    288,
    { align: "right" }
  );

  return doc;
}

export function pdfToBlob(doc: jsPDF): Blob {
  return doc.output("blob");
}