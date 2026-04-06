import { useState, useEffect, useRef } from "react";

export default function useExternalMotionLink(apiUrl, wsUrl) {
  const [extAccel, setExtAccel] = useState(null);
  const [extGyro,  setExtGyro]  = useState(null);

  const [apiOnline, setApiOnline] = useState(false);
  const [wsOnline,  setWsOnline]  = useState(false);

  const wsRef = useRef(null);

  // ───────────────────────────────────────────────
  // 1) قراءة الحركة من API (أولوية رقم 1)
  // ───────────────────────────────────────────────
  useEffect(() => {
    if (!apiUrl) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        // نتوقع JSON مثل:
        // { ax, ay, az, gx, gy, gz }
        if (data.ax !== undefined) {
          setExtAccel({ x: data.ax, y: data.ay, z: data.az });
          setApiOnline(true);
        }
        if (data.gx !== undefined) {
          setExtGyro({ x: data.gx, y: data.gy, z: data.gz });
        }
      } catch (e) {
        setApiOnline(false);
      }
    }, 120); // تحديث سريع كل 120ms

    return () => clearInterval(interval);
  }, [apiUrl]);

  // ───────────────────────────────────────────────
  // 2) WebSocket fallback (أولوية رقم 2)
  // ───────────────────────────────────────────────
  useEffect(() => {
    if (!wsUrl) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setWsOnline(true);

    ws.onmessage = (msg) => {
      if (apiOnline) return; // لو API شغال → تجاهل WS

      try {
        const data = JSON.parse(msg.data);

        if (data.ax !== undefined) {
          setExtAccel({ x: data.ax, y: data.ay, z: data.az });
        }
        if (data.gx !== undefined) {
          setExtGyro({ x: data.gx, y: data.gy, z: data.gz });
        }
      } catch (e) {
        console.log("WS parse error:", e);
      }
    };

    ws.onerror = () => {
      setWsOnline(false);
      setExtGyro(null); // Reset gyroscope data on error
    };
    ws.onclose = () => {
      setWsOnline(false);
      setExtGyro(null); // Reset gyroscope data on close
    };

    return () => ws.close();
  }, [wsUrl, apiOnline]);

  return {
    extAccel,
    extGyro,
    apiOnline,
    wsOnline,
    isOnline: apiOnline || wsOnline
  };
}
