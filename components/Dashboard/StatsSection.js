/**
 * StatsSection.js
 * ─────────────────────────────────────────────────────────────
 * يستقبل:
 *   accel    — { x, y, z } لحساب Peak Force
 *   gyro     — { x, y, z } لحساب Efficiency
 *   isMoving — boolean
 * ─────────────────────────────────────────────────────────────
 */
import React from "react";
import { View, Text } from "react-native";

export default function StatsSection({ accel, gyro, isMoving }) {
  // Peak Force = مقدار متجه التسارع الكلي (g)
  const peakForce = accel && isMoving
    ? (Math.sqrt(accel.x**2 + accel.y**2 + accel.z**2)).toFixed(2)
    : "0.00";

  // Efficiency تقديرية: كلما كان الجايروسكوب هادئاً = حركة أكفأ
  const gyroMag = gyro
    ? Math.sqrt(gyro.x**2 + gyro.y**2 + gyro.z**2)
    : 0;
  const efficiency = isMoving
    ? Math.max(0, Math.min(100, Math.round(100 - gyroMag * 10)))
    : 0;

  return (
    <View style={{ marginTop: 25, marginHorizontal: 20, flexDirection: "row" }}>
      <StatCard label="PEAK FORCE" value={peakForce} unit="G" />
      <StatCard label="EFFICIENCY" value={efficiency} unit="%" />
    </View>
  );
}

function StatCard({ label, value, unit }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderLeftWidth: 3,
      borderLeftColor: "#0da6f2",
      borderRadius: 12,
      padding: 20,
      marginRight: 10,
    }}>
      <Text style={{ color: "#aaa", fontSize: 10, letterSpacing: 2 }}>{label}</Text>
      <Text style={{ color: "white", fontSize: 24, marginTop: 6 }}>
        {value}
        <Text style={{ color: "#0da6f2", fontSize: 12 }}> {unit}</Text>
      </Text>
    </View>
  );
}