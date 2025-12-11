import { StyleSheet, View, Alert } from 'react-native';
import { Text, Button, Card, Surface } from 'react-native-paper';

interface PermissionsScreenProps {
  cameraPermissionGranted: boolean;
  mediaLibraryPermissionGranted: boolean;
  isLoading: boolean;
  onRequestPermissions: () => void;
  onCancel: () => void;
}

export const PermissionsScreen = ({
  cameraPermissionGranted,
  mediaLibraryPermissionGranted,
  isLoading,
  onRequestPermissions,
  onCancel,
}: PermissionsScreenProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Permissions Required
        </Text>

        <Surface style={styles.infoSurface}>
          <Text variant="bodyMedium" style={styles.infoText}>
            To capture hand scans, we need access to your device camera and
            media library.
          </Text>
        </Surface>

        <Card style={styles.permissionCard}>
          <Card.Content>
            <View style={styles.permissionRow}>
              <Text variant="titleSmall">📷 Camera Access</Text>
              <Text
                variant="bodySmall"
                style={[
                  styles.permissionStatus,
                  cameraPermissionGranted
                    ? styles.granted
                    : styles.notGranted,
                ]}
              >
                {cameraPermissionGranted ? '✓ Granted' : '✗ Not Granted'}
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.permissionDescription}>
              Required to use the camera for hand scanning
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.permissionCard}>
          <Card.Content>
            <View style={styles.permissionRow}>
              <Text variant="titleSmall">📁 Media Library Access</Text>
              <Text
                variant="bodySmall"
                style={[
                  styles.permissionStatus,
                  mediaLibraryPermissionGranted
                    ? styles.granted
                    : styles.notGranted,
                ]}
              >
                {mediaLibraryPermissionGranted
                  ? '✓ Granted'
                  : '✗ Not Granted'}
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.permissionDescription}>
              Required to save captured frames
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.buttonGroup}>
          {!cameraPermissionGranted || !mediaLibraryPermissionGranted ? (
            <>
              <Button
                mode="contained"
                onPress={onRequestPermissions}
                disabled={isLoading}
                loading={isLoading}
                style={styles.button}
              >
                Grant Permissions
              </Button>
              <Button mode="outlined" onPress={onCancel}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              mode="contained"
              onPress={onRequestPermissions}
              style={styles.button}
            >
              Continue
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  content: {
    width: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  infoSurface: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 1,
  },
  infoText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionCard: {
    marginBottom: 12,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionStatus: {
    fontWeight: '600',
  },
  granted: {
    color: '#4CAF50',
  },
  notGranted: {
    color: '#d32f2f',
  },
  permissionDescription: {
    marginTop: 4,
    opacity: 0.7,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 24,
  },
  button: {
    marginBottom: 8,
  },
});
