import { useState, useEffect } from "react";
import { Platform } from "react-native";

export default function useSensors() {
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });
  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    // -------------------------
    // 📌 WEB VERSION
    // -------------------------
    if (Platform.OS === "web") {
      const handleMotion = (event) => {
        if (event.acceleration) {
          setAccel({
            x: event.acceleration.x || 0,
            y: event.acceleration.y || 0,
            z: event.acceleration.z || 0,
          });
        }

        if (event.rotationRate) {
          setGyro({
            x: event.rotationRate.alpha || 0,
            y: event.rotationRate.beta || 0,
            z: event.rotationRate.gamma || 0,
          });
        }
      };

      window.addEventListener("devicemotion", handleMotion);

      return () => {
        window.removeEventListener("devicemotion", handleMotion);
      };
    }

    // -------------------------
    // 📌 MOBILE VERSION (Expo Sensors)
    // -------------------------
    async function loadMobileSensors() {
      const { Accelerometer, Gyroscope } = await import("expo-sensors");

      Accelerometer.setUpdateInterval(100);
      Gyroscope.setUpdateInterval(100);

      const accelSub = Accelerometer.addListener((data) => setAccel(data));
      const gyroSub = Gyroscope.addListener((data) => setGyro(data));

      return () => {
        accelSub && accelSub.remove();
        gyroSub && gyroSub.remove();
      };
    }

    const cleanup = loadMobileSensors();
    return () => cleanup && cleanup();
  }, []);

  return { accel, gyro };
}
