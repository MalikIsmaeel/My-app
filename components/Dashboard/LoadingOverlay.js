/**
 * LoadingOverlay.js
 * شاشة loading تظهر عند معالجة بيانات الجلسة
 */
import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Easing } from "react-native";

export default function LoadingOverlay({ visible, message = "Processing session..." }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start();

      // Dots bounce animation
      const animDot = (dot, delay) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: -10, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0,   duration: 300, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
            Animated.delay(600),
          ])
        );

      animDot(dot1, 0).start();
      animDot(dot2, 150).start();
      animDot(dot3, 300).start();
    } else {
      Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      dot1.stopAnimation(); dot1.setValue(0);
      dot2.stopAnimation(); dot2.setValue(0);
      dot3.stopAnimation(); dot3.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fade }]}>
      <View style={styles.card}>

        {/* أيقونة */}
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>📊</Text>
        </View>

        {/* نص */}
        <Text style={styles.title}>Analyzing Session</Text>
        <Text style={styles.subtitle}>{message}</Text>

        {/* نقاط متحركة */}
        <View style={styles.dots}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { transform: [{ translateY: dot }] }]}
            />
          ))}
        </View>

        {/* شريط تقدم وهمي */}
        <ProgressBar />

      </View>
    </Animated.View>
  );
}

function ProgressBar() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0.85,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.barBg}>
      <Animated.View
        style={[
          styles.barFill,
          { width: progress.interpolate({ inputRange:[0,1], outputRange:["0%","100%"] }) }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11,15,20,0.92)",
    justifyContent:  "center",
    alignItems:      "center",
    zIndex:          999,
  },
  card: {
    backgroundColor: "#13181F",
    borderRadius:    24,
    padding:         32,
    alignItems:      "center",
    width:           260,
    borderWidth:     1,
    borderColor:     "rgba(13,166,242,0.2)",
  },
  iconWrap: {
    width: 64, height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(13,166,242,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon:     { fontSize: 28 },
  title:    { color: "#fff",  fontSize: 16, fontWeight: "700", marginBottom: 6 },
  subtitle: { color: "#555",  fontSize: 12, marginBottom: 24, textAlign: "center" },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: "#0da6f2",
  },
  barBg: {
    width: "100%", height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    backgroundColor: "#0da6f2",
    borderRadius: 2,
  },
});