/**
 * useBackgroundSession.js
 *
 * يحافظ على الجلسة شغّالة حتى لو المستخدم خرج من التطبيق.
 * يستخدم:
 *   - expo-task-manager    → تسجيل background task
 *   - expo-location        → GPS في الـ background
 *   - expo-background-fetch → تنشيط دوري (iOS)
 *   - AsyncStorage         → حفظ الـ frames بين الـ launches
 */

import { useEffect, useRef, useCallback } from "react";
import * as TaskManager       from "expo-task-manager";
import * as Location          from "expo-location";
import * as BackgroundFetch   from "expo-background-fetch";
import AsyncStorage           from "@react-native-async-storage/async-storage";
import { AppState, Platform } from "react-native";

// ── أسماء الـ Tasks ───────────────────────────────────────────────────────────
export const LOCATION_TASK   = "BACKGROUND_LOCATION_TASK";
export const BG_FETCH_TASK   = "BACKGROUND_FETCH_TASK";
const FRAMES_KEY             = "@session_frames";
const SESSION_ACTIVE_KEY     = "@session_active";

// ══════════════════════════════════════════════════════════════════════════════
// تسجيل الـ Tasks  (لازم يكون خارج أي Component — على مستوى الملف)
// ══════════════════════════════════════════════════════════════════════════════

// 1) Location Task — بيشتغل في الـ background ويحفظ كل موقع في AsyncStorage
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn("[BG Location]", error.message);
    return;
  }

  const isActive = await AsyncStorage.getItem(SESSION_ACTIVE_KEY);
  if (isActive !== "true") return;

  const { locations } = data;
  if (!locations || locations.length === 0) return;

  try {
    const raw    = await AsyncStorage.getItem(FRAMES_KEY);
    const frames = raw ? JSON.parse(raw) : [];

    const newFrames = locations.map(loc => ({
      time:     loc.timestamp,
      dt:       0.05,
      accel:    { x: 0, y: 0, z: 0 },
      linear:   { x: 0, y: 0, z: 0 },
      gyro:     { x: 0, y: 0, z: 0 },
      gps: {
        lat:      loc.coords.latitude,
        lon:      loc.coords.longitude,
        speed:    loc.coords.speed,
        accuracy: loc.coords.accuracy,
      },
      source: "Background-GPS",
    }));

    // نحتفظ بآخر 2000 frame بس عشان ما نملّي الذاكرة
    const updated = [...frames, ...newFrames].slice(-2000);
    await AsyncStorage.setItem(FRAMES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("[BG Location] AsyncStorage error:", e);
  }
});

// 2) Background Fetch Task (iOS mainly) — يضمن إن الـ app ما يُقفل
TaskManager.defineTask(BG_FETCH_TASK, async () => {
  const isActive = await AsyncStorage.getItem(SESSION_ACTIVE_KEY);
  if (isActive !== "true") {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// ══════════════════════════════════════════════════════════════════════════════
// Hook الرئيسي
// ══════════════════════════════════════════════════════════════════════════════
export default function useBackgroundSession({
  isRunning,
  isPaused,
  onFramesRestored,   // callback لما نرجّع الـ frames المحفوظة
}) {
  const appStateRef = useRef(AppState.currentState);

  // ── تسجيل Background Location ──────────────────────────────────────────────
  const startBackgroundLocation = useCallback(async () => {
    try {
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      if (fg !== "granted") return;

      const { status: bg } = await Location.requestBackgroundPermissionsAsync();
      if (bg !== "granted") {
        console.warn("[BG] Background location permission denied");
        return;
      }

      const alreadyRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
      if (!alreadyRunning) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK, {
          accuracy:              Location.Accuracy.Balanced,
          timeInterval:          2000,       // كل 2 ثانية
          distanceInterval:      2,          // أو كل 2 متر
          showsBackgroundLocationIndicator: true,   // iOS: أيقونة الـ GPS الزرقاء
          foregroundService: {               // Android: Notification مطلوبة
            notificationTitle:   "ProAnalytics — Session Active",
            notificationBody:    "Recording your motion data in the background",
            notificationColor:   "#0da6f2",
          },
          pausesUpdatesAutomatically: false,
          activityType: Location.ActivityType.Fitness,
        });
      }
    } catch (e) {
      console.warn("[BG] startLocationUpdates error:", e);
    }
  }, []);

  const stopBackgroundLocation = useCallback(async () => {
    try {
      const running = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
      if (running) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK);
      }
    } catch (e) {
      console.warn("[BG] stopLocationUpdates error:", e);
    }
  }, []);

  // ── تسجيل Background Fetch ─────────────────────────────────────────────────
  const registerBackgroundFetch = useCallback(async () => {
    try {
      await BackgroundFetch.registerTaskAsync(BG_FETCH_TASK, {
        minimumInterval: 15,        // iOS: أقل فترة ممكنة (15 ثانية)
        stopOnTerminate: false,     // يكمل بعد إغلاق الـ app
        startOnBoot:     true,      // يبدأ لو الجهاز restart
      });
    } catch (e) {
      // ممكن يكون registered من قبل
      console.log("[BG Fetch] already registered or error:", e);
    }
  }, []);

  const unregisterBackgroundFetch = useCallback(async () => {
    try {
      await BackgroundFetch.unregisterTaskAsync(BG_FETCH_TASK);
    } catch (_) {}
  }, []);

  // ── إدارة الجلسة في AsyncStorage ──────────────────────────────────────────
  const markSessionActive = async () => {
    await AsyncStorage.setItem(SESSION_ACTIVE_KEY, "true");
  };

  const markSessionInactive = async () => {
    await AsyncStorage.setItem(SESSION_ACTIVE_KEY, "false");
  };

  const clearStoredFrames = async () => {
    await AsyncStorage.removeItem(FRAMES_KEY);
  };

  // ── استرجاع الـ frames المحفوظة عند فتح الـ app ────────────────────────────
  const restoreFrames = useCallback(async () => {
    try {
      const isActive = await AsyncStorage.getItem(SESSION_ACTIVE_KEY);
      if (isActive !== "true") return;

      const raw = await AsyncStorage.getItem(FRAMES_KEY);
      if (!raw) return;

      const frames = JSON.parse(raw);
      if (frames.length > 0 && onFramesRestored) {
        onFramesRestored(frames);
      }
    } catch (e) {
      console.warn("[BG] restoreFrames error:", e);
    }
  }, [onFramesRestored]);

  // ── AppState listener: لما الـ app يرجع من الـ background ─────────────────
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async nextState => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      // رجع للـ foreground
      if (
        (prev === "background" || prev === "inactive") &&
        nextState === "active"
      ) {
        await restoreFrames();
      }
    });

    return () => subscription.remove();
  }, [restoreFrames]);

  // ── ابدأ / وقّف الـ background tasks حسب حالة الجلسة ─────────────────────
  useEffect(() => {
    if (isRunning && !isPaused) {
      markSessionActive();
      startBackgroundLocation();
      registerBackgroundFetch();
    } else if (!isRunning) {
      markSessionInactive();
      stopBackgroundLocation();
      unregisterBackgroundFetch();
      clearStoredFrames();
    }
  }, [isRunning, isPaused]);

  // ── تنظيف لو الـ component اتفك ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      // لا تقفل الـ background tasks لما الـ component يـ unmount
      // لأن الـ background يشتغل مستقل عن الـ component
    };
  }, []);

  return {
    clearStoredFrames,
    markSessionInactive,
  };
}
