import React, { useState } from "react";
import {
  Search, Bell, User, ChevronRight, Sparkles, GraduationCap,
  PlayCircle, FileText, Gamepad2, MessageCircleHeart, Lock,
  Check, Snowflake, Flower2, Sun, Leaf, ArrowLeft, Crown,
  Star, Zap, ShieldCheck
} from "lucide-react";

/* ============================================================
   ДИЗАЙН-ТОКЕНЫ
   Индиго→фиолетовый — основной контент
   Коралл→золото — экзаменационный трек (ОГЭ/ЕГЭ)
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
  {
    id: "presentations",
    label: "Презентации",
    desc: "Слайды в Canva, готовые к уроку",
    icon: PlayCircle,
    tint: "from-indigo-500 to-purple-500",
    soft: "bg-indigo-50",
  },
  {
    id: "ksp",
    label: "КСП / КТП",
    desc: "Поурочные и календарные планы",
    icon: FileText,
    tint: "from-violet-500 to-purple-500",
    soft: "bg-violet-50",
  },
  {
    id: "games",
    label: "Игры",
    desc: "Интерактивные тренажёры и квесты",
    icon: Gamepad2,
    tint: "from-fuchsia-500 to-pink-500",
    soft: "bg-fuchsia-50",
  },
  {
    id: "reflection",
    label: "Рефлексии",
    desc: "Инструменты обратной связи с классом",
    icon: MessageCircleHeart,
    tint: "from-purple-500 to-indigo-500",
    soft: "bg-purple-50",
  },
];

// Демо-данные карточек материалов
const DEMO_MATERIALS = {
  presentations: [
    { title: "Квадратные уравнения", grade: 8, tag: "Алгебра", locked: false },
    { title: "Теорема Пифагора", grade: 8, tag: "Геометрия", locked: true },
    { title: "Проценты и доли", grade: 6, tag: "Арифметика", locked: true },
  ],
  ksp: [
    { title: "КСП: Линейные функции", grade: 7, tag: "III четверть", locked: false },
    { title: "КТП на учебный год", grade: 5, tag: "Годовой план", locked: true },
  ],
  games: [
    { title: "Пиратские множители", grade: 5, tag: "Умножение", locked: false },
    { title: "Лабиринт процентов", grade: 6, tag: "Проценты", locked: true },
  ],
  reflection: [
    { title: "Светофор понимания", grade: 5, tag: "Универсальный", locked: false },
    { title: "Карта эмоций урока", grade: 9, tag: "Универсальный", locked: true },
  ],
};

/* ============================================================
   МЕЛКИЕ UI-БЛОКИ
   ============================================================ */

