import React, { useState } from "react";
import { ArrowLeft, MapPin, Heart, Trophy, RotateCcw, PartyPopper, Percent } from "lucide-react";

const ROOMS = 8; // длина лабиринта

const TASK_TEMPLATES = [
  (base) => {
    const percent = [10, 20, 25, 50, 75][Math.floor(Math.random() * 5)];
    const correct = (base * percent) / 100;
    return {
      text: `Сколько будет ${percent}% от ${base}?`,
      correct,
    };
  },
  (base) => {
    const percent = [5, 10, 20][Math.floor(Math.random() * 3)];
    const price = base;
    const discount = (price * percent) / 100;
    const correct = price - discount;
    return {
      text: `Товар стоил ${price} ₸. Скидка ${percent}%. Сколько он стоит теперь?`,
      correct,
    };
  },
];

function generateOptions(correct) {
  const options = new Set([correct]);
  while (options.size < 4) {
    const delta = [-20, -10, -5, 5, 10, 15, 20][Math.floor(Math.random() * 7)];
    const fake = correct + delta;
    if (fake > 0) options.add(fake);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}

function generateTask() {
  const base = [40, 60, 80, 100, 120, 150, 200, 240][Math.floor(Math.random() * 8)];
  const template = TASK_TEMPLATES[Math.floor(Math.random() * TASK_TEMPLATES.length)];
  const { text, correct } = template(base);
  return { text, correct, options: generateOptions(correct) };
}

export default function PercentLabyrinth({ onExit }) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [task, setTask] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [status, setStatus] = useState("playing"); // playing | won | lost

  const start = () => {
    setStarted(true);
    setStep(0);
    setLives(3);
    setScore(0);
    setStatus("playing");
    setTask(generateTask());
  };

  const handleAnswer = (value) => {
    if (feedback) return;
    const correct = value === task.correct;
    setFeedback(correct ? "correct" : "wrong");

    setTimeout(() => {
      setFeedback(null);
      if (correct) {
        setScore((s) => s + 15);
        const next = step + 1;
        if (next >= ROOMS) {
          setStatus("won");
        } else {
          setStep(next);
          setTask(generateTask());
        }
      } else {
        const remaining = lives - 1;
        setLives(remaining);
        if (remaining <= 0) {
          setStatus("lost");
        } else {
          setTask(generateTask());
        }
      }
    }, 550);
  };

  /* ---------- Экран приветствия ---------- */
  if (!started) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 py-6">
        <button onClick={onExit} className="flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors mx-auto sm:mx-0">
          <ArrowLeft className="w-4 h-4" /> Назад к материалам
        </button>

        <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg">
          <Percent className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Лабиринт процентов</h1>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Пройдите {ROOMS} комнат, решая задачи на проценты. У вас 3 жизни — ошибётесь трижды, и путь придётся начать заново.
        </p>
        <button
          onClick={start}
          className="rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white font-semibold text-sm px-6 py-3 shadow-md"
        >
          Войти в лабиринт
        </button>
      </div>
    );
  }

  /* ---------- Победа ---------- */
  if (status === "won") {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-10">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-[#FF6B4A] to-[#FFA800] flex items-center justify-center shadow-lg">
          <PartyPopper className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Лабиринт пройден!</h2>
        <div className="rounded-3xl bg-white border border-slate-100 p-6 flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-[#FFA800]" />
          <span className="text-2xl font-bold text-slate-900">{score}</span>
          <span className="text-sm text-slate-400 font-medium">очков</span>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={start} className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white font-semibold text-sm px-5 py-2.5">
            <RotateCcw className="w-4 h-4" /> Пройти ещё раз
          </button>
          <button onClick={onExit} className="rounded-2xl bg-white border border-slate-100 text-slate-600 font-semibold text-sm px-5 py-2.5">
            К материалам
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Поражение ---------- */
  if (status === "lost") {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-10">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-200 flex items-center justify-center">
          <Heart className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Жизни закончились</h2>
        <p className="text-slate-500 text-sm">Пройдено комнат: {step} из {ROOMS} · Очки: {score}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={start} className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white font-semibold text-sm px-5 py-2.5">
            <RotateCcw className="w-4 h-4" /> Начать заново
          </button>
          <button onClick={onExit} className="rounded-2xl bg-white border border-slate-100 text-slate-600 font-semibold text-sm px-5 py-2.5">
            К материалам
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Игровой процесс ---------- */
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Выйти
        </button>
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <span className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} className={`w-4 h-4 ${i < lives ? "text-rose-500 fill-rose-500" : "text-slate-200 fill-slate-200"}`} />
            ))}
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-[#FFA800]" /> {score}
          </span>
        </div>
      </div>

      {/* Дорожка комнат лабиринта */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {Array.from({ length: ROOMS }).map((_, i) => (
          <React.Fragment key={i}>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                i < step
                  ? "bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white"
                  : i === step
                  ? "bg-white border-2 border-fuchsia-400 text-fuchsia-500"
                  : "bg-slate-100 text-slate-300"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
            </div>
            {i < ROOMS - 1 && <div className={`h-0.5 w-4 shrink-0 ${i < step ? "bg-fuchsia-400" : "bg-slate-200"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Комната с задачей */}
      <div
        className={`rounded-3xl p-8 text-center border border-slate-100 transition-colors ${
          feedback === "correct" ? "bg-emerald-50" : feedback === "wrong" ? "bg-rose-50" : "bg-white"
        }`}
      >
        <div className="text-xs font-semibold text-fuchsia-500 mb-3">Комната {step + 1} из {ROOMS}</div>
        <div className="text-lg font-bold text-slate-900 leading-snug">{task.text}</div>
      </div>

      {/* Варианты ответа */}
      <div className="grid grid-cols-2 gap-3">
        {task.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className="rounded-2xl bg-white border border-slate-100 py-4 text-lg font-bold text-slate-700 hover:border-fuchsia-300 hover:shadow-md transition-all"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
