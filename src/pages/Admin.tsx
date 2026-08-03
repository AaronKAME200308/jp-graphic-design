import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Search, ArrowUpDown, X, FileText,
  Calendar, Star, Wallet, Loader2, RefreshCw,
  Plus, Pencil, Trash2, Save, AlertTriangle, Ban, Receipt
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import FactureModal from "../component/FactureModal";

// ─── Types ────────────────────────────────────────────────────────────────
export interface Commande {
  id: string;
  created_at: string;
  nom: string;
  contact: string;
  entreprise: string;
  site_web: string | null;
  services: string[];
  activite: string;
  objectif: string;
  style: string;
  couleurs: string[];
  elements_eviter: string | null;
  deadline: string | null;
  formats: string;
  budget: string;
  satisfaction: number | null;
  fichiers: string[];
  dossier_storage: string | null;
}

interface CommandeFormData {
  nom: string;
  contact: string;
  entreprise: string;
  site_web: string;
  services: string;
  activite: string;
  objectif: string;
  style: string;
  couleurs: string;
  elements_eviter: string;
  deadline: string;
  formats: string;
  budget: string;
  satisfaction: string;
}

type SortField = "created_at" | "nom" | "budget" | "satisfaction";
type SortDir = "asc" | "desc";

const STORAGE_BUCKET = "commandes-files";

const SORT_LABELS: Record<SortField, string> = {
  created_at: "Date",
  nom: "Nom",
  budget: "Budget",
  satisfaction: "Satisfaction",
};

const EMPTY_FORM: CommandeFormData = {
  nom: "", contact: "", entreprise: "", site_web: "",
  services: "", activite: "", objectif: "", style: "",
  couleurs: "", elements_eviter: "", deadline: "", formats: "",
  budget: "", satisfaction: "",
};

const commandeToForm = (c: Commande): CommandeFormData => ({
  nom: c.nom ?? "",
  contact: c.contact ?? "",
  entreprise: c.entreprise ?? "",
  site_web: c.site_web ?? "",
  services: (c.services ?? []).join(", "),
  activite: c.activite ?? "",
  objectif: c.objectif ?? "",
  style: c.style ?? "",
  couleurs: (c.couleurs ?? []).join(", "),
  elements_eviter: c.elements_eviter ?? "",
  deadline: c.deadline ?? "",
  formats: c.formats ?? "",
  budget: c.budget ?? "",
  satisfaction: c.satisfaction != null ? String(c.satisfaction) : "",
});

const formToPayload = (f: CommandeFormData) => ({
  nom: f.nom.trim(),
  contact: f.contact.trim(),
  entreprise: f.entreprise.trim(),
  site_web: f.site_web.trim() || null,
  services: f.services.split(",").map((s) => s.trim()).filter(Boolean),
  activite: f.activite.trim(),
  objectif: f.objectif.trim(),
  style: f.style.trim(),
  couleurs: f.couleurs.split(",").map((s) => s.trim()).filter(Boolean),
  elements_eviter: f.elements_eviter.trim() || null,
  deadline: f.deadline || null,
  formats: f.formats.trim(),
  budget: f.budget.trim(),
  satisfaction: f.satisfaction ? Number(f.satisfaction) : null,
});

