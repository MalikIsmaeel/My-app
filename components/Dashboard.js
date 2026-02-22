import React from "react";
import { View, ScrollView } from "react-native";

import Header from "./Header";
import SessionTimer from "./SessionTimer";
import AccelerometerSection from "./AccelerometerSection";
import GyroscopeSection from "./GyroscopeSection";
import StatsSection from "./StatsSection";
import BottomNav from "./BottomNav";
import BottomButtons from "./BottomButtons";

export default function Dashboard() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0B0F14", paddingTop: 40 }}>

      {/* المحتوى اللي يتحرك */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 350, // مهم جداً عشان ما يتغطى المحتوى
        }}
      >
        <Header />
        <SessionTimer />
        <AccelerometerSection />
        <GyroscopeSection />
        <StatsSection />
      </ScrollView>

      {/* شريط التنقل */}
      <BottomNav />

      {/* أزرار الجلسة */}
      <BottomButtons />
    </View>
  );
}
