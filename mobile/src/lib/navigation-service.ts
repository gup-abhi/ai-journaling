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
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
  }
}

