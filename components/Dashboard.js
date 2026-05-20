import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";

import Header               from "./Dashboard/Header";
import SessionTimer         from "./Dashboard/SessionTimer";
import AccelerometerSection from "./Dashboard/AccelerometerSection";
import GyroscopeSection     from "./Dashboard/GyroscopeSection";
import StatsSection         from "./Dashboard/StatsSection";
import BottomNav            from "./Dashboard/BottomNav";
import BottomButtons        from "./Dashboard/BottomButtons";
import LoadingOverlay       from "./Dashboard/LoadingOverlay";

import useSensors            from "./Dashboard/useSensors";
import useGPS                from "./Dashboard/useGPS";
import useExternalMotionLink from "./Dashboard/useExternalMotionLink";
import useBackgroundSession  from "./Dashboard/useBackgroundSession"; // ✅ الجديد

export default function Dashboard({ navigation }) {

  // ── حساسات الجهاز ─────────────────────────────────
  const { accel, linear, gyro } = useSensors();

  // ── GPS ───────────────────────────────────────────
  const { lat, lon, speed, accuracy, status, startGPS, stopGPS } = useGPS();

  // ── API / WebSocket ────────────────────────────────
  const { extAccel, extGyro, apiOnline, wsOnline } = useExternalMotionLink(
    "http://192.168.1.50:5000/motion",
    "ws://192.168.1.50:5000/ws"
  );

  const finalAccel = extAccel || accel;
  const finalGyro  = extGyro  || gyro;

  // ── State ──────────────────────────────────────────
  const [isRunning,  setIsRunning]  = useState(false);
  const [isPaused,   setIsPaused]   = useState(false);
  const [frames,     setFrames]     = useState([]);
  const [isMoving,   setIsMoving]   = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Processing session...");

  const framesRef       = useRef([]);
  const sessionStepsRef = useRef(0);

  // ── Background Session ✅ ──────────────────────────
  const { clearStoredFrames, markSessionInactive } = useBackgroundSession({
    isRunning,
    isPaused,
    // لما الـ app يرجع من الـ background، ندمج الـ frames المحفوظة
    onFramesRestored: (bgFrames) => {
      setFrames(prev => {
        const existingTimes = new Set(prev.map(f => f.time));
        const unique = bgFrames.filter(f => !existingTimes.has(f.time));
        const merged = [...prev, ...unique].sort((a, b) => a.time - b.time);
        const sliced = merged.slice(-2000);
        framesRef.current = sliced;
        return sliced;
      });
    },
  });

  // ── كشف الحركة ────────────────────────────────────
  const motionSource = extAccel || linear;

  useEffect(() => {
    if (!motionSource) return;
    const mag = Math.sqrt(
      motionSource.x ** 2 +
      motionSource.y ** 2 +
      motionSource.z ** 2
    );
    setIsMoving(mag > 0.12);
  }, [motionSource]);

  // ── FRAME CAPTURE (Foreground) ─────────────────────
  useEffect(() => {
    let interval = null;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        if (!finalAccel || !finalGyro) return;
        const now = Date.now();

        setFrames(prev => {
          const dt = prev.length > 0
            ? (now - prev[prev.length - 1].time) / 1000
            : 0.05;

          const newFrame = {
            time: now, dt,
            accel:  finalAccel || { x: 0, y: 0, z: 0 },
            linear: linear     || { x: 0, y: 0, z: 0 },
            gyro:   finalGyro  || { x: 0, y: 0, z: 0 },
            gps: { lat, lon, speed, accuracy },
            source: apiOnline ? "API" : wsOnline ? "WebSocket" : "Device",
          };

          const updated = [...prev.slice(-1999), newFrame];
          framesRef.current = updated;
          return updated;
        });
      }, 50);
    }
    return () => interval && clearInterval(interval);
  }, [isRunning, isPaused, finalAccel, finalGyro, linear, lat, lon, speed, accuracy, apiOnline, wsOnline]);

  // ── STOP SESSION ──────────────────────────────────
  const stopSession = async () => {
    setIsRunning(false);
    setIsPaused(false);

    await markSessionInactive();
    await clearStoredFrames();

    const capturedFrames = [...framesRef.current];
    const capturedSteps  = sessionStepsRef.current;

    setLoadingMsg("Saving session data...");
    setIsLoading(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          setLoadingMsg("Computing analytics...");

          setTimeout(() => {
            const sessionData = {
              duration: capturedFrames.length > 0
                ? (capturedFrames[capturedFrames.length - 1].time - capturedFrames[0].time) / 1000
                : 0,
              points: capturedFrames.length,
              steps:  capturedSteps,
              frames: capturedFrames,
              finalPosition: { lat, lon, speed },
            };

            setIsLoading(false);

            setTimeout(() => {
              navigation.navigate("SessionAnalysis", { sessionData });
            }, 100);
          }, 600);
        }, 400);
      });
    });
  };

  const resetSession = async () => {
    setIsRunning(false);
    setIsPaused(false);
    setFrames([]);
    framesRef.current = [];
    sessionStepsRef.current = 0;
    await clearStoredFrames();
    await markSessionInactive();
  };

  const gpsData = { lat, lon, speed, accuracy };

  return (
    <View style={styles.root}>

      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        <Header />

        <Text style={[styles.gpsBar, {
          color: status === "GPS Active"
            ? "#32FF7E"
            : status === "GPS Stopped"
            ? "#FF9F1A"
            : "#FF3E3E",
        }]}>
          {status}{accuracy ? `  •  ${accuracy.toFixed(0)}م` : ""}
        </Text>

        {/* ✅ شارة الـ Background */}
        {isRunning && (
          <Text style={styles.bgBadge}>
            ⚡ Session continues in background
          </Text>
        )}

        {apiOnline && (
          <Text style={{ textAlign: "center", color: "#32FF7E", fontSize: 12 }}>
            API Motion Source Active
          </Text>
        )}

        {!apiOnline && wsOnline && (
          <Text style={{ textAlign: "center", color: "#FFD32A", fontSize: 12 }}>
            WebSocket Motion Source Active
          </Text>
        )}

        {isRunning && (
          <Text style={styles.frameCount}>
            ● {frames.length} frames recorded
          </Text>
        )}

        <SessionTimer
          isRunning={isRunning}
          isPaused={isPaused}
          gps={gpsData}
          linear={motionSource}
          onStepsUpdate={s => { sessionStepsRef.current = s; }}
        />

        <AccelerometerSection accel={finalAccel} isMoving={isMoving} />
        <GyroscopeSection     gyro={finalGyro}   isMoving={isMoving} />
        <StatsSection accel={finalAccel} gyro={finalGyro} isMoving={isMoving} />
      </ScrollView>

      <BottomNav />

      <View style={styles.fixedButtons}>
        <BottomButtons
          isRunning={isRunning}
          isPaused={isPaused}
          onStart={() => {
            setFrames([]);
            framesRef.current = [];
            sessionStepsRef.current = 0;
            setIsRunning(true);
            setIsPaused(false);
          }}
          onPause={() => setIsPaused(p => !p)}
          onStop={stopSession}
          onReset={resetSession}
          onRefreshGPS={startGPS}
          onStopGPS={stopGPS}
        />
      </View>

      <LoadingOverlay visible={isLoading} message={loadingMsg} />

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0F14" },

  gpsBar: {
    textAlign: "center", marginBottom: 4,
    fontSize: 12, fontWeight: "bold", letterSpacing: 1,
  },

  bgBadge: {
    textAlign: "center",
    color: "#FFD32A",
    fontSize: 11,
    marginBottom: 4,
    letterSpacing: 0.5,
  },

  frameCount: {
    textAlign: "center", color: "#0da6f2",
    fontSize: 11, marginBottom: 6,
  },

  fixedButtons: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    backgroundColor: "rgba(11,15,20,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
});
