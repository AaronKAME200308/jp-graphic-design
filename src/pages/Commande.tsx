import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Upload, X, MessageCircle, Phone,
  User, Briefcase, Target, Palette, Clock, CheckCircle2
} from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { createClient } from "@supabase/supabase-js";
import { FaWhatsapp } from "react-icons/fa";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? "",
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""
);

const WHATSAPP_NUMBER = "237673846813";

const BUDGET_OPTIONS = [
  "5 000 – 15 000 FCFA",
  "15 000 – 30 000 FCFA",
  "30 000 – 60 000 FCFA",
  "60 000 – 100 000 FCFA",
  "100 000 – 200 000 FCFA",
  "+ 200 000 FCFA",
  "__custom__",
];

const PRESET_COLORS = [
  { label: "Noir", hex: "#000000" },
  { label: "Blanc", hex: "#FFFFFF" },
  { label: "Or", hex: "#F2CC6A" },
  { label: "Rouge", hex: "#E53E3E" },
  { label: "Bleu roi", hex: "#2B6CB0" },
  { label: "Vert", hex: "#276749" },
  { label: "Violet", hex: "#6B46C1" },
  { label: "Orange", hex: "#DD6B20" },
];

// ─── Types ───────────────────────────────────────────────────────────────────
interface FormData {
  nom: string; contact: string; entreprise: string; siteWeb: string;
  services: string[];
  activite: string; objectif: string;
  style: string; elementsEviter: string;
  deadline: string; formats: string; budget: string; budgetCustom: string;
  satisfaction: number;
}

interface PickedColor { hex: string; name: string; }

const initialForm: FormData = {
  nom: "", contact: "", entreprise: "", siteWeb: "",
  services: [],
  activite: "", objectif: "",
  style: "", elementsEviter: "",
  deadline: "", formats: "", budget: "", budgetCustom: "",
  satisfaction: 0,
};

// ─── Glass card ───────────────────────────────────────────────────────────────
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}>
    {children}
  </div>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ num, title, icon: Icon }: { num: number; title: string; icon: React.ElementType }) => (
  <div className="flex items-center gap-4 py-2">
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#f2cc6a] to-[#f2a500] shadow-lg shadow-[#f2cc6a]/30 flex-shrink-0">
      <Icon size={18} className="text-black" />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-3">
        <span className="text-[#f2cc6a]/60 text-xs font-extrabold tracking-widest uppercase">
          0{num}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#f2cc6a]/40 to-transparent" />
      </div>
      <h2 className="font-coco font-extrabold text-xl text-white mt-0.5">{title}</h2>
    </div>
  </div>
);

// ─── Styled label ─────────────────────────────────────────────────────────────
const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block font-extrabold text-white/90 text-sm mb-2">
    {children} {required && <span className="text-[#f2cc6a]">*</span>}
  </label>
);

// ─── Hint ─────────────────────────────────────────────────────────────────────
const Hint = ({ children }: { children: React.ReactNode }) => (
  <p className="text-white/35 text-xs italic mb-3">{children}</p>
);

// ─── Glass input ─────────────────────────────────────────────────────────────
const glassInput = "w-full bg-white/5 border border-white/15 hover:border-[#f2cc6a]/50 focus:border-[#f2cc6a] rounded-xl px-4 py-3 text-white placeholder:text-white/25 outline-none transition-all duration-200 backdrop-blur-sm";

// ─── TextInput ────────────────────────────────────────────────────────────────
const TextInput = ({ label, name, value, onChange, required = false, type = "text", placeholder, hint }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; type?: string; placeholder?: string; hint?: string;
}) => (
  <GlassCard className="p-5">
    <Label required={required}>{label}</Label>
    {hint && <Hint>{hint}</Hint>}
    <input type={type} name={name} value={value} onChange={onChange} required={required}
      placeholder={placeholder ?? "Votre réponse"} className={glassInput} />
  </GlassCard>
);

// ─── TextArea ─────────────────────────────────────────────────────────────────
const TextArea = ({ label, name, value, onChange, required = false, rows = 3, hint }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean; rows?: number; hint?: string;
}) => (
  <GlassCard className="p-5">
    <Label required={required}>{label}</Label>
    {hint && <Hint>{hint}</Hint>}
    <textarea name={name} value={value} onChange={onChange} required={required} rows={rows}
      placeholder="Votre réponse"
      className={`${glassInput} resize-none`} />
  </GlassCard>
);

