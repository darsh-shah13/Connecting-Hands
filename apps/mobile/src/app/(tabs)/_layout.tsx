import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        tabBarShowLabel: true,
        tabBarStyle: {
          paddingBottom: bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Connecting Hands',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="hand-detection"
        options={{
          title: 'Detection',
          headerTitle: 'Hand Detection',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hand-back-right" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ar-hand"
        options={{
          title: 'AR View',
          headerTitle: 'AR Hand View',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="augmented-reality" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
      <Tab.Screen
        name="share"
        options={{
          title: 'Share',
          headerTitle: 'Share',
        }}
      />
      <Tab.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
