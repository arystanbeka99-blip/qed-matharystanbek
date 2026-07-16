import React, { useEffect, useState } from "react";
import { X, ExternalLink, Loader2 } from "lucide-react";

/**
 * Показывает произвольный файл (HTML или PDF) во встроенном iframe.
 * Используется для:
 *  - собственных HTML-игр (Мафия-анализатор, лабиринты и т.п.)
 *  - HTML-рефлексий
 *  - рабочих листов (PDF или HTML)
 * Файл должен лежать в публичном бакете Supabase Storage (materials-files).
 */
export default function GenericFileViewer({ open, onClose, title, fileUrl }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) setLoading(true);
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
          <iframe
            title={title}
            src={fileUrl}
            onLoad={() => setLoading(false)}
            className="absolute inset-0 w-full h-full border-0"
            allow="fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
