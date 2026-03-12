/* ---------------- Haversine ---------------- */
function haversine(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

  const R = 6371e3;
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/* ---------------- GPS ONLY ---------------- */

export function calculateTotalDistance(frames) {
  if (!frames || frames.length < 2) return 0;

  let total = 0;
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1].gps;
    const curr = frames[i].gps;

    if (!prev || !curr) continue;
    if (!prev.lat || !curr.lat) continue;

    total += haversine(prev.lat, prev.lon, curr.lat, curr.lon);
  }
  return total || 0;
}

export function calculateMovement(frames) {
  if (!frames || frames.length < 2) return 0;

  const first = frames[0].gps;
  const last = frames[frames.length - 1].gps;

  if (!first || !last) return 0;
  if (!first.lat || !last.lat) return 0;

  return haversine(first.lat, first.lon, last.lat, last.lon) || 0;
}

export function calculateAverageSpeed(frames) {
  if (!frames || !frames.length) return 0;

  let sum = 0;
  let count = 0;

  frames.forEach((f) => {
    if (f.gps?.speed !== null && f.gps?.speed !== undefined) {
      sum += f.gps.speed;
      count++;
    }
  });

  return count ? sum / count : 0;
}

export function getInstantSpeed(frames) {
  if (!frames || !frames.length) return 0;
  return frames[frames.length - 1]?.gps?.speed || 0;
}

/* ---------------- IMU ONLY ---------------- */

export function calculateStability(frames) {
  if (!frames.length) return 0;

  const aTotals = frames.map(f =>
    Math.sqrt(f.accel.x**2 + f.accel.y**2 + f.accel.z**2)
  );

  const mean = aTotals.reduce((a,b)=>a+b,0) / aTotals.length;
  const variance = aTotals.reduce((a,b)=>a + (b-mean)**2, 0) / aTotals.length;
  const sigma = Math.sqrt(variance);

  return 99 * Math.exp(-sigma / 1.2) || 0;
}

export function calculateSmoothness(frames, dt=0.02) {
  if (frames.length < 2) return 0;

  const aTotals = frames.map(f =>
    Math.sqrt(f.accel.x**2 + f.accel.y**2 + f.accel.z**2)
  );

  const jerks = [];
  for (let i=1; i<aTotals.length; i++) {
    jerks.push((aTotals[i] - aTotals[i-1]) / dt);
  }

  const rms = Math.sqrt(jerks.reduce((a,b)=>a+b*b,0) / jerks.length);

  return 99 * Math.exp(-rms / 1.5) || 0;
}

export function calculateBalance(frames) {
  if (!frames.length) return 0;

  const rolls = frames.map(f => Math.atan(f.accel.y / f.accel.z));
  const pitch = frames.map(f => Math.atan(-f.accel.x / Math.sqrt(f.accel.y**2 + f.accel.z**2)));

  const std = arr => {
    const m = arr.reduce((a,b)=>a+b,0) / arr.length;
    return Math.sqrt(arr.reduce((a,b)=>a+(b-m)**2,0) / arr.length);
  };

  const sigmaRoll = std(rolls);
  const sigmaPitch = std(pitch);

  return 99 * Math.exp(-(sigmaRoll + sigmaPitch) / 0.8) || 0;
}

export function calculateControl(frames) {
  if (!frames.length) return 0;

  const aTotals = frames.map(f =>
    Math.sqrt(f.accel.x**2 + f.accel.y**2 + f.accel.z**2)
  );

  const gTotals = frames.map(f =>
    Math.sqrt(f.gyro.x**2 + f.gyro.y**2 + f.gyro.z**2)
  );

  const meanA = aTotals.reduce((a,b)=>a+b,0) / aTotals.length;
  const meanG = gTotals.reduce((a,b)=>a+b,0) / gTotals.length;

  let num = 0, denA = 0, denG = 0;

  for (let i=0; i<aTotals.length; i++) {
    num += (aTotals[i] - meanA) * (gTotals[i] - meanG);
    denA += (aTotals[i] - meanA)**2;
    denG += (gTotals[i] - meanG)**2;
  }

  const r = num / Math.sqrt(denA * denG);
  return 99 * Math.abs(r) || 0;
}

export function calculateMobility(frames, dt=0.02) {
  if (!frames.length) return 0;

  let v = 0;
  const velocities = [];

  frames.forEach(f => {
    const aTotal = Math.sqrt(f.accel.x**2 + f.accel.y**2 + f.accel.z**2);
    v += aTotal * dt;
    velocities.push(Math.abs(v));
  });

  const avgV = velocities.reduce((a,b)=>a+b,0) / velocities.length;

  return 99 * (avgV / 3) || 0;
}

export function calculateLoad(frames, dt=0.02) {
  if (!frames.length) return 0;

  let load = 0;

  frames.forEach(f => {
    const aTotal = Math.sqrt(f.accel.x**2 + f.accel.y**2 + f.accel.z**2);
    load += aTotal**2 * dt;
  });

  return 99 * (load / 500) || 0;
}
