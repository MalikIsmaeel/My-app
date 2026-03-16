import React, { useState, useEffect } from "react";
import { View, Text, Alert, ScrollView, StyleSheet } from "react-native";
import * as Location from "expo-location";

import Header from "./Dashboard/Header";
import SessionTimer from "./Dashboard/SessionTimer";
import AccelerometerSection from "./Dashboard/AccelerometerSection";
import GyroscopeSection from "./Dashboard/GyroscopeSection";
import StatsSection from "./Dashboard/StatsSection";
import BottomNav from "./Dashboard/BottomNav";
import BottomButtons from "./Dashboard/BottomButtons";
import useSensors from "./Dashboard/useSensors";

export default function Dashboard({ navigation }) {
  const { accel, linear, gyro } = useSensors();

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [frames, setFrames] = useState([]);

  const [currentLat, setCurrentLat] = useState(null);
  const [currentLon, setCurrentLon] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [gpsStatus, setGpsStatus] = useState("Searching...");

  /* ---------------- MOVEMENT DETECTION (GPS ONLY) ---------------- */
  function isMoving(speed) {
    return speed > 0.5; // GPS-only movement detection
  }

  /* ---------------- GPS START ---------------- */
  const startGPS = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setGpsStatus("Permission Denied");
      Alert.alert("GPS Permission", "Please enable GPS permission");
      return;
    }

    setGpsStatus("Searching...");

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 300,
        distanceInterval: 0,
      },
      (loc) => {
        if (!loc || !loc.coords) {
          setGpsStatus("No Signal");
          return;
        }

        setCurrentLat(loc.coords.latitude);
        setCurrentLon(loc.coords.longitude);
        setCurrentSpeed(loc.coords.speed || 0);

        setGpsStatus("GPS Active");
      }
    );
  };

  useEffect(() => {
    startGPS();
  }, []);

  /* ---------------- FRAME CAPTURE ---------------- */
  useEffect(() => {
    let interval = null;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        if (!accel || !linear || !gyro || !currentLat || !currentLon) return;

        // 🔥 لا تسجّل أي شيء إلا عند الحركة (GPS ONLY)
        if (!isMoving(currentSpeed)) return;

        const now = Date.now();
        const dt =
          frames.length > 0
            ? (now - frames[frames.length - 1].time) / 1000
            : 0.02;

        setFrames((prev) => [
          ...prev,
          {
            time: now,
            dt,
            accel,
            linear,
            gyro,
            gps: {
              lat: currentLat,
              lon: currentLon,
              speed: currentSpeed,
            },
          },
        ]);
      }, 20); // 50Hz sampling
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, accel, linear, gyro, currentLat, currentLon, currentSpeed]);

  /* ---------------- STOP SESSION ---------------- */
  const stopSession = () => {
    setIsRunning(false);
    setIsPaused(false);

    const sessionData = {
      duration: frames.length * 0.02,
      points: frames.length,
      frames,
    };

    navigation.navigate("SessionAnalysis", { sessionData });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0F14" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        <Header />

        <Text
          style={{
            color: gpsStatus === "GPS Active" ? "#32FF7E" : "#FF3E3E",
            textAlign: "center",
            marginBottom: 10,
            fontSize: 12,
          }}
        >
          {gpsStatus}
        </Text>

        {/* 🔥 SessionTimer الآن يعتمد فقط على GPS */}
        <SessionTimer
          isRunning={isRunning}
          isPaused={isPaused}
          gps={{ lat: currentLat, lon: currentLon, speed: currentSpeed }}
        />

        <AccelerometerSection accel={accel} speed={currentSpeed} />
        <GyroscopeSection gyro={gyro} speed={currentSpeed} />
        <StatsSection />
      </ScrollView>

      <BottomNav />

      <View style={styles.fixedButtons}>
        <BottomButtons
          isRunning={isRunning}
          isPaused={isPaused}
          onStart={() => {
            if (!currentLat || !currentLon) {
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
