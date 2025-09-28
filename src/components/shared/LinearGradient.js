import { Platform } from 'react-native';

export const LinearGradient = Platform.OS === 'web'
  ? require('expo-linear-gradient').LinearGradient
  : require('react-native-linear-gradient').default;