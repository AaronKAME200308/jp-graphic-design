import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Upload, X, MessageCircle, Phone } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { createClient } from "@supabase/supabase-js";
import { FaWhatsapp } from "react-icons/fa";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? "",
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""
);

const WHATSAPP_NUMBER = "237673846813";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface FormData {
  nom: string; contact: string; entreprise: string; siteWeb: string;
  services: string[];
  activite: string; objectif: string;
  style: string; couleurs: string[]; elementsEviter: string;
  deadline: string; formats: string; budget: string;
  satisfaction: number;
}

const initialForm: FormData = {
  nom: "", contact: "", entreprise: "", siteWeb: "",
  services: [],
  activite: "", objectif: "",
  style: "", couleurs: [], elementsEviter: "",
  deadline: "", formats: "", budget: "",
  satisfaction: 0,
};

// ─── Sub-components ──────────────────────────────────────────────────────────────
const Section = ({ title }: { title: string }) => (
  <div className="w-full px-6 py-4 rounded-2xl bg-black/60 border border-[#f2cc6a]/40">
    <h2 className="font-coco font-extrabold text-lg underline underline-offset-4 decoration-[#f2cc6a] text-white italic">
      {title}
    </h2>
  </div>
);

const FieldCard = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full px-6 py-5 rounded-2xl bg-black/40 border border-[#f2cc6a]/20 backdrop-blur-sm">
    {children}
  </div>
);

const TextInput = ({ label, name, value, onChange, required = false, type = "text", placeholder }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; type?: string; placeholder?: string;
}) => (
  <FieldCard>
    <label className="block font-coco font-extrabold text-white mb-3">
      {label} {required && <span className="text-[#f2cc6a]">*</span>}
    </label>
    <input
      type={type} name={name} value={value} onChange={onChange} required={required}
      placeholder={placeholder ?? "Votre réponse"}
      className="w-full bg-transparent border-b border-[#f2cc6a]/50 focus:border-[#f2cc6a] outline-none text-white/80 pb-1 placeholder:text-white/30 transition-colors duration-200"
    />
  </FieldCard>
);

const TextArea = ({ label, name, value, onChange, required = false, rows = 3, hint }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean; rows?: number; hint?: string;
}) => (
  <FieldCard>
    <label className="block font-coco font-extrabold text-white mb-1">
      {label} {required && <span className="text-[#f2cc6a]">*</span>}
    </label>
    {hint && <p className="text-white/40 text-sm mb-3 italic">{hint}</p>}
    <textarea
      name={name} value={value} onChange={onChange} required={required} rows={rows}
      placeholder="Votre réponse"
      className="w-full bg-transparent border-b border-[#f2cc6a]/50 focus:border-[#f2cc6a] outline-none text-white/80 pb-1 placeholder:text-white/30 transition-colors duration-200 resize-none"
    />
  </FieldCard>
);

const CheckboxGroup = ({ label, options, selected, onChange, required = false, otherValue, onOtherChange, otherLabel }: {
  label: string; options: string[]; selected: string[];
  onChange: (val: string) => void; required?: boolean;
  otherValue?: string; onOtherChange?: (val: string) => void; otherLabel?: string;
}) => (
  <FieldCard>
    <label className="block font-coco font-extrabold text-white mb-4">
      {label} {required && <span className="text-[#f2cc6a]">*</span>}
    </label>
    <div className="space-y-3">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
          <span onClick={() => onChange(opt)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 cursor-pointer
              ${selected.includes(opt) ? "border-[#f2cc6a] bg-gradient-to-br from-[#f2cc6a] to-[#f2a500]" : "border-white/30 group-hover:border-[#f2cc6a]/60"}`}>
            {selected.includes(opt) && <span className="text-black text-xs font-bold">✓</span>}
          </span>
          <span className="text-white/80 group-hover:text-white transition-colors">{opt}</span>
        </label>
      ))}
      {otherLabel && onOtherChange && (
        <label className="flex items-center gap-3 cursor-pointer group">
          <span onClick={() => onChange("__other__")}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 cursor-pointer
              ${selected.includes("__other__") ? "border-[#f2cc6a] bg-gradient-to-br from-[#f2cc6a] to-[#f2a500]" : "border-white/30 group-hover:border-[#f2cc6a]/60"}`}>
            {selected.includes("__other__") && <span className="text-black text-xs font-bold">✓</span>}
          </span>
          <span className="text-white/80">{otherLabel} :</span>
          <input type="text" value={otherValue} onChange={(e) => onOtherChange(e.target.value)}
            onClick={() => !selected.includes("__other__") && onChange("__other__")}
            placeholder="Précisez..."
            className="flex-1 bg-transparent border-b border-[#f2cc6a]/40 focus:border-[#f2cc6a] outline-none text-white/80 pb-0.5 placeholder:text-white/30 text-sm transition-colors" />
        </label>
      )}
    </div>
  </FieldCard>
);

