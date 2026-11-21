import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#94A3B8';
    switch (variant) {
      case 'secondary':
        return '#0EA5E9';
      case 'outline':
        return 'transparent';
      case 'danger':
        return '#EF4444';
      case 'primary':
      default:
        return '#2563EB';
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return '#2563EB';
    return '#FFFFFF';
  };

  const getBorder = () => {
    if (variant === 'outline') {
      return { borderWidth: 1.5, borderColor: '#2563EB' };
    }
    return {};
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getBorder(),
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;