function SoftIcon({ icon: Icon, tint }) {
  return (
    <div
      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tint} flex items-center justify-center shadow-lg`}
      style={{ boxShadow: "0 8px 20px -6px rgba(79,70,229,0.45)" }}
    >
      <Icon className="w-6 h-6 text-white" strokeWidth={2.2} />
    </div>
  );
}

function Header({ onLogoClick }) {
  return (
    <header className="flex items-center gap-4 mb-8">
      <button
        onClick={onLogoClick}
        className="flex items-center gap-3 shrink-0"
      >
        <div className={`w-11 h-11 rounded-2xl ${GRAD_MAIN} flex items-center justify-center shadow-lg`}
             style={{ boxShadow: "0 8px 24px -6px rgba(79,70,229,0.5)" }}>
          <span className="text-white font-bold text-lg tracking-tight">Q</span>
        </div>
        <div className="leading-tight text-left">
          <div className="font-bold text-slate-900 text-[15px] tracking-tight">QED Math Space</div>
          <div className="text-[11px] text-slate-400 font-medium">для учителей математики</div>
        </div>
      </button>

      <div className="flex-1 relative max-w-xl">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Найти материал..."
          className="w-full bg-white rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none shadow-sm border border-slate-100 focus:border-indigo-300 transition-colors"
        />
      </div>

      <button className="relative w-11 h-11 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:shadow-md transition-shadow">
        <Bell className="w-5 h-5 text-slate-500" />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FF6B4A]" />
      </button>

      <button className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:shadow-md transition-shadow">
        <User className="w-5 h-5 text-slate-500" />
      </button>
    </header>
  );
}

/* ============================================================
   ГЛАВНЫЙ ДАШБОРД
   ============================================================ */

function Dashboard({ onOpenMaterials, onOpenPaywall }) {
  const [grade, setGrade] = useState(null);
  const [quarter, setQuarter] = useState(null);

  return (
    <div className="space-y-8">
      {/* Приветственные карточки */}
      <div className="grid md:grid-cols-2 gap-5">
        <div
          className={`relative overflow-hidden rounded-3xl ${GRAD_MAIN} p-8 flex flex-col justify-between min-h-[190px]`}
          style={{ boxShadow: "0 20px 45px -18px rgba(79,70,229,0.55)" }}
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-2xl px-3 py-1.5 text-white text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Добро пожаловать
            </div>
            <h1 className="text-white text-2xl font-bold tracking-tight mb-1.5">
              QED Math Space
            </h1>
            <p className="text-white/80 text-sm max-w-sm">
              Все ваши уроки, планы и игры — в одном премиальном пространстве.
            </p>
          </div>
          <button
            onClick={() => onOpenMaterials(null, null, null)}
            className="relative z-10 self-start mt-4 bg-white text-indigo-600 font-semibold text-sm px-5 py-2.5 rounded-2xl flex items-center gap-1.5 hover:bg-white/90 transition-colors"
          >
            Смотреть материалы <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div
          className={`relative overflow-hidden rounded-3xl ${GRAD_EXAM} p-8 flex flex-col justify-between min-h-[190px]`}
          style={{ boxShadow: "0 20px 45px -18px rgba(255,107,74,0.55)" }}
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-2xl px-3 py-1.5 text-white text-xs font-medium mb-4">
              <GraduationCap className="w-3.5 h-3.5" /> ОГЭ · ЕГЭ
            </div>
            <h2 className="text-white text-2xl font-bold tracking-tight mb-1.5">
              Подготовка к экзаменам
            </h2>
            <p className="text-white/85 text-sm max-w-sm">
              Варианты, разборы заданий и тренажёры для выпускных классов.
            </p>
          </div>
          <button
            onClick={() => onOpenMaterials(9, null, null)}
            className="relative z-10 self-start mt-4 bg-white text-[#FF6B4A] font-semibold text-sm px-5 py-2.5 rounded-2xl flex items-center gap-1.5 hover:bg-white/90 transition-colors"
          >
            Открыть раздел <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Фильтр по классу */}
      <section>
        <h3 className="text-slate-800 font-bold text-sm mb-3 px-1">По классу</h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {GRADES.map((g) => {
            const active = grade === g;
            return (
              <button
                key={g}
                onClick={() => setGrade(active ? null : g)}
                className={`rounded-2xl py-4 flex flex-col items-center justify-center transition-all ${
                  active
                    ? `${GRAD_MAIN} text-white shadow-lg`
                    : "bg-white text-slate-700 border border-slate-100 hover:border-indigo-200"
                }`}
                style={active ? { boxShadow: "0 10px 24px -8px rgba(79,70,229,0.5)" } : {}}
              >
                <span className="text-lg font-bold">{g}</span>
                <span className={`text-[10px] font-medium ${active ? "text-white/80" : "text-slate-400"}`}>
                  класс
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Фильтр по четверти */}
      <section>
        <h3 className="text-slate-800 font-bold text-sm mb-3 px-1">По четверти</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUARTERS.map((q) => {
            const active = quarter === q.id;
            const Icon = q.icon;
            return (
              <button
                key={q.id}
                onClick={() => setQuarter(active ? null : q.id)}
                className={`rounded-2xl p-4 flex items-center gap-3 transition-all border ${
                  active
                    ? "border-transparent text-white shadow-lg"
                    : "bg-white border-slate-100 text-slate-700 hover:border-indigo-200"
                }`}
                style={
                  active
                    ? {
                        backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                        boxShadow: "0 10px 24px -8px rgba(79,70,229,0.4)",
                      }
                    : {}
                }
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${q.tint} ${active ? "" : "opacity-90"}`}>
                  <Icon className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-sm font-semibold">{q.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Типы материалов */}
      <section>
        <h3 className="text-slate-800 font-bold text-sm mb-3 px-1">Тип материала</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MATERIAL_TYPES.map((m) => (
            <button
              key={m.id}
              onClick={() => onOpenMaterials(grade, quarter, m.id)}
              className={`text-left rounded-3xl p-5 ${m.soft} border border-white hover:shadow-md transition-shadow group`}
            >
              <SoftIcon icon={m.icon} tint={m.tint} />
              <div className="mt-4 font-bold text-slate-800 text-sm">{m.label}</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">{m.desc}</div>
              <div className="mt-3 flex items-center gap-1 text-indigo-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Открыть <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Баннер подписки */}
      <button
        onClick={onOpenPaywall}
        className="w-full rounded-3xl bg-white border border-slate-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-4 text-left">
          <div className={`w-12 h-12 rounded-2xl ${GRAD_EXAM} flex items-center justify-center shadow-md`}>
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm">Откройте полный доступ QED PRO</div>
            <div className="text-xs text-slate-400">Все презентации, планы, игры и рефлексии без ограничений</div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300" />
      </button>
    </div>
  );
}

