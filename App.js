import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LandingScreen from './components/LandingScreen';
import Dashboard from './components/Dashboard';

import { load, addLog } from "./components/Dashboard/storage";

const Stack = createNativeStackNavigator();

export default function App() {
  try {
    addLog("APP_START");
  } catch (e) {
    console.log("LOG ERROR:", e);
  }

  // طباعة كل اللوجز عند بداية التشغيل
  try {
    console.log("MMKV LOGS:", load("logs"));
  } catch (e) {
    console.log("LOAD LOGS ERROR:", e);
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
