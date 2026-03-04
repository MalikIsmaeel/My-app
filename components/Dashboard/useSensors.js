import { useState, useEffect } from "react";
import { Accelerometer, Gyroscope } from "expo-sensors";
import { addLog } from "./storage";

export default function useSensors() {
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });
  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    addLog("HOOK_MOUNTED");

    async function init() {
      try {
        addLog("INIT_START");

        // طلب الصلاحيات
        addLog("REQUESTING_PERMISSIONS");
        const accelPerm = await Accelerometer.requestPermissionsAsync();
        const gyroPerm = await Gyroscope.requestPermissionsAsync();
        addLog(`PERMISSIONS_RESULT accel=${accelPerm.status} gyro=${gyroPerm.status}`);

        // التحقق من توفر الحساسات
        const accelAvailable = await Accelerometer.isAvailableAsync();
        const gyroAvailable = await Gyroscope.isAvailableAsync();
        addLog(`SENSORS_AVAILABLE accel=${accelAvailable} gyro=${gyroAvailable}`);

        // إعداد التحديث
        addLog("SETTING_UPDATE_INTERVAL");
        Accelerometer.setUpdateInterval(100);
        Gyroscope.setUpdateInterval(100);
        addLog("UPDATE_INTERVAL_SET");

        // إضافة Listeners
        addLog("ADDING_LISTENERS");

        const accelSub = Accelerometer.addListener((data) => {
          setAccel(data);
          addLog("ACCEL_EVENT_RECEIVED");
        });

        const gyroSub = Gyroscope.addListener((data) => {
          setGyro(data);
          addLog("GYRO_EVENT_RECEIVED");
        });

        addLog("LISTENERS_READY");

        // Cleanup
        return () => {
          addLog("CLEANUP_START");
          accelSub && accelSub.remove();
          gyroSub && gyroSub.remove();
          addLog("CLEANUP_DONE");
        };

      } catch (err) {
        addLog("ERROR_" + err.message);
      }
    }

    const cleanup = init();

    return () => {
      addLog("HOOK_UNMOUNT");
      cleanup && cleanup();
    };
  }, []);

  return { accel, gyro };
}
