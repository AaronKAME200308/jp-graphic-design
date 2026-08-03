import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (session) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError("Identifiants incorrects.");
      return;
    }
    navigate("/admin");
  };

  const inputCls =
    "w-full bg-white/5 border border-white/15 focus:border-[#f2cc6a] rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-all placeholder:text-white/25";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-portfolio-bg px-4">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/5 border border-white/15 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-6">
          <Lock className="text-[#f2cc6a]" size={22} />
          <h1 className="font-coco font-extrabold text-xl text-white">Connexion Admin</h1>
        </div>

        <div className="space-y-3 mb-4">
          <input
            type="email"
            required
            placeholder="Email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Mot de passe"
            className={inputCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f2cc6a] to-[#f2a500] text-black text-sm font-extrabold shadow-lg disabled:opacity-50 transition-all"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </motion.form>
    </div>
  );
}