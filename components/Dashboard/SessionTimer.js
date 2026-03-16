import React, { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
}

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

export default function SessionTimer({ isRunning, isPaused, gps }) {
  const [time, setTime] = useState(0);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);

  const lastGPS = useRef(null);
  const intervalRef = useRef(null);

  function isMoving(speed) {
    return speed > 0.5;
  }

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (!gps || !gps.lat || !gps.lon) return;

        if (!isMoving(gps.speed)) return;

        setTime((prev) => prev + 0.1);

        if (lastGPS.current) {
          const dist = haversine(
            lastGPS.current.lat,
            lastGPS.current.lon,
            gps.lat,
            gps.lon
          );

          if (dist > 0.3) {
            setDistance((d) => d + dist);
            setSteps((s) => s + dist / 0.75);
          }
        }

        lastGPS.current = { lat: gps.lat, lon: gps.lon };
      }, 100);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, gps]);

  return (
    <View
      style={{
        marginTop: 20,
        marginHorizontal: 20,
        padding: 20,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <MaterialIcons name="timer" size={26} color="#0da6f2" />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ color: "#aaa", fontSize: 10, letterSpacing: 2 }}>
            SESSION TIME
          </Text>

          <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>
            {formatTime(time)}
          </Text>

          <Text style={{ color: "#32FF7E", fontSize: 14, marginTop: 5 }}>
            Steps: {Math.floor(steps)}
          </Text>

          <Text style={{ color: "#FFD32A", fontSize: 14, marginTop: 5 }}>
            Distance: {distance.toFixed(1)} m
          </Text>
        </View>
      </View>
    </View>
  );
}
