import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
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
  calculateMovement,
  formatDuration,
} from "./utils/analytics";

export default function SessionAnalysis() {
  const route       = useRoute();
  const navigation  = useNavigation();
  const sessionData = route.params?.sessionData;

  if (!sessionData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No session data found</Text>
        <TouchableOpacity
          style={[styles.button, { marginTop: 20, width: 200 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ FIX: تأكد دائماً إن frames مصفوفة وليست undefined
  const frames = Array.isArray(sessionData.frames) ? sessionData.frames : [];

  // ── مؤشرات الحركة — محمية من الكراش ─────────
  let stabilityScore  = 0;
  let smoothnessScore = 0;
  let balanceScore    = 0;
  let controlScore    = 0;
  let mobilityScore   = 0;
  let loadScore       = 0;
  let totalDistance   = 0;
  let avgSpeed        = 0;
  let instantSpeed    = 0;
  let movement        = 0;

  // ✅ FIX: لف الحسابات بـ try/catch — لو أي function فيها خطأ ما يكسر الشاشة
  try { stabilityScore  = calculateStability(frames)  || 0; } catch (e) { console.warn("stability",  e); }
  try { smoothnessScore = calculateSmoothness(frames) || 0; } catch (e) { console.warn("smoothness", e); }
  try { balanceScore    = calculateBalance(frames)    || 0; } catch (e) { console.warn("balance",    e); }
  try { controlScore    = calculateControl(frames)    || 0; } catch (e) { console.warn("control",    e); }
  try { mobilityScore   = calculateMobility(frames)   || 0; } catch (e) { console.warn("mobility",   e); }
  try { loadScore       = calculateLoad(frames)       || 0; } catch (e) { console.warn("load",       e); }
  try { totalDistance   = calculateTotalDistance(frames) || 0; } catch (e) { console.warn("distance", e); }
  try { avgSpeed        = calculateAverageSpeed(frames)  || 0; } catch (e) { console.warn("avgSpeed", e); }
  try { instantSpeed    = getInstantSpeed(frames)        || 0; } catch (e) { console.warn("instantSpeed", e); }
  try { movement        = calculateMovement(frames)      || 0; } catch (e) { console.warn("movement", e); }

  // ── وقت الجلسة ───────────────────────────────
  const duration =
    frames.length >= 2
      ? (frames[frames.length - 1].time - frames[0].time) / 1000
      : sessionData.duration || 0;

  const durationFmt = formatDuration(duration);
  const steps       = sessionData.steps || 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Session Analysis</Text>
          <Text style={styles.headerSubtitle}>Last Session</Text>
          <Text style={styles.headerSensor}>IMU6050 + GPS ACTIVE</Text>
        </View>

        {/* تحذير إذا لا بيانات */}
        {frames.length === 0 && (
          <View style={styles.warnBox}>
            <Text style={styles.warnTxt}>
              ⚠️  No data recorded — move during session and ensure GPS is active.
            </Text>
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{durationFmt}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Steps</Text>
            <Text style={styles.statValue}>{steps.toLocaleString()}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Points</Text>
            <Text style={styles.statValue}>
              {frames.length >= 1000
                ? `${(frames.length / 1000).toFixed(1)}k`
                : frames.length}
            </Text>
          </View>
        </View>

        {/* Motion Score Cards */}
        <Text style={styles.sectionTitle}>Motion Analysis</Text>
        <View style={styles.grid}>
          <ScoreCard score={stabilityScore.toFixed(1)}  label="Stability"  color="#32FF7E" />
          <ScoreCard score={balanceScore.toFixed(1)}    label="Balance"    color="#0da6f2" />
          <ScoreCard score={smoothnessScore.toFixed(1)} label="Smoothness" color="#FFD32A" />
          <ScoreCard score={controlScore.toFixed(1)}    label="Control"    color="#FF9F1A" />
          <ScoreCard score={mobilityScore.toFixed(1)}   label="Mobility"   color="#FF3E3E" />
          <ScoreCard score={loadScore.toFixed(1)}       label="Load"       color="#32FF7E" />
        </View>

        {/* GPS / Movement Cards */}
        <Text style={styles.sectionTitle}>GPS & Movement</Text>
        <View style={styles.grid}>
          <ScoreCard
            score={totalDistance >= 1000
              ? `${(totalDistance/1000).toFixed(2)} km`
              : `${totalDistance.toFixed(0)} م`}
            label="Distance"
            color="#0da6f2"
          />
          <ScoreCard
            score={`${avgSpeed.toFixed(1)} km/h`}
            label="Avg Speed"
            color="#FFD32A"
          />
          <ScoreCard
            score={`${instantSpeed.toFixed(1)} km/h`}
            label="Instant Speed"
            color="#FF9F1A"
          />
          <ScoreCard
            score={movement.toFixed(2)}
            label="Movement (m)"
            color="#32FF7E"
          />
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Generate Medical Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, { color: "#aaa" }]}>← Back to Dashboard</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#0B0F14" },
  scroll:         { padding: 16, paddingBottom: 40 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B0F14" },
  emptyText:      { color: "#fff", fontSize: 18 },

  header:         { alignItems: "center", marginBottom: 20 },
  headerTitle:    { fontSize: 26, fontWeight: "700", color: "#fff" },
  headerSubtitle: { fontSize: 12, color: "#0da6f2", marginTop: 4 },
  headerSensor:   { fontSize: 10, color: "#aaa", marginTop: 2 },

  warnBox: {
    backgroundColor: "rgba(255,160,0,0.1)",
    borderWidth: 1, borderColor: "rgba(255,160,0,0.3)",
    borderRadius: 12, padding: 14, marginBottom: 16,
  },
  warnTxt: { color: "#FFD32A", fontSize: 13, textAlign: "center", lineHeight: 20 },

  statsRow: { flexDirection: "row", marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 14,
    borderColor: "#0da6f2",
    borderWidth: 1,
    alignItems: "center",
    marginRight: 8,
  },
  statLabel: { fontSize: 10, color: "#aaa", marginBottom: 4 },
  statValue: { fontSize: 18, color: "#fff", fontWeight: "700" },

  sectionTitle: {
    fontSize: 11, color: "#555", letterSpacing: 1,
    textTransform: "uppercase", marginBottom: 12, marginTop: 8,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 8 },

  button: {
    marginTop: 16,
    backgroundColor: "#0da6f2",
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});