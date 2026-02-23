import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LandingScreen from './components/LandingScreen';
import Dashboard from './components/Dashboard';
import SessionAnalysis from './components/SessionAnalysis';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="SessionAnalysis" component={SessionAnalysis} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
