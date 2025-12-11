import React from 'react';
import { Card, Text } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export interface ErrorCardProps {
  title: string;
  message: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ title, message }) => {
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
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#c62828',
    marginBottom: 12,
  },
  title: {
    color: '#c62828',
    marginBottom: 4,
  },
  message: {
    color: '#b71c1c',
  },
});