// ─── RadioGroup ───────────────────────────────────────────────────────────────
const RadioGroup = ({ label, options, selected, onChange, required = false, hint, otherValue, onOtherChange }: {
  label: string; options: string[]; selected: string;
  onChange: (val: string) => void; required?: boolean; hint?: string;
  otherValue?: string; onOtherChange?: (val: string) => void;
}) => (
  <GlassCard className="p-5">
    <Label required={required}>{label}</Label>
    {hint && <Hint>{hint}</Hint>}
    <div className="space-y-2 mt-1">
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <motion.div key={opt} whileHover={{ x: 4 }} onClick={() => onChange(opt)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200
              ${active ? "border-[#f2cc6a]/60 bg-[#f2cc6a]/10" : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"}`}>
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
              ${active ? "border-[#f2cc6a]" : "border-white/30"}`}>
              {active && <span className="w-2 h-2 rounded-full bg-[#f2cc6a] block" />}
            </span>
            <span className={`text-sm transition-colors ${active ? "text-white" : "text-white/60"}`}>{opt}</span>
          </motion.div>
        );
      })}
      {onOtherChange && (
        <motion.div whileHover={{ x: 4 }}
          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200
            ${selected === "__other__" ? "border-[#f2cc6a]/60 bg-[#f2cc6a]/10" : "border-white/8 bg-white/3 hover:border-white/20"}`}>
          <span onClick={() => onChange("__other__")}
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
              ${selected === "__other__" ? "border-[#f2cc6a]" : "border-white/30"}`}>
            {selected === "__other__" && <span className="w-2 h-2 rounded-full bg-[#f2cc6a] block" />}
          </span>
          <span className="text-sm text-white/60 flex-shrink-0" onClick={() => onChange("__other__")}>Autre :</span>
          <input type="text" value={otherValue} onChange={(e) => onOtherChange(e.target.value)}
            onClick={() => onChange("__other__")} placeholder="Précisez..."
            className="flex-1 bg-transparent outline-none text-white/80 placeholder:text-white/25 text-sm" />
        </motion.div>
      )}
    </div>
  </GlassCard>
);

// ─── Color Picker ─────────────────────────────────────────────────────────────
const ColorPicker = ({ label, colors, onChange, required }: {
  label: string;
  colors: PickedColor[];
  onChange: (colors: PickedColor[]) => void;
  required?: boolean;
}) => {
  const [hexInput, setHexInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const nativeRef = useRef<HTMLInputElement>(null);

  const addColor = (hex: string, name: string) => {
    if (!hex) return;
    const normalized = hex.startsWith("#") ? hex : `#${hex}`;
    if (colors.find(c => c.hex.toLowerCase() === normalized.toLowerCase())) return;
    onChange([...colors, { hex: normalized, name: name || normalized }]);
  };

  const removeColor = (idx: number) => onChange(colors.filter((_, i) => i !== idx));

  const handleHexSubmit = () => {
    if (hexInput.length >= 4) {
      addColor(hexInput, nameInput);
      setHexInput("");
      setNameInput("");
    }
  };

  return (
    <GlassCard className="p-5">
      <Label required={required}>{label}</Label>
      <Hint>Cliquez sur une pastille, entrez un code hex ou un nom de couleur</Hint>

      {/* Pastilles prédéfinies */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESET_COLORS.map((c) => {
          const active = colors.find(x => x.hex.toLowerCase() === c.hex.toLowerCase());
          return (
            <motion.button key={c.hex} type="button" title={c.label}
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
              onClick={() => active ? removeColor(colors.findIndex(x => x.hex.toLowerCase() === c.hex.toLowerCase())) : addColor(c.hex, c.label)}
              className={`relative w-9 h-9 rounded-full border-2 transition-all shadow-md ${active ? "border-[#f2cc6a] scale-110" : "border-white/20"}`}
              style={{ backgroundColor: c.hex }}>
              {active && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 size={14} className={c.hex === "#FFFFFF" ? "text-black" : "text-white"} />
                </span>
              )}
            </motion.button>
          );
        })}

        {/* Native color picker */}
        <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          onClick={() => nativeRef.current?.click()}
          className="w-9 h-9 rounded-full border-2 border-dashed border-white/30 hover:border-[#f2cc6a]/60 flex items-center justify-center bg-white/5 text-white/50 text-lg transition-all"
          title="Choisir une couleur personnalisée">
          +
          <input ref={nativeRef} type="color" className="hidden" onChange={(e) => addColor(e.target.value, "")} />
        </motion.button>
      </div>

      {/* Saisie hex + nom */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm font-mono">#</span>
          <input type="text" value={hexInput.replace("#", "")} maxLength={6}
            onChange={(e) => setHexInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleHexSubmit())}
            placeholder="f2cc6a"
            className="w-full bg-white/5 border border-white/15 hover:border-[#f2cc6a]/50 focus:border-[#f2cc6a] rounded-xl pl-8 pr-3 py-2.5 text-white/80 font-mono text-sm outline-none transition-all placeholder:text-white/20" />
        </div>
        <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleHexSubmit())}
          placeholder="Nom (optionnel)"
          className="flex-1 bg-white/5 border border-white/15 hover:border-[#f2cc6a]/50 focus:border-[#f2cc6a] rounded-xl px-3 py-2.5 text-white/80 text-sm outline-none transition-all placeholder:text-white/20" />
        <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleHexSubmit}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f2cc6a] to-[#f2a500] text-black font-coco font-extrabold text-sm shadow-md flex-shrink-0">
          OK
        </motion.button>
      </div>

      {/* Couleurs sélectionnées */}
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {colors.map((c, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/10 border border-white/15">
              <span className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: c.hex }} />
              <span className="text-white/70 text-xs">{c.name}</span>
              <button type="button" onClick={() => removeColor(i)} className="text-white/30 hover:text-[#f2cc6a] transition-colors ml-1">
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

// ─── Budget Select ────────────────────────────────────────────────────────────
const BudgetSelect = ({ value, customValue, onSelect, onCustomChange, required, t }: {
  value: string; customValue: string;
  onSelect: (v: string) => void; onCustomChange: (v: string) => void;
  required?: boolean; t: (fr: string, en: string) => string;
}) => (
  <GlassCard className="p-5">
    <Label required={required}>{t("Votre budget", "Your budget")}</Label>
    <Hint>{t("Sélectionnez une tranche ou entrez un montant personnalisé", "Select a range or enter a custom amount")}</Hint>
    <div className="grid grid-cols-2 gap-2 mb-3">
      {BUDGET_OPTIONS.filter(o => o !== "__custom__").map((opt) => {
        const active = value === opt;
        return (
          <motion.button key={opt} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(opt)}
            className={`px-3 py-2.5 rounded-xl text-xs  font-extrabold border transition-all duration-200 text-left
              ${active ? "border-[#f2cc6a]/70 bg-[#f2cc6a]/15 text-white" : "border-white/10 bg-white/3 text-white/50 hover:border-white/25 hover:text-white/80"}`}>
            {opt}
          </motion.button>
        );
      })}
    </div>
    <motion.button type="button" whileHover={{ scale: 1.01 }}
      onClick={() => onSelect("__custom__")}
      className={`w-full px-3 py-2.5 rounded-xl text-xs font-coco font-extrabold border transition-all duration-200 text-left mb-3
        ${value === "__custom__" ? "border-[#f2cc6a]/70 bg-[#f2cc6a]/15 text-white" : "border-dashed border-white/20 text-white/40 hover:border-white/35 hover:text-white/70"}`}>
      ✎ {t("Autre montant...", "Custom amount...")}
    </motion.button>
    <AnimatePresence>
      {value === "__custom__" && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
          <input type="text" value={customValue} onChange={(e) => onCustomChange(e.target.value)}
            placeholder="ex: 75 000 FCFA" required
            className={glassInput} />
        </motion.div>
      )}
    </AnimatePresence>
  </GlassCard>
);

