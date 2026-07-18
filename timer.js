(function () {
  "use strict";

  const WORK_MIN = 20;
  const WORK_MAX = 120;

  const workInput = document.getElementById("work-input");
  const breakInput = document.getElementById("break-input");
  const breakHint = document.getElementById("break-hint");
  const modeLabel = document.getElementById("mode-label");
  const timeDisplay = document.getElementById("time-display");
  const progressCircle = document.getElementById("progress-circle");
  const startBtn = document.getElementById("start-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const resetBtn = document.getElementById("reset-btn");
  const sessionCountEl = document.getElementById("session-count");

  const CIRCUMFERENCE = 2 * Math.PI * 54;

  let mode = "work";
  let secondsRemaining = 0;
  let totalSeconds = 0;
  let intervalId = null;
  let sessionsCompleted = 0;

  function getWorkMinutes() {
    return clamp(parseInt(workInput.value, 10) || WORK_MIN, WORK_MIN, WORK_MAX);
  }

  function getMaxBreakMinutes() {
    return Math.floor(getWorkMinutes() / 2);
  }

  function getBreakMinutes() {
    const maxBreak = getMaxBreakMinutes();
    return clamp(parseInt(breakInput.value, 10) || 1, 1, maxBreak);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function formatTime(totalSecs) {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function updateBreakConstraints() {
    const maxBreak = getMaxBreakMinutes();
    breakInput.max = maxBreak;
    breakHint.textContent = `Max ${maxBreak} min (half of work)`;

    const currentBreak = parseInt(breakInput.value, 10);
    if (currentBreak > maxBreak) {
      breakInput.value = maxBreak;
      breakInput.classList.add("invalid");
    } else {
      breakInput.classList.remove("invalid");
    }
  }

  function validateWorkInput() {
    const value = parseInt(workInput.value, 10);
    if (isNaN(value) || value < WORK_MIN || value > WORK_MAX) {
      workInput.classList.add("invalid");
      return false;
    }
    workInput.classList.remove("invalid");
    return true;
  }

  function validateBreakInput() {
    const value = parseInt(breakInput.value, 10);
    const maxBreak = getMaxBreakMinutes();
    if (isNaN(value) || value < 1 || value > maxBreak) {
      breakInput.classList.add("invalid");
      return false;
    }
    breakInput.classList.remove("invalid");
    return true;
  }

  function setInputsEnabled(enabled) {
    workInput.disabled = !enabled;
    breakInput.disabled = !enabled;
  }

  function updateDisplay() {
    timeDisplay.textContent = formatTime(secondsRemaining);

    const progress = totalSeconds > 0 ? secondsRemaining / totalSeconds : 0;
    progressCircle.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);

    const isBreak = mode === "break";
    modeLabel.textContent = isBreak ? "Break" : "Work";
    modeLabel.classList.toggle("break", isBreak);
    progressCircle.classList.toggle("break", isBreak);
  }

  function loadDurationForMode() {
    const minutes = mode === "work" ? getWorkMinutes() : getBreakMinutes();
    totalSeconds = minutes * 60;
    secondsRemaining = totalSeconds;
  }

  function onTimerComplete() {
    clearInterval(intervalId);
    intervalId = null;

    if (mode === "work") {
      sessionsCompleted += 1;
      sessionCountEl.textContent = sessionsCompleted;
      mode = "break";
    } else {
      mode = "work";
    }

    loadDurationForMode();
    updateDisplay();
    setInputsEnabled(true);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  function tick() {
    if (secondsRemaining <= 0) {
      onTimerComplete();
      return;
    }
    secondsRemaining -= 1;
    updateDisplay();

    if (secondsRemaining <= 0) {
      onTimerComplete();
    }
  }

  function start() {
    if (!validateWorkInput() || !validateBreakInput()) return;

    if (intervalId === null) {
      if (secondsRemaining <= 0) {
        loadDurationForMode();
      }
      intervalId = setInterval(tick, 1000);
      setInputsEnabled(false);
      startBtn.disabled = true;
      pauseBtn.disabled = false;
    }
  }

  function pause() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
    }
  }

  function reset() {
    pause();
    mode = "work";
    loadDurationForMode();
    updateDisplay();
    setInputsEnabled(true);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  function onWorkInputChange() {
    validateWorkInput();
    updateBreakConstraints();
    validateBreakInput();

    if (intervalId === null) {
      if (mode === "work") {
        loadDurationForMode();
        updateDisplay();
      }
    }
  }

  function onBreakInputChange() {
    validateBreakInput();

    if (intervalId === null && mode === "break") {
      loadDurationForMode();
      updateDisplay();
    }
  }

  progressCircle.style.strokeDasharray = CIRCUMFERENCE;

  workInput.addEventListener("input", onWorkInputChange);
  workInput.addEventListener("change", onWorkInputChange);
  breakInput.addEventListener("input", onBreakInputChange);
  breakInput.addEventListener("change", onBreakInputChange);
  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", pause);
  resetBtn.addEventListener("click", reset);

  updateBreakConstraints();
  loadDurationForMode();
  updateDisplay();
})();
