import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function BottomButtons({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onStop,
  onReset,
  onRefreshGPS,
}) {
  return (
    <View style={styles.container}>

      {/* ── قبل البدء ── */}
      {!isRunning && (
        <>
          <TouchableOpacity style={styles.startBtn} onPress={onStart}>
            <MaterialIcons name="play-arrow" size={24} color="#000" />
            <Text style={styles.startTxt}>START SESSION</Text>
          </TouchableOpacity>

          <View style={{ height: 10 }} />

          <View style={styles.row}>
            <TouchableOpacity style={[styles.refreshBtn, { flex: 1 }]} onPress={onRefreshGPS}>
              <MaterialIcons name="gps-fixed" size={18} color="#fff" />
              <Text style={styles.refreshTxt}>REFRESH GPS</Text>
            </TouchableOpacity>

            <View style={{ width: 10 }} />

            <TouchableOpacity style={[styles.resetBtn, { flex: 1 }]} onPress={onReset}>
              <MaterialIcons name="refresh" size={18} color="#fff" />
              <Text style={styles.resetTxt}>RESET</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── أثناء الجلسة ── */}
      {isRunning && (
        <>
          <View style={styles.row}>
            <TouchableOpacity style={styles.pauseBtn} onPress={onPause}>
              <MaterialIcons name={isPaused ? "play-arrow" : "pause"} size={22} color="#000" />
              <Text style={styles.pauseTxt}>{isPaused ? "RESUME" : "PAUSE"}</Text>
            </TouchableOpacity>

            <View style={{ width: 10 }} />

            <TouchableOpacity style={styles.stopBtn} onPress={onStop}>
              <MaterialIcons name="stop" size={22} color="#fff" />
              <Text style={styles.stopTxt}>END SESSION</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 10 }} />

          <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
            <MaterialIcons name="refresh" size={18} color="#fff" />
            <Text style={styles.resetTxt}>RESET</Text>
          </TouchableOpacity>
        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "column" },
  row:       { flexDirection: "row" },

  startBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#32FF7E", paddingVertical: 18, borderRadius: 50,
  },
  startTxt: { color: "#000", fontWeight: "700", fontSize: 16, marginLeft: 6 },

  pauseBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#FFD32A", paddingVertical: 16, borderRadius: 50,
  },
  pauseTxt: { color: "#000", fontWeight: "700", fontSize: 15, marginLeft: 4 },

  stopBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#FF3E3E", paddingVertical: 16, borderRadius: 50,
  },
  stopTxt: { color: "#fff", fontWeight: "700", fontSize: 15, marginLeft: 4 },

  refreshBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#0da6f2", paddingVertical: 12, borderRadius: 50,
  },
  refreshTxt: { color: "#fff", fontWeight: "700", fontSize: 14, marginLeft: 6 },

  resetBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)", paddingVertical: 12,
    borderRadius: 50, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  resetTxt: { color: "#fff", fontWeight: "700", fontSize: 14, marginLeft: 6 },
});