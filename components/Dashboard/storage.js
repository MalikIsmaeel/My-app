import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();

// حفظ قيمة
export const save = (key, value) => {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (e) {
    console.log("MMKV save error:", e);
  }
};

// تحميل قيمة
export const load = (key) => {
  try {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.log("MMKV load error:", e);
    return null;
  }
};

// حذف قيمة
export const remove = (key) => {
  try {
    storage.delete(key);
  } catch (e) {
    console.log("MMKV delete error:", e);
  }
};

// إضافة Log
export const addLog = (message) => {
  try {
    const logs = load("logs") || [];
    logs.push({
      time: new Date().toISOString(),
      message,
    });
    save("logs", logs);
  } catch (e) {
    console.log("MMKV log error:", e);
  }
};
