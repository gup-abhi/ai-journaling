import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../stores/auth.store'
import { useThemeStore, ThemeMode } from '../stores/theme.store'
import { useThemeColors } from '../theme/colors'
import { useToast } from '../contexts/ToastContext'
import Header from '../components/Header'

export default function Settings() {
  const { user, getUser, signOut, isLoading } = useAuthStore()
  const { themeMode, setThemeMode } = useThemeStore()
  const { showToast } = useToast()
  const colors = useThemeColors()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      getUser()
    }
  }, [user, getUser])

  const handleSignOut = () => {
    // Show confirmation toast instead of alert
    showToast('Signing out...', 'info', 2000)
    
    // Proceed with sign out after a brief delay to show the confirmation
    setTimeout(async () => {
      setLoading(true)
      try {
        await signOut()
        showToast('Signed out successfully!', 'success')
      } catch (error) {
        console.error('Sign out error:', error)
        showToast('Failed to sign out. Please try again.', 'error')
      } finally {
        setLoading(false)
      }
    }, 1000)
  }

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
  }

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light': return 'sun'
      case 'dark': return 'moon'
      case 'system': return 'smartphone'
      default: return 'smartphone'
    }
  }

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light': return 'Light'
      case 'dark': return 'Dark'
      case 'system': return 'System'
      default: return 'System'
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Settings"
      />

      {/* User Details Section */}
      <View style={[styles.section, { marginTop: 20 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
              <Text style={[styles.avatarText, { color: colors.accentText }]}>
                {user?.display_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.display_name || user?.full_name || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.muted }]}>
                {user?.email || 'No email'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Theme Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
          <Text style={[styles.settingDescription, { color: colors.muted }]}>
            Choose your preferred theme
          </Text>
          <View style={styles.themeOptions}>
            {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themeOption,
                  { 
                    backgroundColor: themeMode === mode ? colors.accentBg : 'transparent',
                    borderColor: themeMode === mode ? colors.accent : colors.border
                  }
                ]}
                onPress={() => handleThemeChange(mode)}
              >
                <Feather 
                  name={getThemeIcon(mode)} 
                  size={20} 
                  color={themeMode === mode ? colors.accentText : colors.muted} 
                />
                <Text style={[
                  styles.themeOptionText, 
                  { color: themeMode === mode ? colors.accentText : colors.text }
                ]}>
                  {getThemeLabel(mode)}
                </Text>
                {themeMode === mode && (
                  <Feather name="check" size={16} color={colors.accentText} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Version</Text>
            <Text style={[styles.infoValue, { color: colors.muted }]}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Build</Text>
            <Text style={[styles.infoValue, { color: colors.muted }]}>2024.1</Text>
          </View>
        </View>
      </View>

      {/* Sign Out Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: '#e74c3c' }]}
          onPress={handleSignOut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Feather name="log-out" size={20} color="#ffffff" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  themeOptions: {
    gap: 8,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})
