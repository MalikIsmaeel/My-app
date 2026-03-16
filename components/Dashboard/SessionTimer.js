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

export default function SessionTimer({ isRunning, isPaused, isStopped, onFrame }) {
  const [time, setTime] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // إيقاف أي interval شغال
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // تشغيل التايمر
    if (isRunning && !isPaused && !isStopped) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 0.1;

          // حماية من undefined
          if (typeof onFrame === "function") {
            onFrame(newTime);
          }

          return newTime;
        });
      }, 100);
    }

    // عند الإيقاف
    if (isStopped) {
      setTime(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, isStopped]);

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
        </View>
      </View>
    </View>
  );
}
