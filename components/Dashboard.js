import React, { useState } from "react";
import { View, ScrollView } from "react-native";

import useSensors from "./useSensors";

import Header from "./Header";
import SessionTimer from "./SessionTimer";
import AccelerometerSection from "./AccelerometerSection";
import GyroscopeSection from "./GyroscopeSection";
import StatsSection from "./StatsSection";
import BottomNav from "./BottomNav";
import BottomButtons from "./BottomButtons";

export default function Dashboard() {
  const { accel, gyro } = useSensors();

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);

  const [frames, setFrames] = useState([]);

  const handleFrame = (currentTime) => {
    if (isRunning && !isPaused) {
      setFrames((prev) => [
        ...prev,
        {
          time: currentTime,
          accel,
          gyro,
        },
      ]);
    }
  };

  const stopSession = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsStopped(true);

    console.log("SESSION DATA:", frames);

    setFrames([]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0F14", paddingTop: 40 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 350 }}>
        <Header />

        <SessionTimer
          isRunning={isRunning}
          isPaused={isPaused}
          isStopped={isStopped}
          onFrame={handleFrame}
        />

        <AccelerometerSection accel={accel} />
        <GyroscopeSection gyro={gyro} />

        <StatsSection />
      </ScrollView>

      <BottomNav />

      <BottomButtons
        onStart={() => {
          setIsRunning(true);
          setIsPaused(false);
          setIsStopped(false);
        }}
        onPause={() => {
          setIsPaused(true);
        }}
        onStop={stopSession}
      />
    </View>
  );
}
