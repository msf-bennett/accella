import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../styles/colors';

// Dashboard
import ParentDashboard from '../screens/parent/dashboard/ParentDashboard';
import ChildrenOverview from '../screens/parent/dashboard/ChildrenOverview';
import ChildProgress from '../screens/parent/dashboard/ChildProgress';
import SavedCoachesTrainers from '../screens/parent/dashboard/SavedCoachesTrainers';

// Search
import SearchAcademies from '../screens/parent/search/SearchAcademies';
import ParentSearchHome from '../screens/parent/search/ParentSearchHome';
import ParentSearchScreen from '../screens/parent/search/ParentSearchScreen';
import NearbyAcademies from '../screens/parent/search/NearbyAcademies';
import SearchCoaches from '../screens/parent/search/SearchCoaches';
import SearchTrainers from '../screens/parent/search/SearchTrainers';
import CompareAcademies from '../screens/parent/search/CompareAcademies';

// Booking
import BookSession from '../screens/parent/booking/BookSession';
import BookTrial from '../screens/parent/booking/BookTrial';
import Schedule from '../screens/parent/booking/Schedule';
import CalendarScreen from '../screens/parent/booking/CalendarScreen';
import SessionDetails from '../screens/parent/booking/SessionDetails';
import EventDetails from '../screens/parent/booking/EventDetails';

// Payment
import PaymentHistory from '../screens/parent/payment/PaymentHistory';
import PaymentDetails from '../screens/parent/payment/PaymentDetails';
import AddPaymentMethod from '../screens/parent/payment/AddPaymentMethod';
import BillingSettings from '../screens/parent/payment/BillingSettings';
import PaymentReminders from '../screens/parent/payment/PaymentReminders';
import PaymentDashboard from '../screens/parent/payment/PaymentDashboard';

// Communication
import CoachChat from '../screens/parent/communication/CoachChat';
import Notifications from '../screens/parent/communication/Notifications';
import NotificationSettings from '../screens/parent/settings/NotificationSettings';
import FeedbackScreen from '../screens/parent/communication/FeedbackScreen';

// Settings
import SettingsScreen from '../screens/parent/settings/SettingsScreen';
import ParentProfile from '../screens/parent/settings/ParentProfile';
import FamilySettings from '../screens/parent/settings/FamilySettings';
import PrivacySettings from '../screens/parent/settings/PrivacySettings';
import ChildProtection from '../screens/parent/settings/ChildProtection';

// Activities
import AllActivities from '../screens/parent/activities/AllActivities';

// Child Management
import RegisterChild from '../screens/parent/child-management/RegisterChild';

// Support
import SupportScreen from '../screens/parent/support/SupportScreen';

// Shared (consider keeping in shared folder)
import ChatScreen from '../screens/shared/ChatScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Placeholder Component for screens not yet implemented
const PlaceholderScreen = ({ title }) => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderText}>{title || 'Coming Soon'}</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
  </View>
);

