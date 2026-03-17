import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Accelerometer, Pedometer } from "expo-sensors";

// ═══════════════════════════════════════
//  ثوابت النظام
// ═══════════════════════════════════════
const STEP_LENGTH       = 0.75;   // متر
const ALPHA             = 0.8;    // low-pass للجاذبية
const MOVE_THRESHOLD    = 0.12;   // م/ث² عتبة الحركة
const GPS_MAX_ACCURACY  = 15;     // متر — أسوأ دقة GPS مقبولة
const GPS_SPEED_MAX_GAP = 2.5;    // كم/س — أقصى فرق بين GPS والسنسور
const CADENCE_WINDOW_MS = 10000;  // 10 ثوانٍ لحساب الـ cadence
const ACCEL_BUF_SIZE    = 20;     // ~1 ثانية
const STOP_CONFIRM_TICKS = 3;     // ثوانٍ متتالية لتأكيد الوقوف

/* ---------------- FORMAT TIME ---------------- */
function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

/* ---------------- HAVERSINE ---------------- */
function haversine(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3, r = x => x * Math.PI / 180;
  const a = Math.sin(r(lat2-lat1)/2)**2
          + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lon2-lon1)/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* ---------------- SIMPLE KALMAN ---------------- */
function kalman(prev, measurement) {
  return prev == null ? measurement : prev + 0.3 * (measurement - prev);
}