/* ============================================================
   СТРАНИЦА МАТЕРИАЛОВ
   ============================================================ */

function MaterialsPage({ initialType, onBack, onOpenPaywall }) {
  const [activeType, setActiveType] = useState(initialType || "presentations");
  const type = MATERIAL_TYPES.find((m) => m.id === activeType);
  const items = DEMO_MATERIALS[activeType] || [];

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Назад на главную
      </button>

      {/* Табы типов материалов */}
      <div className="flex flex-wrap gap-2">
        {MATERIAL_TYPES.map((m) => {
          const active = m.id === activeType;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setActiveType(m.id)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
                active ? `${GRAD_MAIN} text-white shadow-md` : "bg-white text-slate-600 border border-slate-100 hover:border-indigo-200"
              }`}
            >
              <Icon className="w-4 h-4" /> {m.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-slate-900 font-bold text-lg tracking-tight">{type?.label}</h2>
        <span className="text-xs text-slate-400 font-medium">{items.length} материала</span>
      </div>

      {/* Сетка карточек */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="relative rounded-3xl bg-white border border-slate-100 p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <SoftIcon icon={type.icon} tint={type.tint} />
              {item.locked && (
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
              )}
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm leading-snug">{item.title}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 rounded-lg px-2 py-1">
                  {item.grade} класс
                </span>
                <span className="text-[11px] font-medium text-slate-400">{item.tag}</span>
              </div>
            </div>

            {item.locked ? (
              <button
                onClick={onOpenPaywall}
                className="mt-1 w-full rounded-2xl bg-slate-50 text-slate-500 text-sm font-semibold py-2.5 flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" /> Открыть по подписке
              </button>
            ) : (
              <button className={`mt-1 w-full rounded-2xl ${GRAD_MAIN} text-white text-sm font-semibold py-2.5 flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity`}>
                <PlayCircle className="w-3.5 h-3.5" /> Открыть материал
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   PAYWALL / ПОДПИСКА
   ============================================================ */

function Paywall({ onBack }) {
  const [plan, setPlan] = useState("year");

  const plans = [
    {
      id: "month",
      label: "Месяц",
      price: "3 990 ₸",
      period: "/ мес",
      badge: null,
    },
    {
      id: "year",
      label: "Год",
      price: "1 990 ₸",
      period: "/ мес",
      badge: "Выгода 50%",
    },
  ];

  const features = [
    "Все презентации 5–11 классов",
    "КСП/КТП по всем четвертям",
    "Интерактивные игры и тренажёры",
    "Инструменты рефлексии для класса",
    "Материалы для ОГЭ и ЕГЭ",
    "Новые материалы каждую неделю",
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Назад
      </button>

      <div className="text-center space-y-2 pt-2">
        <div className={`inline-flex items-center gap-1.5 ${GRAD_EXAM} text-white text-xs font-semibold rounded-2xl px-3 py-1.5`}>
          <Crown className="w-3.5 h-3.5" /> QED PRO
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Полный доступ ко всем материалам
        </h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Один тариф — все классы, все четверти, все типы материалов без ограничений.
        </p>
      </div>

      {/* Переключатель тарифа */}
      <div className="flex justify-center gap-3">
        {plans.map((p) => {
          const active = plan === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              className={`relative rounded-3xl px-6 py-4 min-w-[150px] text-left transition-all border ${
                active ? `${GRAD_MAIN} text-white border-transparent shadow-lg` : "bg-white border-slate-100 text-slate-700 hover:border-indigo-200"
              }`}
              style={active ? { boxShadow: "0 14px 30px -12px rgba(79,70,229,0.5)" } : {}}
            >
              {p.badge && (
                <span className="absolute -top-2.5 right-3 bg-[#FFA800] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                  {p.badge}
                </span>
              )}
              <div className={`text-xs font-semibold ${active ? "text-white/80" : "text-slate-400"}`}>{p.label}</div>
              <div className="text-lg font-bold mt-1">
                {p.price} <span className={`text-xs font-medium ${active ? "text-white/70" : "text-slate-400"}`}>{p.period}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Карточка с составом подписки */}
      <div
        className="rounded-3xl bg-white border border-slate-100 p-7"
        style={{ boxShadow: "0 20px 45px -25px rgba(79,70,229,0.35)" }}
      >
        <div className="grid sm:grid-cols-2 gap-3.5 mb-7">
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
          className={`w-full ${GRAD_MAIN} text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 transition-opacity`}
          style={{ boxShadow: "0 14px 30px -10px rgba(79,70,229,0.55)" }}
        >
          <Zap className="w-4 h-4" /> Оформить QED PRO
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-slate-400 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" /> Безопасная оплата · Отмена в любой момент
        </div>
      </div>

      {/* Соц. доказательство */}
      <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`w-7 h-7 rounded-full ${GRAD_MAIN} border-2 border-white`} />
          ))}
        </div>
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-[#FFA800] fill-[#FFA800]" /> 4.9 — используют более 1 200 учителей
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   КОРНЕВОЕ ПРИЛОЖЕНИЕ (простая роутинг-логика через состояние)
   ============================================================ */

export default function App() {
  const [view, setView] = useState("dashboard"); // dashboard | materials | paywall
  const [materialsFilter, setMaterialsFilter] = useState({ grade: null, quarter: null, type: null });

  const openMaterials = (grade, quarter, type) => {
    setMaterialsFilter({ grade, quarter, type });
    setView("materials");
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] font-sans">
      <div className="max-w-6xl mx-auto px-5 py-6">
        <Header onLogoClick={() => setView("dashboard")} />

        {view === "dashboard" && (
          <Dashboard
            onOpenMaterials={openMaterials}
            onOpenPaywall={() => setView("paywall")}
          />
        )}

        {view === "materials" && (
          <MaterialsPage
            initialType={materialsFilter.type}
            onBack={() => setView("dashboard")}
            onOpenPaywall={() => setView("paywall")}
          />
        )}

        {view === "paywall" && <Paywall onBack={() => setView("dashboard")} />}
      </div>
    </div>
  );
}
