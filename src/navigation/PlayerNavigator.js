import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PlayerDashboard from '../screens/player/PlayerDashboard';
import AssignedSessions from '../screens/player/AssignedSessions';
import SessionDetails from '../screens/player/SessionDetails';
import FeedbackForm from '../screens/player/FeedbackForm';
import ChatScreen from '../screens/shared/ChatScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import NewScreen from '../screens/shared/NewScreen';
import { COLORS } from '../styles/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="PlayerDashboard" 
      component={PlayerDashboard} 
      options={{ 
        headerShown: false // This removes the extra header
      }} 
    />
  </Stack.Navigator>
);

const SessionsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AssignedSessions" 
      component={AssignedSessions} 
      options={{ title: 'My Sessions' }} 
    />
    <Stack.Screen 
      name="SessionDetails" 
      component={SessionDetails} 
      options={{ title: 'Session Details' }} 
    />
    <Stack.Screen 
      name="FeedbackForm" 
      component={FeedbackForm} 
      options={{ title: 'Session Feedback' }} 
    />
  </Stack.Navigator>
);

const NewStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="NewMain" 
      component={NewScreen} 
      options={{ 
        title: 'Create & Discover',
        headerShown: false 
      }} 
    />
    {/* Add placeholder screens - replace with actual components later */}
    <Stack.Screen 
      name="SearchCoaches" 
      component={() => <View style={styles.placeholderScreen}><Text>Search Coaches Screen</Text></View>}
      options={{ title: 'Find Coaches' }}
    />
    <Stack.Screen 
      name="SearchAcademies" 
      component={() => <View style={styles.placeholderScreen}><Text>Search Academies Screen</Text></View>}
      options={{ title: 'Sports Academies' }}
    />
    <Stack.Screen 
      name="BookSession" 
      component={() => <View style={styles.placeholderScreen}><Text>Book Session Screen</Text></View>}
      options={{ title: 'Book Training' }}
    />
    <Stack.Screen 
      name="LogWorkout" 
      component={() => <View style={styles.placeholderScreen}><Text>Log Workout Screen</Text></View>}
      options={{ title: 'Log Workout' }}
    />
    <Stack.Screen 
      name="OpenSessions" 
      component={() => <View style={styles.placeholderScreen}><Text>Open Sessions Screen</Text></View>}
      options={{ title: 'Join Sessions' }}
    />
  </Stack.Navigator>
);

// Custom Plus Button Component
const PlusButton = ({ focused }) => (
  <View style={[
    styles.plusButton, 
    { backgroundColor: focused ? COLORS.primary : COLORS.primary }
  ]}>
    <Icon 
      name="add" 
      size={22} 
      color="#fff"
    />
  </View>
);

const PlayerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Sessions':
              iconName = 'fitness-center';
              break;
            case 'New':
              // Return custom plus button
              return <PlusButton focused={focused} />;
            case 'Chat':
              iconName = 'chat';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // This ensures no extra headers on tab screens
        tabBarShowLabel: true, // Show labels for all tabs
      })}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Sessions" component={SessionsStack} />
      <Tab.Screen 
        name="New" 
        component={NewStack}
        options={{
          tabBarLabel: 'New', // Show "New" label
        }}
      />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  plusButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8, // Reduced from 20
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default PlayerNavigator;