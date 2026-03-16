import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import ScoreCard from "./ScoreCard";

import { computeAnalytics } from "./utils/analytics.js";

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

  // 🔥 حساب كل شيء من ProAnalytics
  const analytics = computeAnalytics(frames);

  const {
    windows,
    steps,
    duration,
    durationFormatted
  } = analytics;

  // آخر نافذة (آخر ثانية)
  const lastWindow = windows.length > 0 ? windows[windows.length - 1] : null;

  const stability = lastWindow?.stability || 0;
  const balance = lastWindow?.balance || 0;
  const smoothness = lastWindow?.smoothness || 0;
  const control = lastWindow?.control || 0;
  const mobility = lastWindow?.mobility || 0;
  const load = lastWindow?.load || 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Session Analysis</Text>
          <Text style={styles.headerSubtitle}>Last Session</Text>
          <Text style={styles.headerSensor}>PHONE IMU + GPS ACTIVE</Text>
        </View>

        {/* الزمن + النقاط + الخطوات */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{durationFormatted}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Data Points</Text>
            <Text style={styles.statValue}>{sessionData.points}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Steps</Text>
            <Text style={styles.statValue}>{steps}</Text>
          </View>
        </View>

        {/* المؤشرات الستة */}
        <View style={styles.grid}>
          <ScoreCard score={stability.toFixed(1)} label="Stability" color="#32FF7E" />
          <ScoreCard score={balance.toFixed(1)} label="Balance" color="#0da6f2" />
          <ScoreCard score={smoothness.toFixed(1)} label="Smoothness" color="#FFD32A" />
          <ScoreCard score={control.toFixed(1)} label="Control" color="#FF9F1A" />
          <ScoreCard score={mobility.toFixed(1)} label="Mobility" color="#FF3E3E" />
          <ScoreCard score={load.toFixed(1)} label="Load" color="#32FF7E" />
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
  statValue: { fontSize: 20, color: "#fff", fontWeight: "700" },
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
