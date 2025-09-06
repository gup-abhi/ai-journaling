import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/auth.store';
import { useThemeColors } from '../theme/colors';
import { ENV } from '../config/env';

export default function GoogleOAuth() {
  const navigation = useNavigation();
  const { signInWithGoogle } = useAuthStore();
  const colors = useThemeColors();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    console.log('WebView navigation to:', url);
    
    // Check if this is a callback URL (contains success/error indicators)
    if (url.includes('/auth/google/callback') || url.includes('success=true') || url.includes('error=') || url.includes('code=')) {
      // Handle the callback
      handleOAuthCallback(url);
    }
    
    // Check if we've been redirected to the frontend (this means OAuth was successful)
    if (url.includes('ai-journaling.onrender.com/sign-in') || url.includes('ai-journaling.onrender.com/dashboard') || 
        url.includes('localhost:5173/sign-in') || url.includes('localhost:5173/dashboard')) {
      console.log('Redirected to frontend, assuming OAuth success');
      handleAuthSuccess();
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message received:', data);
      
      if (data.type === 'AUTH_SUCCESS') {
        // Authentication was successful
        handleAuthSuccess();
      }
    } catch (error) {
      console.log('WebView message parse error:', error);
    }
  };

  const handleAuthSuccess = async () => {
    try {
      // Check if we're authenticated now
      await useAuthStore.getState().restore();
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        Alert.alert('Success', 'Google sign-in successful!', [
          { text: 'OK', onPress: () => {
            // Navigation will automatically switch to authenticated stack
            // No need to navigate manually
          }}
        ]);
      } else {
        throw new Error('Authentication failed after OAuth');
      }
    } catch (err: any) {
      console.error('Auth success error:', err);
      setError(err.message || 'Authentication failed');
      Alert.alert('Error', err.message || 'Authentication failed', [
        { text: 'OK', onPress: () => {
          // Navigate back to SignIn screen
          navigation.navigate('SignIn' as never);
        }}
      ]);
    }
  };

  const handleOAuthCallback = async (url: string) => {
    try {
      console.log('Handling OAuth callback for URL:', url);
      
      // Check if this is the callback URL from the backend
      if (url.includes('/auth/google/callback')) {
        // The backend should have set the cookies and redirected to the frontend
        // Let's check if we're authenticated now
        await useAuthStore.getState().restore();
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          Alert.alert('Success', 'Google sign-in successful!', [
            { text: 'OK', onPress: () => {
              // Navigation will automatically switch to authenticated stack
              // No need to navigate manually
            }}
          ]);
        } else {
          throw new Error('Authentication failed after OAuth');
        }
      } else if (url.includes('error=')) {
        // Extract error from URL
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const error = urlParams.get('error');
        throw new Error(error ? decodeURIComponent(error) : 'OAuth error occurred');
      } else if (url.includes('code=')) {
        // This might be the authorization code from Google
        // The backend should handle this automatically
        console.log('Received authorization code, waiting for backend processing...');
      }
    } catch (err: any) {
      console.error('OAuth callback error:', err);
      setError(err.message || 'OAuth callback failed');
      Alert.alert('Error', err.message || 'OAuth callback failed', [
        { text: 'OK', onPress: () => {
          // Navigate back to SignIn screen
          navigation.navigate('SignIn' as never);
        }}
      ]);
    }
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setError(nativeEvent.description || 'WebView failed to load');
    setIsLoading(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: '600',
    },
    webView: {
      flex: 1,
    },
  });

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Google Sign-In</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.navigate('SignIn' as never)}
          >
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.text} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Google Sign-In</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('SignIn' as never)}
        >
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.errorText, { marginTop: 16 }]}>
            Loading Google Sign-In...
          </Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        style={styles.webView}
        source={{ 
          uri: `${ENV.API_BASE}/auth/google/login?mobile=true`,
          headers: {
            'X-Mobile-App': 'true',
            'User-Agent': 'ReactNative-Mobile-App/1.0'
          }
        }}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onError={handleError}
        onLoadEnd={handleLoadEnd}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        automaticallyAdjustContentInsets={false}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        allowsBackForwardNavigationGestures={true}
        userAgent="ReactNative-Mobile-App/1.0"
      />
    </SafeAreaView>
  );
}
