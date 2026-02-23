import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function BottomButtons({ onStart, onPause, onStop }) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: "#0B0F14",
      }}
    >
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <TouchableOpacity
          onPress={onStart}
          style={{
            flex: 2,
            backgroundColor: "#0da6f2",
            height: 60,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            marginRight: 10,
          }}
        >
          <MaterialIcons name="play-arrow" size={26} color="#000" />
          <Text style={{ color: "#000", marginLeft: 6, letterSpacing: 2 }}>
            START SESSION
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPause}
          style={{
            flex: 1,
            backgroundColor: "rgba(255,103,0,0.2)",
            borderWidth: 1,
            borderColor: "rgba(255,103,0,0.4)",
            height: 60,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialIcons name="pause" size={24} color="#ff6700" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onStop}
        style={{
          backgroundColor: "rgba(255,0,127,0.1)",
          borderWidth: 1,
          borderColor: "rgba(255,0,127,0.3)",
          height: 45,
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#ff007f",
            marginRight: 6,
          }}
        />
        <Text style={{ color: "#ff007f", letterSpacing: 2 }}>
          END ANALYSIS SESSION
        </Text>
      </TouchableOpacity>
    </View>
  );
}