// ─── Page principale ───────────────────────────────────────────────────────
export default function Admin() {
  const { signOut } = useAuth();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Commande | null>(null);
  const [creating, setCreating] = useState(false);
  const [facturing, setFacturing] = useState<Commande | null>(null);

  const fetchCommandes = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("commandes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Impossible de charger les commandes. Vérifie les policies RLS sur la table 'commandes'.");
      console.error(error);
    } else {
      setCommandes((data ?? []) as Commande[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCommandes();
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
    let list = commandes;
    if (q) {
      list = list.filter((c) =>
        [c.nom, c.contact, c.entreprise, c.activite]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      let av: string | number = a[sortField] ?? "";
      let bv: string | number = b[sortField] ?? "";
      if (sortField === "satisfaction") {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [commandes, search, sortField, sortDir]);

  const handleUpdated = (updated: Commande) => {
    setCommandes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelected((prev) => (prev && prev.id === updated.id ? updated : prev));
  };

  const handleDeleted = (id: string) => {
    setCommandes((prev) => prev.filter((c) => c.id !== id));
    setSelected(null);
  };

  const handleCreated = (created: Commande) => {
    setCommandes((prev) => [created, ...prev]);
    setCreating(false);
  };

  return (
    <div className="min-h-screen w-full bg-portfolio-bg px-4 sm:px-6 md:px-10 py-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-coco font-extrabold text-2xl text-white">Commandes</h1>
          <p className="text-white/40 text-sm">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f2cc6a] to-[#f2a500] text-black font-extrabold text-sm shadow-lg"
          >
            <Plus size={15} /> Nouvelle commande
          </button>
          <button
            onClick={fetchCommandes}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-white/70 hover:border-[#f2cc6a]/50 hover:text-[#f2cc6a] transition-all text-sm"
          >
            <RefreshCw size={15} /> Actualiser
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-white/70 hover:border-red-400/50 hover:text-red-400 transition-all text-sm"
          >
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
      </div>

      {/* SEARCH + SORT */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, contact, entreprise..."
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
        <div className="text-white/40 text-center py-20">Aucune commande trouvée.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-white/50 text-left whitespace-nowrap">
                <th className="px-4 py-3 font-extrabold">Date</th>
                <th className="px-4 py-3 font-extrabold">Nom</th>
                <th className="px-4 py-3 font-extrabold">Contact</th>
                <th className="px-4 py-3 font-extrabold">Entreprise</th>
                <th className="px-4 py-3 font-extrabold">Site web</th>
                <th className="px-4 py-3 font-extrabold">Services</th>
                <th className="px-4 py-3 font-extrabold">Activité</th>
                <th className="px-4 py-3 font-extrabold">Objectif</th>
                <th className="px-4 py-3 font-extrabold">Style</th>
                <th className="px-4 py-3 font-extrabold">Couleurs</th>
                <th className="px-4 py-3 font-extrabold">À éviter</th>
                <th className="px-4 py-3 font-extrabold">Deadline</th>
                <th className="px-4 py-3 font-extrabold">Formats</th>
                <th className="px-4 py-3 font-extrabold">Budget</th>
                <th className="px-4 py-3 font-extrabold">Satisfaction</th>
                <th className="px-4 py-3 font-extrabold">Fichiers</th>
                <th className="px-4 py-3 font-extrabold">ID</th>
                <th className="px-4 py-3 font-extrabold">Facture</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="border-t border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-white/40 whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-white whitespace-nowrap">{c.nom}</td>
                  <td className="px-4 py-3 text-white/70 whitespace-nowrap">{c.contact}</td>
                  <td className="px-4 py-3 text-white/70 whitespace-nowrap">{c.entreprise}</td>
                  <td className="px-4 py-3 text-white/50 max-w-[160px] truncate" title={c.site_web ?? ""}>
                    {c.site_web ? (
                      <a
                        href={c.site_web}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-[#f2cc6a] underline underline-offset-2"
                      >
                        {c.site_web}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/60 max-w-[180px] truncate" title={c.services?.join(", ")}>
                    {c.services?.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60 max-w-[140px] truncate" title={c.activite}>
                    {c.activite}
                  </td>
                  <td className="px-4 py-3 text-white/60 max-w-[200px] truncate" title={c.objectif}>
                    {c.objectif}
                  </td>
                  <td className="px-4 py-3 text-white/60 max-w-[180px] truncate" title={c.style}>
                    {c.style}
                  </td>
                  <td className="px-4 py-3 text-white/60 max-w-[160px] truncate" title={c.couleurs?.join(", ")}>
                    {c.couleurs?.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60 max-w-[160px] truncate" title={c.elements_eviter ?? ""}>
                    {c.elements_eviter || "—"}
                  </td>
                  <td className="px-4 py-3 text-white/40 whitespace-nowrap">
                    {c.deadline ? new Date(c.deadline).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60 max-w-[160px] truncate" title={c.formats}>
                    {c.formats}
                  </td>
                  <td className="px-4 py-3 text-[#f2cc6a] whitespace-nowrap">{c.budget}</td>
                  <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                    {c.satisfaction != null ? `${c.satisfaction} ★` : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/50 whitespace-nowrap">{c.fichiers?.length ?? 0}</td>
                  <td className="px-4 py-3 text-white/30 font-mono text-xs" title={c.id}>
                    {c.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFacturing(c);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-white/70 hover:border-[#f2cc6a]/50 hover:text-[#f2cc6a] text-xs font-extrabold transition-all"
                    >
                      <Receipt size={13} /> Facture
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL / EDIT / DELETE */}
      <AnimatePresence>
        {selected && (
          <CommandeDetail
            commande={selected}
            onClose={() => setSelected(null)}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
            onCreateFacture={() => setFacturing(selected)}
          />
        )}
      </AnimatePresence>

      {/* CREATE */}
      <AnimatePresence>
        {creating && (
          <CommandeCreateModal onClose={() => setCreating(false)} onCreated={handleCreated} />
        )}
      </AnimatePresence>

      {/* FACTURE */}
      <AnimatePresence>
        {facturing && (
          <FactureModal commande={facturing} onClose={() => setFacturing(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Champs de formulaire partagés (création + édition) ───────────────────
function CommandeFormFields({
  form,
  onChange,
}: {
  form: CommandeFormData;
  onChange: (field: keyof CommandeFormData, value: string) => void;
}) {
  const inputCls =
    "w-full bg-white/5 border border-white/15 focus:border-[#f2cc6a] rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-all placeholder:text-white/25";
  const labelCls = "block text-white/50 text-xs font-extrabold uppercase mb-1.5";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className={labelCls}>Nom *</label>
        <input className={inputCls} value={form.nom} onChange={(e) => onChange("nom", e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>Contact *</label>
        <input className={inputCls} value={form.contact} onChange={(e) => onChange("contact", e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>Entreprise *</label>
        <input className={inputCls} value={form.entreprise} onChange={(e) => onChange("entreprise", e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>Site web</label>
        <input className={inputCls} value={form.site_web} onChange={(e) => onChange("site_web", e.target.value)} placeholder="https://..." />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Services (séparés par une virgule) *</label>
        <input className={inputCls} value={form.services} onChange={(e) => onChange("services", e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>Activité *</label>
        <input className={inputCls} value={form.activite} onChange={(e) => onChange("activite", e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>Budget *</label>
        <input className={inputCls} value={form.budget} onChange={(e) => onChange("budget", e.target.value)} required />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Objectif principal *</label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={form.objectif}
          onChange={(e) => onChange("objectif", e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Style souhaité *</label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={form.style}
          onChange={(e) => onChange("style", e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Couleurs (séparées par une virgule)</label>
        <input
          className={inputCls}
          value={form.couleurs}
          onChange={(e) => onChange("couleurs", e.target.value)}
          placeholder="Or (#F2CC6A), Noir (#000000)"
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Éléments à éviter</label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={form.elements_eviter}
          onChange={(e) => onChange("elements_eviter", e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls}>Deadline</label>
        <input
          type="date"
          className={`${inputCls} [color-scheme:dark]`}
          value={form.deadline}
          onChange={(e) => onChange("deadline", e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls}>Satisfaction (1 à 5)</label>
        <select className={inputCls} value={form.satisfaction} onChange={(e) => onChange("satisfaction", e.target.value)}>
          <option value="">—</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} ★
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Formats / contraintes techniques *</label>
        <input className={inputCls} value={form.formats} onChange={(e) => onChange("formats", e.target.value)} required />
      </div>
    </div>
  );
}

// ─── Détail / édition / suppression d'une commande ─────────────────────────
function CommandeDetail({
  commande,
  onClose,
  onUpdated,
  onDeleted,
  onCreateFacture,
}: {
  commande: Commande;
  onClose: () => void;
  onUpdated: (c: Commande) => void;
  onDeleted: (id: string) => void;
  onCreateFacture: () => void;
}) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [form, setForm] = useState<CommandeFormData>(commandeToForm(commande));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [signedUrls, setSignedUrls] = useState<{ name: string; url: string }[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    setForm(commandeToForm(commande));
  }, [commande]);

  useEffect(() => {
    const loadFiles = async () => {
      if (!commande.dossier_storage) {
        setSignedUrls([]);
        setLoadingFiles(false);
        return;
      }
      setLoadingFiles(true);
      try {
        const { data: fileList, error: listError } = await supabase
          .storage
          .from(STORAGE_BUCKET)
          .list(commande.dossier_storage);

        if (listError || !fileList) {
          setSignedUrls([]);
          return;
        }

        const urls = await Promise.all(
          fileList.map(async (f) => {
            const path = `${commande.dossier_storage}/${f.name}`;
            const { data } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 60 * 10);
            return { name: f.name, url: data?.signedUrl ?? "" };
          })
        );
        setSignedUrls(urls.filter((u) => u.url));
      } finally {
        setLoadingFiles(false);
      }
    };
    loadFiles();
  }, [commande.dossier_storage]);

  const handleFieldChange = (field: keyof CommandeFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    setForm(commandeToForm(commande));
    setSaveError("");
    setMode("view");
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const payload = formToPayload(form);
    const { data, error } = await supabase
      .from("commandes")
      .update(payload)
      .eq("id", commande.id)
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      setSaveError("Impossible d'enregistrer les modifications. Vérifie les champs obligatoires.");
      console.error(error);
      return;
    }
    onUpdated(data as Commande);
    setMode("view");
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");

    if (commande.dossier_storage) {
      const { data: fileList } = await supabase.storage.from(STORAGE_BUCKET).list(commande.dossier_storage);
      if (fileList && fileList.length > 0) {
        const paths = fileList.map((f) => `${commande.dossier_storage}/${f.name}`);
        await supabase.storage.from(STORAGE_BUCKET).remove(paths);
      }
    }

    const { error } = await supabase.from("commandes").delete().eq("id", commande.id);
    setDeleting(false);
    if (error) {
      setDeleteError("Impossible de supprimer cette commande.");
      console.error(error);
      return;
    }
    onDeleted(commande.id);
  };

  const isImage = (name: string) => /\.(jpe?g|png|gif|webp)$/i.test(name);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white/5 border border-white/15 backdrop-blur-2xl rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="font-coco font-extrabold text-2xl text-white">{commande.nom}</h2>
            <p className="text-white/40 text-sm">{commande.entreprise}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {mode === "view" ? (
              <>
                <button
                  onClick={onCreateFacture}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-white/70 hover:border-[#f2cc6a]/50 hover:text-[#f2cc6a] text-xs font-extrabold transition-all"
                >
                  <Receipt size={13} /> Facture
                </button>
                <button
                  onClick={() => setMode("edit")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-white/70 hover:border-[#f2cc6a]/50 hover:text-[#f2cc6a] text-xs font-extrabold transition-all"
                >
                  <Pencil size={13} /> Modifier
                </button>
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-white/70 hover:border-red-400/50 hover:text-red-400 text-xs font-extrabold transition-all"
                >
                  <Trash2 size={13} /> Supprimer
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white text-xs font-extrabold transition-all disabled:opacity-50"
                >
                  <Ban size={13} /> Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#f2cc6a] to-[#f2a500] text-black text-xs font-extrabold shadow-lg disabled:opacity-50 transition-all"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </>
            )}
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors ml-1">
              <X size={22} />
            </button>
          </div>
        </div>

        {saveError && (
          <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
            {saveError}
          </p>
        )}

        {/* CONFIRMATION SUPPRESSION */}
        <AnimatePresence>
          {confirmingDelete && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="flex-1">
                  <p className="text-white text-sm font-extrabold mb-1">Supprimer définitivement cette commande ?</p>
                  <p className="text-white/50 text-xs mb-3">
                    Cette action est irréversible et supprimera aussi les fichiers associés dans le storage.
                  </p>
                  {deleteError && <p className="text-red-400 text-xs mb-3">{deleteError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-extrabold disabled:opacity-50 transition-all"
                    >
                      {deleting ? "Suppression..." : "Confirmer la suppression"}
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(false)}
                      disabled={deleting}
                      className="px-3 py-1.5 rounded-lg border border-white/20 text-white/70 text-xs font-extrabold disabled:opacity-50 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODE EDIT */}
        {mode === "edit" ? (
          <CommandeFormFields form={form} onChange={handleFieldChange} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <InfoRow label="Contact" value={commande.contact} />
              <InfoRow label="Site web" value={commande.site_web || "—"} />
              <InfoRow label="Services" value={commande.services?.join(", ")} />
              <InfoRow label="Activité" value={commande.activite} />
              <InfoRow label="Budget" value={commande.budget} icon={<Wallet size={13} />} />
              <InfoRow
                label="Deadline"
                value={commande.deadline ? new Date(commande.deadline).toLocaleDateString("fr-FR") : "—"}
                icon={<Calendar size={13} />}
              />
              <InfoRow
                label="Satisfaction"
                value={commande.satisfaction != null ? `${commande.satisfaction} / 5` : "—"}
                icon={<Star size={13} />}
              />
              <InfoRow label="Formats" value={commande.formats} />
            </div>

            <DetailBlock label="Objectif principal" text={commande.objectif} />
            <DetailBlock label="Style souhaité" text={commande.style} />
            {commande.elements_eviter && <DetailBlock label="Éléments à éviter" text={commande.elements_eviter} />}

            {commande.couleurs?.length > 0 && (
              <div className="mb-6">
                <p className="text-white/40 text-xs uppercase font-extrabold mb-2">Couleurs souhaitées</p>
                <div className="flex flex-wrap gap-2">
                  {commande.couleurs.map((c, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FICHIERS */}
            <div className="mb-6">
              <p className="text-white/40 text-xs uppercase font-extrabold mb-3">Fichiers joints</p>
              {loadingFiles ? (
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <Loader2 className="animate-spin" size={14} /> Chargement des fichiers...
                </div>
              ) : signedUrls.length === 0 ? (
                <p className="text-white/30 text-sm">Aucun fichier.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {signedUrls.map((f) => (
                    <a
                      key={f.name}
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-[#f2cc6a]/50 transition-all bg-white/5 flex flex-col items-center justify-center aspect-square"
                    >
                      {isImage(f.name) ? (
                        <img src={f.url} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-white/50 p-3">
                          <FileText size={28} />
                          <span className="text-[10px] text-center truncate w-full">{f.name}</span>
                        </div>
                      )}
                      {isImage(f.name) && (
                        <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white/80 truncate bg-black/50 rounded px-1">
                          {f.name}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* MÉTA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <InfoRow label="ID" value={commande.id} />
              <InfoRow label="Créée le" value={new Date(commande.created_at).toLocaleString("fr-FR")} />
              <InfoRow label="Dossier storage" value={commande.dossier_storage || "—"} />
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Création d'une nouvelle commande ──────────────────────────────────────
function CommandeCreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (c: Commande) => void;
}) {
  const [form, setForm] = useState<CommandeFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFieldChange = (field: keyof CommandeFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = formToPayload(form);
    const { data, error } = await supabase.from("commandes").insert([payload]).select().single();
    setSaving(false);
    if (error || !data) {
      setError("Impossible de créer la commande. Vérifie les champs obligatoires.");
      console.error(error);
      return;
    }
    onCreated(data as Commande);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.form
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-white/5 border border-white/15 backdrop-blur-2xl rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-coco font-extrabold text-2xl text-white">Nouvelle commande</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        <CommandeFormFields form={form} onChange={handleFieldChange} />

        {error && (
          <p className="text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-white/15 text-white/70 text-sm font-extrabold disabled:opacity-50 transition-all"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f2cc6a] to-[#f2a500] text-black text-sm font-extrabold shadow-lg disabled:opacity-50 transition-all"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Création..." : "Créer la commande"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

// ─── Petits composants d'affichage ──────────────────────────────────────────
function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-w-0">
      <p className="text-white/35 text-[11px] uppercase font-extrabold flex items-center gap-1.5 mb-1">
        {icon}
        {label}
      </p>
      <p className="text-white text-sm break-all">{value || "—"}</p>
    </div>
  );
}

function DetailBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="mb-6">
      <p className="text-white/40 text-xs uppercase font-extrabold mb-2">{label}</p>
      <p className="text-white/80 text-sm leading-relaxed bg-white/5 border border-white/10 rounded-xl p-4">{text}</p>
    </div>
  );
}