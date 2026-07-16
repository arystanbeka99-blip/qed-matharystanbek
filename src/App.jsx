import React, { useState } from "react";
import {
  Search, Bell, User, ChevronRight, Sparkles, GraduationCap,
  PlayCircle, FileText, Gamepad2, MessageCircleHeart, Lock,
  Check, Snowflake, Flower2, Sun, Leaf, ArrowLeft, Crown,
  Star, Zap, ShieldCheck, Menu, X, LayoutGrid, BookOpen, ClipboardList, Download,
} from "lucide-react";
import { useSubscription } from "./hooks/useSubscription";
import { supabase, fetchMaterials } from "./lib/supabaseClient";
import CanvaViewer from "./components/CanvaViewer";
import GenericFileViewer from "./components/GenericFileViewer";
import ProfilePage from "./components/ProfilePage";
import PirateGame from "./components/PirateGame";
import PercentLabyrinth from "./components/PercentLabyrinth";
import ReflectionTool from "./components/ReflectionTool";
import Auth from "./components/Auth";

/* ============================================================
   ДИЗАЙН-ТОКЕНЫ
   ============================================================ */
const GRAD_MAIN = "bg-gradient-to-br from-[#4F46E5] to-[#A855F7]";
const GRAD_EXAM = "bg-gradient-to-br from-[#FF6B4A] to-[#FFA800]";

const GRADES = [5, 6, 7, 8, 9, 10, 11];

const QUARTERS = [
  { id: 1, label: "I четверть", icon: Leaf, tint: "from-amber-400 to-orange-400" },
  { id: 2, label: "II четверть", icon: Snowflake, tint: "from-sky-400 to-indigo-400" },
  { id: 3, label: "III четверть", icon: Flower2, tint: "from-pink-400 to-fuchsia-400" },
  { id: 4, label: "IV четверть", icon: Sun, tint: "from-yellow-400 to-lime-400" },
];

const MATERIAL_TYPES = [
  { id: "presentations", label: "Презентации", desc: "Слайды в Canva, готовые к уроку", icon: PlayCircle, tint: "from-indigo-500 to-purple-500", soft: "bg-indigo-50" },
  { id: "ksp", label: "КСП / КТП", desc: "Поурочные и календарные планы", icon: FileText, tint: "from-violet-500 to-purple-500", soft: "bg-violet-50" },
  { id: "games", label: "Игры", desc: "Интерактивные тренажёры и квесты", icon: Gamepad2, tint: "from-fuchsia-500 to-pink-500", soft: "bg-fuchsia-50" },
  { id: "reflection", label: "Рефлексии", desc: "Инструменты обратной связи с классом", icon: MessageCircleHeart, tint: "from-purple-500 to-indigo-500", soft: "bg-purple-50" },
  { id: "textbooks", label: "Учебники", desc: "PDF-учебники для скачивания и чтения", icon: BookOpen, tint: "from-teal-500 to-emerald-500", soft: "bg-teal-50" },
  { id: "worksheets", label: "Рабочие листы", desc: "Задания для самостоятельной работы", icon: ClipboardList, tint: "from-sky-500 to-cyan-500", soft: "bg-sky-50" },
];

// Демо-данные (в проде — fetchMaterials() из lib/supabaseClient.js)
const DEMO_MATERIALS = {
  presentations: [
    { title: "Квадратные уравнения", grade: 8, tag: "Алгебра", locked: false, canvaUrl: "https://www.canva.com/design/DAF000000000/view" },
    { title: "Теорема Пифагора", grade: 8, tag: "Геометрия", locked: true, canvaUrl: "https://www.canva.com/design/DAF000000001/view" },
    { title: "Проценты и доли", grade: 6, tag: "Арифметика", locked: true, canvaUrl: "https://www.canva.com/design/DAF000000002/view" },
  ],
  ksp: [
    { title: "КСП: Линейные функции", grade: 7, tag: "III четверть", locked: false },
    { title: "КТП на учебный год", grade: 5, tag: "Годовой план", locked: true },
  ],
  games: [
    { title: "Пиратские множители", grade: 5, tag: "Умножение", locked: false, gameId: "pirate-multiplication" },
    { title: "Лабиринт процентов", grade: 6, tag: "Проценты", locked: true, gameId: "percent-labyrinth" },
  ],
  reflection: [
    { title: "Светофор понимания", grade: 5, tag: "Универсальный", locked: false, toolId: "traffic-light" },
    { title: "Карта эмоций урока", grade: 9, tag: "Универсальный", locked: true },
  ],
};

