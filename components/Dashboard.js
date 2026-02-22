import React, { useState } from "react";
import { View, ScrollView } from "react-native";

import Header from "./Header";
import SessionTimer from "./SessionTimer";
import AccelerometerSection from "./AccelerometerSection";
import GyroscopeSection from "./GyroscopeSection";
import StatsSection from "./StatsSection";
import BottomNav from "./BottomNav";
import BottomButtons from "./BottomButtons";

export default function Dashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0F14", paddingTop: 40 }}>

      <ScrollView contentContainerStyle={{ paddingBottom: 350 }}>
        <Header />

        <SessionTimer
          isRunning={isRunning}
          isPaused={isPaused}
          isStopped={isStopped}
        />

        <AccelerometerSection />
        <GyroscopeSection />
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
        onStop={() => {
          setIsRunning(false);
          setIsPaused(false);
          setIsStopped(true);
        }}
      />
    </View>
  );
}
