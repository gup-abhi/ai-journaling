import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

// Create a navigation container ref that can be used outside of React components
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function resetToSignIn() {
  if (navigationRef.isReady()) {
    try {
      console.log('🔄 Resetting navigation to SignIn screen')
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    } catch (error) {
      console.error('❌ Failed to reset navigation to SignIn:', error);
    }
  } else {
    console.warn('⚠️ Navigation ref is not ready, cannot reset to SignIn');
  }
}

