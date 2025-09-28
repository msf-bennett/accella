import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import AthleteNavigator from './AthleteNavigator';
import ChildNavigator from './ChildNavigator';
import CoachNavigator from './CoachNavigator';
import ParentNavigator from './ParentNavigator';
import PlayersNavigator from './PlayersNavigator';
import TraineeNavigator from './TraineeNavigator';
import TrainerNavigator from './TrainerNavigator';
import { loginSuccess } from '../store/reducers/authReducer';
import AuthService from '../services/AuthService';
import { 
  USER_TYPES, 
  getNavigatorForUserType,
  isValidUserType,
  getUserTypeDisplayName 
} from '../utils/constants';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AuthService.getCurrentUser();
      if (userData) {
        dispatch(loginSuccess(userData));
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  // Navigator components mapping
  const navigatorComponents = {
    'AuthNavigator': AuthNavigator,
    'AthleteNavigator': AthleteNavigator,
    'ChildNavigator': ChildNavigator,
    'CoachNavigator': CoachNavigator,
    'ParentNavigator': ParentNavigator,
    'PlayersNavigator': PlayersNavigator,
    'TraineeNavigator': TraineeNavigator,
    'TrainerNavigator': TrainerNavigator,
  };

  // Get the appropriate navigator component based on user type/role
  const getNavigatorComponent = () => {
    // If not authenticated, show auth screens
    if (!isAuthenticated) {
      return navigatorComponents['AuthNavigator'];
    }

    // If no user data or invalid user type, default to CoachNavigator
    if (!user || !user.userType || !isValidUserType(user.userType)) {
      if (__DEV__ && user?.userType) {
        console.warn(`Invalid user type: ${user.userType}, defaulting to CoachNavigator`);
      }
      return navigatorComponents['CoachNavigator'];
    }

    // Get navigator name from constants mapping
    const navigatorName = getNavigatorForUserType(user.userType);
    const NavigatorComponent = navigatorComponents[navigatorName];

    if (!NavigatorComponent) {
      console.error(`Navigator component not found for: ${navigatorName}`);
      return navigatorComponents['CoachNavigator'];
    }

    return NavigatorComponent;
  };

  const NavigatorComponent = getNavigatorComponent();

  // Optional: Log current navigation for debugging
  if (__DEV__) {
    const navigatorName = Object.keys(navigatorComponents).find(
      key => navigatorComponents[key] === NavigatorComponent
    );
    const userDisplayName = user?.userType ? getUserTypeDisplayName(user.userType) : 'Not authenticated';
    
    console.log(`AppNavigator: Rendering ${navigatorName} for user: ${userDisplayName}`);
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        gestureEnabled: false, // Disable gesture to prevent accidental navigation
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={NavigatorComponent}
        options={{
          animationEnabled: false, // Smooth transition between different navigators
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;