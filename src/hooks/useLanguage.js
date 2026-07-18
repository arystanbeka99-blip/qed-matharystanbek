import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { TRANSLATIONS } from "../lib/i18n";

const STORAGE_KEY = "qed-language";

/**
 * Управляет языком интерфейса (ru / kk).
 *
 * До входа в аккаунт — выбор хранится в localStorage браузера (чтобы
 * экран регистрации сразу открылся на нужном языке).
 * После входа — язык подгружается из profiles.language и там же
 * сохраняется при смене, чтобы личный кабинет всегда открывался на
 * языке, который выбрал учитель, с любого устройства.
 */
export function useLanguage() {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || null
  );

  // Подтягиваем язык из профиля, если учитель уже вошёл в аккаунт
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data?.user?.id;
      if (!uid) return;
      const { data: row } = await supabase.from("profiles").select("language").eq("id", uid).maybeSingle();
      if (!cancelled && row?.language) {
        setLanguageState(row.language);
        localStorage.setItem(STORAGE_KEY, row.language);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (lang) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);

    // Если учитель уже вошёл — сразу сохраняем выбор в его профиль
    const { data } = await supabase.auth.getUser();
    const uid = data?.user?.id;
    if (uid) {
      await supabase.from("profiles").update({ language: lang }).eq("id", uid);
    }
  }, []);

  const t = useCallback(
    (key) => {
      const dict = TRANSLATIONS[language || "ru"];
      return dict?.[key] ?? TRANSLATIONS.ru[key] ?? key;
    },
    [language]
  );

  return { language: language || "ru", languageChosen: Boolean(language), setLanguage, t };
}
