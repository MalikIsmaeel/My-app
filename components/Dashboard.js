import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

import useSensors from "./Dashboard/useSensors";
import Header from "./Dashboard/Header";
import SessionTimer from "./Dashboard/SessionTimer";
import AccelerometerSection from "./Dashboard/AccelerometerSection";
import GyroscopeSection from "./Dashboard/GyroscopeSection";
import StatsSection from "./Dashboard/StatsSection";
import BottomNav from "./Dashboard/BottomNav";
import BottomButtons from "./Dashboard/BottomButtons";

export default function Dashboard() {
  const navigation = useNavigation();
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

    const sessionData = {
      duration: frames.length * 0.1,
      points: frames.length,
      frames,
    };

    navigation.navigate("SessionAnalysis", { sessionData });
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
