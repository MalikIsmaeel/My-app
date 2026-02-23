import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function SessionTimer({ isRunning, isPaused, isStopped, onFrame }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval = null;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 0.1;

          // منع conflict مع Dashboard
          setTimeout(() => onFrame(newTime), 0);

          return newTime;
        });
      }, 100);
    }

    if (isPaused) {
      clearInterval(interval);
    }

    if (isStopped) {
      clearInterval(interval);
      setTime(0);
    }

    return () => clearInterval(interval);
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
            {time.toFixed(1)}s
          </Text>
        </View>
      </View>
    </View>
  );
}
