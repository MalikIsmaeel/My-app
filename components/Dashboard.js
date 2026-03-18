import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";

import Header               from "./Dashboard/Header";
import SessionTimer         from "./Dashboard/SessionTimer";
import AccelerometerSection from "./Dashboard/AccelerometerSection";
import GyroscopeSection     from "./Dashboard/GyroscopeSection";
import StatsSection         from "./Dashboard/StatsSection";
import BottomNav            from "./Dashboard/BottomNav";
import BottomButtons        from "./Dashboard/BottomButtons";
import useSensors           from "./Dashboard/useSensors";
import useGPS               from "./Dashboard/UseGPS";

export default function Dashboard({ navigation }) {
  const { accel, linear, gyro } = useSensors();
  const { lat, lon, speed, accuracy, status, startGPS } = useGPS();

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused,  setIsPaused]  = useState(false);
  const [frames,    setFrames]    = useState([]);
  const [isMoving,  setIsMoving]  = useState(false);

  const sessionStepsRef = useRef(0);

  // ── كشف الحركة من linear ──────────────────────
  useEffect(() => {
    if (!linear) return;
    const mag = Math.sqrt(linear.x**2 + linear.y**2 + linear.z**2);
    setIsMoving(mag > 0.12);
  }, [linear]);

  // ── FRAME CAPTURE ─────────────────────────────
  useEffect(() => {
    let interval = null;
    if (isRunning && !isPaused && isMoving) {
      interval = setInterval(() => {
        if (!accel || !gyro) return;
        const now = Date.now();
        const dt  = frames.length > 0
          ? (now - frames[frames.length - 1].time) / 1000
          : 0.05;
        setFrames(prev => [...prev.slice(-199), {
          time: now, dt, accel,
          linear: linear || { x:0, y:0, z:0 },
          gyro,
          gps: { lat, lon, speed, accuracy },
        }]);
      }, 50);
    }
    return () => interval && clearInterval(interval);
  }, [isRunning, isPaused, isMoving, accel, linear, gyro, lat, lon, speed, accuracy]);

  // ── STOP SESSION ──────────────────────────────
  const stopSession = () => {
    setIsRunning(false);
    setIsPaused(false);
    navigation.navigate("SessionAnalysis", {
      sessionData: {
        duration:      frames.length * 0.05,
        points:        frames.length,
        steps:         sessionStepsRef.current,
        frames,
        finalPosition: { lat, lon, speed },
      }
    });
  };

  const gpsData = { lat, lon, speed, accuracy };

  // ارتفاع الأزرار السفلية (تقريبي)
  const BUTTONS_HEIGHT = isRunning ? 80 : 130;

  return (
    <View style={styles.root}>

      {/* ── المحتوى القابل للتمرير ── */}
      <ScrollView contentContainerStyle={{ paddingBottom: BUTTONS_HEIGHT + 60 }}>
        <Header />

        <Text style={[styles.gpsBar, {
          color: status === "GPS Active" ? "#32FF7E" : "#FF3E3E"
        }]}>
          {status}{accuracy ? `  •  ${accuracy.toFixed(0)}م` : ""}
        </Text>

        <SessionTimer
          isRunning={isRunning}
          isPaused={isPaused}
          gps={gpsData}
          linear={linear}
          onStepsUpdate={s => { sessionStepsRef.current = s; }}
        />

        <AccelerometerSection accel={accel} isMoving={isMoving} />
        <GyroscopeSection     gyro={gyro}   isMoving={isMoving} />
        <StatsSection accel={accel} gyro={gyro} isMoving={isMoving} />
      </ScrollView>

      {/* ── BottomNav ── */}
      <BottomNav />

      {/* ── الأزرار الثابتة في الأسفل ── */}
      <View style={styles.fixedButtons}>
        <BottomButtons
          isRunning={isRunning}
          isPaused={isPaused}
          onStart={() => {
            setFrames([]);
            sessionStepsRef.current = 0;
            setIsRunning(true);
            setIsPaused(false);
          }}
          onPause={() => setIsPaused(p => !p)}
          onStop={stopSession}
          onRefreshGPS={startGPS}
        />
      </View>

    </View>
  );
}

// ── SessionTimer web-safe: يستخدم dynamic import للـ Pedometer ──
// (الملف SessionTimer.js نفسه يحتاج يستخدم dynamic import — راجع SessionTimer.js)

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },
  gpsBar: {
    textAlign:     "center",
    marginBottom:  10,
    fontSize:      12,
    fontWeight:    "bold",
    letterSpacing: 1,
  },
  fixedButtons: {
    position:          "absolute",
    bottom:            0,
    left:              0,
    right:             0,
    paddingHorizontal: 20,
    paddingTop:        12,
    paddingBottom:     Platform.OS === "ios" ? 30 : 16,
    backgroundColor:   "rgba(11,15,20,0.95)",
    borderTopWidth:    1,
    borderTopColor:    "rgba(255,255,255,0.08)",
  },
});