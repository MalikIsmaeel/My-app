/* ============================================================
   ProAnalytics — Full Motion Analysis Engine
   Using: Accelerometer + Linear Acceleration + Gyroscope
   ============================================================ */

/* ---------------- TIME FORMAT ---------------- */
export function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return (
    String(hrs).padStart(2, "0") +
    ":" +
    String(mins).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}

/* ---------------- MOVEMENT DETECTION ---------------- */
function isMoving(accel, speed) {
  if (!accel) return false;

  const a = Math.sqrt(accel.x**2 + accel.y**2 + accel.z**2);

  if (speed > 0.3) return true;
  if (Math.abs(a - 9.8) > 0.3) return true;

  return false;
}

function filterMovingFrames(frames) {
  return frames.filter(f => isMoving(f.accel, f.gps?.speed));
}

/* ---------------- WINDOWING ---------------- */
function createWindows(frames, windowSize = 1.0, step = 0.5) {
  const windows = [];
  let start = frames[0].time;

  while (true) {
    const end = start + windowSize * 1000;
    const w = frames.filter(f => f.time >= start && f.time < end);

    if (w.length === 0) break;

    windows.push(w);
    start += step * 1000;
  }

  return windows;
}

/* ============================================================
   1) MOBILITY
   ============================================================ */
function calcMobility(window) {
  const la = window.map(f =>
    Math.sqrt(f.linear.x**2 + f.linear.y**2 + f.linear.z**2)
  );

  const avg = la.reduce((a,b)=>a+b,0) / la.length;
  return Math.min(100, (avg / 4) * 100);
}

/* ============================================================
   2) STABILITY
   ============================================================ */
function calcStability(window) {
  const aTotals = window.map(f =>
    Math.sqrt(f.accel.x**2 + f.accel.y**2 + f.accel.z**2)
  );

  const mean = aTotals.reduce((a,b)=>a+b,0) / aTotals.length;
  const variance = aTotals.reduce((a,b)=>a+(b-mean)**2,0) / aTotals.length;
  const sigma = Math.sqrt(variance);

  return Math.max(0, 100 * (1 - sigma / 3));
}

/* ============================================================
   3) BALANCE
   ============================================================ */
function calcBalance(window) {
  const diffs = window.map(f =>
    Math.abs(f.accel.x - f.accel.y) +
    Math.abs(f.accel.y - f.accel.z) +
    Math.abs(f.accel.z - f.accel.x)
  );

  const avg = diffs.reduce((a,b)=>a+b,0) / diffs.length;
  return Math.max(0, 100 * (1 - avg / 6));
}

/* ============================================================
   4) SMOOTHNESS
   ============================================================ */
function calcSmoothness(window) {
  const aTotals = window.map(f =>
    Math.sqrt(f.accel.x**2 + f.accel.y**2 + f.accel.z**2)
  );

  const jerks = [];
  for (let i=1; i<aTotals.length; i++) {
    const dt = (window[i].time - window[i-1].time) / 1000;
    jerks.push((aTotals[i] - aTotals[i-1]) / dt);
  }

  const avg = jerks.reduce((a,b)=>a+Math.abs(b),0) / jerks.length;
  return Math.max(0, 100 * (1 - avg / 10));
}

/* ============================================================
   5) CONTROL
   ============================================================ */
function calcControl(window) {
  const gTotals = window.map(f =>
    Math.sqrt(f.gyro.x**2 + f.gyro.y**2 + f.gyro.z**2)
  );

  const mean = gTotals.reduce((a,b)=>a+b,0) / gTotals.length;
  const variance = gTotals.reduce((a,b)=>a+(b-mean)**2,0) / gTotals.length;
  const sigma = Math.sqrt(variance);

  return Math.max(0, 100 * (1 - sigma / 5));
}

/* ============================================================
   6) LOAD
   ============================================================ */
function calcLoad(window) {
  let load = 0;

  for (let i=1; i<window.length; i++) {
    const a = Math.sqrt(
      window[i].accel.x**2 +
      window[i].accel.y**2 +
      window[i].accel.z**2
    );

    const dt = (window[i].time - window[i-1].time) / 1000;
    load += a * dt;
  }

  return Math.min(100, (load / 500) * 100);
}

/* ============================================================
   STEPS
   ============================================================ */
function calcSteps(frames) {
  let steps = 0;
  let lastPeak = 0;

  frames.forEach(f => {
    const a = Math.sqrt(f.accel.x**2 + f.accel.y**2 + f.accel.z**2);
    const dynamic = Math.abs(a - 9.8);

    if (dynamic > 1.2) {
      if (f.time - lastPeak > 250) {
        steps++;
        lastPeak = f.time;
      }
    }
  });

  return steps;
}

/* ============================================================
   MAIN ENGINE
   ============================================================ */
export function computeAnalytics(frames) {
  const moving = filterMovingFrames(frames);
  if (!moving.length) {
    return {
      windows: [],
      steps: 0,
      duration: 0,
      durationFormatted: "00:00:00"
    };
  }

  const windows = createWindows(moving);

  const results = windows.map(w => ({
    mobility: calcMobility(w),
    stability: calcStability(w),
    balance: calcBalance(w),
    smoothness: calcSmoothness(w),
    control: calcControl(w),
    load: calcLoad(w)
  }));

  return {
    windows: results,
    steps: calcSteps(moving),
    duration: moving.length * 0.02,
    durationFormatted: formatDuration(moving.length * 0.02)
  };
}
