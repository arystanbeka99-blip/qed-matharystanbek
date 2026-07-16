import React, { useEffect, useState } from "react";
import { X, ExternalLink, Loader2, AlertTriangle } from "lucide-react";

/**
 * Показывает произвольный файл (HTML или PDF) во встроенном iframe.
 * Используется для:
 *  - собственных HTML-игр
 *  - HTML-рефлексий
 *  - рабочих листов (PDF или HTML)
 *
 * Для .html/.htm файлов мы САМИ скачиваем текст и вставляем его через
 * srcDoc, а не просто указываем src=ссылка. Это защищает от ситуации,
 * когда Supabase Storage отдаёт файл с неправильным заголовком
 * Content-Type (из-за чего браузер показывал "сырой" код вместо
 * отрисованной страницы) — srcDoc всегда рендерится как HTML,
 * независимо от того, что говорит сервер.
 */
export default function GenericFileViewer({ open, onClose, title, fileUrl }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [htmlContent, setHtmlContent] = useState(null);

  const isHtmlFile = (fileUrl || "").toLowerCase().split("?")[0].match(/\.html?$/);

  useEffect(() => {
    if (!open || !fileUrl) return;
    setLoading(true);
    setError(null);
    setHtmlContent(null);

    if (isHtmlFile) {
      // Добавляем метку времени, чтобы обойти возможное кэширование
      // сервером/браузером старой версии файла
      const bustedUrl = fileUrl + (fileUrl.includes("?") ? "&" : "?") + "t=" + Date.now();
      fetch(bustedUrl)
        .then((res) => {
          if (!res.ok) throw new Error("Файл не найден на сервере");
          return res.text();
        })
        .then((text) => {
          setHtmlContent(text);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      // PDF и другие файлы — открываем как обычно, у них таких проблем не бывает
      setLoading(false);
    }
  }, [open, fileUrl]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        style={{ boxShadow: "0 30px 70px -20px rgba(79,70,229,0.4)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="min-w-0">
            <div className="font-bold text-slate-800 text-sm truncate">{title}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
              title="Открыть в новой вкладке"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-slate-50">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" /> Загрузка...
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-rose-500 text-sm font-medium px-6 text-center">
              <AlertTriangle className="w-6 h-6" />
              Не удалось загрузить файл: {error}
            </div>
          )}

          {!loading && !error && isHtmlFile && htmlContent && (
            <iframe
              title={title}
              srcDoc={htmlContent}
              className="absolute inset-0 w-full h-full border-0"
              allow="fullscreen"
              allowFullScreen
            />
          )}

          {!loading && !error && !isHtmlFile && (
            <iframe
              title={title}
              src={fileUrl}
              className="absolute inset-0 w-full h-full border-0"
              allow="fullscreen"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
}
