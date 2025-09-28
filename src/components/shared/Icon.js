// components/Icon.js
import { Platform } from 'react-native';

// Import the appropriate icon component based on platform
const NativeIcon = Platform.OS === 'web'
  ? require('@expo/vector-icons/MaterialIcons').default
  : require('react-native-vector-icons/MaterialIcons').default;

// Wrapper component to normalize props and handle differences
const Icon = ({ name, size = 24, color = '#000', style, onPress, ...props }) => {
  // Handle any prop differences between libraries if needed
  const iconProps = {
    name,
    size,
    color,
    style,
    onPress,
    ...props
  };

  return <NativeIcon {...iconProps} />;
};

export default Icon;