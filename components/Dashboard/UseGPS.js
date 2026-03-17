import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";

/* ----------------------------------------------------
   hook مخصص لإدارة GPS
   - يطلب الإذن
   - يبدأ التتبع
   - يحدث الإحداثيات والسرعة والدقة
   - يعيد الحالة للاستخدام في أي مكوّن
---------------------------------------------------- */
export default function useGPS() {

  /* ---------------- حالات GPS ---------------- */
  const [lat, setLat] = useState(null);        // خط العرض
  const [lon, setLon] = useState(null);        // خط الطول
  const [speed, setSpeed] = useState(0);       // السرعة الحالية
  const [accuracy, setAccuracy] = useState(null); // دقة GPS
  const [status, setStatus] = useState("Searching..."); // حالة GPS

  /* ---------------- معرف مراقبة GPS ---------------- */
  const watchIdRef = useRef(null); // يخزن watchPositionAsync ID

  /* ----------------------------------------------------
     دالة بدء GPS
     - تطلب الإذن
     - تبدأ التتبع
     - تحفظ watchId
  ---------------------------------------------------- */
  const startGPS = async () => {

    // إذا كان هناك تتبع سابق → أوقفه
    if (watchIdRef.current) {
      await Location.stopLocationUpdatesAsync(watchIdRef.current);
      watchIdRef.current = null;
    }

    // طلب إذن الوصول للموقع
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setStatus("Permission Denied"); // تم رفض الإذن
      return false;
    }

    setStatus("Searching..."); // جاري البحث عن إشارة GPS

    try {
      // بدء مراقبة الموقع
      const id = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, // أعلى دقة
          timeInterval: 1000,               // تحديث كل ثانية
          distanceInterval: 5,              // تحديث بعد 5 متر حركة
          deferredUpdatesInterval: 1000,
          foregroundService: {
            notificationTitle: "GPS Tracking",
            notificationBody: "Tracking your movement",
          },
        },

        /* ----------------------------------------------------
           عند وصول بيانات GPS جديدة
        ---------------------------------------------------- */
        (loc) => {
          if (!loc?.coords) {
            setStatus("No Signal"); // لا توجد إشارة GPS
            return;
          }

          // تحديث بيانات GPS
          setLat(loc.coords.latitude);
          setLon(loc.coords.longitude);
          setSpeed(loc.coords.speed || 0);
          setAccuracy(loc.coords.accuracy);

          setStatus("GPS Active"); // GPS يعمل
        }
      );

      // حفظ معرف التتبع
      watchIdRef.current = id;
      return true;

    } catch (error) {
      setStatus("GPS Failed"); // فشل تشغيل GPS
      return false;
    }
  };

  /* ----------------------------------------------------
     تشغيل GPS عند أول تحميل للمكوّن
     وإيقافه عند الخروج
  ---------------------------------------------------- */
  useEffect(() => {
    startGPS(); // تشغيل GPS تلقائيًا

    return () => {
      // تنظيف عند الخروج
      if (watchIdRef.current) {
        Location.stopLocationUpdatesAsync(watchIdRef.current);
      }
    };
  }, []);

  /* ----------------------------------------------------
     القيم التي يعيدها hook
     يمكن استخدامها في أي مكوّن
  ---------------------------------------------------- */
  return {
    lat,
    lon,
    speed,
    accuracy,
    status,
    startGPS, // لإعادة تشغيل GPS يدويًا
  };
}
