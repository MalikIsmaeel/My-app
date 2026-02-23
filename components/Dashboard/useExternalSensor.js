import { useState, useEffect } from "react";
import { BleManager } from "react-native-ble-plx";
import base64 from "react-native-base64";

export default function useExternalSensor() {
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });
  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const manager = new BleManager();

    manager.startDeviceScan(null, null, (error, device) => {
      if (device && device.name === "MPU_DEVICE") {
        manager.stopDeviceScan();

        device.connect().then((d) => {
          d.discoverAllServicesAndCharacteristics().then((dev) => {
            dev.monitorCharacteristicForService(
              "serviceUUID",
              "charUUID",
              (error, data) => {
                const text = base64.decode(data.value);
                const [ax, ay, az, gx, gy, gz] = text.split(",");

                setAccel({ x: +ax, y: +ay, z: +az });
                setGyro({ x: +gx, y: +gy, z: +gz });
              }
            );
          });
        });
      }
    });

    return () => manager.destroy();
  }, []);

  return { accel, gyro };
}
