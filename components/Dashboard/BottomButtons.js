import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function BottomButtons({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onStop,
  onRefreshGPS,
}) {
  return (
    <View style={styles.bottomContainer}>

      {/* START BUTTON */}
      {!isRunning && (
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.startText}>START SESSION</Text>
        </TouchableOpacity>
      )}

      {/* PAUSE + END BUTTONS */}
      {isRunning && (
        <View style={styles.row}>
          <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
            <Text style={styles.pauseText}>
              {isPaused ? "RESUME" : "PAUSE"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.stopButton} onPress={onStop}>
            <Text style={styles.stopText}>END SESSION</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* REFRESH GPS BUTTON */}
      <TouchableOpacity style={styles.refreshButton} onPress={onRefreshGPS}>
        <Text style={styles.refreshText}>REFRESH GPS</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", 
  },

  /* START BUTTON */
  startButton: {
    backgroundColor: "#32FF7E",
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 12,
  },
  startText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },

  /* PAUSE + STOP */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: "#FFD32A",
    paddingVertical: 16,
    borderRadius: 50,
    marginRight: 8,
    alignItems: "center",
  },
  pauseText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 15,
  },
  stopButton: {
    flex: 1,
    backgroundColor: "#FF3E3E",
    paddingVertical: 16,
    borderRadius: 50,
    marginLeft: 8,
    alignItems: "center",
  },
  stopText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  /* REFRESH GPS */
  refreshButton: {
    backgroundColor: "#0da6f2",
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",
  },
  refreshText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
