import { StyleSheet, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '@/services/apiClient';

export default function HomeScreen() {
  const [status, setStatus] = useState<string>('Checking API...');
  const router = useRouter();

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await apiClient.get('/health');
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

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.featureTitle}>
            AR Hand Experience
          </Text>
          <Text variant="bodyMedium" style={styles.featureDescription}>
            View and interact with 3D hand models in augmented reality. Experience haptic feedback
            when your palm approaches the virtual hand.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" icon="hand-extended" onPress={() => router.push('/ar-hand')}>
            Open AR View
          </Button>
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
  featureTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  featureDescription: {
    marginBottom: 12,
    lineHeight: 22,
  },
});
