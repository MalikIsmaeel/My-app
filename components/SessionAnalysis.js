import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import ScoreCard from "./ScoreCard";

import { computeAnalytics } from "./utils/analytics";

// ── helper: متوسط قيمة معينة عبر كل الـ windows ─────
function avg(windows, key) {
  if (!windows || windows.length === 0) return 0;
  const sum = windows.reduce((a, w) => a + (w[key] || 0), 0);
  return sum / windows.length;
}

// ── GPS helpers ──────────────────────────────────────
function toRad(deg) { return deg * Math.PI / 180; }

function haversine(lat1, lon1, lat2, lon2) {
  const R  = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function calcTotalDistance(frames) {
  let dist = 0;
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i-1].gps;
    const b = frames[i].gps;
    if (a?.lat && a?.lon && b?.lat && b?.lon &&
        a.lat !== b.lat && a.lon !== b.lon) {
      dist += haversine(a.lat, a.lon, b.lat, b.lon);
    }
  }
  return dist;
}

function calcAvgSpeed(frames) {
  const speeds = frames
    .map(f => f.gps?.speed)
    .filter(s => s != null && s >= 0);
  if (speeds.length === 0) return 0;
  return (speeds.reduce((a,b) => a+b, 0) / speeds.length) * 3.6;
}

function calcInstantSpeed(frames) {
  for (let i = frames.length - 1; i >= 0; i--) {
    const s = frames[i].gps?.speed;
    if (s != null && s >= 0) return s * 3.6;
  }
  return 0;
}

function calcMovement(frames) {
  let total = 0;
  for (let i = 1; i < frames.length; i++) {
    const f  = frames[i];
    const dt = (f.time - frames[i-1].time) / 1000 || 0.05;
    const mag = Math.sqrt(
      (f.linear?.x || 0)**2 +
      (f.linear?.y || 0)**2 +
      (f.linear?.z || 0)**2
    );
    total += mag * dt;
  }
  return total;
}

/* ════════════════════════════════════════════════════ */

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

  const frames = Array.isArray(sessionData.frames) ? sessionData.frames : [];

  // ✅ الاستدعاء الصحيح — دالة واحدة تُرجع كل شيء
  const analytics = computeAnalytics(frames, sessionData.steps || 0);
  const windows   = analytics.windows || [];

  // ── متوسطات المؤشرات من الـ windows ──────────
  const stabilityScore  = avg(windows, "stability");
  const smoothnessScore = avg(windows, "smoothness");
  const balanceScore    = avg(windows, "balance");
  const controlScore    = avg(windows, "control");
  const mobilityScore   = avg(windows, "mobility");
  const loadScore       = avg(windows, "load");

  // ── GPS / حركة ───────────────────────────────
  const totalDistance = calcTotalDistance(frames);
  const avgSpeedVal   = calcAvgSpeed(frames);
  const instantSpeed  = calcInstantSpeed(frames);
  const movement      = calcMovement(frames);

  const durationFmt = analytics.durationFormatted || "00:00:00";
  const steps       = analytics.steps || 0;

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
            score={`${avgSpeedVal.toFixed(1)} km/h`}
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