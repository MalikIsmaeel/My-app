import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import ScoreCard from "./ScoreCard";

import {
  calculateStability,
  calculateSmoothness,
  calculateBalance,
  calculateControl,
  calculateMobility,
  calculateLoad,
  calculateTotalDistance,
  calculateAverageSpeed,
  getInstantSpeed,
  calculateMovement
} from "./utils/analytics";

export default function SessionAnalysis() {
  const route = useRoute();
  const sessionData = route.params?.sessionData;

  if (!sessionData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No session data found</Text>
      </View>
    );
  }

  const frames = sessionData.frames || [];

  const totalDistance = calculateTotalDistance(frames);
  const avgSpeed = calculateAverageSpeed(frames);
  const instantSpeed = getInstantSpeed(frames);
  const movement = calculateMovement(frames);

  const stabilityScore = calculateStability(frames);
  const smoothnessScore = calculateSmoothness(frames);
  const balanceScore = calculateBalance(frames);
  const controlScore = calculateControl(frames);
  const mobilityScore = calculateMobility(frames);
  const loadScore = calculateLoad(frames);

  const durationMin = (sessionData.duration / 60).toFixed(1);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Session Analysis</Text>
          <Text style={styles.headerSubtitle}>Last Session</Text>
          <Text style={styles.headerSensor}>IMU6050 + GPS ACTIVE</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{durationMin} <Text style={styles.statUnit}>min</Text></Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Data Points</Text>
            <Text style={styles.statValue}>{(sessionData.points / 1000).toFixed(1)}k</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <ScoreCard score={(stabilityScore || 0).toFixed(2)} label="Stability" color="#32FF7E" />
          <ScoreCard score={(balanceScore || 0).toFixed(2)} label="Balance" color="#0da6f2" />
          <ScoreCard score={(smoothnessScore || 0).toFixed(2)} label="Smoothness" color="#FFD32A" />
          <ScoreCard score={(controlScore || 0).toFixed(2)} label="Control" color="#FF9F1A" />
          <ScoreCard score={(mobilityScore || 0).toFixed(2)} label="Mobility" color="#FF3E3E" />
          <ScoreCard score={(loadScore || 0).toFixed(2)} label="Load" color="#32FF7E" />

          <ScoreCard score={(totalDistance || 0).toFixed(2)} label="Distance (m)" color="#0da6f2" />
          <ScoreCard score={(avgSpeed || 0).toFixed(2)} label="Avg Speed" color="#FFD32A" />
          <ScoreCard score={(instantSpeed || 0).toFixed(2)} label="Instant Speed" color="#FF9F1A" />
          <ScoreCard score={(movement || 0).toFixed(2)} label="Movement (m)" color="#32FF7E" />
        </View>

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
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#fff", fontSize: 18 },
  header: { alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: "700", color: "#fff" },
  headerSubtitle: { fontSize: 12, color: "#0da6f2" },
  headerSensor: { fontSize: 10, color: "#aaa" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 16,
    borderColor: "#0da6f2",
    borderWidth: 1,
  },
  statLabel: { fontSize: 10, color: "#aaa" },
  statValue: { fontSize: 22, color: "#fff", fontWeight: "700" },
  statUnit: { fontSize: 12, color: "#0da6f2" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  button: {
    marginTop: 20,
    backgroundColor: "#0da6f2",
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
