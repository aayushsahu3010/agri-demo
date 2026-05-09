/**
 * AppNavigator.tsx
 * ─────────────────────────────────────────────────────────
 * Root navigator for CROOPIC.
 *  • If user is not logged in → AuthStack (Login / Register)
 *  • If user is logged in     → MainTabs  (Home / Scan / History / Profile)
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

// Auth screens
import LoginScreen    from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main screens
import HomeScreen    from '../screens/main/HomeScreen';
import ScanScreen    from '../screens/main/ScanScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ResultScreen  from '../screens/main/ResultScreen';

// ── Stack & Tab types ──────────────────────────────────────
export type AuthStackParams = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParams = {
  MainTabs: undefined;
  Result: { scan: import('../services/api').ScanResponse };
};

const AuthStack  = createNativeStackNavigator<AuthStackParams>();
const MainStack  = createNativeStackNavigator<MainStackParams>();
const Tab        = createBottomTabNavigator();

// ── Bottom Tab Navigator ──────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            Home:    ['home',         'home-outline'],
            Scan:    ['scan-circle',  'scan-circle-outline'],
            History: ['time',         'time-outline'],
            Profile: ['person-circle','person-circle-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    />
      <Tab.Screen name="Scan"    component={ScanScreen}    />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ── Main Stack (wraps tabs + result modal) ────────────────
function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      <MainStack.Screen
        name="Result"
        component={ResultScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </MainStack.Navigator>
  );
}

// ── Root Navigator ────────────────────────────────────────
export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <MainNavigator />
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login"    component={LoginScreen}    />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
