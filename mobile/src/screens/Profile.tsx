import React, { useContext } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/ui/Card';

const Profile = ({ navigation }: any) => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    logout();
  };

  const MenuItem = ({ icon, label, color, onPress, showChevron = false }: any) => (
    <Pressable 
      style={({ pressed }) => [
        styles.menuItem, 
        { 
          borderBottomColor: theme.colors.border, 
          paddingVertical: theme.spacing.xl, 
          paddingHorizontal: theme.spacing.xl,
          backgroundColor: pressed ? 'rgba(0,0,0,0.05)' : 'transparent'
        }
      ]}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={24} color={color || theme.colors.text} />
        <Text style={[styles.menuItemText, { color: color || theme.colors.text, fontFamily: theme.typography.family.primary, fontSize: theme.typography.size.body }]}>{label}</Text>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { padding: theme.spacing.xl, paddingTop: Math.max(insets.top, theme.spacing.xxxl) }]}>
        <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h1 }}>Profile</Text>
      </View>

      <Card style={{ margin: theme.spacing.xl }}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary, marginRight: theme.spacing.lg }]}>
            <Text style={[styles.avatarText, { fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h2 }]}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <View>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h3, marginBottom: theme.spacing.xs }}>{user?.name || 'Guest User'}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primary, fontSize: theme.typography.size.body }}>{user?.email || 'Not logged in'}</Text>
          </View>
        </View>
      </Card>

      <View style={{ marginTop: theme.spacing.sm }}>
        <MenuItem 
          icon="settings-outline" 
          label="Settings" 
          showChevron 
          onPress={() => navigation.navigate('Settings')} 
        />

        {user ? (
          <MenuItem 
            icon="log-out-outline" 
            label="Logout" 
            color={theme.colors.error}
            onPress={handleLogout} 
          />
        ) : (
          <MenuItem 
            icon="log-in-outline" 
            label="Login / Register" 
            color={theme.colors.primary}
            onPress={() => logout()} // clears guest state
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {},
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemText: { marginLeft: 15 },
});

export default Profile;
