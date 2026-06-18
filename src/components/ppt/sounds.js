/* Web Audio bilan sintez qilingan ovozlar — fayl kerak emas */
let ctx;
const getCtx = () => {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

const blip = (freq, start, dur, type = 'sine', gain = 0.2) => {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g); g.connect(c.destination);
  o.start(start); o.stop(start + dur + 0.02);
};

/* To'g'ri javob — ko'tariluvchi yoqimli ohang */
export const playCorrect = () => {
  const c = getCtx(); if (!c) return;
  const t = c.currentTime;
  blip(660, t,        0.12, 'triangle', 0.25);
  blip(880, t + 0.10, 0.14, 'triangle', 0.25);
  blip(1320, t + 0.20, 0.20, 'triangle', 0.22);
};

/* Noto'g'ri javob — past tushuvchi buzz */
export const playWrong = () => {
  const c = getCtx(); if (!c) return;
  const t = c.currentTime;
  blip(220, t,        0.22, 'sawtooth', 0.18);
  blip(160, t + 0.12, 0.30, 'sawtooth', 0.18);
};

/* Baraban aylanishi — sekinlashuvchi "tik-tik" */
export const playSpin = (duration = 3.2) => {
  const c = getCtx(); if (!c) return;
  const t0 = c.currentTime;
  let t = 0;
  let gap = 0.045;
  while (t < duration) {
    blip(900, t0 + t, 0.025, 'square', 0.1);
    t += gap;
    gap *= 1.085;   // sekinlashadi
  }
};

/* Sanoq "tik" (3,2,1) */
export const playTick = () => {
  const c = getCtx(); if (!c) return;
  blip(520, c.currentTime, 0.14, 'square', 0.18);
};

/* Boshlanish "go!" */
export const playGo = () => {
  const c = getCtx(); if (!c) return;
  const t = c.currentTime;
  blip(784, t, 0.18, 'triangle', 0.28);
  blip(1175, t + 0.12, 0.28, 'triangle', 0.26);
};

/* G'alaba */
export const playWin = () => {
  const c = getCtx(); if (!c) return;
  const t = c.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => blip(f, t + i * 0.12, 0.2, 'triangle', 0.24));
};
