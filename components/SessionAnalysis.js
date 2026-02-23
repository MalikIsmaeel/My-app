import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRoute } from "@react-navigation/native";

import ScoreCard from "./ScoreCard";

export default function SessionAnalysis() {
  const route = useRoute();
  const sessionData = route.params?.sessionData;

  // حماية من الصفحة الفاضية
  if (!sessionData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No session data found</Text>
      </View>
    );
  }

  const durationSec = sessionData.duration;
  const durationMin = (durationSec / 60).toFixed(1);

  const points = sessionData.points;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Session Analysis</Text>
          <Text style={styles.headerSubtitle}>Last Session</Text>
          <Text style={styles.headerSensor}>MPU6050 SENSOR ARRAY: ACTIVE</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>
              {durationMin} <Text style={styles.statUnit}>min</Text>
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Data Points</Text>
            <Text style={styles.statValue}>
              {(points / 1000).toFixed(1)} <Text style={styles.statUnit}>k</Text>
            </Text>
          </View>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          <ScoreCard score={points} label="Stability" color="#32FF7E" />
          <ScoreCard score={points} label="Balance" color="#0da6f2" />
          <ScoreCard score={points} label="Smoothness" color="#FFD32A" />
          <ScoreCard score={points} label="Control" color="#FF9F1A" />
          <ScoreCard score={points} label="Mobility" color="#FF3E3E" />
          <ScoreCard score={points} label="Load" color="#32FF7E" />
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Generate Medical Report</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F14" },

  scroll: { padding: 16 },

  emptyContainer: {
    flex: 1,
    backgroundColor: "#0B0F14",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: "#fff",
    fontSize: 18,
  },

  header: {
    alignItems: "center",
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#fff",
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#0da6f2",
    fontWeight: "600",
  },

  headerSensor: {
    fontSize: 10,
    marginTop: 2,
    color: "#aaa",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#0da6f2",
    shadowColor: "#0da6f2",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },

  statLabel: {
    fontSize: 10,
    color: "#aaa",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },

  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },

  statUnit: {
    fontSize: 12,
    color: "#0da6f2",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  button: {
    marginTop: 20,
    backgroundColor: "#0da6f2",
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: "center",
    shadowColor: "#0da6f2",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 2,
  },
});
