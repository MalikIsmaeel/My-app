import React from "react";
import { View, Text } from "react-native";

export default function GyroscopeSection({ gyro }) {
  return (
    <View style={{ marginTop: 25 }}>
      {/* Title */}
      <View style={{ marginHorizontal: 20 }}>
        <Text style={{ color: "#0da6f2", fontSize: 12, letterSpacing: 2 }}>
          Gyroscope <Text style={{ color: "#aaa" }}>(deg/s)</Text>
        </Text>
        <View
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.1)",
            marginTop: 6,
          }}
        />
      </View>

      {/* Cards */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          marginTop: 10,
        }}
      >
        <AxisCard label="AXIS X" value={(gyro.x ).toFixed(2)} />
        <AxisCard label="AXIS Y" value={(gyro.y ).toFixed(2)} />
        <AxisCard label="AXIS Z" value={(gyro.z ).toFixed(2)} />
      </View>
    </View>
  );
}

/* ----------- AXIS CARD COMPONENT ----------- */

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
