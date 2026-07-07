import React, { useEffect } from "react";
import { X, ExternalLink, Loader2 } from "lucide-react";

/**
 * Приводит обычную ссылку на просмотр Canva к embed-формату.
 * Учитель вставляет ссылку вида:
 *   https://www.canva.com/design/DAF.../view
 * Компонент сам конвертирует её в:
 *   https://www.canva.com/design/DAF.../view?embed
 */
function toEmbedUrl(canvaUrl) {
  if (!canvaUrl) return null;
  try {
    const url = new URL(canvaUrl);
    if (!url.searchParams.has("embed")) {
      url.searchParams.set("embed", "");
    }
    return url.toString();
  } catch {
    return canvaUrl;
  }
}

export default function CanvaViewer({ open, onClose, title, canvaUrl }) {
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    if (open) setLoading(true);
  }, [open, canvaUrl]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const embedUrl = toEmbedUrl(canvaUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Затемнение фона */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Окно плеера */}
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        style={{ boxShadow: "0 30px 70px -20px rgba(79,70,229,0.4)" }}
      >
        {/* Шапка модалки */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="min-w-0">
            <div className="font-bold text-slate-800 text-sm truncate">{title}</div>
            <div className="text-[11px] text-slate-400 font-medium">Презентация · Canva</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={canvaUrl}
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

        {/* Тело: iframe в формате 16:9 */}
        <div className="relative w-full bg-slate-50" style={{ paddingTop: "56.25%" }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" /> Загрузка презентации...
            </div>
          )}
          {embedUrl ? (
            <iframe
              title={title}
              src={embedUrl}
              onLoad={() => setLoading(false)}
              className="absolute inset-0 w-full h-full border-0"
              allow="fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
              Ссылка на Canva не указана
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