export default function SessionTimer() {
  const [isTracking, setIsTracking] = useState(false);
  const [steps,      setSteps]      = useState(0);
  const [distance,   setDistance]   = useState(0);
  const [time,       setTime]       = useState(0);
  const [isMoving,   setIsMoving]   = useState(false);
  const [fusionMode, setFusionMode] = useState("---");
  const [gpsStatus,  setGpsStatus]  = useState("---");

  // ── Refs ──────────────────────────────────────
  const accelSubRef      = useRef(null);
  const pedometerSubRef  = useRef(null);
  const gpsSubRef        = useRef(null);
  const timerRef         = useRef(null);
  const pulseAnim        = useRef(new Animated.Value(1)).current;
  const loopRef          = useRef(null);

  const startTimeRef     = useRef(null);
  const startStepsRef    = useRef(null);
  const recentStepsRef   = useRef([]);
  const gravityRef       = useRef({ x:0, y:0, z:0 });
  const accelBufRef      = useRef([]);
  const lastGPSRef       = useRef(null);

  // قيم حية للـ Fusion Engine
  const sensorKmhRef     = useRef(0);
  const gpsKmhRef        = useRef(0);
  const gpsAccRef        = useRef(999);
  const isMovingRef      = useRef(false);
  const stopTicksRef     = useRef(0);
  const fusedDistRef     = useRef(0);
  const sensorDistRef    = useRef(0);

  // ── Pulse animation ───────────────────────────
  useEffect(() => {
    if (isMoving) {
      loopRef.current = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue:1.25, duration:400, useNativeDriver:true }),
        Animated.timing(pulseAnim, { toValue:1,    duration:400, useNativeDriver:true }),
      ]));
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      Animated.timing(pulseAnim, { toValue:1, duration:200, useNativeDriver:true }).start();
    }
  }, [isMoving]);

  // ══════════════════════════════════════════════
  //  Fusion Engine — كل ثانية
  // ══════════════════════════════════════════════
  const fusionTick = () => {
    const moving = isMovingRef.current;
    const gpsOk  = gpsAccRef.current <= GPS_MAX_ACCURACY && gpsKmhRef.current > 0;
    const sSpd   = sensorKmhRef.current;
    const gSpd   = gpsKmhRef.current;
    const gap    = Math.abs(sSpd - gSpd);

    if (!moving) {
      stopTicksRef.current++;
      if (stopTicksRef.current >= STOP_CONFIRM_TICKS) {
        setIsMoving(false);
        setFusionMode("واقف");
      }
      return;
    }

    stopTicksRef.current = 0;
    setIsMoving(true);

    let deltaM = 0;
    let mode   = "";

    if (gpsOk && gap <= GPS_SPEED_MAX_GAP) {
      // ✅ Fusion: sensor 65% + GPS 35%
      const fusedKmh = sSpd * 0.65 + gSpd * 0.35;
      deltaM = fusedKmh / 3.6;
      mode   = "🔵 Fusion";
    } else if (gpsOk && gap > GPS_SPEED_MAX_GAP) {
      // ⚠️ GPS متعارض — تجاهله
      deltaM = sSpd / 3.6;
      mode   = "🟡 Sensor (GPS⚠️)";
    } else {
      // 🟢 Sensor فقط
      deltaM = sSpd / 3.6;
      mode   = "🟢 Sensor";
    }

    // ✅ الخطوات تتقدم على الـ fusion → استخدمها مباشرة
    const stepDelta = sensorDistRef.current - fusedDistRef.current;
    if (stepDelta > 0 && stepDelta < 3) {
      fusedDistRef.current = sensorDistRef.current;
    } else {
      fusedDistRef.current += deltaM;
    }

    setDistance(fusedDistRef.current);
    setFusionMode(mode);
  };

  // ══════════════════════════════════════════════
  //  بدء التتبع
  // ══════════════════════════════════════════════
  const startTracking = async () => {
    stopSensors();

    // إعادة تعيين
    setSteps(0); setDistance(0); setTime(0);
    setIsMoving(false); setFusionMode("---"); setGpsStatus("---");
    recentStepsRef.current  = [];
    accelBufRef.current     = [];
    gravityRef.current      = { x:0, y:0, z:0 };
    lastGPSRef.current      = null;
    startStepsRef.current   = null;
    startTimeRef.current    = Date.now();
    fusedDistRef.current    = 0;
    sensorDistRef.current   = 0;
    sensorKmhRef.current    = 0;
    gpsKmhRef.current       = 0;
    gpsAccRef.current       = 999;
    isMovingRef.current     = false;
    stopTicksRef.current    = 0;

    setIsTracking(true);

    // ── 1) Pedometer ──────────────────────────
    try {
      const { status } = await Pedometer.requestPermissionsAsync();
      if (status === "granted") {
        pedometerSubRef.current = Pedometer.watchStepCount(result => {
          if (startStepsRef.current === null) {
            startStepsRef.current = result.steps;
          }
          const sess = Math.max(0, result.steps - startStepsRef.current);
          setSteps(sess);
          sensorDistRef.current = sess * STEP_LENGTH;

          // Cadence → سرعة تقديرية
          const now = Date.now();
          recentStepsRef.current.push(now);
          recentStepsRef.current = recentStepsRef.current.filter(t => now - t < CADENCE_WINDOW_MS);
          const cad = recentStepsRef.current.length * 6;
          sensorKmhRef.current = (cad * STEP_LENGTH / 60) * 3.6;
        });
      }
    } catch(e) { console.log("Pedometer:", e); }

    // ── 2) Accelerometer ──────────────────────
    Accelerometer.setUpdateInterval(50); // 20fps
    accelSubRef.current = Accelerometer.addListener(({ x, y, z }) => {
      const g = gravityRef.current;
      // Low-pass → عزل الجاذبية
      g.x = ALPHA*g.x + (1-ALPHA)*x;
      g.y = ALPHA*g.y + (1-ALPHA)*y;
      g.z = ALPHA*g.z + (1-ALPHA)*z;
      const mag = Math.sqrt((x-g.x)**2 + (y-g.y)**2 + (z-g.z)**2);
      accelBufRef.current.push(mag);
      if (accelBufRef.current.length > ACCEL_BUF_SIZE) accelBufRef.current.shift();
      const avg = accelBufRef.current.reduce((a,b) => a+b, 0) / accelBufRef.current.length;
      isMovingRef.current = avg > MOVE_THRESHOLD;
    });

    // ── 3) GPS (دعم ثانوي + Kalman) ───────────
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setGpsStatus("⏳...");
        gpsSubRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.BestForNavigation, timeInterval:1000, distanceInterval:0 },
          ({ coords: { latitude, longitude, speed, accuracy } }) => {
            if (accuracy > 50) return;

            gpsAccRef.current = accuracy;

            // Kalman على الإحداثيات
            const filtLat = kalman(lastGPSRef.current?.lat, latitude);
            const filtLon = kalman(lastGPSRef.current?.lon, longitude);
            lastGPSRef.current = { lat: filtLat, lon: filtLon };

            if (accuracy <= GPS_MAX_ACCURACY) {
              gpsKmhRef.current = (speed && speed > 0) ? speed * 3.6 : 0;
              setGpsStatus(`✅ ${accuracy.toFixed(0)}م`);
            } else {
              gpsKmhRef.current = 0;
              setGpsStatus(`⚠️ ${accuracy.toFixed(0)}م`);
            }
          }
        );
      } else {
        setGpsStatus("❌ لا صلاحية");
      }
    } catch(e) { setGpsStatus("❌ خطأ"); }

    // ── 4) Timer + Fusion كل ثانية ─────────────
    timerRef.current = setInterval(() => {
      setTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      fusionTick();
    }, 1000);
  };

  // ══════════════════════════════════════════════
  //  إيقاف
  // ══════════════════════════════════════════════
  const stopSensors = () => {
    accelSubRef.current?.remove();     accelSubRef.current    = null;
    pedometerSubRef.current?.remove(); pedometerSubRef.current = null;
    try { gpsSubRef.current?.remove(); } catch(e) {}
    gpsSubRef.current = null;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const stopTracking = () => {
    stopSensors();
    setIsTracking(false);
    setIsMoving(false);
    setFusionMode("---");
  };

  useEffect(() => () => stopSensors(), []);

  // ── لون Fusion ─────────────────────────────────
  const modeColor = fusionMode.includes("🔵") ? "#0da6f2"
                  : fusionMode.includes("🟡") ? "#FFD32A"
                  : fusionMode.includes("🟢") ? "#32FF7E"
                  : "#555";

  /* ---------------- UI ---------------- */
  return (
    <View style={{ marginTop: 20, marginHorizontal: 20 }}>

      {/* TIME */}
      <View style={styles.card}>
        <MaterialIcons name="timer" size={26} color="#0da6f2" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.label}>الوقت</Text>
          <Text style={styles.valueBig}>{formatTime(time)}</Text>
        </View>
      </View>

      {/* STEPS */}
      <View style={styles.card}>
        <MaterialIcons name="directions-walk" size={26} color="#32FF7E" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.label}>الخطوات</Text>
          <Text style={styles.value}>{steps.toLocaleString()}</Text>
        </View>
      </View>

      {/* DISTANCE */}
      <View style={styles.card}>
        <MaterialIcons name="straighten" size={26} color="#FFD32A" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.label}>المسافة</Text>
          <Text style={styles.value}>
            {distance >= 1000
              ? `${(distance / 1000).toFixed(2)} كم`
              : `${distance.toFixed(1)} م`}
          </Text>
        </View>
      </View>

      {/* MOVEMENT */}
      <View style={styles.card}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <MaterialIcons
            name={isMoving ? "directions-run" : "accessibility"}
            size={26}
            color={isMoving ? "#32FF7E" : "#FF3E3E"}
          />
        </Animated.View>
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.label}>الحركة</Text>
          <Text style={{ color: isMoving ? "#32FF7E" : "#FF3E3E", fontSize: 18, fontWeight:"bold" }}>
            {isMoving ? "في الحركة" : "متوقف"}
          </Text>
        </View>
        {/* Fusion badge */}
        <View style={[styles.badge, { borderColor: modeColor + "60", backgroundColor: modeColor + "15" }]}>
          <Text style={[styles.badgeText, { color: modeColor }]}>{fusionMode}</Text>
        </View>
      </View>

      {/* GPS STATUS */}
      <View style={[styles.card, { paddingVertical: 10 }]}>
        <MaterialIcons name="gps-fixed" size={22} color="#0da6f2" />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.label}>GPS</Text>
          <Text style={{ color: "#aaa", fontSize: 13 }}>{gpsStatus}</Text>
        </View>
        <View style={{ alignItems:"flex-end" }}>
          <Text style={styles.label}>Pedometer</Text>
          <Text style={{ color: "#aaa", fontSize: 13 }}>
            {startStepsRef.current !== null ? "✅ يعمل" : isTracking ? "⏳..." : "---"}
          </Text>
        </View>
      </View>

      {/* BUTTONS */}
      {!isTracking ? (
        <TouchableOpacity style={styles.startButton} onPress={startTracking}>
          <MaterialIcons name="play-arrow" size={28} color="white" />
          <Text style={styles.buttonText}>ابدأ التتبع</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.stopButton} onPress={stopTracking}>
          <MaterialIcons name="stop" size={28} color="white" />
          <Text style={styles.buttonText}>إيقاف التتبع</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = {
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    color: "#aaa",
    fontSize: 10,
    letterSpacing: 2,
  },
  valueBig: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  value: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  startButton: {
    backgroundColor: "#32FF7E",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },
  stopButton: {
    backgroundColor: "#FF3E3E",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
};