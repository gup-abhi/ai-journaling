import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useToast } from '../contexts/ToastContext'
import { useAuthStore } from '../stores/auth.store'
import { useNavigation } from '@react-navigation/native'
import { useThemeColors } from '../theme/colors'
import { Feather } from '@expo/vector-icons'
import Logo from '../components/Logo'

export default function SignUp() {
  const { signUp, signInWithGoogle, isLoading, error } = useAuthStore()
  const nav = useNavigation<any>()
  const colors = useThemeColors()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const onSubmit = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showToast('Please fill in all fields', 'error')
      return
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error')
      return
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    const res = await signUp({ email, password, display_name: displayName })
    if (res.ok) {
      showToast('Account created successfully! Please check your email to verify your account.', 'success', 4000)
      // Navigate to sign in after a short delay to allow user to see the success message
      setTimeout(() => nav.navigate('SignIn'), 2000)
    } else if (error) {
      showToast(error, 'error')
    }
  }

  const onGoogleSignUp = async () => {
    const res = await signInWithGoogle()
    if (res.ok) {
      showToast('Successfully logged in with Google!', 'success')
    } else if (error) {
      showToast(error, 'error')
    }
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Logo />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Join us and start your personal journaling journey
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Feather name="user" size={20} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Display name"
                placeholderTextColor={colors.muted}
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Feather name="mail" size={20} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Feather name="lock" size={20} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password (min. 6 characters)"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Feather 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={colors.muted} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Feather name="lock" size={20} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm Password"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Feather 
                  name={showConfirmPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={colors.muted} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.button, 
              { backgroundColor: colors.accent },
              isLoading && { opacity: 0.7 }
            ]} 
            onPress={onSubmit} 
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.buttonContent}>
                <Text style={[styles.buttonText, { color: colors.background }]}>Creating account...</Text>
              </View>
            ) : (
              <Text style={[styles.buttonText, { color: colors.background }]}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.muted }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity 
            style={[
              styles.googleButton, 
              { backgroundColor: colors.cardBg, borderColor: colors.border },
              isLoading && { opacity: 0.7 }
            ]} 
            onPress={onGoogleSignUp} 
            disabled={isLoading}
          >
            <View style={styles.googleButtonContent}>
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={[styles.googleButtonText, { color: colors.text }]}>
                Continue with Google
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => nav.navigate('SignIn')}
            style={styles.linkContainer}
          >
            <Text style={[styles.linkText, { color: colors.muted }]}>
              Already have an account?{' '}
              <Text style={[styles.link, { color: colors.accent }]}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    fontSize: 14,
  },
  link: {
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})


