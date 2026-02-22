import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function SessionTimer() {
  return (
    <View
      style={{
        marginTop: 20,
        marginHorizontal: 20,
        padding: 20,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Left side */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <MaterialIcons name="timer" size={26} color="#0da6f2" />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ color: "#aaa", fontSize: 10, letterSpacing: 2 }}>
            SESSION TIME
          </Text>
          <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>
            04:25
            <Text style={{ color: "#0da6f2", fontSize: 20 }}>.82</Text>
          </Text>
        </View>
      </View>

      {/* Right side */}
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color: "#aaa", fontSize: 10, letterSpacing: 2 }}>
          SENSOR STATUS
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#0da6f2", fontSize: 12 }}>
            MPU6050 Connected
          </Text>
          <MaterialIcons name="sensors" size={18} color="#0da6f2" />
        </View>
      </View>
    </View>
  );
}
