import { Platform } from 'react-native';

export const BlurView = Platform.OS === 'web' 
  ? require('expo-blur').BlurView
  : require('expo-blur').BlurView;