const RadioGroup = ({ label, options, selected, onChange, required = false, hint, otherValue, onOtherChange }: {
  label: string; options: string[]; selected: string;
  onChange: (val: string) => void; required?: boolean; hint?: string;
  otherValue?: string; onOtherChange?: (val: string) => void;
}) => (
  <FieldCard>
    <label className="block font-coco font-extrabold text-white mb-1">
      {label} {required && <span className="text-[#f2cc6a]">*</span>}
    </label>
    {hint && <p className="text-white/40 text-sm mb-3 italic">{hint}</p>}
    <div className="space-y-3 mt-4">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
          <span onClick={() => onChange(opt)}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 cursor-pointer
              ${selected === opt ? "border-[#f2cc6a]" : "border-white/30 group-hover:border-[#f2cc6a]/60"}`}>
            {selected === opt && <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#f2cc6a] to-[#f2a500] block" />}
          </span>
          <span className="text-white/80 group-hover:text-white transition-colors">{opt}</span>
        </label>
      ))}
      {onOtherChange && (
        <label className="flex items-center gap-3 cursor-pointer group">
          <span onClick={() => onChange("__other__")}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 cursor-pointer
              ${selected === "__other__" ? "border-[#f2cc6a]" : "border-white/30 group-hover:border-[#f2cc6a]/60"}`}>
            {selected === "__other__" && <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#f2cc6a] to-[#f2a500] block" />}
          </span>
          <span className="text-white/80">Autre :</span>
          <input type="text" value={otherValue} onChange={(e) => onOtherChange(e.target.value)}
            onClick={() => onChange("__other__")} placeholder="Précisez..."
            className="flex-1 bg-transparent border-b border-[#f2cc6a]/40 focus:border-[#f2cc6a] outline-none text-white/80 pb-0.5 placeholder:text-white/30 text-sm transition-colors" />
        </label>
      )}
    </div>
  </FieldCard>
);

const StarRating = ({ label, value, onChange, required = false }: {
  label: string; value: number; onChange: (val: number) => void; required?: boolean;
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <FieldCard>
      <label className="block font-coco font-extrabold text-white mb-4">
        {label} {required && <span className="text-[#f2cc6a]">*</span>}
      </label>
      <div className="flex gap-4 items-end justify-center mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="flex flex-col items-center gap-1">
            <span className="text-white/40 text-sm">{star}</span>
            <motion.button type="button" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(star)} className="text-3xl transition-all duration-200">
              <span className={`${(hovered || value) >= star ? "text-[#f2cc6a]" : "text-white/20"}`}>★</span>
            </motion.button>
          </div>
        ))}
      </div>
    </FieldCard>
  );
};

const FileUpload = ({ label, files, onChange, onRemove }: {
  label: string; files: File[]; onChange: (files: File[]) => void; onRemove: (idx: number) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).slice(0, 5 - files.length);
    onChange([...files, ...dropped]);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const added = Array.from(e.target.files).slice(0, 5 - files.length);
    onChange([...files, ...added]);
  };
  return (
    <FieldCard>
      <label className="block font-coco font-extrabold text-white mb-1">{label}</label>
      <p className="text-white/40 text-sm mb-4 italic">Importez jusqu'à 5 fichiers. 100 MB max. par fichier.</p>
      <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-[#f2cc6a]/40 hover:border-[#f2cc6a] rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:bg-[#f2cc6a]/5">
        <Upload className="w-8 h-8 text-[#f2cc6a]/60 mx-auto mb-2" />
        <p className="text-white/60 text-sm">Glisser-déposer ou cliquer pour ajouter un fichier</p>
        <input ref={inputRef} type="file" multiple accept="image/*,.pdf" onChange={handleChange} className="hidden" />
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#f2cc6a]/10 rounded-lg px-3 py-2">
              <span className="text-white/70 text-sm flex-1 truncate">{f.name}</span>
              <button type="button" onClick={() => onRemove(i)} className="text-white/40 hover:text-[#f2cc6a] transition-colors">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </FieldCard>
  );
};

