import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowUpDown, Loader2, RefreshCw, Send, Download,
  Trash2, AlertTriangle, Receipt, X,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { ADMIN_WHATSAPP_NUMBER, buildWhatsappLink } from "../lib/whatsapp";

interface FactureRow {
  id: string;
  commande_id: string | null;
  numero_affiche: string;
  type_prestation: string | null;
  date_emission: string;
  client_nom: string;
  client_contact: string | null;
  kit_titre: string | null;
  total: number;
  pdf_url: string | null;
  created_at: string;
}

type SortField = "created_at" | "client_nom" | "total";
type SortDir = "asc" | "desc";

const SORT_LABELS: Record<SortField, string> = {
  created_at: "Date",
  client_nom: "Client",
  total: "Montant",
};

export default function Factures() {
  const [factures, setFactures] = useState<FactureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const fetchFactures = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("factures")
      .select("id, commande_id, numero_affiche, type_prestation, date_emission, client_nom, client_contact, kit_titre, total, pdf_url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Impossible de charger les factures. Vérifie les policies RLS sur la table 'factures'.");
      console.error(error);
    } else {
      setFactures((data ?? []) as FactureRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = factures;
    if (q) {
      list = list.filter((f) =>
        [f.client_nom, f.numero_affiche, f.kit_titre ?? ""]
          .some((v) => v.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [factures, search, sortField, sortDir]);

  const resendMessage = (f: FactureRow) =>
    `Bonjour ${f.client_nom}, voici votre facture proforma ${f.numero_affiche}${f.kit_titre ? ` pour "${f.kit_titre}"` : ""}.\nMontant total : ${f.total.toLocaleString("fr-FR")} FCFA.\n\nVous pouvez la consulter et la télécharger ici :\n${f.pdf_url}\n\nJPGRAPHICDESIGN — Votre vision, notre création.`;

  const adminMessage = (f: FactureRow) =>
    `Facture : ${f.numero_affiche}\nClient : ${f.client_nom}\nTotal : ${f.total.toLocaleString("fr-FR")} FCFA\nPDF : ${f.pdf_url}`;

  const handleDelete = async (f: FactureRow) => {
    setDeletingId(f.id);
    try {
      const path = `${f.commande_id ?? "unknown"}/${f.numero_affiche}.pdf`;
      await supabase.storage.from("factures").remove([path]);
    } catch {
      /* le fichier n'existait peut-être plus, on continue */
    }
    const { error } = await supabase.from("factures").delete().eq("id", f.id);
    setDeletingId(null);
    setConfirmingDeleteId(null);
    if (error) {
      console.error(error);
      return;
    }
    setFactures((prev) => prev.filter((x) => x.id !== f.id));
  };

  return (
    <div className="min-h-screen w-full bg-portfolio-bg px-4 sm:px-6 md:px-10 py-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Receipt className="text-[#f2cc6a]" size={26} />
          <div>
            <h1 className="font-coco font-extrabold text-2xl text-white">Factures</h1>
            <p className="text-white/40 text-sm">
              {filtered.length} facture{filtered.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={fetchFactures}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-white/70 hover:border-[#f2cc6a]/50 hover:text-[#f2cc6a] transition-all text-sm"
        >
          <RefreshCw size={15} /> Actualiser
        </button>
      </div>

      {/* SEARCH + SORT */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par client, numéro, prestation..."
            className="w-full bg-white/5 border border-white/15 focus:border-[#f2cc6a] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/25 outline-none transition-all"
          />
        </div>

        {(Object.keys(SORT_LABELS) as SortField[]).map((f) => (
          <button
            key={f}
            onClick={() => toggleSort(f)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition-all
              ${sortField === f ? "border-[#f2cc6a]/70 bg-[#f2cc6a]/15 text-white" : "border-white/10 text-white/50 hover:text-white/80"}`}
          >
            {SORT_LABELS[f]}
            <ArrowUpDown
              size={12}
              className={sortField === f && sortDir === "asc" ? "rotate-180 transition-transform" : "transition-transform"}
            />
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/50 gap-2">
          <Loader2 className="animate-spin" size={20} /> Chargement...
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-10">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-white/40 text-center py-20">Aucune facture trouvée.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-white/50 text-left whitespace-nowrap">
                <th className="px-4 py-3 font-extrabold">N°</th>
                <th className="px-4 py-3 font-extrabold">Date</th>
                <th className="px-4 py-3 font-extrabold">Client</th>
                <th className="px-4 py-3 font-extrabold">Prestation</th>
                <th className="px-4 py-3 font-extrabold">Montant</th>
                <th className="px-4 py-3 font-extrabold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-[#f2cc6a] font-extrabold whitespace-nowrap">{f.numero_affiche}</td>
                  <td className="px-4 py-3 text-white/40 whitespace-nowrap">
                    {new Date(f.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-white whitespace-nowrap">{f.client_nom}</td>
                  <td className="px-4 py-3 text-white/60 max-w-[220px] truncate" title={f.kit_titre ?? ""}>
                    {f.kit_titre || "—"}
                  </td>
                  <td className="px-4 py-3 text-white/80 whitespace-nowrap font-extrabold">
                    {f.total.toLocaleString("fr-FR")} FCFA
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {f.pdf_url && (
                        <>
                          <a
                            href={buildWhatsappLink(f.client_contact ?? "", resendMessage(f))}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Envoyer au client"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#f2cc6a] to-[#f2a500] text-black text-xs font-extrabold"
                          >
                            <Send size={12} /> Client
                          </a>
                          <a
                            href={buildWhatsappLink(ADMIN_WHATSAPP_NUMBER, adminMessage(f))}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="M'envoyer une copie"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/15 text-white/70 hover:text-[#f2cc6a] hover:border-[#f2cc6a]/50 text-xs font-extrabold transition-all"
                          >
                            <Send size={12} /> Admin
                          </a>
                          <a
                            href={f.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Télécharger"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white text-xs font-extrabold transition-all"
                          >
                            <Download size={12} />
                          </a>
                        </>
                      )}
                      <button
                        onClick={() => setConfirmingDeleteId(f.id)}
                        title="Supprimer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/40 text-xs font-extrabold transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {confirmingDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfirmingDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/5 border border-white/15 backdrop-blur-2xl rounded-3xl w-full max-w-md p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-red-400" size={20} />
                  <h3 className="text-white font-extrabold">Supprimer cette facture ?</h3>
                </div>
                <button onClick={() => setConfirmingDeleteId(null)} className="text-white/40 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <p className="text-white/50 text-sm mb-5">
                Cette action supprime la facture et son PDF associé. Elle est irréversible.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmingDeleteId(null)}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-white/70 text-xs font-extrabold"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    const f = factures.find((x) => x.id === confirmingDeleteId);
                    if (f) handleDelete(f);
                  }}
                  disabled={deletingId === confirmingDeleteId}
                  className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-extrabold disabled:opacity-50"
                >
                  {deletingId === confirmingDeleteId ? "Suppression..." : "Confirmer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}