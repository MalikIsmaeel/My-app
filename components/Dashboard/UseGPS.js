import { useState, useRef } from "react";
import * as Location from "expo-location";

export default function useGPS() {
  const [lat,      setLat]      = useState(null);
  const [lon,      setLon]      = useState(null);
  const [speed,    setSpeed]    = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [status,   setStatus]   = useState("GPS Inactive");

  const watchRef = useRef(null);

  // ── تشغيل GPS ─────────────────────────────────────
  const startGPS = async () => {
    // إذا في watch شغّال، وقّفه أولاً
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }

    const { status: perm } = await Location.requestForegroundPermissionsAsync();
    if (perm !== "granted") {
      setStatus("GPS Denied");
      return;
    }

    setStatus("GPS Active");

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy:         Location.Accuracy.High,
        timeInterval:     1000,
        distanceInterval: 1,
      },
      (loc) => {
        setLat(loc.coords.latitude);
        setLon(loc.coords.longitude);
        setSpeed(loc.coords.speed);
        setAccuracy(loc.coords.accuracy);
      }
    );
  };

  // ── إيقاف GPS ─────────────────────────────────────
  const stopGPS = () => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    setStatus("GPS Stopped");
    setSpeed(null);
    setAccuracy(null);
  };

  return { lat, lon, speed, accuracy, status, startGPS, stopGPS };
}
