import React from 'react';
import { Button, ButtonProps } from 'react-native-paper';

export interface PrimaryButtonProps extends Omit<ButtonProps, 'mode'> {
  label: string;
  loading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  loading = false,
  disabled,
  ...props
}) => {
  return (
    <Button
      mode="contained"
      disabled={disabled || loading}
      loading={loading}
      {...props}
    >
      {label}
    </Button>
  );
};
