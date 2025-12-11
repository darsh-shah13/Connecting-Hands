import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Modal
      </Text>
      <Text style={styles.subtitle}>
        Press the button below to dismiss this modal.
      </Text>

      <Button
        mode="contained"
        onPress={() => router.back()}
        style={styles.button}
      >
        Dismiss
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 15,
  },
});
