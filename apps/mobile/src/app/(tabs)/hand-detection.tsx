import { StyleSheet, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';

export default function HandDetectionScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Hand Detection
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Point your device camera at your hand to begin detection
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button disabled>Start Camera (Coming Soon)</Button>
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
});
