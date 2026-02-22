import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function LandingScreen() {
  const navigation = useNavigation();

  // Slider Logic
  const sliderX = useRef(new Animated.Value(0)).current;
  const SLIDER_WIDTH = Dimensions.get("window").width * 0.75;
  const SLIDE_THRESHOLD = SLIDER_WIDTH - 70;

  // -----------------------------
  // 📌 MOBILE SLIDER (PanResponder)
  // -----------------------------
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => Platform.OS !== "web",

      onPanResponderMove: (_, gesture) => {
        if (gesture.dx >= 0 && gesture.dx <= SLIDE_THRESHOLD) {
          sliderX.setValue(gesture.dx);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SLIDE_THRESHOLD - 20) {
          navigation.navigate("Dashboard");
        } else {
          Animated.spring(sliderX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // -----------------------------
  // 📌 WEB SLIDER (Mouse Events)
  // -----------------------------
  const [isDragging, setDragging] = useState(false);

  const handleMouseDown = () => {
    if (Platform.OS === "web") setDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const dx = e.nativeEvent.offsetX - 30;

    if (dx >= 0 && dx <= SLIDE_THRESHOLD) {
      sliderX.setValue(dx);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    sliderX.stopAnimation((value) => {
      if (value > SLIDE_THRESHOLD - 20) {
        navigation.navigate("Dashboard");
      } else {
        Animated.spring(sliderX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    });

    setDragging(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Ambient Glows */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        {/* Decorative Lines */}
        <View style={[styles.line, { top: "25%", opacity: 0.3 }]} />
        <View style={[styles.line, { top: "50%", opacity: 0.2, transform: [{ scaleX: 0.75 }] }]} />
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

        {/* Slider Button */}
        <View
          style={styles.sliderContainer}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Animated.View
            {...(Platform.OS !== "web" ? panResponder.panHandlers : {})}
            style={[
              styles.sliderButton,
              { transform: [{ translateX: sliderX }] },
            ]}
          >
            <MaterialIcons name="arrow-forward" size={28} color="#0da6f2" />
          </Animated.View>

          <Text style={styles.sliderText}>اسحب لبدء التحليل</Text>
        </View>

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

  // Slider
  sliderContainer: {
    width: "75%",
    height: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    marginTop: 50,
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
  },

  sliderButton: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "rgba(13,166,242,0.15)",
    borderWidth: 1,
    borderColor: "rgba(13,166,242,0.4)",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
  },

  sliderText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#cbd5e1",
    fontSize: 16,
    letterSpacing: 1,
  },

  // Footer
  footerText: {
    position: "absolute",
    bottom: 80,
    color: "rgba(13,166,242,0.4)",
    fontSize: 12,
    letterSpacing: 2,
  },

  // Dots
  dots: {
    position: "absolute",
    bottom: 40,
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
