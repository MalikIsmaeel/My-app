/**
 * useSensors.js
 * ─────────────────────────────────────────────────────────────
 * مصدر واحد لكل بيانات الحساسات (Accelerometer + Gyroscope)
 * يُعيد:
 *   accel  — التسارع الخام  { x, y, z }
 *   linear — التسارع الخطي بعد طرح الجاذبية { x, y, z }
 *   gyro   — الجايروسكوب   { x, y, z }
 * ─────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";

const ALPHA = 0.8; // معامل low-pass filter

export default function useSensors() {
  const [accel,  setAccel]  = useState({ x: 0, y: 0, z: 0 });
  const [linear, setLinear] = useState({ x: 0, y: 0, z: 0 });
  const [gyro,   setGyro]   = useState({ x: 0, y: 0, z: 0 });

  const gravityRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    // ─── WEB ──────────────────────────────────────────────
    if (Platform.OS === "web") {
      const handle = (e) => {
        if (e.acceleration) {
          const a = {
            x: e.acceleration.x || 0,
            y: e.acceleration.y || 0,
            z: e.acceleration.z || 0,
          };
          setAccel(a);

          // Web DeviceMotion يُعيد التسارع بدون جاذبية مباشرة
          setLinear(a);
        }
        if (e.rotationRate) {
          setGyro({
            x: e.rotationRate.alpha || 0,
            y: e.rotationRate.beta  || 0,
            z: e.rotationRate.gamma || 0,
          });
        }
      };
      window.addEventListener("devicemotion", handle);
      return () => window.removeEventListener("devicemotion", handle);
    }

    // ─── MOBILE ───────────────────────────────────────────
    let accelSub, gyroSub;

    async function start() {
      const { Accelerometer, Gyroscope } = await import("expo-sensors");

      Accelerometer.setUpdateInterval(50); // 20 fps
      Gyroscope.setUpdateInterval(50);

      accelSub = Accelerometer.addListener(({ x, y, z }) => {
        // Raw
        setAccel({ x, y, z });

        // Low-pass → عزل الجاذبية
        const g = gravityRef.current;
        g.x = ALPHA * g.x + (1 - ALPHA) * x;
        g.y = ALPHA * g.y + (1 - ALPHA) * y;
        g.z = ALPHA * g.z + (1 - ALPHA) * z;

        // Linear = Total - Gravity
        setLinear({
          x: x - g.x,
          y: y - g.y,
          z: z - g.z,
        });
      });

      gyroSub = Gyroscope.addListener((data) => setGyro(data));
    }

    start();

    return () => {
      accelSub?.remove();
      gyroSub?.remove();
    };
  }, []);

  return { accel, linear, gyro };
}