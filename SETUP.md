# Background Session — Setup Guide

## 1. Install packages

```bash
npx expo install expo-task-manager expo-location expo-background-fetch @react-native-async-storage/async-storage
```

---

## 2. app.json — أضف الـ permissions دي

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to track your session.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "We need your location in the background to keep recording your session.",
        "NSLocationAlwaysUsageDescription": "We need your location in the background to keep recording your session.",
        "UIBackgroundModes": ["location", "fetch"]
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_LOCATION"
      ]
    },
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow ProAnalytics to use your location in the background to keep recording your session.",
          "locationAlwaysPermission": "Allow ProAnalytics to use your location in the background.",
          "locationWhenInUsePermission": "Allow ProAnalytics to use your location."
        }
      ]
    ]
  }
}
```

---

## 3. File placement

```
your-project/
├── Dashboard.js                   ← استبدل بالملف الجديد
└── Dashboard/
    ├── useGPS.js                  ← استبدل بالملف الجديد
    ├── useBackgroundSession.js    ← ملف جديد أضفه هنا
    └── ... (باقي الملفات كما هي)
```

---

## 4. How it works

| الحالة | اللي بيحصل |
|--------|-----------|
| الجلسة شغّالة + App في الـ foreground | Frames من الـ sensor بكل 50ms + GPS عادي |
| الجلسة شغّالة + App في الـ background | GPS كل 2 ثانية/2 متر يتحفظ في AsyncStorage |
| المستخدم يرجع للـ app | الـ frames المحفوظة في الـ background تندمج مع الموجودة |
| المستخدم يضغط Stop | كل الـ frames (foreground + background) تتحلل مع بعض |

---

## 5. ملاحظات مهمة

- **Android:** لازم تبني الـ app كـ development build (مش Expo Go) عشان الـ background tasks تشتغل
  ```bash
  npx expo run:android
  ```

- **iOS:** نفس الكلام — Expo Go مش بيدعم background location
  ```bash
  npx expo run:ios
  ```

- الـ background GPS بيستهلك بطارية — الـ `timeInterval: 2000` و`distanceInterval: 2` محسوبين عشان يوازنوا بين الدقة وعمر البطارية

- لو الجهاز وقف (terminated — مش background)، على iOS ممكن الـ `Background Fetch` يصحّي الـ app لكن مش مضمون على كل الأجهزة
