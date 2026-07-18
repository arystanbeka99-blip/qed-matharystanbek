import React from "react";
import { GraduationCap, Check } from "lucide-react";
import { LANGUAGES, TRANSLATIONS } from "../lib/i18n";

/**
 * Показывается один раз, до экрана входа/регистрации — если язык ещё
 * не выбран (нет записи в localStorage). После выбора Auth.jsx и весь
 * остальной сайт сразу открываются на этом языке.
 */
export default function LanguageSelect({ onSelect }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-5 font-sans overflow-hidden bg-[#0F1030]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#312E81] via-[#4F46E5] to-[#A855F7]" />
      <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-[#A855F7]/40 blur-3xl" />
      <div className="absolute top-1/3 -right-20 w-[28rem] h-[28rem] rounded-full bg-[#FF6B4A]/30 blur-3xl" />

      <div className="relative w-full max-w-sm text-center">
        <div
          className="w-16 h-16 mx-auto rounded-3xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-5"
          style={{ boxShadow: "0 20px 45px -15px rgba(0,0,0,0.5)" }}
        >
          <GraduationCap className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-white text-2xl font-bold tracking-tight">
          {TRANSLATIONS.ru.choose_language_title} / {TRANSLATIONS.kk.choose_language_title}
        </h1>

        <div className="mt-7 space-y-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className="w-full flex items-center justify-between rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-4 hover:bg-white/20 transition-colors"
            >
              <span className="text-white font-bold text-base">{lang.label}</span>
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                <Check className="w-4 h-4 text-white/70" />
              </div>
            </button>
          ))}
        </div>

        <p className="text-white/50 text-xs mt-8">
          Можно изменить позже в личном кабинете · Кейін профильде өзгертуге болады
        </p>
      </div>
    </div>
  );
}
