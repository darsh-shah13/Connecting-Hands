import { StyleSheet, View } from 'react-native';
import { Text, List, Switch, Divider } from 'react-native-paper';
import { useState } from 'react';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      <List.Section>
        <List.Subheader>App Settings</List.Subheader>
        <List.Item
          title="Notifications"
          right={() => (
            <Switch
              value={notifications}
              onValueChange={setNotifications}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Dark Mode"
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
            />
          )}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Version"
          description="0.0.1"
        />
        <List.Item
          title="API Endpoint"
          description="http://localhost:8000"
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
