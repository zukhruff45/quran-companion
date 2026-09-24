import React, { useContext } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import Button from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  illustration?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

const EmptyState = ({ 
  icon = 'book-outline', 
  illustration,
  title, 
  message, 
  actionLabel, 
  onAction,
  style 
}: EmptyStateProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, style]}>
      {illustration ? (
        <View style={{ marginBottom: 24 }}>{illustration}</View>
      ) : (
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name={icon} size={48} color={theme.colors.primary} />
        </View>
      )}
      
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h2 }]}>
        {title}
      </Text>
      
      {message && (
        <Text style={[styles.message, { color: theme.colors.textSecondary, fontFamily: theme.typography.family.primary, fontSize: theme.typography.size.body }]}>
          {message}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button 
          title={actionLabel} 
          onPress={onAction} 
          variant="outline"
          style={styles.actionBtn} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionBtn: {
    minWidth: 160,
  },
});

export default EmptyState;
