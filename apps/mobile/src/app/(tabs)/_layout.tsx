import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
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
        tabBarStyle: {
          paddingBottom: bottom,
        },
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
        }}
      />
    </Tab.Navigator>
  );
}
