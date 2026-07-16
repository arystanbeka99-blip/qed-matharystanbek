import React, { useState } from "react";
import { Mail, Lock, User, Loader2, GraduationCap, Sparkles } from "lucide-react";
import { signIn, signUp } from "../lib/supabaseClient";

export default function Auth({ onSuccess }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, fullName);
        setNotice("Проверьте почту — мы отправили ссылку для подтверждения аккаунта.");
      } else {
        await signIn(email, password);
        onSuccess?.();
      }
    } catch (err) {
      setError(translateAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-5 font-sans overflow-hidden bg-[#0F1030]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#312E81] via-[#4F46E5] to-[#A855F7]" />
      <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-[#A855F7]/40 blur-3xl" />
      <div className="absolute top-1/3 -right-20 w-[28rem] h-[28rem] rounded-full bg-[#FF6B4A]/30 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-[#FFA800]/25 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-7">
          <div
            className="w-16 h-16 mx-auto rounded-3xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4"
            style={{ boxShadow: "0 20px 45px -15px rgba(0,0,0,0.5)" }}
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">QED Math Space</h1>
          <p className="text-white/70 text-sm mt-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Пространство для учителей математики
          </p>
        </div>

        <div
          className="rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-7"
          style={{ boxShadow: "0 25px 60px -20px rgba(0,0,0,0.5)" }}
        >
          <div className="flex bg-white/10 rounded-2xl p-1 border border-white/10 mb-6">
            {[
              { id: "signin", label: "Вход" },
              { id: "signup", label: "Регистрация" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id);
                  setError(null);
                  setNotice(null);
                }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  mode === m.id ? "bg-white text-indigo-600 shadow-lg" : "text-white/70 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="relative">
                <User className="w-4 h-4 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Имя и фамилия"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/50 outline-none border border-white/15 focus:border-white/40 focus:bg-white/15 transition-colors"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Электронная почта"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/50 outline-none border border-white/15 focus:border-white/40 focus:bg-white/15 transition-colors"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/50 outline-none border border-white/15 focus:border-white/40 focus:bg-white/15 transition-colors"
              />
            </div>

            {error && (
              <div className="text-xs font-medium text-rose-200 bg-rose-500/20 border border-rose-300/20 rounded-xl px-3 py-2">
                {error}
              </div>
            )}
            {notice && (
              <div className="text-xs font-medium text-emerald-100 bg-emerald-500/20 border border-emerald-300/20 rounded-xl px-3 py-2">
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-indigo-600 font-bold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-60 mt-1"
              style={{ boxShadow: "0 14px 30px -12px rgba(0,0,0,0.4)" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signup" ? "Создать аккаунт" : "Войти"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-white/50 mt-6 leading-relaxed px-4">
          Продолжая, вы соглашаетесь с условиями использования QED Math Space
          и политикой обработки персональных данных.
        </p>
      </div>
    </div>
  );
}

function translateAuthError(message) {
  const map = {
    "Invalid login credentials": "Неверная почта или пароль.",
    "User already registered": "Пользователь с такой почтой уже зарегистрирован.",
    "Email not confirmed": "Подтвердите почту — мы отправили ссылку при регистрации.",
  };
  return map[message] || message;
}
