import React, { useState, useEffect, useRef } from "react";
import { View, Text, Alert, ScrollView, StyleSheet } from "react-native";

import Header from "./Dashboard/Header";
import SessionTimer from "./Dashboard/SessionTimer";
import AccelerometerSection from "./Dashboard/AccelerometerSection";
import GyroscopeSection from "./Dashboard/GyroscopeSection";
import StatsSection from "./Dashboard/StatsSection";
import BottomNav from "./Dashboard/BottomNav";
import BottomButtons from "./Dashboard/BottomButtons";
import useSensors from "./Dashboard/useSensors";
import useGPS from "./Dashboard/UseGPS";

export default function Dashboard({ navigation }) {
  const { accel, linear, gyro } = useSensors();
  const { lat, lon, speed, accuracy, status, startGPS } = useGPS();

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [frames, setFrames] = useState([]);

  function isMoving(speed) {
    return speed > 0.5;
  }

  /* ---------------- FRAME CAPTURE ---------------- */
  useEffect(() => {
    let interval = null;

    if (isRunning && !isPaused && isMoving(speed)) {
      interval = setInterval(() => {
        if (!accel || !linear || !gyro || !lat || !lon) return;

        const now = Date.now();
        const dt = frames.length > 0
          ? (now - frames[frames.length - 1].time) / 1000
          : 0.05;

        const frame = {
          time: now,
          dt,
          accel,
          linear,
          gyro,
          gps: { lat, lon, speed, accuracy },
        };

        setFrames((prev) => [...prev.slice(-199), frame]);
      }, 50);
    }

    return () => interval && clearInterval(interval);
  }, [isRunning, isPaused, accel, linear, gyro, lat, lon, speed, accuracy]);

  /* ---------------- STOP SESSION ---------------- */
  const stopSession = () => {
    setIsRunning(false);
    setIsPaused(false);

    const sessionData = {
      duration: frames.length * 0.05,
      points: frames.length,
      frames,
      finalPosition: { lat, lon, speed },
    };

    navigation.navigate("SessionAnalysis", { sessionData });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0F14" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        <Header />

        <Text
          style={{
            color: status === "GPS Active" ? "#32FF7E" : "#FF3E3E",
            textAlign: "center",
            marginBottom: 10,
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          {status}
        </Text>

        <SessionTimer
          isRunning={isRunning}
          isPaused={isPaused}
          gps={{ lat, lon, speed, accuracy }}
        />

        <AccelerometerSection accel={accel} speed={speed} />
        <GyroscopeSection gyro={gyro} speed={speed} />
        <StatsSection />
      </ScrollView>

      <BottomNav />

      <View style={styles.fixedButtons}>
        <BottomButtons
          isRunning={isRunning}
          isPaused={isPaused}
          onStart={() => {
            if (!lat || !lon || status !== "GPS Active") {
              Alert.alert("GPS", "Waiting for GPS signal...");
              return;
            }
            setIsRunning(true);
          }}
          onPause={() => setIsPaused(!isPaused)}
          onStop={stopSession}
          onRefreshGPS={startGPS}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fixedButtons: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
