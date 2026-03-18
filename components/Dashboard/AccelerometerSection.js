/**
 * AccelerometerSection.js
 * ─────────────────────────────────────────────────────────────
 * يستقبل:
 *   accel    — { x, y, z } من useSensors
 *   isMoving — boolean من Dashboard (محسوب من linear accel)
 * ─────────────────────────────────────────────────────────────
 */
import React from "react";
import { View, Text } from "react-native";

export default function AccelerometerSection({ accel, isMoving }) {
  if (!accel) accel = { x: 0, y: 0, z: 0 };

  const ax = isMoving ? accel.x.toFixed(2) : "0.00";
  const ay = isMoving ? accel.y.toFixed(2) : "0.00";
  const az = isMoving ? accel.z.toFixed(2) : "0.00";

  return (
    <View style={{ marginTop: 25 }}>
      <View style={{ marginHorizontal: 20 }}>
        <Text style={{ color: "#0da6f2", fontSize: 12, letterSpacing: 2 }}>
          Accelerometer <Text style={{ color: "#aaa" }}>(m/s²)</Text>
        </Text>
        <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginTop: 6 }} />
      </View>

      <View style={{ flexDirection: "row", marginHorizontal: 20, marginTop: 10 }}>
        <AxisCard label="AXIS X" value={ax} color="#0da6f2" />
        <AxisCard label="AXIS Y" value={ay} color="#0da6f2" />
        <AxisCard label="AXIS Z" value={az} color="#0da6f2" />
      </View>
    </View>
  );
}

function AxisCard({ label, value, color }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
      borderRadius: 12,
      padding: 20,
      marginRight: 10,
      alignItems: "center",
    }}>
      <Text style={{ color: "#aaa", fontSize: 10 }}>{label}</Text>
      <Text style={{ color: "white", fontSize: 32, marginTop: 6 }}>{value}</Text>
    </View>
  );
}