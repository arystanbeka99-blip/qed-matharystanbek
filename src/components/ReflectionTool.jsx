import React, { useState } from "react";
import { ArrowLeft, Users, RotateCcw, Smile, Meh, Frown } from "lucide-react";

const OPTIONS = [
  { id: "green", label: "Понял(а) всё", color: "bg-emerald-500", soft: "bg-emerald-50", ring: "ring-emerald-300", icon: Smile },
  { id: "yellow", label: "Есть вопросы", color: "bg-amber-400", soft: "bg-amber-50", ring: "ring-amber-300", icon: Meh },
  { id: "red", label: "Нужна помощь", color: "bg-rose-500", soft: "bg-rose-50", ring: "ring-rose-300", icon: Frown },
];

/**
 * Демо-версия хранит ответы в локальном состоянии.
 * В проде — пишите каждый ответ в Supabase (таблица lesson_reflections:
 * lesson_id, student_name, answer, created_at) и подписывайтесь на
 * realtime-канал, чтобы учитель видел светофор класса в реальном времени.
 */
export default function ReflectionTool({ onExit }) {
  const [mode, setMode] = useState("student"); // student | teacher
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState([
    { id: "green" },
    { id: "green" },
    { id: "yellow" },
  ]); // демо-данные для учительского вида

  const handleSubmit = () => {
    if (!selected) return;
    setResponses((r) => [...r, { id: selected }]);
    setSubmitted(true);
  };

  const reset = () => {
    setSelected(null);
    setSubmitted(false);
  };

  const counts = OPTIONS.reduce((acc, o) => {
    acc[o.id] = responses.filter((r) => r.id === o.id).length;
    return acc;
  }, {});
  const total = responses.length || 1;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад к материалам
        </button>
        <div className="flex bg-white rounded-2xl p-1 border border-slate-100">
          {[
            { id: "student", label: "Ученик" },
            { id: "teacher", label: "Учитель", icon: Users },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                mode === m.id ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-md" : "text-slate-500"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "student" ? (
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Светофор понимания</h1>
            <p className="text-slate-500 text-sm mt-1">Как прошёл сегодняшний урок? Выберите честно.</p>
          </div>

          {submitted ? (
            <div className="rounded-3xl bg-white border border-slate-100 p-8 space-y-3">
              <div className="text-3xl">✅</div>
              <div className="font-bold text-slate-800 text-sm">Ответ отправлен учителю</div>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-indigo-600 text-xs font-semibold mt-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ответить ещё раз
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-3">
                {OPTIONS.map((o) => {
                  const Icon = o.icon;
                  const active = selected === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setSelected(o.id)}
                      className={`flex items-center gap-4 rounded-3xl p-4 border transition-all ${
                        active ? `${o.soft} border-transparent ring-2 ${o.ring}` : "bg-white border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-2xl ${o.color} flex items-center justify-center shadow-md shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-slate-800 text-sm">{o.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!selected}
                className="w-full rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold text-sm py-3.5 disabled:opacity-40 transition-opacity"
              >
                Отправить ответ
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Ответы класса</h2>
            <p className="text-slate-400 text-xs mt-1">Обновляется в реальном времени по мере ответов учеников</p>
          </div>

          <div className="rounded-3xl bg-white border border-slate-100 p-6 space-y-4">
            {OPTIONS.map((o) => {
              const Icon = o.icon;
              const pct = Math.round((counts[o.id] / total) * 100);
              return (
                <div key={o.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Icon className="w-4 h-4" /> {o.label}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{counts[o.id]} · {pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${o.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-xs text-slate-400">Всего ответов: {responses.length}</div>
        </div>
      )}
    </div>
  );
}