// Home Stack - Parent Dashboard with all child-related navigation
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ParentDashboard" 
      component={ParentDashboard} 
      options={{ 
        headerShown: false
      }} 
    />
    <Stack.Screen 
      name="ChildProgress" 
      component={ChildProgress} 
      options={{ title: 'Child Progress' }} 
    />
    <Stack.Screen 
      name="SessionDetails" 
      component={SessionDetails}
      options={{ title: 'Session Details' }} 
    />
    <Stack.Screen 
      name="EventDetails" 
      component={EventDetails}
      options={{ title: 'Event Details' }} 
    />
    <Stack.Screen 
      name="AllActivities" 
      component={AllActivities}
      options={{ title: 'All Activities' }} 
    />
    <Stack.Screen 
      name="Notifications" 
      component={Notifications}
      options={{ title: 'Notifications' }} 
    />
    
    <Stack.Screen 
      name="ChildrenOverview" 
      component={ChildrenOverview} 
      options={{ title: 'My Children' }} 
    />
    <Stack.Screen 
      name="Schedule" 
      component={Schedule}
      options={{ title: 'Child Schedule' }} 
    />
    <Stack.Screen 
      name="CalendarScreen" 
      component={CalendarScreen}
      options={{ title: 'Calendar View' }} 
    />
    <Stack.Screen 
      name="FeedbackScreen" 
      component={FeedbackScreen}
      options={{ title: 'Coach Feedback' }} 
    />
    <Stack.Screen 
      name="CoachChat" 
      component={ChatScreen}
      options={{ title: 'Coach Chat' }} 
    />
    
    <Stack.Screen 
      name="ParentSearchMain" 
      component={ParentSearchHome}
      options={{ 
        title: 'Find & Book',
        headerShown: false 
      }} 
    />
    <Stack.Screen 
      name="SearchAcademies" 
      component={SearchAcademies}
      options={{ title: 'Sports Academies' }}
    />
    <Stack.Screen 
      name="NearbyAcademies" 
      component={NearbyAcademies}
      options={{ title: 'Nearby Academies' }}
    />
    <Stack.Screen 
      name="SearchCoaches" 
      component={SearchCoaches}
      options={{ title: 'Find Coaches' }}
    />
    <Stack.Screen 
      name="BookSession" 
      component={BookSession}
      options={{ title: 'Book Training' }}
    />
    <Stack.Screen 
      name="RegisterChild" 
      component={RegisterChild}
      options={{ title: 'Register Child' }}
    />
    <Stack.Screen 
      name="CompareAcademies" 
      component={CompareAcademies}
      options={{ title: 'Compare Options' }}
    />
    <Stack.Screen 
      name="BookTrial" 
      component={BookTrial}
      options={{ title: 'Trial Session' }}
    />
    <Stack.Screen 
      name="PaymentHistory" 
      component={PaymentHistory} 
      options={{ title: 'Payments & Bills' }} 
    />
    <Stack.Screen 
      name="PaymentDetails" 
      component={PaymentDetails}
      options={{ title: 'Payment Details' }}
    />
    <Stack.Screen 
      name="AddPaymentMethod" 
      component={AddPaymentMethod}
      options={{ title: 'Payment Method' }}
    />
    <Stack.Screen 
      name="BillingSettings" 
      component={BillingSettings}
      options={{ title: 'Billing Settings' }}
    />
    <Stack.Screen 
      name="PaymentReminders" 
      component={PaymentReminders}
      options={{ title: 'Payment Reminders' }}
    />
    
    
    <Stack.Screen 
      name="ParentProfile" 
      component={ProfileScreen} 
      options={{ title: 'My Profile' }} 
    />
    <Stack.Screen 
      name="SettingsScreen" 
      component={SettingsScreen}
      options={{ title: 'Settings' }} 
    />
    <Stack.Screen 
      name="SupportScreen" 
      component={SupportScreen}
      options={{ title: 'Parent Support' }} 
    />
    <Stack.Screen 
      name="FamilySettings" 
      component={FamilySettings}
      options={{ title: 'Family Settings' }}
    />
    <Stack.Screen 
      name="NotificationSettings" 
      component={NotificationSettings}
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen 
      name="PrivacySettings" 
      component={PrivacySettings}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="PaymentDashboard" 
      component={PaymentDashboard}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="ChildProtection" 
      component={ChildProtection}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="SearchTrainers" 
      component={SearchTrainers}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="SavedCoachesTrainers" 
      component={SavedCoachesTrainers}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="ParentSearchScreen" 
      component={ParentSearchScreen}
      options={{ title: 'Privacy & Safety' }}
    />
  </Stack.Navigator>
);