// ─── WhatsApp success modal ──────────────────────────────────────────────────────
const SuccessModal = ({ nom, onClose, t }: { nom: string; onClose: () => void; t: (fr: string, en: string) => string }) => {
  const waMessage = encodeURIComponent(
    `Bonjour JP ! Je viens de passer une commande sur votre site. Mon nom : ${nom}`
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-black via-black/95 to-black/90 border border-[#f2cc6a]/40 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
      >
        {/* Icône animée */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f2cc6a] to-[#f2a500] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#f2cc6a]/30"
        >
          <span className="text-4xl">🎉</span>
        </motion.div>

        <h2 className="font-coco font-extrabold text-2xl text-white mb-2">
          {t("Commande envoyée !", "Order sent!")}
        </h2>
        <p className="text-white/60 text-sm mb-6">
          {t(
            `Merci ${nom} ! Vos informations et fichiers ont bien été enregistrés.`,
            `Thank you ${nom}! Your information and files have been saved.`
          )}
        </p>

        {/* Encadré WhatsApp */}
        <div className="bg-[#f2cc6a]/10 border border-[#f2cc6a]/30 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 justify-center mb-2">
            <MessageCircle className="w-4 h-4 text-[#f2cc6a]" />
            <span className="font-coco font-extrabold text-[#f2cc6a] text-sm">
              {t("Étape suivante", "Next step")}
            </span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            {t(
              "Contactez JP Graphic Design sur WhatsApp pour confirmer votre commande et démarrer votre projet !",
              "Contact JP Graphic Design on WhatsApp to confirm your order and start your project!"
            )}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-white/50 text-xs">
            <Phone size={12} />
            <span>+237 673 846 813</span>
          </div>
        </div>

        {/* Bouton WhatsApp */}
        <motion.a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#25D366] text-white font-coco font-extrabold text-base shadow-lg shadow-[#25D366]/30 mb-3 transition-all"
        >
          <FaWhatsapp size={22} />
          {t("Contacter sur WhatsApp", "Contact on WhatsApp")}
        </motion.a>

        <button
          onClick={onClose}
          className="text-white/30 hover:text-white/60 text-sm transition-colors"
        >
          {t("Fermer", "Close")}
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── Main page ───────────────────────────────────────────────────────────────────
export default function Commande() {
  const { t } = useLang();
  const [form, setForm] = useState<FormData>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [serviceAutre, setServiceAutre] = useState("");
  const [couleurAutreVal, setCouleurAutreVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof FormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleList = (field: "services" | "couleurs", val: string) => {
    const list = form[field] as string[];
    set(field, list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Slug du nom : "Jean Pascal Mouele" → "jean-pascal-mouele"
      const nomSlug = form.nom.trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");

      const timestamp = Date.now();
      const folderPath = `commandes/${nomSlug}_${timestamp}`;

      // 1. Upload des fichiers dans le sous-dossier nominatif
      const fileUrls: string[] = [];
      for (const file of files) {
        const safeFileName = file.name.replace(/\s+/g, "_");
        const filePath = `${folderPath}/${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("commandes-files")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("commandes-files")
          .getPublicUrl(filePath);

        fileUrls.push(urlData.publicUrl);
      }

      // 2. Résolution des champs "Autre"
      const servicesFinaux = form.services.includes("__other__")
        ? [...form.services.filter((s) => s !== "__other__"), serviceAutre].filter(Boolean)
        : form.services;

      const couleursFinales = form.couleurs.includes("__other__")
        ? [...form.couleurs.filter((c) => c !== "__other__"), couleurAutreVal].filter(Boolean)
        : form.couleurs;

      // 3. Insertion en base
      const { error: insertError } = await supabase.from("commandes").insert([{
        nom: form.nom,
        contact: form.contact,
        entreprise: form.entreprise,
        site_web: form.siteWeb,
        services: servicesFinaux,
        activite: form.activite,
        objectif: form.objectif,
        style: form.style,
        couleurs: couleursFinales,
        elements_eviter: form.elementsEviter,
        deadline: form.deadline || null,
        formats: form.formats,
        budget: form.budget,
        satisfaction: form.satisfaction,
        fichiers: fileUrls,
        dossier_storage: folderPath,
        created_at: new Date().toISOString(),
      }]);

      if (insertError) throw insertError;

      // 4. Afficher la modal WhatsApp
      setShowModal(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err: unknown) {
      setError(t(
        "Une erreur est survenue. Veuillez réessayer ou nous contacter directement.",
        "An error occurred. Please try again or contact us directly."
      ));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setFiles([]);
    setServiceAutre("");
    setCouleurAutreVal("");
  };

  return (
    <>
      {/* Modal WhatsApp */}
      <AnimatePresence>
        {showModal && (
          <SuccessModal nom={form.nom} onClose={handleCloseModal} t={t} />
        )}
      </AnimatePresence>

      <section className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* TITRE */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 border border-[#f2cc6a]/60 rounded-full bg-black/60 mb-4">
            <ShoppingBag className="w-5 h-5 text-[#f2cc6a]" />
            <span className="font-coco font-extrabold text-xl">
              {t("Passer une commande", "Place an order")}
            </span>
          </div>
          <p className="text-white/50 text-sm">
            {t("Bienvenue chez JP Graphic Design — Yaoundé, Cameroun", "Welcome to JP Graphic Design — Yaoundé, Cameroon")}
          </p>
          <p className="text-white/40 text-xs mt-1">
            {t("* Indique une question obligatoire", "* Indicates a required question")}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* INFORMATIONS PERSONNELLES */}
          <Section title={t("INFORMATIONS PERSONNELS", "PERSONAL INFORMATION")} />
          <p className="text-white/40 text-sm px-1">
            {t(
              "Merci de bien vouloir renseigner vos informations afin que nous puissions traiter votre commande avec le plus grand soin.",
              "Please fill in your information so we can process your order with the utmost care."
            )}
          </p>
          <TextInput label={t("Votre noms/prénoms", "Your full name")} name="nom" value={form.nom} onChange={(e) => set("nom", e.target.value)} required />
          <TextInput label={t("Votre adresse téléphonique/email", "Your phone/email")} name="contact" value={form.contact} onChange={(e) => set("contact", e.target.value)} required />
          <TextInput label={t("Nom de l'entreprise/projet", "Company/project name")} name="entreprise" value={form.entreprise} onChange={(e) => set("entreprise", e.target.value)} required />
          <TextInput label={t("Votre site web", "Your website")} name="siteWeb" value={form.siteWeb} onChange={(e) => set("siteWeb", e.target.value)} placeholder="https://..." />

          {/* BESOINS DU CLIENT */}
          <Section title={t("BESOINS DU CLIENT", "CLIENT NEEDS")} />
          <RadioGroup
            label={t("Services souhaités", "Desired services")}
            hint={t("(Cochez les services qui vous intéressent)", "(Check the services that interest you)")}
            options={[
              t("Création de logo", "Logo creation"),
              t("Charte graphique complète (couleurs, typographies, règles d'utilisation)", "Complete brand identity (colors, typography, usage guidelines)"),
              t("Identité visuelle pour réseaux sociaux (bannières, templates, posts)", "Visual identity for social media (banners, templates, posts)"),
              t("Design de supports imprimés (cartes de visite, flyers, brochures, affiches)", "Print design (business cards, flyers, brochures, posters)"),
              t("Packaging produit", "Product packaging"),
            ]}
            selected={form.services[0] ?? ""}
            onChange={(val) => set("services", [val])}
            required
            otherValue={serviceAutre}
            onOtherChange={setServiceAutre}
          />

          {/* OBJECTIFS DU PROJET */}
          <Section title={t("OBJECTIFS DU PROJET", "PROJECT OBJECTIVES")} />
          <TextInput
            label={t("Décrirez ou définissez votre activité en 03 mots", "Describe your activity in 3 words")}
            name="activite" value={form.activite} onChange={(e) => set("activite", e.target.value)} required
          />
          <TextArea
            label={t("Quel est l'objectif principal de ce projet ?", "What is the main goal of this project?")}
            hint={t("(ex. améliorer l'image de marque, se différencier, lancer un nouveau produit)", "(e.g. improve brand image, differentiate, launch a new product)")}
            name="objectif" value={form.objectif} onChange={(e) => set("objectif", e.target.value)} required
          />

          {/* STYLE ET INSPIRATIONS */}
          <Section title={t("STYLE ET INSPIRATIONS", "STYLE & INSPIRATIONS")} />
          <TextArea
            label={t("Décrivez le style que vous imaginez :", "Describe the style you envision:")}
            hint={t("(ex. minimaliste, coloré, élégant, audacieux)", "(e.g. minimalist, colorful, elegant, bold)")}
            name="style" value={form.style} onChange={(e) => set("style", e.target.value)} required
          />
          <FileUpload
            label={t("Avez-vous des références ou exemples visuels que vous aimez ? (joindre images ou liens)", "Do you have visual references or examples you like? (attach images or links)")}
            files={files} onChange={setFiles} onRemove={(idx) => setFiles(files.filter((_, i) => i !== idx))}
          />
          <CheckboxGroup
            label={t("Couleurs", "Colors")}
            options={[
              t("Je fais confiance à votre expertise", "I trust your expertise"),
              t("Bleu", "Blue"), t("Rouge", "Red"), t("Vert", "Green"),
            ]}
            selected={form.couleurs} onChange={(val) => toggleList("couleurs", val)} required
            otherLabel={t("Autre", "Other")} otherValue={couleurAutreVal} onOtherChange={setCouleurAutreVal}
          />
          <TextArea
            label={t("Y a-t-il des styles ou éléments à éviter ?", "Are there styles or elements to avoid?")}
            name="elementsEviter" value={form.elementsEviter} onChange={(e) => set("elementsEviter", e.target.value)}
          />

          {/* CONTRAINTES */}
          <Section title={t("CONTRAINTES", "CONSTRAINTS")} />
          <FieldCard>
            <label className="block font-coco font-extrabold text-white mb-3">
              {t("Vos deadlines/délais", "Your deadline")} <span className="text-[#f2cc6a]">*</span>
            </label>
            <p className="text-white/40 text-sm mb-2 italic">{t("Date", "Date")}</p>
            <input type="date" name="deadline" value={form.deadline} onChange={(e) => set("deadline", e.target.value)}
              required className="bg-transparent border-b border-[#f2cc6a]/50 focus:border-[#f2cc6a] outline-none text-white/80 pb-1 transition-colors duration-200 [color-scheme:dark]" />
          </FieldCard>
          <TextArea
            label={t("Formats ou contraintes techniques spécifiques", "Specific formats or technical constraints")}
            hint={t("(ex: PNG, JPG, PDF etc.)", "(e.g. PNG, JPG, PDF etc.)")}
            name="formats" value={form.formats} onChange={(e) => set("formats", e.target.value)} required
          />
          <TextInput
            label={t("Votre budget", "Your budget")} name="budget" value={form.budget}
            onChange={(e) => set("budget", e.target.value)} required placeholder="ex: 50 000 FCFA"
          />

          {/* VALIDATION ET SUIVI */}
          <Section title={t("NB: VALIDATION ET SUIVI", "NB: VALIDATION & FOLLOW-UP")} />
          <FieldCard>
            <p className="text-white/70">
              {t(
                "Nombre d'allers-retours inclus (2 séries de modifications comprises, au-delà facturation supplémentaire)",
                "Number of revisions included (2 rounds of modifications, additional charges beyond that)"
              )}
            </p>
          </FieldCard>
          <FieldCard>
            <p className="text-white/70">
              {t(
                "Délai de réponse attendu du client (48h après réception des propositions)",
                "Expected client response time (48h after receiving proposals)"
              )}
            </p>
          </FieldCard>
          <StarRating
            label={t("Appréciez vous le service, jusqu'ici ?", "How do you rate the service so far?")}
            value={form.satisfaction} onChange={(val) => set("satisfaction", val)} required
          />

          {/* ERREUR */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-red-400 text-sm px-2">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUBMIT */}
          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-4 rounded-2xl font-coco font-extrabold text-lg bg-gradient-to-r from-[#f2cc6a] to-white/90 text-black/80 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300">
            {loading ? t("Envoi en cours...", "Sending...") : t("Envoyer ma commande", "Send my order")}
          </motion.button>

        </form>
      </section>
    </>
  );
}