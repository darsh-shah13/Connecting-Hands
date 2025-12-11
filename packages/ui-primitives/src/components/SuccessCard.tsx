import React from 'react';
import { Card, Text } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export interface SuccessCardProps {
  title: string;
  message: string;
}

export const SuccessCard: React.FC<SuccessCardProps> = ({ title, message }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodySmall" style={styles.message}>
          {message}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
    marginBottom: 12,
  },
  title: {
    color: '#2e7d32',
    marginBottom: 4,
  },
  message: {
    color: '#1b5e20',
  },
});
