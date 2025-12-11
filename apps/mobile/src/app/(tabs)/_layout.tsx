import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { SegmentedButtons } from 'react-native-paper';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: true,
        headerTitleAlign: 'center',
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Connecting Hands',
        }}
      />
      <Tab.Screen
        name="hand-detection"
        options={{
          title: 'Detection',
          headerTitle: 'Hand Detection',
        }}
      />
      <Tab.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}
