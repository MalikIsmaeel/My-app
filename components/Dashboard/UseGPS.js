/**
 * UseGPS.js
 * ─────────────────────────────────────────────────────────────
 * مصدر واحد لبيانات GPS في كامل التطبيق
 * الإصلاحات:
 *   ✅ استبدال stopLocationUpdatesAsync بـ subscription.remove()
 *   ✅ حذف foregroundService (يحتاج إعداد app.json خاص)
 *   ✅ تنظيف صحيح عند الخروج
 * ─────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";

export default function useGPS() {
  const [lat,      setLat]      = useState(null);
  const [lon,      setLon]      = useState(null);
  const [speed,    setSpeed]    = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [status,   setStatus]   = useState("Searching...");

  // ✅ نحفظ الـ subscription object (له .remove())
  const subscriptionRef = useRef(null);

  const startGPS = async () => {
    // إيقاف أي تتبع سابق
    if (subscriptionRef.current) {
      try { subscriptionRef.current.remove(); } catch (e) {}
      subscriptionRef.current = null;
    }

    const { status: perm } = await Location.requestForegroundPermissionsAsync();
    if (perm !== "granted") {
      setStatus("Permission Denied");
      return false;
    }

    setStatus("Searching...");

    try {
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy:         Location.Accuracy.BestForNavigation,
          timeInterval:     1000,
          distanceInterval: 2,
        },
        (loc) => {
          if (!loc?.coords) { setStatus("No Signal"); return; }

          const { latitude, longitude, speed: spd, accuracy: acc } = loc.coords;

          setLat(latitude);
          setLon(longitude);
          setSpeed(spd || 0);
          setAccuracy(acc);
          setStatus("GPS Active");
        }
      );
      return true;
    } catch (e) {
      setStatus("GPS Failed");
      return false;
    }
  };

  useEffect(() => {
    startGPS();
    return () => {
      if (subscriptionRef.current) {
        try { subscriptionRef.current.remove(); } catch (e) {}
      }
    };
  }, []);

  return { lat, lon, speed, accuracy, status, startGPS };
}