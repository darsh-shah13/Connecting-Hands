import { StyleSheet, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { apiClient } from '@/services/apiClient';

export default function HomeScreen() {
  const [status, setStatus] = useState<string>('Checking API...');

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await apiClient.get('/health');
      setStatus('API is running');
    } catch (error) {
      setStatus('API is offline');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome to Connecting Hands
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Hand Gesture Recognition App
          </Text>
          <View style={styles.statusContainer}>
            <Text variant="labelMedium">API Status: {status}</Text>
          </View>
        </Card.Content>
        <Card.Actions>
          <Button onPress={checkApiHealth}>Check Status</Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 16,
    opacity: 0.7,
  },
  statusContainer: {
    marginVertical: 12,
    padding: 8,
  },
});
