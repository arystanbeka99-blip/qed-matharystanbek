import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Anchor, Clock, Trophy, RotateCcw, Skull } from "lucide-react";

const LEVELS = {
  easy: { label: "Юнга", range: [1, 5], time: 45 },
  medium: { label: "Матрос", range: [2, 9], time: 40 },
  hard: { label: "Капитан", range: [6, 12], time: 35 },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion(range) {
  const a = randInt(range[0], range[1]);
  const b = randInt(range[0], range[1]);
  const correct = a * b;

  const options = new Set([correct]);
  while (options.size < 4) {
    const delta = randInt(-10, 10) || 1;
    const fake = correct + delta;
    if (fake > 0) options.add(fake);
  }

  return {
    a,
    b,
    correct,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
}

export default function PirateGame({ onExit }) {
  const [level, setLevel] = useState(null);
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef(null);

  const startLevel = (key) => {
    const cfg = LEVELS[key];
    setLevel(key);
    setScore(0);
    setStreak(0);
    setTimeLeft(cfg.time);
    setGameOver(false);
    setQuestion(generateQuestion(cfg.range));
  };

  useEffect(() => {
    if (!level || gameOver) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [level, gameOver]);

  const handleAnswer = (value) => {
    if (feedback) return; // защита от повторного клика во время анимации
    const isCorrect = value === question.correct;
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore((s) => s + 10 + streak * 2);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setFeedback(null);
      setQuestion(generateQuestion(LEVELS[level].range));
    }, 500);
  };

  /* ---------- Экран выбора уровня ---------- */
  if (!level) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={onExit} className="flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад к материалам
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-semibold rounded-2xl px-3 py-1.5">
            <Anchor className="w-3.5 h-3.5" /> Игра · Умножение
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Пиратские множители</h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Выберите звание — от юнги до капитана — и решайте примеры на скорость.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {Object.entries(LEVELS).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => startLevel(key)}
              className="rounded-3xl bg-white border border-slate-100 p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md mb-3">
                <Anchor className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-slate-800 text-sm">{cfg.label}</div>
              <div className="text-xs text-slate-400 mt-1">
                множители {cfg.range[0]}–{cfg.range[1]}
              </div>
              <div className="text-xs text-slate-400">{cfg.time} секунд</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Экран окончания игры ---------- */
  if (gameOver) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-10">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-[#FF6B4A] to-[#FFA800] flex items-center justify-center shadow-lg">
          <Skull className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Время вышло!</h2>
          <p className="text-slate-500 text-sm mt-1">Звание: {LEVELS[level].label}</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-100 p-6 flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-[#FFA800]" />
          <span className="text-2xl font-bold text-slate-900">{score}</span>
          <span className="text-sm text-slate-400 font-medium">очков</span>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => startLevel(level)}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold text-sm px-5 py-2.5"
          >
            <RotateCcw className="w-4 h-4" /> Ещё раз
          </button>
          <button
            onClick={() => setLevel(null)}
            className="rounded-2xl bg-white border border-slate-100 text-slate-600 font-semibold text-sm px-5 py-2.5"
          >
            Другой уровень
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Экран самой игры ---------- */
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => setLevel(null)} className="flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Сменить уровень
        </button>
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-indigo-500" /> {timeLeft}с
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-[#FFA800]" /> {score}
          </span>
        </div>
      </div>

      {/* Полоса времени */}
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / LEVELS[level].time) * 100}%` }}
        />
      </div>

      {/* Пример */}
      <div
        className={`rounded-3xl p-10 text-center transition-colors ${
          feedback === "correct"
            ? "bg-emerald-50"
            : feedback === "wrong"
            ? "bg-rose-50"
            : "bg-white"
        } border border-slate-100`}
      >
        {streak > 2 && (
          <div className="inline-flex items-center gap-1 text-xs font-bold text-[#FFA800] mb-3">
            🔥 Серия: {streak}
          </div>
        )}
        <div className="text-4xl font-bold text-slate-900 tracking-tight">
          {question.a} × {question.b}
        </div>
      </div>

      {/* Варианты ответа */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className="rounded-2xl bg-white border border-slate-100 py-5 text-xl font-bold text-slate-700 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
