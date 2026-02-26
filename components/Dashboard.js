import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import * as Location from "expo-location";

import Header from "./Dashboard/Header";
import SessionTimer from "./Dashboard/SessionTimer";
import AccelerometerSection from "./Dashboard/AccelerometerSection";
import GyroscopeSection from "./Dashboard/GyroscopeSection";
import StatsSection from "./Dashboard/StatsSection";
import BottomNav from "./Dashboard/BottomNav";
import BottomButtons from "./Dashboard/BottomButtons";
import useSensors from "./Dashboard/useSensors";

export default function Dashboard({ navigation }) {
  const { accel, gyro } = useSensors();

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [frames, setFrames] = useState([]);

  // GPS states
  const [currentLat, setCurrentLat] = useState(null);
  const [currentLon, setCurrentLon] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  // GPS status text
  const [gpsStatus, setGpsStatus] = useState("Searching...");

  /* ---------------------------------------------
     GPS STARTER + DETECT
  ----------------------------------------------*/
  const startGPS = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setGpsStatus("Permission Denied");
      Alert.alert("GPS Permission", "Please enable GPS permission");
      return;
    }

    setGpsStatus("Searching...");

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 500,
        distanceInterval: 0,
      },
      (loc) => {
        if (!loc || !loc.coords) {
          setGpsStatus("No Signal");
          return;
        }

        setCurrentLat(loc.coords.latitude);
        setCurrentLon(loc.coords.longitude);
        setCurrentSpeed(loc.coords.speed || 0);

        setGpsStatus("GPS Active");
      }
    );
  };

  // Run GPS on load
  useEffect(() => {
    startGPS();
  }, []);

  /* ---------------------------------------------
     FRAME RECORDING
  ----------------------------------------------*/
  useEffect(() => {
    let interval = null;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        const time = Date.now();

        setFrames((prev) => [
          ...prev,
          {
            time,
            accel,
            gyro,
            gps: {
              lat: currentLat,
              lon: currentLon,
              speed: currentSpeed,
            },
          },
        ]);
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, accel, gyro, currentLat, currentLon, currentSpeed]);

  /* ---------------------------------------------
     END SESSION
  ----------------------------------------------*/
  const stopSession = () => {
    setIsRunning(false);
    setIsPaused(false);

    const sessionData = {
      duration: frames.length * 0.1,
      points: frames.length,
      frames,
    };

    navigation.navigate("SessionAnalysis", { sessionData });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0F14" }}>
      <Header />

      {/* GPS STATUS */}
      <Text
        style={{
          color: gpsStatus === "GPS Active" ? "#32FF7E" : "#FF3E3E",
          textAlign: "center",
          marginBottom: 10,
          fontSize: 12,
        }}
      >
        {gpsStatus}
      </Text>

      <SessionTimer
        isRunning={isRunning}
        isPaused={isPaused}
        onFrame={() => {}}
      />

      <AccelerometerSection accel={accel} />
      <GyroscopeSection gyro={gyro} />
      <StatsSection />

      <BottomNav />
 
      <BottomButtons
        isRunning={isRunning}
        isPaused={isPaused}
        onStart={() => setIsRunning(true)}
        onPause={() => setIsPaused(!isPaused)}
        onStop={() => {
          setIsRunning(false);
          setIsPaused(false);
          setFrames([]);
        }}
        onRefreshGPS={startGPS} // زر الريفريش
      />
    </View>
  );
  //query style for bottom buttons and the dashboard
  const styles = StyleSheet.create({
    container: {
      padding: 16,
      paddingBottom: 30,
    },
    bottomContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  });

}