// Children Stack - Overview and detailed management of children
const ChildrenStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ChildrenOverview" 
      component={ChildrenOverview} 
      options={{ title: 'My Children' }} 
    />
    <Stack.Screen 
      name="ChildProgress" 
      component={ChildProgress} 
      options={{ title: 'Child Progress' }} 
    />
    <Stack.Screen 
      name="Schedule" 
      component={Schedule}
      options={{ title: 'Child Schedule' }} 
    />
    <Stack.Screen 
      name="CalendarScreen" 
      component={CalendarScreen}
      options={{ title: 'Calendar View' }} 
    />
    <Stack.Screen 
      name="NearbyAcademies" 
      component={NearbyAcademies}
      options={{ title: 'Coach Feedback' }} 
    />
    <Stack.Screen 
      name="CoachChat" 
      component={ChatScreen}
      options={{ title: 'Coach Chat' }} 
    />


    <Stack.Screen 
      name="ParentDashboard" 
      component={ParentDashboard} 
      options={{ 
        headerShown: false
      }} 
    />
    <Stack.Screen 
      name="SessionDetails" 
      component={SessionDetails}
      options={{ title: 'Session Details' }} 
    />
    <Stack.Screen 
      name="EventDetails" 
      component={EventDetails}
      options={{ title: 'Event Details' }} 
    />
    <Stack.Screen 
      name="AllActivities" 
      component={AllActivities}
      options={{ title: 'All Activities' }} 
    />
    <Stack.Screen 
      name="Notifications" 
      component={Notifications}
      options={{ title: 'Notifications' }} 
    />


    <Stack.Screen 
      name="ParentSearchMain" 
      component={ParentSearchHome}
      options={{ 
        title: 'Find & Book',
        headerShown: false 
      }} 
    />
    <Stack.Screen 
      name="SearchAcademies" 
      component={SearchAcademies}
      options={{ title: 'Sports Academies' }}
    />
    <Stack.Screen 
      name="SearchCoaches" 
      component={SearchCoaches}
      options={{ title: 'Find Coaches' }}
    />
    <Stack.Screen 
      name="BookSession" 
      component={BookSession}
      options={{ title: 'Book Training' }}
    />
    <Stack.Screen 
      name="RegisterChild" 
      component={RegisterChild}
      options={{ title: 'Register Child' }}
    />
    <Stack.Screen 
      name="CompareAcademies" 
      component={CompareAcademies}
      options={{ title: 'Compare Options' }}
    />
    <Stack.Screen 
      name="BookTrial" 
      component={BookTrial}
      options={{ title: 'Trial Session' }}
    />
    <Stack.Screen 
      name="PaymentHistory" 
      component={PaymentHistory} 
      options={{ title: 'Payments & Bills' }} 
    />
    <Stack.Screen 
      name="PaymentDetails" 
      component={PaymentDetails}
      options={{ title: 'Payment Details' }}
    />
    <Stack.Screen 
      name="AddPaymentMethod" 
      component={AddPaymentMethod}
      options={{ title: 'Payment Method' }}
    />
    <Stack.Screen 
      name="BillingSettings" 
      component={BillingSettings}
      options={{ title: 'Billing Settings' }}
    />
    <Stack.Screen 
      name="PaymentReminders" 
      component={PaymentReminders}
      options={{ title: 'Payment Reminders' }}
    />
    
    
    <Stack.Screen 
      name="ParentProfile" 
      component={ProfileScreen} 
      options={{ title: 'My Profile' }} 
    />
    <Stack.Screen 
      name="SettingsScreen" 
      component={SettingsScreen}
      options={{ title: 'Settings' }} 
    />
    <Stack.Screen 
      name="SupportScreen" 
      component={SupportScreen}
      options={{ title: 'Parent Support' }} 
    />
    <Stack.Screen 
      name="FamilySettings" 
      component={FamilySettings}
      options={{ title: 'Family Settings' }}
    />
    <Stack.Screen 
      name="NotificationSettings" 
      component={NotificationSettings}
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen 
      name="PrivacySettings" 
      component={PrivacySettings}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="PaymentDashboard" 
      component={PaymentDashboard}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="ChildProtection" 
      component={ChildProtection}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="SearchTrainers" 
      component={SearchTrainers}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="SavedCoachesTrainers" 
      component={SavedCoachesTrainers}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="ParentSearchScreen" 
      component={ParentSearchScreen}
      options={{ title: 'Privacy & Safety' }}
    />
  </Stack.Navigator>
);

