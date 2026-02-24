import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Accelerometer, Gyroscope } from "expo-sensors";

export default function SensorsReader() {
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    // سرعة التحديث (كل 100ms)
    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);

    const accelSub = Accelerometer.addListener((data) => {
      setAccelData(data);
    });

    const gyroSub = Gyroscope.addListener((data) => {
      setGyroData(data);
    });

    // تنظيف الاشتراك عند الخروج
    return () => {
      accelSub && accelSub.remove();
      gyroSub && gyroSub.remove();
    };
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: "white", fontSize: 16, marginBottom: 10 }}>
        Accelerometer
      </Text>
      <Text style={{ color: "white" }}>X: {accelData.x.toFixed(2)}</Text>
      <Text style={{ color: "white" }}>Y: {accelData.y.toFixed(2)}</Text>
      <Text style={{ color: "white" }}>Z: {accelData.z.toFixed(2)}</Text>

      <View style={{ height: 20 }} />

      <Text style={{ color: "white", fontSize: 16, marginBottom: 10 }}>
        Gyroscope
      </Text>
      <Text style={{ color: "white" }}>X: {gyroData.x.toFixed(2)}</Text>
      <Text style={{ color: "white" }}>Y: {gyroData.y.toFixed(2)}</Text>
      <Text style={{ color: "white" }}>Z: {gyroData.z.toFixed(2)}</Text>
    </View>
  );
}
