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
  onStopGPS,       // ✅ الجديد
}) {
  return (
    <View>

      {/* ── الصف الأول: Start / Pause ── */}
      <View style={styles.row}>
        {!isRunning ? (
          /* زر START */
          <TouchableOpacity style={[styles.mainBtn, styles.startBtn]} onPress={onStart}>
            <MaterialIcons name="play-arrow" size={26} color="#000" />
            <Text style={styles.startBtnText}>START SESSION</Text>
          </TouchableOpacity>
        ) : (
          /* زر PAUSE / RESUME */
          <TouchableOpacity style={[styles.mainBtn, styles.pauseBtn]} onPress={onPause}>
            <MaterialIcons
              name={isPaused ? "play-arrow" : "pause"}
              size={26}
              color="#ff6700"
            />
            <Text style={styles.pauseBtnText}>
              {isPaused ? "RESUME" : "PAUSE"}
            </Text>
          </TouchableOpacity>
        )}

        {/* زر REFRESH GPS */}
        <TouchableOpacity style={styles.iconBtn} onPress={onRefreshGPS}>
          <MaterialIcons name="gps-fixed" size={22} color="#0da6f2" />
        </TouchableOpacity>
      </View>

      {/* ── الصف الثاني: End Session + Stop GPS ── */}
      <View style={styles.row}>
        {/* END ANALYSIS SESSION */}
        {isRunning && (
          <TouchableOpacity style={[styles.endBtn, { flex: 2, marginRight: 8 }]} onPress={onStop}>
            <View style={styles.redDot} />
            <Text style={styles.endBtnText}>END ANALYSIS SESSION</Text>
          </TouchableOpacity>
        )}

        {/* STOP GPS ✅ */}
        <TouchableOpacity
          style={[styles.stopGPSBtn, isRunning ? { flex: 1 } : { flex: 1 }]}
          onPress={onStopGPS}
        >
          <MaterialIcons name="gps-off" size={18} color="#FF3E3E" />
          <Text style={styles.stopGPSText}>STOP GPS</Text>
        </TouchableOpacity>
      </View>

      {/* ── زر RESET (ظاهر بس لو الجلسة وقفت) ── */}
      {!isRunning && (
        <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
          <MaterialIcons name="refresh" size={18} color="#aaa" />
          <Text style={styles.resetBtnText}>RESET</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },

  // ── START ──
  mainBtn: {
    flex: 2,
    height: 60,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  startBtn: {
    backgroundColor: "#0da6f2",
  },
  startBtnText: {
    color: "#000",
    marginLeft: 6,
    letterSpacing: 2,
    fontWeight: "700",
  },

  // ── PAUSE ──
  pauseBtn: {
    backgroundColor: "rgba(255,103,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,103,0,0.4)",
  },
  pauseBtnText: {
    color: "#ff6700",
    marginLeft: 6,
    letterSpacing: 2,
    fontWeight: "700",
  },

  // ── GPS REFRESH icon ──
  iconBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(13,166,242,0.1)",
    borderWidth: 1,
    borderColor: "rgba(13,166,242,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── END SESSION ──
  endBtn: {
    height: 45,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,0,127,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,0,127,0.3)",
  },
  redDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: "#ff007f",
    marginRight: 6,
  },
  endBtnText: {
    color: "#ff007f",
    letterSpacing: 1.5,
    fontSize: 12,
    fontWeight: "700",
  },

  // ── STOP GPS ✅ ──
  stopGPSBtn: {
    height: 45,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,62,62,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,62,62,0.35)",
  },
  stopGPSText: {
    color: "#FF3E3E",
    marginLeft: 5,
    letterSpacing: 1.5,
    fontSize: 12,
    fontWeight: "700",
  },

  // ── RESET ──
  resetBtn: {
    height: 40,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  resetBtnText: {
    color: "#aaa",
    marginLeft: 5,
    letterSpacing: 1.5,
    fontSize: 12,
  },
});