// Search Stack - Find academies, coaches, and book sessions
const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ParentSearchMain" 
      component={ParentSearchHome}
      options={{ 
        title: 'Find & Book',
        headerShown: false 
      }} 
    />
    <Stack.Screen 
      name="SearchAcademies" 
      component={SearchAcademies}
      options={{ title: 'Sports Academies' }}
    />
    <Stack.Screen 
      name="NearbyAcademies" 
      component={NearbyAcademies}
      options={{ title: 'Nearby Academies' }}
    />
    <Stack.Screen 
      name="SearchCoaches" 
      component={SearchCoaches}
      options={{ title: 'Find Coaches' }}
    />
    <Stack.Screen 
      name="BookSession" 
      component={BookSession}
      options={{ title: 'Book Training' }}
    />
    <Stack.Screen 
      name="RegisterChild" 
      component={RegisterChild}
      options={{ title: 'Register Child' }}
    />
    <Stack.Screen 
      name="CompareAcademies" 
      component={CompareAcademies}
      options={{ title: 'Compare Options' }}
    />
    <Stack.Screen 
      name="BookTrial" 
      component={BookTrial}
      options={{ title: 'Trial Session' }}
    />

    <Stack.Screen 
      name="ParentDashboard" 
      component={ParentDashboard} 
      options={{ 
        headerShown: false
      }} 
    />
    <Stack.Screen 
      name="ChildProgress" 
      component={ChildProgress} 
      options={{ title: 'Child Progress' }} 
    />
    <Stack.Screen 
      name="SessionDetails" 
      component={SessionDetails}
      options={{ title: 'Session Details' }} 
    />
    <Stack.Screen 
      name="EventDetails" 
      component={EventDetails}
      options={{ title: 'Event Details' }} 
    />
    <Stack.Screen 
      name="AllActivities" 
      component={AllActivities}
      options={{ title: 'All Activities' }} 
    />
    <Stack.Screen 
      name="Notifications" 
      component={Notifications}
      options={{ title: 'Notifications' }} 
    />
    
    <Stack.Screen 
      name="ChildrenOverview" 
      component={ChildrenOverview} 
      options={{ title: 'My Children' }} 
    />
    <Stack.Screen 
      name="Schedule" 
      component={Schedule}
      options={{ title: 'Child Schedule' }} 
    />
    <Stack.Screen 
      name="CalendarScreen" 
      component={CalendarScreen}
      options={{ title: 'Calendar View' }} 
    />
    <Stack.Screen 
      name="FeedbackScreen" 
      component={FeedbackScreen}
      options={{ title: 'Coach Feedback' }} 
    />
    <Stack.Screen 
      name="CoachChat" 
      component={ChatScreen}
      options={{ title: 'Coach Chat' }} 
    />
    <Stack.Screen 
      name="PaymentHistory" 
      component={PaymentHistory} 
      options={{ title: 'Payments & Bills' }} 
    />
    <Stack.Screen 
      name="PaymentDetails" 
      component={PaymentDetails}
      options={{ title: 'Payment Details' }}
    />
    <Stack.Screen 
      name="AddPaymentMethod" 
      component={AddPaymentMethod}
      options={{ title: 'Payment Method' }}
    />
    <Stack.Screen 
      name="BillingSettings" 
      component={BillingSettings}
      options={{ title: 'Billing Settings' }}
    />
    <Stack.Screen 
      name="PaymentReminders" 
      component={PaymentReminders}
      options={{ title: 'Payment Reminders' }}
    />
    
    
    <Stack.Screen 
      name="ParentProfile" 
      component={ProfileScreen} 
      options={{ title: 'My Profile' }} 
    />
    <Stack.Screen 
      name="SettingsScreen" 
      component={SettingsScreen}
      options={{ title: 'Settings' }} 
    />
    <Stack.Screen 
      name="SupportScreen" 
      component={SupportScreen}
      options={{ title: 'Parent Support' }} 
    />
    <Stack.Screen 
      name="FamilySettings" 
      component={FamilySettings}
      options={{ title: 'Family Settings' }}
    />
    <Stack.Screen 
      name="NotificationSettings" 
      component={NotificationSettings}
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen 
      name="PrivacySettings" 
      component={PrivacySettings}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="PaymentDashboard" 
      component={PaymentDashboard}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="ChildProtection" 
      component={ChildProtection}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="SearchTrainers" 
      component={SearchTrainers}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="SavedCoachesTrainers" 
      component={SavedCoachesTrainers}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="ParentSearchScreen" 
      component={ParentSearchScreen}
      options={{ title: 'Privacy & Safety' }}
    />
  </Stack.Navigator>
);

