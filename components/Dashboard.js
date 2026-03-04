import React, { useState } from "react";
import { View, ScrollView } from "react-native";

import useSensors from "./Dashboard/useSensors";
import { addLog } from "./Dashboard/storage";

import Header from "./Dashboard/Header";
import SessionTimer from "./Dashboard/SessionTimer";
import AccelerometerSection from "./Dashboard/AccelerometerSection";
import GyroscopeSection from "./Dashboard/GyroscopeSection";
import StatsSection from "./Dashboard/StatsSection";
import BottomNav from "./Dashboard/BottomNav";
import BottomButtons from "./Dashboard/BottomButtons";

export default function Dashboard() {
  const { accel, gyro } = useSensors();

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);

  const [frames, setFrames] = useState([]);

  // تسجيل كل Frame
  const handleFrame = (currentTime) => {
    try {
      if (isRunning && !isPaused) {
        const frame = {
          time: currentTime,
          accel,
          gyro,
        };

        setFrames((prev) => [...prev, frame]);

        addLog("FRAME_RECORDED_" + currentTime);
      }
    } catch (err) {
      addLog("FRAME_ERROR_" + err.message);
    }
  };

  // عند إيقاف الجلسة
  const stopSession = () => {
    try {
      addLog("SESSION_STOP");

      setIsRunning(false);
      setIsPaused(false);
      setIsStopped(true);

      addLog("SESSION_DATA_FRAMES=" + frames.length);

      console.log("SESSION DATA:", frames);

      setFrames([]);
      addLog("FRAMES_CLEARED");
    } catch (err) {
      addLog("STOP_SESSION_ERROR_" + err.message);
    }
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
          addLog("SESSION_START");
          setIsRunning(true);
          setIsPaused(false);
          setIsStopped(false);
        }}
        onPause={() => {
          addLog("SESSION_PAUSE");
          setIsPaused(true);
        }}
        onStop={stopSession}
      />
    </View>
  );
}
