import React from "react";
import Header from "./header";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function Dashboard() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0B0F14", paddingTop: 40 }}>

      {/* Header */}
      <Header />

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        {/* Session Timer */}
        <SessionTimer />

        {/* Accelerometer */}
        <SectionTitle title="Accelerometer" unit="(m/s²)" />
        <View style={{ flexDirection: "row", marginHorizontal: 20, marginTop: 10 }}>
          <AxisCard label="AXIS X" value="42" />
          <AxisCard label="AXIS Y" value="88" />
          <AxisCard label="AXIS Z" value="15" />
        </View>

        {/* Gyroscope */}
        <SectionTitle title="Gyroscope" unit="(deg/s)" />
        <View style={{ flexDirection: "row", marginHorizontal: 20, marginTop: 10 }}>
          <AxisCard label="AXIS X" value="09" />
          <AxisCard label="AXIS Y" value="12" />
          <AxisCard label="AXIS Z" value="04" />
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", marginHorizontal: 20, marginTop: 20 }}>
          <StatCard label="Peak Force" value="12.4" unit="G" />
          <StatCard label="Efficiency" value="94" unit="%" />
        </View>
      </ScrollView>

      {/* Floating Navigation Bar */}
      <BottomNav />

      {/* Bottom Buttons */}
      <BottomButtons />

    </View>
  );
}

/* COMPONENTS */

function Header() {
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
      <View>
        <Text style={{ color: "#0da6f2", fontSize: 10, letterSpacing: 2 }}>
          ProAnalytics Medical
        </Text>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
          Motion Performance
        </Text>
      </View>

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

function SessionTimer() {
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

function SectionTitle({ title, unit }) {
  return (
    <View style={{ marginTop: 25, marginHorizontal: 20 }}>
      <Text style={{ color: "#0da6f2", fontSize: 12, letterSpacing: 2 }}>
        {title} <Text style={{ color: "#aaa" }}>{unit}</Text>
      </Text>
      <View
        style={{
          height: 1,
          backgroundColor: "rgba(255,255,255,0.1)",
          marginTop: 6,
        }}
      />
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

function BottomNav() {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 199,
        left: 0,
        right: 0,
        alignItems: "center",
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
        <MaterialIcons name="analytics" size={26} color="#0da6f2" />
        <MaterialIcons name="history" size={26} color="#9ca3af" />
        <MaterialIcons name="person" size={26} color="#9ca3af" />
        <MaterialIcons name="settings" size={26} color="#9ca3af" />
      </View>
    </View>
  );
}

function BottomButtons() {
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
