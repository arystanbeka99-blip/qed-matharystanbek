import React, { useEffect, useState } from "react";
import {
  ArrowLeft, Mail, Calendar, Crown, School, User, Edit3,
  FileText, Gamepad2, PlayCircle, ShieldCheck, LogOut, Check, Globe,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { LANGUAGES } from "../lib/i18n";

const GRAD_MAIN = "bg-gradient-to-br from-[#4F46E5] to-[#A855F7]";
const GRAD_EXAM = "bg-gradient-to-br from-[#FF6B4A] to-[#FFA800]";

/**
 * Личная комната учителя: профиль, статус подписки, язык интерфейса,
 * быстрая статистика активности. Данные профиля читаются из таблицы
 * profiles (создаётся автоматически триггером при регистрации).
 */
export default function ProfilePage({ onBack, onOpenPaywall, isPro, plan, periodEnd, userEmail, t, language, setLanguage }) {
  const [profile, setProfile] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [editingSchool, setEditingSchool] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data?.user?.id;
      if (!uid) return;
      const { data: row } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (!cancelled && row) {
        setProfile(row);
        setNameInput(row.full_name || "");
        setSchoolInput(row.school || "");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveField = async (field, value, closeEditor) => {
    setSaving(true);
    const { data } = await supabase.auth.getUser();
    const uid = data?.user?.id;
    if (uid) {
      await supabase.from("profiles").update({ [field]: value }).eq("id", uid);
      setProfile((p) => ({ ...p, [field]: value }));
    }
    setSaving(false);
    closeEditor(false);
  };

  const initials = (profile?.full_name || userEmail || "У")
    .trim()
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(language === "kk" ? "kk-KZ" : "ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const tariffLabel = plan === "year" ? t("tariff_year") : plan === "half_year" ? t("tariff_half_year") : t("tariff_month");

  return (
    <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 pb-20 sm:pb-0">
      <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </button>

      {/* Карточка профиля */}
      <div
        className={`relative overflow-hidden rounded-3xl ${GRAD_MAIN} p-6 sm:p-8`}
        style={{ boxShadow: "0 20px 45px -18px rgba(79,70,229,0.55)" }}
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute right-10 bottom-0 w-24 h-24 rounded-full bg-white/10" />

        <div className="relative z-10 flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveField("full_name", nameInput, setEditingName)}
                  className="bg-white/20 border border-white/30 rounded-xl px-3 py-1.5 text-white placeholder-white/60 text-lg font-bold outline-none w-full max-w-[220px]"
                  placeholder={t("auth_fullname")}
                />
                <button
                  onClick={() => saveField("full_name", nameInput, setEditingName)}
                  disabled={saving}
                  className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0"
                >
                  <Check className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="flex items-center gap-2 text-white text-lg sm:text-xl font-bold tracking-tight truncate"
              >
                {profile?.full_name || t("app_tagline")}
                <Edit3 className="w-3.5 h-3.5 text-white/60 shrink-0" />
              </button>
            )}
            <div className="flex items-center gap-1.5 text-white/80 text-xs sm:text-sm mt-1 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" /> {userEmail}
            </div>
            {isPro && (
              <div className={`inline-flex items-center gap-1 mt-2.5 ${GRAD_EXAM} text-white text-[11px] font-bold rounded-lg px-2.5 py-1`}>
                <Crown className="w-3 h-3" /> {t("pro_badge")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Язык интерфейса — закреплён с момента регистрации, изменить нельзя.
          Это защищает от бесплатного доступа к материалам другого языка:
          переключение языка внутри профиля также переключало бы набор
          материалов, доступных по подписке. */}
      <div className="rounded-2xl bg-white border border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <Globe className="w-4.5 h-4.5 text-sky-500" />
          </div>
          <div className="text-sm font-bold text-slate-800">{t("profile_language")}</div>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 rounded-lg px-3 py-1.5">
          {LANGUAGES.find((l) => l.code === language)?.label}
        </span>
      </div>
      <p className="text-[11px] text-slate-400 -mt-3 px-1">{t("profile_language_locked_note")}</p>

      {/* Быстрые сведения */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-white border border-slate-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Calendar className="w-4.5 h-4.5 text-indigo-500" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-400 font-medium">{t("profile_joined")}</div>
            <div className="text-sm font-bold text-slate-800 truncate">{joinedDate}</div>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <School className="w-4.5 h-4.5 text-purple-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-slate-400 font-medium">{t("profile_school")}</div>
            {editingSchool ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <input
                  autoFocus
                  value={schoolInput}
                  onChange={(e) => setSchoolInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveField("school", schoolInput, setEditingSchool)}
                  placeholder={t("profile_school_placeholder")}
                  className="text-sm font-bold text-slate-800 outline-none border-b border-purple-300 w-full min-w-0"
                />
                <button
                  onClick={() => saveField("school", schoolInput, setEditingSchool)}
                  disabled={saving}
                  className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center shrink-0"
                >
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingSchool(true)}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-800 truncate"
              >
                {profile?.school || t("profile_school_not_set")}
                <Edit3 className="w-3 h-3 text-slate-300 shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Подписка */}
      <div className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm">{t("profile_subscription")}</h3>
          {isPro ? (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-lg px-2.5 py-1">{t("profile_active")}</span>
          ) : (
            <span className="text-[11px] font-bold text-slate-400 bg-slate-50 rounded-lg px-2.5 py-1">{t("profile_not_active")}</span>
          )}
        </div>

        {isPro ? (
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${GRAD_EXAM} flex items-center justify-center shrink-0`}>
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm">
                {t("profile_tariff")} «{tariffLabel}»
              </div>
              {periodEnd && (
                <div className="text-xs text-slate-400 mt-0.5">
                  {t("profile_valid_until")} {new Date(periodEnd).toLocaleDateString(language === "kk" ? "kk-KZ" : "ru-RU")}
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenPaywall}
            className={`w-full rounded-2xl ${GRAD_MAIN} text-white font-semibold text-sm py-3.5 flex items-center justify-center gap-2`}
          >
            <Crown className="w-4 h-4" /> {t("pro_badge")}
          </button>
        )}
      </div>

      {/* Быстрые ссылки на разделы контента */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { labelKey: "type_presentations", icon: PlayCircle, tint: "from-indigo-500 to-purple-500" },
          { labelKey: "type_games", icon: Gamepad2, tint: "from-fuchsia-500 to-pink-500" },
          { labelKey: "type_ksp", icon: FileText, tint: "from-violet-500 to-purple-500" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.labelKey} className="rounded-2xl bg-white border border-slate-100 p-4 text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${item.tint} flex items-center justify-center mb-2`}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="text-xs font-semibold text-slate-600">{t(item.labelKey)}</div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-1.5 text-slate-300 text-[11px]">
        <ShieldCheck className="w-3.5 h-3.5" /> {t("profile_privacy_note")} ·{" "}
        <a
          href={language === "kk" ? "/privacy-kk.html" : "/privacy.html"}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-slate-400 hover:text-slate-600"
        >
          {t("privacy_policy_link")}
        </a>
      </div>

      <button
        onClick={() => supabase.auth.signOut()}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-100 text-rose-500 font-semibold text-sm py-3.5 hover:bg-rose-50 transition-colors"
      >
        <LogOut className="w-4 h-4" /> {t("sign_out")}
      </button>
    </div>
  );
}
