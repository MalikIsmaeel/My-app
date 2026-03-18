import React, { useState, useEffect, useRef } from "react";
import { View, Text, Animated, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// ✅ لا static import لـ expo-sensors أو expo-location
// كل شيء يأتي من props أو dynamic import

const STEP_LENGTH        = 0.75;
const MOVE_THRESHOLD     = 0.12;
const GPS_MAX_ACCURACY   = 15;
const GPS_SPEED_MAX_GAP  = 2.5;
const CADENCE_WINDOW_MS  = 10000;
const ACCEL_BUF_SIZE     = 20;
const STOP_CONFIRM_TICKS = 3;

function formatTime(s) {
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

export default function SessionTimer({ isRunning, isPaused, gps, linear, onStepsUpdate }) {
  const [steps,      setSteps]      = useState(0);
  const [distance,   setDistance]   = useState(0);
  const [time,       setTime]       = useState(0);
  const [isMoving,   setIsMoving]   = useState(false);
  const [fusionMode, setFusionMode] = useState("---");
  const [gpsDisplay, setGpsDisplay] = useState("---");
  const [pedStatus,  setPedStatus]  = useState("---");

  const pulseAnim       = useRef(new Animated.Value(1)).current;
  const loopRef         = useRef(null);
  const pedometerSubRef = useRef(null);
  const timerRef        = useRef(null);

  const startTimeRef   = useRef(null);
  const pausedTimeRef  = useRef(0);
  const pauseStartRef  = useRef(null);
  const startStepsRef  = useRef(null);
  const recentStepsRef = useRef([]);
  const accelBufRef    = useRef([]);

  const sensorKmhRef  = useRef(0);
  const gpsKmhRef     = useRef(0);
  const gpsAccRef     = useRef(999);
  const isMovingRef   = useRef(false);
  const stopTicksRef  = useRef(0);
  const fusedDistRef  = useRef(0);
  const sensorDistRef = useRef(0);

  // ── Pulse ──────────────────────────────────────
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

  // ── GPS props ──────────────────────────────────
  useEffect(() => {
    if (!gps || !isRunning) return;
    const { speed: spd, accuracy: acc } = gps;
    gpsAccRef.current = acc || 999;
    if (acc && acc <= GPS_MAX_ACCURACY) {
      gpsKmhRef.current = (spd && spd > 0) ? spd * 3.6 : 0;
      setGpsDisplay(`✅ ${acc.toFixed(0)}م`);
    } else {
      gpsKmhRef.current = 0;
      setGpsDisplay(acc ? `⚠️ ${acc.toFixed(0)}م` : "⏳...");
    }
  }, [gps, isRunning]);

  // ── Linear accel props ─────────────────────────
  useEffect(() => {
    if (!linear || !isRunning || isPaused) return;
    const mag = Math.sqrt(linear.x**2 + linear.y**2 + linear.z**2);
    accelBufRef.current.push(mag);
    if (accelBufRef.current.length > ACCEL_BUF_SIZE) accelBufRef.current.shift();
    const avg = accelBufRef.current.reduce((a,b)=>a+b,0) / accelBufRef.current.length;
    isMovingRef.current = avg > MOVE_THRESHOLD;
  }, [linear, isRunning, isPaused]);

  // ── isRunning ──────────────────────────────────
  useEffect(() => {
    if (isRunning) initSession();
    else           stopSession();
  }, [isRunning]);

  // ── isPaused ───────────────────────────────────
  useEffect(() => {
    if (!isRunning) return;
    if (isPaused) {
      pauseStartRef.current = Date.now();
      clearInterval(timerRef.current); timerRef.current = null;
      if (pedometerSubRef.current) {
        pedometerSubRef.current.remove();
        pedometerSubRef.current = null;
      }
      isMovingRef.current = false;
      setIsMoving(false);
      setFusionMode("⏸ مؤقت");
    } else {
      if (pauseStartRef.current) {
        pausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      startPedometer();
      startTimer();
    }
  }, [isPaused]);

  // ── Fusion Engine ──────────────────────────────
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

    let deltaM = 0, mode = "";
    if (gpsOk && gap <= GPS_SPEED_MAX_GAP) {
      deltaM = (sSpd * 0.65 + gSpd * 0.35) / 3.6;
      mode   = "🔵 Fusion";
    } else if (gpsOk) {
      deltaM = sSpd / 3.6;
      mode   = "🟡 Sensor (GPS⚠️)";
    } else {
      deltaM = sSpd / 3.6;
      mode   = "🟢 Sensor";
    }

    const stepDelta = sensorDistRef.current - fusedDistRef.current;
    if (stepDelta > 0 && stepDelta < 3) fusedDistRef.current = sensorDistRef.current;
    else fusedDistRef.current += deltaM;

    setDistance(fusedDistRef.current);
    setFusionMode(mode);
  };

  // ── Init ───────────────────────────────────────
  const initSession = async () => {
    setSteps(0); setDistance(0); setTime(0);
    setIsMoving(false); setFusionMode("---");
    setGpsDisplay("---"); setPedStatus("---");
    startStepsRef.current  = null;
    fusedDistRef.current   = 0;  sensorDistRef.current = 0;
    sensorKmhRef.current   = 0;  gpsKmhRef.current     = 0;
    gpsAccRef.current      = 999; isMovingRef.current   = false;
    stopTicksRef.current   = 0;  pausedTimeRef.current  = 0;
    pauseStartRef.current  = null;
    recentStepsRef.current = [];
    accelBufRef.current    = [];
    startTimeRef.current   = Date.now();

    await startPedometer();
    startTimer();
  };

  // ── Pedometer — dynamic import (web-safe) ──────
  const startPedometer = async () => {
    if (Platform.OS === "web") {
      setPedStatus("⚠️ Web Mode");
      return;
    }
    try {
      const { Pedometer } = await import("expo-sensors");
      const { status } = await Pedometer.requestPermissionsAsync();
      if (status !== "granted") { setPedStatus("❌ لا صلاحية"); return; }
      setPedStatus("⏳...");
      pedometerSubRef.current = Pedometer.watchStepCount(result => {
        if (startStepsRef.current === null) {
          startStepsRef.current = result.steps;
          setPedStatus("✅ يعمل");
        }
        const sess = Math.max(0, result.steps - startStepsRef.current);
        setSteps(sess);
        sensorDistRef.current = sess * STEP_LENGTH;
        onStepsUpdate?.(sess);

        const now = Date.now();
        recentStepsRef.current.push(now);
        recentStepsRef.current = recentStepsRef.current.filter(t => now - t < CADENCE_WINDOW_MS);
        sensorKmhRef.current = (recentStepsRef.current.length * 6 * STEP_LENGTH / 60) * 3.6;
      });
    } catch(e) {
      setPedStatus("❌ خطأ");
      console.log("Pedometer:", e);
    }
  };

  // ── Timer ──────────────────────────────────────
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current;
      setTime(Math.floor(elapsed / 1000));
      fusionTick();

      // على الويب: خطوات من المسافة
      if (Platform.OS === "web") {
        const est = Math.floor(fusedDistRef.current / STEP_LENGTH);
        setSteps(est);
        onStepsUpdate?.(est);
      }
    }, 1000);
  };

  const stopSession = () => {
    if (pedometerSubRef.current) {
      pedometerSubRef.current.remove();
      pedometerSubRef.current = null;
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setSteps(0); setDistance(0); setTime(0);
    setIsMoving(false); setFusionMode("---");
    setGpsDisplay("---"); setPedStatus("---");
    startStepsRef.current = null;
    fusedDistRef.current  = 0;
    sensorDistRef.current = 0;
  };

  useEffect(() => () => {
    if (pedometerSubRef.current) pedometerSubRef.current.remove();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const modeColor = fusionMode.includes("🔵") ? "#0da6f2"
                  : fusionMode.includes("🟡") ? "#FFD32A"
                  : fusionMode.includes("🟢") ? "#32FF7E"
                  : "#555";

  return (
    <View style={{ marginTop: 20, marginHorizontal: 20 }}>

      <View style={styles.card}>
        <MaterialIcons name="timer" size={26} color="#0da6f2" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.label}>SESSION TIME</Text>
          <Text style={styles.valueBig}>{formatTime(time)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <MaterialIcons name="directions-walk" size={26} color="#32FF7E" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.label}>STEPS</Text>
          <Text style={styles.value}>{steps.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <MaterialIcons name="straighten" size={26} color="#FFD32A" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.label}>DISTANCE</Text>
          <Text style={styles.value}>
            {distance >= 1000
              ? `${(distance/1000).toFixed(2)} كم`
              : `${distance.toFixed(1)} م`}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <MaterialIcons
            name={isMoving ? "directions-run" : "accessibility"}
            size={26}
            color={isMoving ? "#32FF7E" : "#FF3E3E"}
          />
        </Animated.View>
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.label}>MOVEMENT</Text>
          <Text style={{ color: isMoving ? "#32FF7E" : "#FF3E3E", fontSize: 18, fontWeight: "bold" }}>
            {isMoving ? "في الحركة" : "متوقف"}
          </Text>
        </View>
        <View style={[styles.badge, { borderColor: modeColor+"60", backgroundColor: modeColor+"15" }]}>
          <Text style={[styles.badgeText, { color: modeColor }]}>{fusionMode}</Text>
        </View>
      </View>

      <View style={[styles.card, { paddingVertical: 10 }]}>
        <MaterialIcons name="gps-fixed" size={22} color="#0da6f2" />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.label}>GPS</Text>
          <Text style={{ color: "#aaa", fontSize: 13 }}>{gpsDisplay}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.label}>PEDOMETER</Text>
          <Text style={{ color: "#aaa", fontSize: 13 }}>{pedStatus}</Text>
        </View>
      </View>

    </View>
  );
}

const styles = {
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 15, borderRadius: 12, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    flexDirection: "row", alignItems: "center", marginBottom: 12,
  },
  label:     { color: "#aaa", fontSize: 10, letterSpacing: 2 },
  valueBig:  { color: "white", fontSize: 28, fontWeight: "bold" },
  value:     { color: "white", fontSize: 22, fontWeight: "bold" },
  badge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: "600" },
};