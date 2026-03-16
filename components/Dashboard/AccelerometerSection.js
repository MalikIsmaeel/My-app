import React from "react";
import { View, Text } from "react-native";

export default function AccelerometerSection({ accel, speed }) {
  if (!accel) accel = { x: 0, y: 0, z: 0 };

  const moving = speed > 0.5;

  const ax = moving ? accel.x.toFixed(2) : "0.00";
  const ay = moving ? accel.y.toFixed(2) : "0.00";
  const az = moving ? accel.z.toFixed(2) : "0.00";

  return (
    <View style={{ marginTop: 25 }}>
      <View style={{ marginHorizontal: 20 }}>
        <Text style={{ color: "#0da6f2", fontSize: 12, letterSpacing: 2 }}>
          Accelerometer <Text style={{ color: "#aaa" }}>(m/s²)</Text>
        </Text>
        <View
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.1)",
            marginTop: 6,
          }}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          marginTop: 10,
        }}
      >
        <AxisCard label="AXIS X" value={ax} />
        <AxisCard label="AXIS Y" value={ay} />
        <AxisCard label="AXIS Z" value={az} />
      </View>
    </View>
  );
}

function AxisCard({ label, value }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: 20,
        marginRight: 10,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#aaa", fontSize: 10 }}>{label}</Text>
      <Text style={{ color: "white", fontSize: 32, marginTop: 6 }}>{value}</Text>
    </View>
  );
}
