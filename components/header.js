import React from "react";
import { View, Text } from "react-native";
export default function Header() {  
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingBottom: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#0B0F14",
        borderBottomWidth: 1,
        borderBottomColor: "#0da6f233",
      }}
    >
      {/* Left side */}
      <View>
        <Text style={{ color: "#0da6f2", fontSize: 10, letterSpacing: 2 }}>
          ProAnalytics Medical
        </Text>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
          Motion Performance
        </Text>
      </View>

      {/* Right side (LIVE badge) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#39ff1422",
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "#39ff1444",
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#39ff14",
            marginRight: 6,
          }}
        />
        <Text
          style={{
            color: "#39ff14",
            fontSize: 10,
            letterSpacing: 2,
            fontWeight: "bold",
          }}
        >
          LIVE
        </Text>
      </View>
    </View>
  );
}