// Payments Stack - Payment history and financial management
const PaymentsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="PaymentHistory" 
      component={PaymentHistory} 
      options={{ title: 'Payments & Bills' }} 
    />
    <Stack.Screen 
      name="PaymentDetails" 
      component={PaymentDetails}
      options={{ title: 'Payment Details' }}
    />
    <Stack.Screen 
      name="AddPaymentMethod" 
      component={AddPaymentMethod}
      options={{ title: 'Payment Method' }}
    />
    <Stack.Screen 
      name="BillingSettings" 
      component={BillingSettings}
      options={{ title: 'Billing Settings' }}
    />
    <Stack.Screen 
      name="PaymentReminders" 
      component={PaymentReminders}
      options={{ title: 'Payment Reminders' }}
    />

    <Stack.Screen 
      name="ParentDashboard" 
      component={ParentDashboard} 
      options={{ 
        headerShown: false
      }} 
    />
    <Stack.Screen 
      name="SessionDetails" 
      component={SessionDetails}
      options={{ title: 'Session Details' }} 
    />
    <Stack.Screen 
      name="EventDetails" 
      component={EventDetails}
      options={{ title: 'Event Details' }} 
    />
    <Stack.Screen 
      name="AllActivities" 
      component={AllActivities}
      options={{ title: 'All Activities' }} 
    />
    <Stack.Screen 
      name="Notifications" 
      component={Notifications}
      options={{ title: 'Notifications' }} 
    /><Stack.Screen 
      name="ChildrenOverview" 
      component={ChildrenOverview} 
      options={{ title: 'My Children' }} 
    />
    <Stack.Screen 
      name="ChildProgress" 
      component={ChildProgress} 
      options={{ title: 'Child Progress' }} 
    />
    <Stack.Screen 
      name="Schedule" 
      component={Schedule}
      options={{ title: 'Child Schedule' }} 
    />
    <Stack.Screen 
      name="CalendarScreen" 
      component={CalendarScreen}
      options={{ title: 'Calendar View' }} 
    />
    <Stack.Screen 
      name="FeedbackScreen" 
      component={FeedbackScreen}
      options={{ title: 'Coach Feedback' }} 
    />
    <Stack.Screen 
      name="CoachChat" 
      component={ChatScreen}
      options={{ title: 'Coach Chat' }} 
    /><Stack.Screen 
      name="ParentSearchMain" 
      component={ParentSearchHome}
      options={{ 
        title: 'Find & Book',
        headerShown: false 
      }} 
    />
    <Stack.Screen 
      name="SearchAcademies" 
      component={SearchAcademies}
      options={{ title: 'Sports Academies' }}
    />
    <Stack.Screen 
      name="NearbyAcademies" 
      component={NearbyAcademies}
      options={{ title: 'Nearby Academies' }}
    />
    <Stack.Screen 
      name="SearchCoaches" 
      component={SearchCoaches}
      options={{ title: 'Find Coaches' }}
    />
    <Stack.Screen 
      name="BookSession" 
      component={BookSession}
      options={{ title: 'Book Training' }}
    />
    <Stack.Screen 
      name="RegisterChild" 
      component={RegisterChild}
      options={{ title: 'Register Child' }}
    />
    <Stack.Screen 
      name="CompareAcademies" 
      component={CompareAcademies}
      options={{ title: 'Compare Options' }}
    />
    <Stack.Screen 
      name="BookTrial" 
      component={BookTrial}
      options={{ title: 'Trial Session' }}
    />
    
    <Stack.Screen 
      name="ParentProfile" 
      component={ProfileScreen} 
      options={{ title: 'My Profile' }} 
    />
    <Stack.Screen 
      name="SettingsScreen" 
      component={SettingsScreen}
      options={{ title: 'Settings' }} 
    />
    <Stack.Screen 
      name="SupportScreen" 
      component={SupportScreen}
      options={{ title: 'Parent Support' }} 
    />
    <Stack.Screen 
      name="FamilySettings" 
      component={FamilySettings}
      options={{ title: 'Family Settings' }}
    />
    <Stack.Screen 
      name="NotificationSettings" 
      component={NotificationSettings}
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen 
      name="PrivacySettings" 
      component={PrivacySettings}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="PaymentDashboard" 
      component={PaymentDashboard}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="ChildProtection" 
      component={ChildProtection}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="SearchTrainers" 
      component={SearchTrainers}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="SavedCoachesTrainers" 
      component={SavedCoachesTrainers}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="ParentSearchScreen" 
      component={ParentSearchScreen}
      options={{ title: 'Privacy & Safety' }}
    />
  </Stack.Navigator>
);

