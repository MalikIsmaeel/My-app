import React from "react";
import { View, Text } from "react-native";

export default function StatsSection() {
  return (
    <View style={{ marginTop: 25, marginHorizontal: 20, flexDirection: "row" }}>
      <StatCard label="Peak Force" value="12.4" unit="G" />
      <StatCard label="Efficiency" value="94" unit="%" />
    </View>
  );
}

/* ----------- STAT CARD COMPONENT ----------- */

function StatCard({ label, value, unit }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderLeftWidth: 3,
        borderLeftColor: "#0da6f2",
        borderRadius: 12,
        padding: 20,
        marginRight: 10,
      }}
    >
      <Text style={{ color: "#aaa", fontSize: 10, letterSpacing: 2 }}>
        {label}
      </Text>

      <Text style={{ color: "white", fontSize: 24, marginTop: 6 }}>
        {value}
        <Text style={{ color: "#0da6f2", fontSize: 12 }}> {unit}</Text>
      </Text>
    </View>
  );
}
