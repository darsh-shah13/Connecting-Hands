import { StyleSheet, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';

interface SuccessScreenProps {
  scanId: string;
  onDone: () => void;
}

export const SuccessScreen = ({ scanId, onDone }: SuccessScreenProps) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="displaySmall" style={styles.icon}>
            ✓
          </Text>
          <Text variant="headlineMedium" style={styles.title}>
            Scan Submitted
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            Your hand scan has been successfully uploaded and is being
            processed.
          </Text>

          <View style={styles.scanIdContainer}>
            <Text variant="labelSmall" style={styles.scanIdLabel}>
              Scan ID
            </Text>
            <Text variant="bodySmall" style={styles.scanId}>
              {scanId}
            </Text>
          </View>

          <Text variant="bodySmall" style={styles.nextSteps}>
            You can check the status of your scan in the hand detection tab.
          </Text>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button mode="contained" onPress={onDone} style={styles.button}>
            Back to Home
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  icon: {
    color: '#4CAF50',
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  scanIdContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  scanIdLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  scanId: {
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  nextSteps: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  actions: {
    justifyContent: 'center',
  },
  button: {
    width: '100%',
  },
});
