import { useState } from "react";
import { motion } from "framer-motion";
import {
  X, Plus, Trash2, Loader2, FileText, Send, Download, CheckCircle2,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { generateFacturePdf, pdfToBlob } from "../lib/generateFacturePdf";
import type { FactureLigne } from "../lib/generateFacturePdf";
import { ADMIN_WHATSAPP_NUMBER, buildWhatsappLink } from "../lib/whatsapp";
import type { Commande } from "../pages/Admin";

const STORAGE_BUCKET = "factures";

const inputCls =
  "w-full bg-white/5 border border-white/15 focus:border-[#f2cc6a] rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-all placeholder:text-white/70";
const labelCls = "block text-white/50 text-xs font-extrabold uppercase mb-1.5";

interface FactureModalProps {
  commande: Commande;
  onClose: () => void;
}

export default function FactureModal({ commande, onClose }: FactureModalProps) {
  const [typePrestation, setTypePrestation] = useState("Prestation graphique");
  const [kitTitre, setKitTitre] = useState(
    `Kit de communication : ${commande.entreprise || commande.nom}`
  );
  const [kitSousTitre, setKitSousTitre] = useState(commande.objectif || "");
  const [clientSousTitre, setClientSousTitre] = useState(commande.entreprise || "");

  const [lignes, setLignes] = useState<FactureLigne[]>([
    { livrable: "", specifications: "", qte: "1", montant: 0 },
  ]);

  const [delaiLivraison, setDelaiLivraison] = useState(
    commande.deadline ? `avant le ${new Date(commande.deadline).toLocaleDateString("fr-FR")}` : "à convenir"
  );
  const [livraison, setLivraison] = useState("remis via WhatsApp pour les fichiers sources");
  const [propriete, setPropriete] = useState(
    "fichiers sources propriété de JPGRAPHICDESIGN jusqu'au paiement intégral"
  );
  const [acompte, setAcompte] = useState("");
  const [solde, setSolde] = useState("");
  const [modePaiement, setModePaiement] = useState("MTN / Orange Money");

  const [step, setStep] = useState<"form" | "sending" | "done">("form");
  const [error, setError] = useState("");
  const [clientLink, setClientLink] = useState("");
  const [adminLink, setAdminLink] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [numeroAffiche, setNumeroAffiche] = useState("");

  const total = lignes.reduce((sum, l) => sum + (Number(l.montant) || 0), 0);

  const updateLigne = (index: number, field: keyof FactureLigne, value: string) => {
    setLignes((prev) =>
      prev.map((l, i) =>
        i === index ? { ...l, [field]: field === "montant" ? Number(value) || 0 : value } : l
      )
    );
  };

  const addLigne = () =>
    setLignes((prev) => [...prev, { livrable: "", specifications: "", qte: "1", montant: 0 }]);

  const removeLigne = (index: number) =>
    setLignes((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const handleGenerate = async () => {
    setError("");

    if (!kitTitre.trim() || lignes.some((l) => !l.livrable.trim())) {
      setError("Merci de renseigner le titre de la prestation et le nom de chaque livrable.");
      return;
    }

    setStep("sending");

    // Garde-fou : si une étape reste bloquée plus de 25s (réseau, RLS mal
    // configurée, clés Supabase invalides...), on arrête le spinner et on
    // affiche une erreur au lieu de tourner indéfiniment.
    const withTimeout = <T,>(promise: PromiseLike<T>, label: string, ms = 25000): Promise<T> =>
      Promise.race([
        Promise.resolve(promise),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(`Délai dépassé pendant : ${label}`)), ms)
        ),
      ]);

    try {
      // 1. Enregistrer la facture (le numéro est généré automatiquement en base)
      console.log("[facture] 1/5 insertion en base...");
      const { data: factureRow, error: insertError } = await withTimeout(
        supabase
          .from("factures")
          .insert([
            {
              commande_id: commande.id,
              type_prestation: typePrestation,
              client_nom: commande.entreprise || commande.nom,
              client_sous_titre: clientSousTitre || null,
              client_contact: commande.contact,
              kit_titre: kitTitre,
              kit_sous_titre: kitSousTitre || null,
              lignes,
              total,
              delai_livraison: delaiLivraison,
              livraison,
              propriete,
              acompte,
              solde,
              mode_paiement: modePaiement,
            },
          ])
          .select()
          .single(),
        "enregistrement de la facture"
      );

      if (insertError || !factureRow) {
        console.error("[facture] erreur insertion:", insertError);
        throw new Error(
          insertError?.message ||
            "Impossible d'enregistrer la facture. Vérifie que la table 'factures' existe et que les policies RLS sont bien appliquées."
        );
      }
      console.log("[facture] insertion OK ->", factureRow.numero_affiche);

      // 2. Générer le PDF
      console.log("[facture] 2/5 génération du PDF...");
      const dateEmission = new Date(factureRow.date_emission ?? factureRow.created_at).toLocaleDateString(
        "fr-FR",
        { day: "numeric", month: "long", year: "numeric" }
      );

      const doc = await withTimeout(
        generateFacturePdf({
          numeroAffiche: factureRow.numero_affiche,
          typePrestation,
          dateEmission,
          emetteurNom: factureRow.emetteur_nom,
          emetteurActivite: factureRow.emetteur_activite,
          emetteurVille: factureRow.emetteur_ville,
          emetteurContact: factureRow.emetteur_contact,
          clientNom: factureRow.client_nom,
          clientSousTitre: factureRow.client_sous_titre || "",
          clientContact: factureRow.client_contact || "",
          kitTitre,
          kitSousTitre,
          lignes,
          total,
          delaiLivraison,
          livraison,
          propriete,
          acompte,
          solde,
          modePaiement,
        }),
        "génération du PDF"
      );
      console.log("[facture] PDF généré");

      const blob = pdfToBlob(doc);
      console.log(`[facture] taille du PDF : ${(blob.size / 1024).toFixed(1)} Ko`);
      const path = `${commande.id}/${factureRow.numero_affiche}.pdf`;

      // 3. Upload du PDF
      console.log("[facture] 3/5 upload du PDF...");
      const { error: uploadError } = await withTimeout(
        supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, blob, { contentType: "application/pdf", upsert: true }),
        "envoi du PDF vers le stockage"
      );

      if (uploadError) {
        console.error("[facture] erreur upload:", uploadError);
        throw new Error(
          `Impossible d'envoyer le PDF sur le stockage : ${uploadError.message}. Vérifie que le bucket 'factures' existe.`
        );
      }
      console.log("[facture] upload OK");

      const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      const publicUrl = publicUrlData.publicUrl;

      // 4. Mettre à jour la facture avec le lien du PDF
      console.log("[facture] 4/5 mise à jour du lien PDF...");
      const { error: updateError } = await withTimeout(
        supabase.from("factures").update({ pdf_path: path, pdf_url: publicUrl }).eq("id", factureRow.id),
        "mise à jour de la facture"
      );
      if (updateError) {
        console.warn("[facture] mise à jour du lien PDF échouée (non bloquant):", updateError);
      }

      // 5. Construire les liens WhatsApp
      console.log("[facture] 5/5 construction des liens WhatsApp...");
      const clientMessage = `Bonjour ${commande.nom}, voici votre facture proforma ${factureRow.numero_affiche} pour "${kitTitre}".\nMontant total : ${total.toLocaleString("fr-FR")} FCFA.\n\nVous pouvez la consulter et la télécharger ici :\n${publicUrl}\n\nJPGRAPHICDESIGN — Votre vision, notre création.`;

      const adminMessage = `Nouvelle facture générée : ${factureRow.numero_affiche}\nClient : ${commande.nom} (${commande.entreprise})\nTotal : ${total.toLocaleString("fr-FR")} FCFA\nPDF : ${publicUrl}`;

      setClientLink(buildWhatsappLink(commande.contact, clientMessage));
      setAdminLink(buildWhatsappLink(ADMIN_WHATSAPP_NUMBER, adminMessage));
      setPdfUrl(publicUrl);
      setNumeroAffiche(factureRow.numero_affiche);
      setStep("done");
      console.log("[facture] terminé ✅");
    } catch (e) {
      console.error("[facture] échec:", e);
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
      setStep("form");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={step === "form" ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white/5 border border-white/15 backdrop-blur-2xl rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="text-[#f2cc6a]" size={22} />
            <h2 className="font-coco font-extrabold text-2xl text-white">
              Facture proforma - {commande.nom}
            </h2>
          </div>
          {step !== "sending" && (
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X size={22} />
            </button>
          )}
        </div>

        {step === "done" ? (
          <div className="text-center py-6">
            <CheckCircle2 className="mx-auto text-[#f2cc6a] mb-4" size={48} />
            <p className="text-white font-extrabold text-lg mb-1">Facture {numeroAffiche} créée !</p>
            <p className="text-white/50 text-sm mb-8">
              Le PDF a été généré et enregistré. Il ne reste qu'à envoyer les messages WhatsApp.
            </p>

            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <a
                href={clientLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#f2cc6a] to-[#f2a500] text-black font-extrabold text-sm shadow-lg hover:scale-[1.02] transition-transform"
              >
                <Send size={16} /> Envoyer au client ({commande.contact})
              </a>
              <a
                href={adminLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/20 text-white font-extrabold text-sm hover:border-[#f2cc6a]/50 hover:text-[#f2cc6a] transition-all"
              >
                <Send size={16} /> M'envoyer une copie (admin)
              </a>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-white/60 font-extrabold text-sm hover:text-white transition-all"
              >
                <Download size={16} /> Télécharger le PDF
              </a>
            </div>

            <button
              onClick={onClose}
              className="mt-8 text-white/40 hover:text-white text-sm underline underline-offset-4"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            {error && (
              <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className={labelCls}>Type de prestation</label>
                <input
                  className={inputCls}
                  value={typePrestation}
                  onChange={(e) => setTypePrestation(e.target.value)}
                  placeholder="Prestation événementielle"
                />
              </div>
              <div>
                <label className={labelCls}>Sous-titre client (facultatif)</label>
                <input
                  className={inputCls}
                  value={clientSousTitre}
                  onChange={(e) => setClientSousTitre(e.target.value)}
                  placeholder="Nom du projet / de l'entreprise"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Titre du kit / de la prestation *</label>
                <input
                  className={inputCls}
                  value={kitTitre}
                  onChange={(e) => setKitTitre(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Sous-titre du kit (facultatif)</label>
                <input
                  className={inputCls}
                  value={kitSousTitre}
                  onChange={(e) => setKitSousTitre(e.target.value)}
                  placeholder="Signalétique et supports de communication pour l'événement"
                />
              </div>
            </div>

            {/* LIGNES */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className={labelCls + " mb-0"}>Livrables</label>
                <button
                  type="button"
                  onClick={addLigne}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-white/70 hover:border-[#f2cc6a]/50 hover:text-[#f2cc6a] text-xs font-extrabold transition-all"
                >
                  <Plus size={14} /> Ajouter une ligne
                </button>
              </div>

              <div className="space-y-3">
                {lignes.map((ligne, i) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-12 gap-2"
                  >
                    <input
                      className={`${inputCls} sm:col-span-3`}
                      placeholder="Livrable (ex: Badges nominatifs)"
                      value={ligne.livrable}
                      onChange={(e) => updateLigne(i, "livrable", e.target.value)}
                    />
                    <input
                      className={`${inputCls} sm:col-span-5`}
                      placeholder="Spécifications"
                      value={ligne.specifications}
                      onChange={(e) => updateLigne(i, "specifications", e.target.value)}
                    />
                    <input
                      className={`${inputCls} sm:col-span-1`}
                      placeholder="Qté"
                      value={ligne.qte}
                      onChange={(e) => updateLigne(i, "qte", e.target.value)}
                    />
                    <input
                      className={`${inputCls} sm:col-span-2`}
                      placeholder="Montant"
                      type="number"
                      value={ligne.montant || ""}
                      onChange={(e) => updateLigne(i, "montant", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeLigne(i)}
                      disabled={lignes.length === 1}
                      className="sm:col-span-1 flex items-center justify-center text-white/30 hover:text-red-400 disabled:opacity-20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-right text-white/70 text-sm mt-3 font-extrabold">
                TOTAL : <span className="text-[#f2cc6a]">{total.toLocaleString("fr-FR")} FCFA</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className={labelCls}>Délai de livraison</label>
                <input className={inputCls} value={delaiLivraison} onChange={(e) => setDelaiLivraison(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Livraison</label>
                <input className={inputCls} value={livraison} onChange={(e) => setLivraison(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Propriété intellectuelle</label>
                <input className={inputCls} value={propriete} onChange={(e) => setPropriete(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Acompte au démarrage</label>
                <input className={inputCls} value={acompte} onChange={(e) => setAcompte(e.target.value)} placeholder="ex: 20 000 FCFA" />
              </div>
              <div>
                <label className={labelCls}>Solde à la livraison</label>
                <input className={inputCls} value={solde} onChange={(e) => setSolde(e.target.value)} placeholder="ex: 22 500 FCFA" />
              </div>
              <div>
                <label className={labelCls}>Mode de paiement</label>
                <input className={inputCls} value={modePaiement} onChange={(e) => setModePaiement(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/15 text-white/70 text-sm font-extrabold transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleGenerate}
                disabled={step === "sending"}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f2cc6a] to-[#f2a500] text-black text-sm font-extrabold shadow-lg disabled:opacity-50 transition-all"
              >
                {step === "sending" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Génération...
                  </>
                ) : (
                  <>
                    <FileText size={14} /> Générer la facture
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}