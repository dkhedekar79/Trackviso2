import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Clock } from "lucide-react";
import { useTimer } from "../context/TimerContext";

const pad2 = (n) => String(n).padStart(2, "0");

const FloatingStudyTimer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isRunning,
    mode,
    secondsLeft,
    stopwatchSeconds,
    isPomodoroBreak,
    subjectName,
    getActualElapsedTime,
  } = useTimer();

  const label = useMemo(() => {
    if (mode === "pomodoro") {
      return isPomodoroBreak ? "Break" : "Focus";
    }
    if (mode === "custom") {
      return "Timer";
    }
    return "Stopwatch";
  }, [mode, isPomodoroBreak]);

  const displayTime = useMemo(() => {
    if (mode === "stopwatch") {
      const elapsed = getActualElapsedTime?.() ?? stopwatchSeconds;
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      return `${pad2(m)}:${pad2(s)}`;
    }
    const rem = Math.max(0, secondsLeft);
    const m = Math.floor(rem / 60);
    const s = rem % 60;
    return `${pad2(m)}:${pad2(s)}`;
  }, [mode, secondsLeft, stopwatchSeconds, getActualElapsedTime]);

  if (!isRunning || location.pathname === "/study") {
    return null;
  }

  const goToStudy = () => {
    const q = subjectName
      ? `?subject=${encodeURIComponent(subjectName)}`
      : "";
    navigate(`/study${q}`);
  };

  return (
    <button
      type="button"
      onClick={goToStudy}
      className="fixed bottom-4 right-4 z-[120] flex items-center gap-3 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-slate-900/95 to-purple-950/95 px-4 py-3 shadow-xl shadow-purple-900/40 backdrop-blur-xl transition hover:border-purple-400/60 hover:shadow-purple-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
      aria-label="Study timer running — return to study"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600/30 text-purple-200">
        <Clock className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0 text-left">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-purple-300/90">
          {label}
          {subjectName ? ` · ${subjectName}` : ""}
        </div>
        <div className="font-mono text-xl font-bold tabular-nums text-white">
          {displayTime}
        </div>
      </div>
    </button>
  );
};

export default FloatingStudyTimer;