// Profile Stack - Parent profile and settings
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ParentProfile" 
      component={ProfileScreen} 
      options={{ title: 'My Profile' }} 
    />
    <Stack.Screen 
      name="SettingsScreen" 
      component={SettingsScreen}
      options={{ title: 'Settings' }} 
    />
    <Stack.Screen 
      name="SupportScreen" 
      component={SupportScreen}
      options={{ title: 'Parent Support' }} 
    />
    <Stack.Screen 
      name="FamilySettings" 
      component={FamilySettings}
      options={{ title: 'Family Settings' }}
    />
    <Stack.Screen 
      name="NotificationSettings" 
      component={NotificationSettings}
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen 
      name="PrivacySettings" 
      component={PrivacySettings}
      options={{ title: 'Privacy & Safety' }}
    />

    <Stack.Screen 
      name="ParentDashboard" 
      component={ParentDashboard} 
      options={{ 
        headerShown: false
      }} 
    />
    <Stack.Screen 
      name="ChildProgress" 
      component={ChildProgress} 
      options={{ title: 'Child Progress' }} 
    />
    <Stack.Screen 
      name="SessionDetails" 
      component={SessionDetails}
      options={{ title: 'Session Details' }} 
    />
    <Stack.Screen 
      name="EventDetails" 
      component={EventDetails}
      options={{ title: 'Event Details' }} 
    />
    <Stack.Screen 
      name="AllActivities" 
      component={AllActivities}
      options={{ title: 'All Activities' }} 
    />
    <Stack.Screen 
      name="Notifications" 
      component={Notifications}
      options={{ title: 'Notifications' }} 
    /><Stack.Screen 
      name="ChildrenOverview" 
      component={ChildrenOverview} 
      options={{ title: 'My Children' }} 
    />
    <Stack.Screen 
      name="Schedule" 
      component={Schedule}
      options={{ title: 'Child Schedule' }} 
    />
    <Stack.Screen 
      name="CalendarScreen" 
      component={CalendarScreen}
      options={{ title: 'Calendar View' }} 
    />
    <Stack.Screen 
      name="FeedbackScreen" 
      component={FeedbackScreen}
      options={{ title: 'Coach Feedback' }} 
    />
    <Stack.Screen 
      name="CoachChat" 
      component={ChatScreen}
      options={{ title: 'Coach Chat' }} 
    /><Stack.Screen 
      name="ParentSearchMain" 
      component={ParentSearchHome}
      options={{ 
        title: 'Find & Book',
        headerShown: false 
      }} 
    />
    <Stack.Screen 
      name="SearchAcademies" 
      component={SearchAcademies}
      options={{ title: 'Sports Academies' }}
    />
    <Stack.Screen 
      name="NearbyAcademies" 
      component={NearbyAcademies}
      options={{ title: 'Nearby Academies' }}
    />
    <Stack.Screen 
      name="SearchCoaches" 
      component={SearchCoaches}
      options={{ title: 'Find Coaches' }}
    />
    <Stack.Screen 
      name="BookSession" 
      component={BookSession}
      options={{ title: 'Book Training' }}
    />
    <Stack.Screen 
      name="RegisterChild" 
      component={RegisterChild}
      options={{ title: 'Register Child' }}
    />
    <Stack.Screen 
      name="CompareAcademies" 
      component={CompareAcademies}
      options={{ title: 'Compare Options' }}
    />
    <Stack.Screen 
      name="BookTrial" 
      component={BookTrial}
      options={{ title: 'Trial Session' }}
    />
    <Stack.Screen 
      name="PaymentHistory" 
      component={PaymentHistory} 
      options={{ title: 'Payments & Bills' }} 
    />
    <Stack.Screen 
      name="PaymentDetails" 
      component={PaymentDetails}
      options={{ title: 'Payment Details' }}
    />
    <Stack.Screen 
      name="AddPaymentMethod" 
      component={AddPaymentMethod}
      options={{ title: 'Payment Method' }}
    />
    <Stack.Screen 
      name="BillingSettings" 
      component={BillingSettings}
      options={{ title: 'Billing Settings' }}
    />
    <Stack.Screen 
      name="PaymentReminders" 
      component={PaymentReminders}
      options={{ title: 'Payment Reminders' }}
    />
    <Stack.Screen 
      name="PaymentDashboard" 
      component={PaymentDashboard}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="ChildProtection" 
      component={ChildProtection}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="SearchTrainers" 
      component={SearchTrainers}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="SavedCoachesTrainers" 
      component={SavedCoachesTrainers}
      options={{ title: 'Privacy & Safety' }}
    />
    <Stack.Screen 
      name="ParentSearchScreen" 
      component={ParentSearchScreen}
      options={{ title: 'Privacy & Safety' }}
    />
  </Stack.Navigator>
);

// Custom Search Button Component
const SearchButton = ({ focused }) => (
  <View style={[
    styles.searchButton, 
    { backgroundColor: focused ? COLORS.primary : COLORS.primary }
  ]}>
    <Icon 
      name="search" 
      size={22} 
      color="#fff"
    />
  </View>
);

const ParentNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Children':
              iconName = 'child-care';
              break;
            case 'Search':
              // Return custom search button
              return <SearchButton focused={focused} />;
            case 'Payments':
              iconName = 'payment';
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
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}>
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Children" 
        component={ChildrenStack}
        options={{
          tabBarLabel: 'Children',
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchStack}
        options={{
          tabBarLabel: 'Find',
        }}
      />
      <Tab.Screen 
        name="Payments" 
        component={PaymentsStack}
        options={{
          tabBarLabel: 'Payments',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  searchButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ParentNavigator;