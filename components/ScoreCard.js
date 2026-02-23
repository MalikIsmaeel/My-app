import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ScoreCard({ score, label, color }) {
  return (
    <View style={[styles.card, { borderColor: color }]}>
      <Text style={[styles.score, { color }]}>{score}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
// components\ScoreCard.js
const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#1f1d1dff",
    paddingVertical: 22,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 14,
    alignItems: "center",
  },

  score: {
    fontSize: 32,
    fontWeight: "800",
  },

  label: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#444",
    letterSpacing: 1,
  },
});
