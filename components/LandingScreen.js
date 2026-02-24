import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Platform,
  I18nManager,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function LandingScreen() {
  const navigation = useNavigation();
  const [hover, setHover] = useState(false);

  const isRTL = I18nManager.isRTL; // Arabic = true

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Ambient Glows */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        {/* Decorative Lines */}
        <View style={[styles.line, { top: "25%", opacity: 0.3 }]} />
        <View
          style={[
            styles.line,
            { top: "50%", opacity: 0.2, transform: [{ scaleX: 0.75 }] },
          ]}
        />
        <View style={[styles.line, { top: "75%", opacity: 0.1 }]} />

        {/* Logo */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoGlow} />

          <View style={styles.logoCircle}>
            <MaterialIcons name="sensors" size={48} color="#0da6f2" />
          </View>

          <View style={styles.logoRing} />
        </View>

        {/* Title */}
        <Text style={styles.title}>ProAnalytics Medical</Text>

        <View style={styles.separator} />

        <Text style={styles.subtitle}>
          تحليل حركة الجسم وتحويلها لمؤشرات رقمية
        </Text>

        {/* Start Button */}
        <Pressable
          style={({ pressed }) => [
            styles.startButton,

            // مكان الزر حسب اللغة
            isRTL ? styles.leftPosition : styles.rightPosition,

            // Hover على الويب
            hover && Platform.OS === "web" && styles.startButtonHover,

            // Hover-like على الموبايل
            pressed && Platform.OS !== "web" && styles.startButtonHover,
          ]}
          onPress={() => navigation.navigate("Dashboard")}
          onMouseEnter={() => Platform.OS === "web" && setHover(true)}
          onMouseLeave={() => Platform.OS === "web" && setHover(false)}
        >
          {({ pressed }) => (
            <>
              <MaterialIcons
                name="arrow-forward"
                size={22}
                color={
                  (hover && Platform.OS === "web") ||
                  (pressed && Platform.OS !== "web")
                    ? "#000"
                    : "#0da6f2"
                }
              />

              <Text
                style={[
                  styles.startButtonText,
                  (hover && Platform.OS === "web") ||
                  (pressed && Platform.OS !== "web")
                    ? { color: "#000" }
                    : null,
                ]}
              >
                ابدأ التحليل
              </Text>
            </>
          )}
        </Pressable>

        {/* Footer */}
        <Text style={styles.footerText}>
          High-Precision Movement Analysis
        </Text>

        {/* Dots */}
        <View style={styles.dots}>
          <View style={[styles.dot, { opacity: 1 }]} />
          <View style={[styles.dot, { opacity: 0.6 }]} />
          <View style={[styles.dot, { opacity: 0.3 }]} />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },

  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // Glows
  glowTop: {
    position: "absolute",
    top: -150,
    left: -150,
    width: 300,
    height: 300,
    backgroundColor: "rgba(13,166,242,0.2)",
    borderRadius: 300,
  },
  glowBottom: {
    position: "absolute",
    bottom: -150,
    right: -150,
    width: 300,
    height: 300,
    backgroundColor: "rgba(13,166,242,0.2)",
    borderRadius: 300,
  },

  // Lines
  line: {
    position: "absolute",
    left: 0,
    width: "100%",
    height: 1,
    backgroundColor: "#0da6f2",
  },

  // Logo
  logoWrapper: {
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    backgroundColor: "rgba(13,166,242,0.3)",
    borderRadius: 200,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 96,
    backgroundColor: "#0B0F14",
    borderWidth: 1,
    borderColor: "rgba(13,166,242,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "rgba(13,166,242,0.2)",
  },

  // Text
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  separator: {
    width: 60,
    height: 4,
    backgroundColor: "#0da6f2",
    borderRadius: 10,
    opacity: 0.6,
    marginBottom: 20,
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 18,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 26,
  },

  // Start Button
  startButton: {
    position: "absolute",
    bottom: 40,
    width: 150,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#0da6f2",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },

  startButtonHover: {
    backgroundColor: "#fff",
    borderColor: "#fff",
    shadowColor: "#fff",
    shadowOpacity: 0.8,
  },

  leftPosition: {
    left: 20,
  },

  rightPosition: {
    right: 20,
  },

  startButtonText: {
    marginLeft: 8,
    color: "#cbd5e1",
    fontSize: 15,
    letterSpacing: 1,
    fontWeight: "600",
  },

  // Footer
  footerText: {
    position: "absolute",
    bottom: 100,
    color: "rgba(13,166,242,0.4)",
    fontSize: 12,
    letterSpacing: 2,
  },

  // Dots
  dots: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: "#0da6f2",
    borderRadius: 8,
    marginHorizontal: 4,
  },
});