// ─── File Upload ──────────────────────────────────────────────────────────────
const FileUpload = ({ label, files, onChange, onRemove }: {
  label: string; files: File[]; onChange: (f: File[]) => void; onRemove: (i: number) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const dropped = Array.from(e.dataTransfer.files).slice(0, 5 - files.length);
    onChange([...files, ...dropped]);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    onChange([...files, ...Array.from(e.target.files).slice(0, 5 - files.length)]);
  };

  return (
    <GlassCard className="p-5">
      <Label>{label}</Label>
      <Hint>Jusqu'à 5 fichiers — images ou PDF, 100 MB max.</Hint>
      <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)} onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300
          ${drag ? "border-[#f2cc6a] bg-[#f2cc6a]/10" : "border-white/15 hover:border-[#f2cc6a]/50 hover:bg-white/5"}`}>
        <Upload className={`w-7 h-7 mx-auto mb-2 transition-colors ${drag ? "text-[#f2cc6a]" : "text-white/30"}`} />
        <p className="text-white/40 text-sm">Glisser-déposer ou <span className="text-[#f2cc6a]/80">parcourir</span></p>
        <input ref={inputRef} type="file" multiple accept="image/*,.pdf" onChange={handleChange} className="hidden" />
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <span className="text-[#f2cc6a]/70 text-xs">📎</span>
              <span className="text-white/70 text-sm flex-1 truncate">{f.name}</span>
              <span className="text-white/25 text-xs">{(f.size / 1024).toFixed(0)} KB</span>
              <button type="button" onClick={() => onRemove(i)}
                className="text-white/25 hover:text-red-400 transition-colors"><X size={14} /></button>
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

// ─── Star rating ──────────────────────────────────────────────────────────────
const StarRating = ({ label, value, onChange, required }: {
  label: string; value: number; onChange: (v: number) => void; required?: boolean;
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <GlassCard className="p-5 text-center">
      <Label required={required}>{label}</Label>
      <div className="flex gap-3 justify-center mt-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="flex flex-col items-center gap-1">
            <span className="text-white/25 text-xs">{star}</span>
            <motion.button type="button" whileHover={{ scale: 1.3, rotate: 5 }} whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(star)}
              className={`text-3xl transition-all duration-150 ${(hovered || value) >= star ? "drop-shadow-[0_0_8px_rgba(242,204,106,0.8)]" : ""}`}>
              <span className={(hovered || value) >= star ? "text-[#f2cc6a]" : "text-white/15"}>★</span>
            </motion.button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

// ─── Success Modal ────────────────────────────────────────────────────────────
const SuccessModal = ({ nom, onClose, t, isReturning, previousCount }: {
  nom: string; onClose: () => void; t: (fr: string, en: string) => string;
  isReturning: boolean; previousCount: number;
}) => {
  const waMessage = encodeURIComponent(
    isReturning
      ? `Bonjour JP ! Je viens de passer une nouvelle commande sur votre site. Mon nom : ${nom} (commande n°${previousCount + 1})`
      : `Bonjour JP ! Je viens de passer une commande sur votre site. Mon nom : ${nom}`
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.85, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white/5 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">

        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f2cc6a] to-[#f2a500] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#f2cc6a]/30">
          <span className="text-4xl">{isReturning ? "👑" : "🎉"}</span>
        </motion.div>

        {isReturning && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f2cc6a]/15 border border-[#f2cc6a]/40 mb-4">
            <span className="text-[#f2cc6a] text-xs font-coco font-extrabold">
              {t(`✦ Client fidèle — ${previousCount + 1}ᵉ commande`, `✦ Loyal client — order #${previousCount + 1}`)}
            </span>
          </motion.div>
        )}

        <h2 className="font-coco font-extrabold text-2xl text-white mb-2">
          {isReturning ? t(`Ravi de vous revoir, ${nom} !`, `Welcome back, ${nom}!`) : t("Commande envoyée !", "Order sent!")}
        </h2>
        <p className="text-white/50 text-sm mb-6">
          {isReturning
            ? t(`Votre ${previousCount + 1}ᵉ commande est bien enregistrée. Merci pour votre fidélité !`, `Order #${previousCount + 1} saved. Thank you for your loyalty!`)
            : t(`Merci ${nom} ! Vos informations ont bien été enregistrées.`, `Thank you ${nom}! Your information has been saved.`)}
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 justify-center mb-2">
            <MessageCircle className="w-4 h-4 text-[#f2cc6a]" />
            <span className="font-coco font-extrabold text-[#f2cc6a] text-sm">{t("Étape suivante", "Next step")}</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            {isReturning
              ? t("Contactez JP sur WhatsApp pour confirmer cette nouvelle commande. Il saura que c'est vous !", "Contact JP on WhatsApp to confirm this new order. He'll know it's you!")
              : t("Contactez JP sur WhatsApp pour confirmer votre commande et démarrer votre projet !", "Contact JP on WhatsApp to confirm your order and start your project!")}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-white/35 text-xs">
            <Phone size={11} /><span>+237 673 846 813</span>
          </div>
        </div>

        <motion.a href={waLink} target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#25D366] text-white font-coco font-extrabold text-base shadow-lg shadow-[#25D366]/25 mb-3">
          <FaWhatsapp size={22} />{t("Contacter sur WhatsApp", "Contact on WhatsApp")}
        </motion.a>

        <button onClick={onClose} className="text-white/25 hover:text-white/50 text-sm transition-colors">
          {t("Fermer", "Close")}
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Commande() {
  const { t } = useLang();
  const [form, setForm] = useState<FormData>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [serviceAutre, setServiceAutre] = useState("");
  const [pickedColors, setPickedColors] = useState<PickedColor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);
  const [error, setError] = useState("");

  const set = (field: keyof FormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 0. Détection client récurrent
      const { data: existing } = await supabase
        .from("commandes").select("id").eq("contact", form.contact.trim());
      const returning = !!(existing && existing.length > 0);
      const prevCount = existing ? existing.length : 0;
      setIsReturning(returning);
      setPreviousCount(prevCount);

      // 1. Upload fichiers dans sous-dossier nominatif
      const nomSlug = form.nom.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const folderPath = `commandes/${nomSlug}_${Date.now()}`;
      const fileUrls: string[] = [];

      for (const file of files) {
        const filePath = `${folderPath}/${file.name.replace(/\s+/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("commandes-files").upload(filePath, file);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("commandes-files").getPublicUrl(filePath);
        fileUrls.push(urlData.publicUrl);
      }

      // 2. Résolution service "autre"
      const servicesFinaux = form.services.includes("__other__")
        ? [...form.services.filter(s => s !== "__other__"), serviceAutre].filter(Boolean)
        : form.services;

      // 3. Budget final
      const budgetFinal = form.budget === "__custom__" ? form.budgetCustom : form.budget;

      // 4. Insert
      const { error: insertError } = await supabase.from("commandes").insert([{
        nom: form.nom, contact: form.contact, entreprise: form.entreprise, site_web: form.siteWeb,
        services: servicesFinaux,
        activite: form.activite, objectif: form.objectif,
        style: form.style,
        couleurs: pickedColors.map(c => `${c.name} (${c.hex})`),
        elements_eviter: form.elementsEviter,
        deadline: form.deadline || null,
        formats: form.formats,
        budget: budgetFinal,
        satisfaction: form.satisfaction,
        fichiers: fileUrls,
        dossier_storage: folderPath,
        created_at: new Date().toISOString(),
      }]);

      if (insertError) throw insertError;

      setShowModal(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      setError(t("Une erreur est survenue. Réessayez ou contactez-nous directement.", "An error occurred. Please try again or contact us."));
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
    setPickedColors([]);
  };

  return (
    <>
      <AnimatePresence>
        {showModal && <SuccessModal nom={form.nom} onClose={handleCloseModal} t={t} isReturning={isReturning} previousCount={previousCount} />}
      </AnimatePresence>

      <section className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Header */}
        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl mb-5 shadow-lg">
            <ShoppingBag className="w-5 h-5 text-[#f2cc6a]" />
            <span className="font-coco font-extrabold text-xl">{t("Passer une commande", "Place an order")}</span>
          </div>
          <p className="text-white/40 text-sm">{t("JP Graphic Design · Yaoundé, Cameroun", "JP Graphic Design · Yaoundé, Cameroon")}</p>
          <p className="text-white/25 text-xs mt-1">{t("* Question obligatoire", "* Required field")}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 01 — Informations */}
          <SectionHeader num={1} title={t("Informations personnelles", "Personal information")} icon={User} />
          <p className="text-white/35 text-xs px-1 -mt-2">
            {t("Ces informations nous permettront de vous identifier et de vous recontacter.", "This information will allow us to identify and contact you.")}
          </p>
          <TextInput label={t("Noms / Prénoms", "Full name")} name="nom" value={form.nom} onChange={e => set("nom", e.target.value)} required />
          <TextInput label={t("Téléphone ou Email", "Phone or Email")} name="contact" value={form.contact} onChange={e => set("contact", e.target.value)} required />
          <TextInput label={t("Nom de l'entreprise / projet", "Company / project name")} name="entreprise" value={form.entreprise} onChange={e => set("entreprise", e.target.value)} required />
          <TextInput label={t("Site web (optionnel)", "Website (optional)")} name="siteWeb" value={form.siteWeb} onChange={e => set("siteWeb", e.target.value)} placeholder="https://..." />

          {/* 02 — Besoins */}
          <div className="pt-2"><SectionHeader num={2} title={t("Besoins du client", "Client needs")} icon={Briefcase} /></div>
          <RadioGroup
            label={t("Service souhaité", "Desired service")}
            hint={t("Sélectionnez le service qui vous intéresse", "Select the service that interests you")}
            options={[
              t("Création de logo", "Logo creation"),
              t("Charte graphique complète", "Complete brand identity"),
              t("Identité visuelle pour réseaux sociaux", "Visual identity for social media"),
              t("Design de supports imprimés (flyers, affiches, cartes de visite...)", "Print design (flyers, posters, business cards...)"),
              t("Packaging produit", "Product packaging"),
            ]}
            selected={form.services[0] ?? ""}
            onChange={val => set("services", [val])}
            required otherValue={serviceAutre} onOtherChange={setServiceAutre}
          />

          {/* 03 — Objectifs */}
          <div className="pt-2"><SectionHeader num={3} title={t("Objectifs du projet", "Project objectives")} icon={Target} /></div>
          <TextInput label={t("Définissez votre activité en 3 mots", "Describe your activity in 3 words")} name="activite" value={form.activite} onChange={e => set("activite", e.target.value)} required />
          <TextArea label={t("Objectif principal du projet", "Main project goal")}
            hint={t("ex. améliorer l'image de marque, se différencier, lancer un nouveau produit", "e.g. improve brand image, differentiate, launch a new product")}
            name="objectif" value={form.objectif} onChange={e => set("objectif", e.target.value)} required />

          {/* 04 — Style */}
          <div className="pt-2"><SectionHeader num={4} title={t("Style et inspirations", "Style & inspirations")} icon={Palette} /></div>
          <TextArea label={t("Décrivez le style imaginé", "Describe the style you envision")}
            hint={t("ex. minimaliste, coloré, élégant, audacieux, moderne...", "e.g. minimalist, colorful, elegant, bold, modern...")}
            name="style" value={form.style} onChange={e => set("style", e.target.value)} required />
          <FileUpload
            label={t("Références visuelles (optionnel)", "Visual references (optional)")}
            files={files} onChange={setFiles} onRemove={idx => setFiles(files.filter((_, i) => i !== idx))} />
          <ColorPicker
            label={t("Couleurs souhaitées", "Desired colors")}
            colors={pickedColors} onChange={setPickedColors} required />
          <TextArea label={t("Styles ou éléments à éviter", "Styles or elements to avoid")}
            name="elementsEviter" value={form.elementsEviter} onChange={e => set("elementsEviter", e.target.value)} />

          {/* 05 — Contraintes */}
          <div className="pt-2"><SectionHeader num={5} title={t("Contraintes", "Constraints")} icon={Clock} /></div>

          <GlassCard className="p-5">
            <Label required>{t("Date limite / Deadline", "Deadline")}</Label>
            <input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)}
              required className={`${glassInput} [color-scheme:dark]`} />
          </GlassCard>

          <TextArea label={t("Formats ou contraintes techniques", "Formats or technical constraints")}
            hint="PNG, JPG, PDF, AI, PSD..." name="formats" value={form.formats}
            onChange={e => set("formats", e.target.value)} required />

          <BudgetSelect value={form.budget} customValue={form.budgetCustom}
            onSelect={v => set("budget", v)} onCustomChange={v => set("budgetCustom", v)}
            required t={t} />

          {/* 06 — Validation */}
          <div className="pt-2"><SectionHeader num={6} title={t("Validation & suivi", "Validation & follow-up")} icon={CheckCircle2} /></div>

          <GlassCard className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#f2cc6a]/20 border border-[#f2cc6a]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#f2cc6a] text-xs font-bold">2</span>
              </span>
              <p className="text-white/60 text-sm">
                {t("Allers-retours inclus — 2 séries de modifications. Au-delà, facturation supplémentaire.", "Revisions included — 2 rounds of modifications. Additional charges beyond that.")}
              </p>
            </div>
            <div className="h-px bg-white/8" />
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#f2cc6a]/20 border border-[#f2cc6a]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#f2cc6a] text-xs font-bold">48h</span>
              </span>
              <p className="text-white/60 text-sm">
                {t("Délai de réponse client attendu : 48h après réception des propositions.", "Expected client response time: 48h after receiving proposals.")}
              </p>
            </div>
          </GlassCard>

          <StarRating label={t("Appréciez-vous le service jusqu'ici ?", "How do you rate the service so far?")}
            value={form.satisfaction} onChange={v => set("satisfaction", v)} required />

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-4 rounded-2xl font-coco font-extrabold text-lg bg-gradient-to-r from-[#f2cc6a] to-white/90 text-black/80 shadow-xl shadow-[#f2cc6a]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />{t("Envoi...", "Sending...")}</span>
              : t("Envoyer ma commande", "Send my order")
            }
          </motion.button>

        </form>
      </section>
    </>
  );
}