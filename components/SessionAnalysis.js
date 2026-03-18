/**
 * analytics.js
 * ─────────────────────────────────────────────────────────────
 * إصلاحات:
 *   ✅ computeAnalytics يُعيد steps من sessionData
 *   ✅ duration محسوب من أول وآخر frame (وليس frames.length * ثابت)
 *   ✅ حماية من frames فارغة أو ناقصة
 * ─────────────────────────────────────────────────────────────
 */

/* ---------------- TIME FORMAT ---------------- */
export function formatDuration(seconds) {
  const hrs  = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return (
    String(hrs).padStart(2,"0")  + ":" +
    String(mins).padStart(2,"0") + ":" +
    String(secs).padStart(2,"0")
  );
}

/* ---------------- WINDOWING ---------------- */
function createWindows(frames, windowSize = 1.0, step = 0.5) {
  if (frames.length === 0) return [];
  const windows = [];
  let start = frames[0].time;
  const end  = frames[frames.length - 1].time;

  while (start < end) {
    const wEnd = start + windowSize * 1000;
    const w = frames.filter(f => f.time >= start && f.time < wEnd);
    if (w.length > 0) windows.push(w);
    start += step * 1000;
  }
  return windows;
}

/* ── الدوال الستة ──────────────────────────── */

function calcMobility(w) {
  const vals = w.map(f => Math.sqrt(f.accel.x**2 + f.accel.y**2 + f.accel.z**2));
  const avg  = vals.reduce((a,b)=>a+b,0) / vals.length;
  return Math.min(100, (avg / 4) * 100);
}

function calcStability(w) {
  const vals   = w.map(f => Math.sqrt(f.accel.x**2 + f.accel.y**2 + f.accel.z**2));
  const mean   = vals.reduce((a,b)=>a+b,0) / vals.length;
  const sigma  = Math.sqrt(vals.reduce((a,b)=>a+(b-mean)**2,0) / vals.length);
  return Math.max(0, 100 * (1 - sigma / 3));
}

function calcBalance(w) {
  const diffs = w.map(f =>
    Math.abs(f.accel.x - f.accel.y) +
    Math.abs(f.accel.y - f.accel.z) +
    Math.abs(f.accel.z - f.accel.x)
  );
  const avg = diffs.reduce((a,b)=>a+b,0) / diffs.length;
  return Math.max(0, 100 * (1 - avg / 6));
}

function calcSmoothness(w) {
  const vals  = w.map(f => Math.sqrt(f.accel.x**2 + f.accel.y**2 + f.accel.z**2));
  const jerks = [];
  for (let i = 1; i < vals.length; i++) {
    const dt = (w[i].time - w[i-1].time) / 1000 || 0.05;
    jerks.push(Math.abs((vals[i] - vals[i-1]) / dt));
  }
  if (jerks.length === 0) return 100;
  const avg = jerks.reduce((a,b)=>a+b,0) / jerks.length;
  return Math.max(0, 100 * (1 - avg / 10));
}

function calcControl(w) {
  const vals  = w.map(f => Math.sqrt(f.gyro.x**2 + f.gyro.y**2 + f.gyro.z**2));
  const mean  = vals.reduce((a,b)=>a+b,0) / vals.length;
  const sigma = Math.sqrt(vals.reduce((a,b)=>a+(b-mean)**2,0) / vals.length);
  return Math.max(0, 100 * (1 - sigma / 5));
}

function calcLoad(w) {
  let load = 0;
  for (let i = 1; i < w.length; i++) {
    const a  = Math.sqrt(w[i].accel.x**2 + w[i].accel.y**2 + w[i].accel.z**2);
    const dt = (w[i].time - w[i-1].time) / 1000 || 0.05;
    load += a * dt;
  }
  return Math.min(100, (load / 500) * 100);
}

/* ══════════════════════════════════════════════
   MAIN ENGINE
   ══════════════════════════════════════════════ */
export function computeAnalytics(frames, sessionSteps = 0) {
  if (!frames || frames.length === 0) {
    return {
      windows:           [],
      steps:             sessionSteps,
      duration:          0,
      durationFormatted: "00:00:00",
    };
  }

  // ✅ Duration من أول وآخر frame
  const duration = (frames[frames.length - 1].time - frames[0].time) / 1000;

  const windows = createWindows(frames);

  const results = windows.map(w => ({
    mobility:   calcMobility(w),
    stability:  calcStability(w),
    balance:    calcBalance(w),
    smoothness: calcSmoothness(w),
    control:    calcControl(w),
    load:       calcLoad(w),
  }));

  return {
    windows:           results,
    steps:             sessionSteps,   // ✅ من SessionTimer عبر sessionData
    duration,
    durationFormatted: formatDuration(duration),
  };
}