/* ============================================================
   МЕЛКИЕ UI-БЛОКИ
   ============================================================ */

function SoftIcon({ icon: Icon, tint }) {
  return (
    <div
      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${tint} flex items-center justify-center shadow-lg`}
      style={{ boxShadow: "0 8px 20px -6px rgba(79,70,229,0.45)" }}
    >
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.2} />
    </div>
  );
}

function Header({ onLogoClick, onMenuToggle, isPro, onSignOut, userEmail, onOpenProfile }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 relative">
      {/* Бургер только на мобильном */}
      <button
        onClick={onMenuToggle}
        className="sm:hidden w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0"
      >
        <Menu className="w-5 h-5 text-slate-500" />
      </button>

      <button onClick={onLogoClick} className="flex items-center gap-2.5 shrink-0">
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${GRAD_MAIN} flex items-center justify-center shadow-lg`}
          style={{ boxShadow: "0 8px 24px -6px rgba(79,70,229,0.5)" }}
        >
          <span className="text-white font-bold text-lg tracking-tight">Q</span>
        </div>
        <div className="leading-tight text-left hidden xs:block">
          <div className="font-bold text-slate-900 text-[15px] tracking-tight">QED Math Space</div>
          <div className="text-[11px] text-slate-400 font-medium hidden sm:block">для учителей математики</div>
        </div>
      </button>

      {/* Поиск: полноразмерный на desktop, раскрывающийся на мобильном */}
      <div className="hidden sm:block flex-1 relative max-w-xl">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Найти материал..."
          className="w-full bg-white rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none shadow-sm border border-slate-100 focus:border-indigo-300 transition-colors"
        />
      </div>
      <div className="sm:hidden flex-1" />

      <button
        onClick={() => setSearchOpen((s) => !s)}
        className="sm:hidden w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0"
      >
        {searchOpen ? <X className="w-4.5 h-4.5 text-slate-500" /> : <Search className="w-4.5 h-4.5 text-slate-500" />}
      </button>

      {isPro && (
        <div className={`hidden sm:flex items-center gap-1 ${GRAD_EXAM} text-white text-xs font-bold rounded-xl px-2.5 py-1.5 shrink-0`}>
          <Crown className="w-3.5 h-3.5" /> PRO
        </div>
      )}

      <button className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:shadow-md transition-shadow shrink-0">
        <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-500" />
        <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-2 h-2 rounded-full bg-[#FF6B4A]" />
      </button>

      {/* Профиль: клик открывает меню, а не сразу выходит из аккаунта */}
      <div className="relative shrink-0">
        <button
          onClick={() => setProfileOpen((p) => !p)}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:shadow-md transition-shadow"
        >
          <User className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-500" />
        </button>

        {profileOpen && (
          <>
            {/* Клик вне меню закрывает его */}
            <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
            <div className="absolute right-0 top-12 z-40 w-60 bg-white rounded-2xl border border-slate-100 shadow-xl p-2">
              <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                <div className="text-xs text-slate-400">Вы вошли как</div>
                <div className="text-sm font-semibold text-slate-800 truncate">{userEmail}</div>
                {isPro && (
                  <div className={`inline-flex items-center gap-1 mt-2 ${GRAD_EXAM} text-white text-[10px] font-bold rounded-lg px-2 py-1`}>
                    <Crown className="w-3 h-3" /> QED PRO
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  onOpenProfile();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Мой профиль
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  onSignOut();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
              >
                Выйти из аккаунта
              </button>
            </div>
          </>
        )}
      </div>

      {/* Раскрывающийся поиск для мобильного, второй строкой */}
      {searchOpen && (
        <div className="sm:hidden absolute left-0 right-0 top-16 px-5 z-30">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              type="text"
              placeholder="Найти материал..."
              className="w-full bg-white rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none shadow-lg border border-slate-100"
            />
          </div>
        </div>
      )}
    </header>
  );
}

/* Нижняя навигация для мобильных устройств */
function MobileTabBar({ view, setView }) {
  const tabs = [
    { id: "dashboard", label: "Главная", icon: LayoutGrid },
    { id: "materials", label: "Материалы", icon: FileText },
    { id: "paywall", label: "PRO", icon: Crown },
  ];
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex items-center justify-around py-2 z-40"
         style={{ boxShadow: "0 -8px 24px -12px rgba(15,23,42,0.12)" }}>
      {tabs.map((t) => {
        const active = view === t.id;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Icon className={`w-5 h-5 ${active ? "text-indigo-600" : "text-slate-400"}`} />
            <span className={`text-[10px] font-semibold ${active ? "text-indigo-600" : "text-slate-400"}`}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   ГЛАВНЫЙ ДАШБОРД
   ============================================================ */

function Dashboard({ onOpenMaterials, onOpenPaywall }) {
  const [grade, setGrade] = useState(null);
  const [quarter, setQuarter] = useState(null);

  return (
    <div className="space-y-7 sm:space-y-8 pb-20 sm:pb-0">
      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
        <div
          className={`relative overflow-hidden rounded-3xl ${GRAD_MAIN} p-6 sm:p-8 flex flex-col justify-between min-h-[170px] sm:min-h-[190px]`}
          style={{ boxShadow: "0 20px 45px -18px rgba(79,70,229,0.55)" }}
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-2xl px-3 py-1.5 text-white text-xs font-medium mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Добро пожаловать
            </div>
            <h1 className="text-white text-xl sm:text-2xl font-bold tracking-tight mb-1.5">QED Math Space</h1>
            <p className="text-white/80 text-sm max-w-sm">Все ваши уроки, планы и игры — в одном премиальном пространстве.</p>
          </div>
          <button
            onClick={() => onOpenMaterials(null, null, null)}
            className="relative z-10 self-start mt-4 bg-white text-indigo-600 font-semibold text-sm px-5 py-2.5 rounded-2xl flex items-center gap-1.5 hover:bg-white/90 transition-colors"
          >
            Смотреть материалы <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div
          className={`relative overflow-hidden rounded-3xl ${GRAD_EXAM} p-6 sm:p-8 flex flex-col justify-between min-h-[170px] sm:min-h-[190px]`}
          style={{ boxShadow: "0 20px 45px -18px rgba(255,107,74,0.55)" }}
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-2xl px-3 py-1.5 text-white text-xs font-medium mb-3 sm:mb-4">
              <GraduationCap className="w-3.5 h-3.5" /> Аттестация · ЕНТ
            </div>
            <h2 className="text-white text-xl sm:text-2xl font-bold tracking-tight mb-1.5">Подготовка к экзаменам</h2>
            <p className="text-white/85 text-sm max-w-sm">Варианты, разборы заданий и тренажёры для выпускных классов.</p>
          </div>
          <button
            onClick={() => onOpenMaterials(9, null, null)}
            className="relative z-10 self-start mt-4 bg-white text-[#FF6B4A] font-semibold text-sm px-5 py-2.5 rounded-2xl flex items-center gap-1.5 hover:bg-white/90 transition-colors"
          >
            Открыть раздел <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <section>
        <h3 className="text-slate-800 font-bold text-sm mb-3 px-1">По классу</h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 sm:gap-3">
          {GRADES.map((g) => {
            const active = grade === g;
            return (
              <button
                key={g}
                onClick={() => setGrade(active ? null : g)}
                className={`rounded-2xl py-3.5 sm:py-4 flex flex-col items-center justify-center transition-all ${
                  active ? `${GRAD_MAIN} text-white shadow-lg` : "bg-white text-slate-700 border border-slate-100 hover:border-indigo-200"
                }`}
                style={active ? { boxShadow: "0 10px 24px -8px rgba(79,70,229,0.5)" } : {}}
              >
                <span className="text-base sm:text-lg font-bold">{g}</span>
                <span className={`text-[10px] font-medium ${active ? "text-white/80" : "text-slate-400"}`}>класс</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-slate-800 font-bold text-sm mb-3 px-1">По четверти</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {QUARTERS.map((q) => {
            const active = quarter === q.id;
            const Icon = q.icon;
            return (
              <button
                key={q.id}
                onClick={() => setQuarter(active ? null : q.id)}
                className={`rounded-2xl p-3.5 sm:p-4 flex items-center gap-2.5 sm:gap-3 transition-all border ${
                  active ? `${GRAD_MAIN} border-transparent text-white shadow-lg` : "bg-white border-slate-100 text-slate-700 hover:border-indigo-200"
                }`}
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${q.tint}`}>
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-semibold">{q.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-slate-800 font-bold text-sm mb-3 px-1">Тип материала</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {MATERIAL_TYPES.map((m) => (
            <button
              key={m.id}
              onClick={() => onOpenMaterials(grade, quarter, m.id)}
              className={`text-left rounded-3xl p-4 sm:p-5 ${m.soft} border border-white hover:shadow-md transition-shadow group`}
            >
              <SoftIcon icon={m.icon} tint={m.tint} />
              <div className="mt-3 sm:mt-4 font-bold text-slate-800 text-sm">{m.label}</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">{m.desc}</div>
              <div className="mt-3 flex items-center gap-1 text-indigo-600 text-xs font-semibold sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                Открыть <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={onOpenPaywall}
        className="w-full rounded-3xl bg-white border border-slate-100 p-4 sm:p-5 flex items-center justify-between hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3 sm:gap-4 text-left">
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${GRAD_EXAM} flex items-center justify-center shadow-md shrink-0`}>
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm">Откройте полный доступ QED PRO</div>
            <div className="text-xs text-slate-400 hidden sm:block">Все презентации, планы, игры и рефлексии без ограничений</div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
      </button>
    </div>
  );
}

/* ============================================================
   СТРАНИЦА МАТЕРИАЛОВ
   ============================================================ */

function MaterialsPage({ initialType, initialGrade, initialQuarter, isPro, onBack, onOpenPaywall, onOpenCanva, onOpenGame, onOpenTool, onOpenFile }) {
  const [activeType, setActiveType] = useState(initialType || "presentations");
  const [grade, setGrade] = useState(initialGrade || null);
  const [quarter, setQuarter] = useState(initialQuarter || null);
  const type = MATERIAL_TYPES.find((m) => m.id === activeType);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMaterials({ type: activeType, grade, quarter })
      .then((rows) => {
        if (cancelled) return;
        // Сортируем: сначала по order_index (порядок темы), затем по названию темы
        const sorted = [...rows].sort((a, b) => {
          const orderDiff = (a.order_index ?? 0) - (b.order_index ?? 0);
          if (orderDiff !== 0) return orderDiff;
          return (a.topic || "").localeCompare(b.topic || "", "ru");
        });
        // Приводим поля из базы (snake_case) к формату, который ждёт интерфейс
        const mapped = sorted.map((r) => ({
          title: r.title,
          grade: r.grade,
          quarter: r.quarter,
          topic: r.topic,
          tag: r.tag,
          locked: !r.is_free,
          canvaUrl: r.canva_url,
          fileUrl: r.file_url,
          gameId: r.game_id,
          toolId: r.tool_id,
        }));
        setItems(mapped);
      })
      .catch((err) => console.error("Не удалось загрузить материалы:", err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeType, grade, quarter]);

  const handleOpen = (item) => {
    if (item.locked && !isPro) return onOpenPaywall();
    if (item.canvaUrl) return onOpenCanva(item);
    if (item.gameId) return onOpenGame(item.gameId);
    if (item.toolId) return onOpenTool(item.toolId);
    if (item.fileUrl) return onOpenFile(item);
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-20 sm:pb-0">
      <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Назад на главную
      </button>

      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {MATERIAL_TYPES.map((m) => {
          const active = m.id === activeType;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setActiveType(m.id)}
              className={`flex items-center gap-2 rounded-2xl px-3.5 sm:px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
                active ? `${GRAD_MAIN} text-white shadow-md` : "bg-white text-slate-600 border border-slate-100 hover:border-indigo-200"
              }`}
            >
              <Icon className="w-4 h-4" /> {m.label}
            </button>
          );
        })}
      </div>

      {/* Активные фильтры по классу/четверти — можно менять или сбросить */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <select
          value={grade ?? ""}
          onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : null)}
          className="text-sm font-semibold bg-white border border-slate-100 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-indigo-300"
        >
          <option value="">Все классы</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>{g} класс</option>
          ))}
        </select>

        <select
          value={quarter ?? ""}
          onChange={(e) => setQuarter(e.target.value ? Number(e.target.value) : null)}
          className="text-sm font-semibold bg-white border border-slate-100 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-indigo-300"
        >
          <option value="">Все четверти</option>
          {QUARTERS.map((q) => (
            <option key={q.id} value={q.id}>{q.label}</option>
          ))}
        </select>

        {(grade || quarter) && (
          <button
            onClick={() => { setGrade(null); setQuarter(null); }}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2"
          >
            Сбросить фильтры
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-slate-900 font-bold text-lg tracking-tight">{type?.label}</h2>
        <span className="text-xs text-slate-400 font-medium">{loading ? "загрузка..." : `${items.length} материала`}</span>
      </div>

      {!loading && items.length === 0 && (
        <div className="rounded-3xl bg-white border border-slate-100 p-10 text-center">
          <div className="text-slate-400 text-sm">Материалов пока нет — добавьте их в таблицу materials в Supabase.</div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {items.map((item, i) => {
          const locked = item.locked && !isPro;
          return (
            <div key={i} className="relative rounded-3xl bg-white border border-slate-100 p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <SoftIcon icon={type.icon} tint={type.tint} />
                {locked && (
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm leading-snug">{item.title}</div>
                {item.topic && (
                  <div className="text-xs text-indigo-500 font-medium mt-0.5">{item.topic}</div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 rounded-lg px-2 py-1">{item.grade} класс</span>
                  <span className="text-[11px] font-medium text-slate-400">{item.tag}</span>
                </div>
              </div>

              {locked ? (
                <button
                  onClick={onOpenPaywall}
                  className="mt-1 w-full rounded-2xl bg-slate-50 text-slate-500 text-sm font-semibold py-2.5 flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" /> Открыть по подписке
                </button>
              ) : (
                <button
                  onClick={() => handleOpen(item)}
                  className={`mt-1 w-full rounded-2xl ${GRAD_MAIN} text-white text-sm font-semibold py-2.5 flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity`}
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Открыть материал
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   PAYWALL
   ============================================================ */

function Paywall({ onBack }) {
  const [plan, setPlan] = useState("year");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const plans = [
    { id: "month", label: "Месяц", price: "3 990 ₸", period: "/ мес", badge: null },
    { id: "year", label: "Год", price: "1 990 ₸", period: "/ мес", badge: "Выгода 50%" },
  ];
  const features = [
    "Все презентации 5–11 классов",
    "КСП/КТП по всем четвертям",
    "Интерактивные игры и тренажёры",
    "Инструменты рефлексии для класса",
    "Материалы для итоговой аттестации и ЕНТ",
    "Новые материалы каждую неделю",
  ];

  /**
   * Создаёт Stripe Checkout Session на бэкенде (см. src/api/create-checkout-session.js)
   * и перенаправляет учителя на страницу оплаты.
   */
  const handleCheckout = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setError("Сначала войдите в аккаунт, чтобы оформить подписку.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: user.id, email: user.email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Не удалось начать оплату");
      window.location.href = data.url; // редирект на Stripe Checkout
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 sm:pb-0">
      <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Назад
      </button>

      <div className="text-center space-y-2 pt-2">
        <div className={`inline-flex items-center gap-1.5 ${GRAD_EXAM} text-white text-xs font-semibold rounded-2xl px-3 py-1.5`}>
          <Crown className="w-3.5 h-3.5" /> QED PRO
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Полный доступ ко всем материалам</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">Один тариф — все классы, все четверти, все типы материалов без ограничений.</p>
      </div>

      <div className="flex flex-col xs:flex-row justify-center gap-3">
        {plans.map((p) => {
          const active = plan === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              className={`relative rounded-3xl px-6 py-4 sm:min-w-[150px] text-left transition-all border ${
                active ? `${GRAD_MAIN} text-white border-transparent shadow-lg` : "bg-white border-slate-100 text-slate-700 hover:border-indigo-200"
              }`}
              style={active ? { boxShadow: "0 14px 30px -12px rgba(79,70,229,0.5)" } : {}}
            >
              {p.badge && (
                <span className="absolute -top-2.5 right-3 bg-[#FFA800] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">{p.badge}</span>
              )}
              <div className={`text-xs font-semibold ${active ? "text-white/80" : "text-slate-400"}`}>{p.label}</div>
              <div className="text-lg font-bold mt-1">
                {p.price} <span className={`text-xs font-medium ${active ? "text-white/70" : "text-slate-400"}`}>{p.period}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-7" style={{ boxShadow: "0 20px 45px -25px rgba(79,70,229,0.35)" }}>
        <div className="grid sm:grid-cols-2 gap-3.5 mb-6 sm:mb-7">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-indigo-600" strokeWidth={3} />
              </div>
              <span className="text-sm text-slate-600">{f}</span>
            </div>
          ))}
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`w-full ${GRAD_MAIN} text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-60`}
          style={{ boxShadow: "0 14px 30px -10px rgba(79,70,229,0.55)" }}
        >
          <Zap className="w-4 h-4" /> {loading ? "Переходим к оплате..." : "Оформить QED PRO"}
        </button>
        {error && (
          <div className="mt-3 text-center text-xs font-medium text-rose-500">{error}</div>
        )}
        <div className="flex items-center justify-center gap-1.5 mt-4 text-slate-400 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" /> Безопасная оплата · Отмена в любой момент
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => <div key={i} className={`w-7 h-7 rounded-full ${GRAD_MAIN} border-2 border-white`} />)}
        </div>
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-[#FFA800] fill-[#FFA800]" /> 4.9 — используют более 1 200 учителей
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   КОРНЕВОЕ ПРИЛОЖЕНИЕ
   ============================================================ */

export default function App() {
  const [view, setView] = useState("dashboard"); // dashboard | materials | paywall | game | tool
  const [materialsFilter, setMaterialsFilter] = useState({ grade: null, quarter: null, type: null });
  const [canvaItem, setCanvaItem] = useState(null);
  const [fileItem, setFileItem] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [session, setSession] = useState(undefined); // undefined = проверяется, null = не авторизован

  const { isPro, plan, periodEnd } = useSubscription();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  const openMaterials = (grade, quarter, type) => {
    setMaterialsFilter({ grade, quarter, type });
    setView("materials");
  };

  // Пока идёт первичная проверка сессии — ничего не мигаем
  if (session === undefined) {
    return <div className="min-h-screen bg-[#F4F6FA]" />;
  }

  // Не авторизован — показываем экран входа/регистрации вместо всего приложения
  if (session === null) {
    return <Auth onSuccess={() => {}} />;
  }

  if (view === "game") {
    return (
      <div className="min-h-screen bg-[#F4F6FA] font-sans">
        <div className="max-w-6xl mx-auto px-5 py-6">
          {activeGame === "pirate-multiplication" && <PirateGame onExit={() => setView("materials")} />}
          {activeGame === "percent-labyrinth" && <PercentLabyrinth onExit={() => setView("materials")} />}
        </div>
      </div>
    );
  }

  if (view === "tool") {
    return (
      <div className="min-h-screen bg-[#F4F6FA] font-sans">
        <div className="max-w-6xl mx-auto px-5 py-6">
          {activeTool === "traffic-light" && <ReflectionTool onExit={() => setView("materials")} />}
        </div>
      </div>
    );
  }

  if (view === "profile") {
    return (
      <div className="min-h-screen bg-[#F4F6FA] font-sans">
        <div className="max-w-6xl mx-auto px-5 py-6">
          <ProfilePage
            onBack={() => setView("dashboard")}
            onOpenPaywall={() => setView("paywall")}
            isPro={isPro}
            plan={plan}
            periodEnd={periodEnd}
            userEmail={session?.user?.email}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] font-sans relative">
      <div className="max-w-6xl mx-auto px-5 py-6">
        <Header
          onLogoClick={() => setView("dashboard")}
          isPro={isPro}
          onSignOut={() => supabase.auth.signOut()}
          userEmail={session?.user?.email}
          onOpenProfile={() => setView("profile")}
        />

        {view === "dashboard" && <Dashboard onOpenMaterials={openMaterials} onOpenPaywall={() => setView("paywall")} />}

        {view === "materials" && (
          <MaterialsPage
            initialType={materialsFilter.type}
            initialGrade={materialsFilter.grade}
            initialQuarter={materialsFilter.quarter}
            isPro={isPro}
            onBack={() => setView("dashboard")}
            onOpenPaywall={() => setView("paywall")}
            onOpenCanva={(item) => setCanvaItem(item)}
            onOpenFile={(item) => setFileItem(item)}
            onOpenGame={(gameId) => {
              setActiveGame(gameId);
              setView("game");
            }}
            onOpenTool={(toolId) => {
              setActiveTool(toolId);
              setView("tool");
            }}
          />
        )}

        {view === "paywall" && <Paywall onBack={() => setView("dashboard")} />}
      </div>

      <MobileTabBar view={view === "game" ? "materials" : view} setView={setView} />

      <CanvaViewer
        open={Boolean(canvaItem)}
        title={canvaItem?.title}
        canvaUrl={canvaItem?.canvaUrl}
        onClose={() => setCanvaItem(null)}
      />

      <GenericFileViewer
        open={Boolean(fileItem)}
        title={fileItem?.title}
        fileUrl={fileItem?.fileUrl}
        onClose={() => setFileItem(null)}
      />
    </div>
  );
}
