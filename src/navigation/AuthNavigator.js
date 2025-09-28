import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import { COLORS } from '../styles/colors';
import { Platform } from 'react-native';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Add these to prevent scroll issues
        cardStyle: { backgroundColor: 'transparent' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}>
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Welcome Back' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ 
          title: 'Create Account',
          // Specific options for Register screen to help with scrolling
          cardStyle: { backgroundColor: COLORS.background },
          headerShown: true, // Ensure header is shown consistently
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ title: 'Reset Password' }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;