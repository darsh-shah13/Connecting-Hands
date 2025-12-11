import { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Button, Text, Card, Surface, MD3Colors } from 'react-native-paper';
import type { CapturedFrame } from '@/store/handScanStore';

const { width } = Dimensions.get('window');

interface ReviewScreenProps {
  frames: CapturedFrame[];
  onRetake: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export const ReviewScreen = ({
  frames,
  onRetake,
  onSubmit,
  isSubmitting = false,
  error = null,
}: ReviewScreenProps) => {
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.errorTitle}>
              Upload Failed
            </Text>
            <Text variant="bodyMedium" style={styles.errorMessage}>
              {error}
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={onRetake}>Try Again</Button>
          </Card.Actions>
        </Card>
      </View>
    );
  }

  const selectedFrame = frames[selectedFrameIndex];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        Review Scan
      </Text>

      {/* Main frame display */}
      {selectedFrame && (
        <Surface style={styles.mainFrameContainer}>
          <Image
            source={{ uri: selectedFrame.uri }}
            style={styles.mainFrame}
            resizeMode="contain"
          />
          <Text style={styles.frameInfo}>
            Frame {selectedFrameIndex + 1} of {frames.length}
          </Text>
        </Surface>
      )}

      {/* Frame thumbnails */}
      {frames.length > 1 && (
        <View style={styles.thumbnailContainer}>
          <Text variant="labelMedium" style={styles.thumbnailLabel}>
            Captured Frames
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.thumbnailScroll}>
              {frames.map((frame, index) => (
                <Surface
                  key={index}
                  style={[
                    styles.thumbnail,
                    selectedFrameIndex === index && styles.selectedThumbnail,
                  ]}
                >
                  <Image
                    source={{ uri: frame.uri }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                  {selectedFrameIndex === index && (
                    <View style={styles.selectedIndicator} />
                  )}
                </Surface>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Frame thumbnail click handler */}
      {frames.length > 1 && (
        <View style={styles.thumbnailInteractiveContainer}>
          {frames.map((frame, index) => (
            <View
              key={index}
              style={[
                styles.thumbnailButton,
                selectedFrameIndex === index && styles.selectedButton,
              ]}
            >
              <Button
                onPress={() => setSelectedFrameIndex(index)}
                disabled={isSubmitting}
              >
                Frame {index + 1}
              </Button>
            </View>
          ))}
        </View>
      )}

      {/* Frame details */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text variant="titleSmall">Frame Details</Text>
          <View style={styles.detailRow}>
            <Text variant="bodySmall">Dimensions:</Text>
            <Text variant="bodySmall" style={styles.detailValue}>
              {selectedFrame?.width} x {selectedFrame?.height}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="bodySmall">Captured:</Text>
            <Text variant="bodySmall" style={styles.detailValue}>
              {selectedFrame
                ? new Date(selectedFrame.timestamp).toLocaleTimeString()
                : 'N/A'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={MD3Colors.primary}
            />
            <Text style={styles.uploadingText}>
              Uploading scan...
            </Text>
          </View>
        ) : (
          <>
            <Button
              mode="contained"
              onPress={onSubmit}
              style={styles.submitButton}
              disabled={frames.length === 0}
            >
              Submit Scan
            </Button>
            <Button mode="outlined" onPress={onRetake}>
              Retake
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  mainFrameContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
  },
  mainFrame: {
    width: '100%',
    height: width * 1.2,
    backgroundColor: '#000',
  },
  frameInfo: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 8,
  },
  thumbnailContainer: {
    marginBottom: 16,
  },
  thumbnailLabel: {
    marginBottom: 8,
  },
  thumbnailScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
  },
  selectedThumbnail: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
  },
  thumbnailInteractiveContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  thumbnailButton: {
    flex: 1,
    minWidth: '48%',
  },
  selectedButton: {
    opacity: 0.7,
  },
  detailsCard: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailValue: {
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  submitButton: {
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  uploadingText: {
    marginTop: 12,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  errorCard: {
    backgroundColor: '#ffebee',
  },
  errorTitle: {
    color: '#c62828',
    marginBottom: 12,
  },
  errorMessage: {
    color: '#d32f2f',
  },
});
