// Numéro WhatsApp de l'administrateur (JPGRAPHICDESIGN)
export const ADMIN_WHATSAPP_NUMBER = "+237673846813";
export const DEFAULT_COUNTRY_CODE = "237";

/**
 * Normalise un numéro de téléphone au format attendu par wa.me
 * (chiffres uniquement, avec indicatif pays, sans "+").
 * Ex: "+237 673 846 813" -> "237673846813"
 *     "0673846813"       -> "237673846813"
 *     "673846813"        -> "237673846813"
 */
export function toWhatsappNumber(raw: string, countryCode = DEFAULT_COUNTRY_CODE): string {
  let digits = (raw || "").replace(/[^\d]/g, "");
  if (!digits) return "";

  if (digits.startsWith(countryCode)) {
    return digits;
  }
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return `${countryCode}${digits}`;
}

export function buildWhatsappLink(rawNumber: string, message: string, countryCode?: string): string {
  const number = toWhatsappNumber(rawNumber, countryCode);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}