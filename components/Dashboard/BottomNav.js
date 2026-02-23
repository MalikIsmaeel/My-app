import React from "react";
import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function BottomNav() {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 240, // فوق أزرار الـ Session
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "rgba(255,255,255,0.05)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
          paddingHorizontal: 25,
          paddingVertical: 12,
          borderRadius: 40,
          width: 260,
          justifyContent: "space-between",
        }}
      >
        {/* Active Icon */}
        <MaterialIcons name="analytics" size={26} color="#0da6f2" />

        {/* Inactive Icons */}
        <MaterialIcons name="history" size={26} color="#9ca3af" />
        <MaterialIcons name="person" size={26} color="#9ca3af" />
        <MaterialIcons name="settings" size={26} color="#9ca3af" />
      </View>
    </View>
  );
}
