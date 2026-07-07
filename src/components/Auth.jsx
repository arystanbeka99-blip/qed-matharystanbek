import React, { useState } from "react";
import { Mail, Lock, User, Loader2, GraduationCap } from "lucide-react";
import { signIn, signUp } from "../lib/supabaseClient";

const GRAD_MAIN = "bg-gradient-to-br from-[#4F46E5] to-[#A855F7]";

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
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center px-5 font-sans">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className={`w-14 h-14 mx-auto rounded-3xl ${GRAD_MAIN} flex items-center justify-center shadow-lg mb-4`}
               style={{ boxShadow: "0 12px 28px -8px rgba(79,70,229,0.5)" }}>
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">QED Math Space</h1>
          <p className="text-slate-400 text-sm mt-1">Пространство для учителей математики</p>
        </div>

        {/* Переключатель режима */}
        <div className="flex bg-white rounded-2xl p-1 border border-slate-100 mb-6">
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
                mode === m.id ? `${GRAD_MAIN} text-white shadow-md` : "text-slate-500"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Имя и фамилия"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none shadow-sm border border-slate-100 focus:border-indigo-300 transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="Электронная почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none shadow-sm border border-slate-100 focus:border-indigo-300 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none shadow-sm border border-slate-100 focus:border-indigo-300 transition-colors"
            />
          </div>

          {error && <div className="text-xs font-medium text-rose-500 px-1">{error}</div>}
          {notice && <div className="text-xs font-medium text-emerald-600 px-1">{notice}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${GRAD_MAIN} text-white font-semibold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-60`}
            style={{ boxShadow: "0 14px 30px -12px rgba(79,70,229,0.5)" }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "signup" ? "Создать аккаунт" : "Войти"}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400 mt-6 leading-relaxed">
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
