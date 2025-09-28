import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../styles/colors';

// Existing Athlete Screens (uncomment when available)
import AthletesDashboard from '../screens/athlete/dashboard/AthletesDashboard';
// import MyTrainingPlan from '../screens/athlete/MyTrainingPlan';
// import TodaysWorkout from '../screens/athlete/TodaysWorkout';
// import ProgressTracking from '../screens/athlete/ProgressTracking';
// import CoachConnection from '../screens/athlete/CoachConnection';

// Shared Screens
import ChatScreen from '../screens/shared/ChatScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import NewScreen from '../screens/shared/NewScreen';

// Dashboard & Overview Screens (Comment out imports for unbuilt screens)
// import PersonalDashboard from '../screens/athlete/dashboard/PersonalDashboard';
// import TodaysActivities from '../screens/athlete/dashboard/TodaysActivities';
// import WeeklyOverview from '../screens/athlete/dashboard/WeeklyOverview';
// import UpcomingTraining from '../screens/athlete/dashboard/UpcomingTraining';
// import RecentAchievements from '../screens/athlete/dashboard/RecentAchievements';
// import MotivationalContent from '../screens/athlete/dashboard/MotivationalContent';
// import DailyGoals from '../screens/athlete/dashboard/DailyGoals';
// import QuickStats from '../screens/athlete/dashboard/QuickStats';
// import WeatherInfo from '../screens/athlete/dashboard/WeatherInfo';
// import NotificationCenter from '../screens/athlete/dashboard/NotificationCenter';

// Training & Workouts Screens
// import MyTrainingPlans from '../screens/athlete/training/MyTrainingPlans';
// import ActiveWorkouts from '../screens/athlete/training/ActiveWorkouts';
// import WorkoutHistory from '../screens/athlete/training/WorkoutHistory';
// import CustomWorkouts from '../screens/athlete/training/CustomWorkouts';
// import WorkoutLibrary from '../screens/athlete/training/WorkoutLibrary';
// import ExerciseInstructions from '../screens/athlete/training/ExerciseInstructions';
// import WorkoutTimer from '../screens/athlete/training/WorkoutTimer';
// import SetRepsTracker from '../screens/athlete/training/SetRepsTracker';
// import RestTimer from '../screens/athlete/training/RestTimer';
// import WorkoutNotes from '../screens/athlete/training/WorkoutNotes';
// import TechniqueVideos from '../screens/athlete/training/TechniqueVideos';
// import DrillPractice from '../screens/athlete/training/DrillPractice';
// import SkillDevelopment from '../screens/athlete/training/SkillDevelopment';
// import StrengthTraining from '../screens/athlete/training/StrengthTraining';
// import CardioWorkouts from '../screens/athlete/training/CardioWorkouts';
// import FlexibilityMobility from '../screens/athlete/training/FlexibilityMobility';
// import SportSpecificTraining from '../screens/athlete/training/SportSpecificTraining';

// Progress & Performance Screens
// import ProgressDashboard from '../screens/athlete/progress/ProgressDashboard';
// import PersonalBests from '../screens/athlete/progress/PersonalBests';
// import PerformanceMetrics from '../screens/athlete/progress/PerformanceMetrics';
// import FitnessAssessments from '../screens/athlete/progress/FitnessAssessments';
// import BodyComposition from '../screens/athlete/progress/BodyComposition';
// import InjuryLog from '../screens/athlete/progress/InjuryLog';
// import RecoveryTracking from '../screens/athlete/progress/RecoveryTracking';
// import SleepTracking from '../screens/athlete/progress/SleepTracking';
// import ProgressPhotos from '../screens/athlete/progress/ProgressPhotos';
// import MeasurementLog from '../screens/athlete/progress/MeasurementLog';
// import CompetitionResults from '../screens/athlete/progress/CompetitionResults';
// import SeasonStats from '../screens/athlete/progress/SeasonStats';
// import GoalTracking from '../screens/athlete/progress/GoalTracking';
// import MotivationTracker from '../screens/athlete/progress/MotivationTracker';
// import StreakCounter from '../screens/athlete/progress/StreakCounter';

// Search & Discovery Screens
// import SearchCoaches from '../screens/athlete/search/SearchCoaches';
// import SearchAcademies from '../screens/athlete/search/SearchAcademies';
// import SearchTrainingPartners from '../screens/athlete/search/SearchTrainingPartners';
// import NearbyFacilities from '../screens/athlete/search/NearbyFacilities';
// import OpenTrainingSessions from '../screens/athlete/search/OpenTrainingSessions';
// import SportsEvents from '../screens/athlete/search/SportsEvents';
// import Competitions from '../screens/athlete/search/Competitions';
// import WorkshopsClinic from '../screens/athlete/search/WorkshopsClinic';
// import TrialsScouts from '../screens/athlete/search/TrialsScouts';
// import TeamOpportunities from '../screens/athlete/search/TeamOpportunities';
// import ScholarshipInfo from '../screens/athlete/search/ScholarshipInfo';
// import SportsNews from '../screens/athlete/search/SportsNews';
// import EquipmentStores from '../screens/athlete/search/EquipmentStores';

// Nutrition & Wellness Screens
// import NutritionDashboard from '../screens/athlete/nutrition/NutritionDashboard';
// import MealPlanning from '../screens/athlete/nutrition/MealPlanning';
// import CalorieTracking from '../screens/athlete/nutrition/CalorieTracking';
// import HydrationMonitor from '../screens/athlete/nutrition/HydrationMonitor';
// import SupplementTracker from '../screens/athlete/nutrition/SupplementTracker';
// import RecipeLibrary from '../screens/athlete/nutrition/RecipeLibrary';
// import NutritionalGoals from '../screens/athlete/nutrition/NutritionalGoals';
// import FoodDiary from '../screens/athlete/nutrition/FoodDiary';
// import MacroTracking from '../screens/athlete/nutrition/MacroTracking';
// import WeightManagement from '../screens/athlete/nutrition/WeightManagement';
// import PrePostWorkoutMeals from '../screens/athlete/nutrition/PrePostWorkoutMeals';
// import NutritionalEducation from '../screens/athlete/nutrition/NutritionalEducation';

// Communication & Social Screens
// import CoachChat from '../screens/athlete/communication/CoachChat';
// import TeamChat from '../screens/athlete/communication/TeamChat';
// import TrainingPartnerChat from '../screens/athlete/communication/TrainingPartnerChat';
// import ParentUpdates from '../screens/athlete/communication/ParentUpdates';
// import FeedbackToCoach from '../screens/athlete/communication/FeedbackToCoach';
// import SessionReviews from '../screens/athlete/communication/SessionReviews';
// import QuestionsForum from '../screens/athlete/communication/QuestionsForum';
// import SocialFeed from '../screens/athlete/communication/SocialFeed';
// import AchievementSharing from '../screens/athlete/communication/AchievementSharing';
// import CommunityGroups from '../screens/athlete/communication/CommunityGroups';
// import MentorConnection from '../screens/athlete/communication/MentorConnection';

// Learning & Development Screens
// import LearningCenter from '../screens/athlete/learning/LearningCenter';
// import TechniqueTutorials from '../screens/athlete/learning/TechniqueTutorials';
// import SportSpecificCourses from '../screens/athlete/learning/SportSpecificCourses';
// import MentalTraining from '../screens/athlete/learning/MentalTraining';
// import MotivationalContent from '../screens/athlete/learning/MotivationalContent';
// import SuccessStories from '../screens/athlete/learning/SuccessStories';
// import ExpertInterviews from '../screens/athlete/learning/ExpertInterviews';
// import SkillChallenges from '../screens/athlete/learning/SkillChallenges';
// import QuizAssessments from '../screens/athlete/learning/QuizAssessments';
// import CertificatePrograms from '../screens/athlete/learning/CertificatePrograms';

// Bookings & Payments Screens
// import SessionBookings from '../screens/athlete/bookings/SessionBookings';
// import CoachBookings from '../screens/athlete/bookings/CoachBookings';
// import FacilityBookings from '../screens/athlete/bookings/FacilityBookings';
// import PaymentHistory from '../screens/athlete/bookings/PaymentHistory';
// import SubscriptionPlans from '../screens/athlete/bookings/SubscriptionPlans';
// import BookingCalendar from '../screens/athlete/bookings/BookingCalendar';
// import CancellationPolicy from '../screens/athlete/bookings/CancellationPolicy';
// import RefundRequests from '../screens/athlete/bookings/RefundRequests';
// import InvoiceReceipts from '../screens/athlete/bookings/InvoiceReceipts';
// import PaymentMethods from '../screens/athlete/bookings/PaymentMethods';

// Profile & Settings Screens
// import AthleteProfile from '../screens/athlete/profile/AthleteProfile';
// import PersonalInfo from '../screens/athlete/profile/PersonalInfo';
// import SportsProfile from '../screens/athlete/profile/SportsProfile';
// import HealthInformation from '../screens/athlete/profile/HealthInformation';
// import EmergencyContacts from '../screens/athlete/profile/EmergencyContacts';
// import ParentalConsent from '../screens/athlete/profile/ParentalConsent';
// import MedicalClearance from '../screens/athlete/profile/MedicalClearance';
// import ProfileVisibility from '../screens/athlete/profile/ProfileVisibility';
// import NotificationSettings from '../screens/athlete/profile/NotificationSettings';
// import PrivacySettings from '../screens/athlete/profile/PrivacySettings';
// import AccountSettings from '../screens/athlete/profile/AccountSettings';
// import DataBackup from '../screens/athlete/profile/DataBackup';
// import SupportHelp from '../screens/athlete/profile/SupportHelp';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Placeholder Component for unbuilt screens
const PlaceholderScreen = ({ title }) => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>{title || 'Feature Coming Soon'}</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

// Dashboard Stack - Personal dashboard with training overview and progress
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AthletesDashboard" 
      component={AthletesDashboard}
      options={{ 
        headerShown: false
      }} 
    />
    
    {/* Daily Overview */}
    <Stack.Screen 
      name="TodaysActivities" 
      component={() => <PlaceholderScreen title="Today's Training" />}
      options={{ title: "Today's Activities" }} 
    />
    <Stack.Screen 
      name="TodaysWorkout" 
      component={() => <PlaceholderScreen title="Current Workout" />}
      options={{ title: "Today's Workout" }} 
    />
    <Stack.Screen 
      name="DailyGoals" 
      component={() => <PlaceholderScreen title="Daily Goals" />}
      options={{ title: 'Daily Goals' }} 
    />
    <Stack.Screen 
      name="QuickStats" 
      component={() => <PlaceholderScreen title="Quick Stats" />}
      options={{ title: 'Quick Stats' }} 
    />
    
    {/* Weekly & Progress Overview */}
    <Stack.Screen 
      name="WeeklyOverview" 
      component={() => <PlaceholderScreen title="Weekly Training Overview" />}
      options={{ title: 'Weekly Overview' }} 
    />
    <Stack.Screen 
      name="UpcomingTraining" 
      component={() => <PlaceholderScreen title="Upcoming Sessions" />}
      options={{ title: 'Upcoming Training' }} 
    />
    <Stack.Screen 
      name="RecentAchievements" 
      component={() => <PlaceholderScreen title="Recent Achievements" />}
      options={{ title: 'Achievements' }} 
    />
    <Stack.Screen 
      name="ProgressSnapshot" 
      component={() => <PlaceholderScreen title="Progress Snapshot" />}
      options={{ title: 'Progress Overview' }} 
    />
    
    {/* Motivation & Content */}
    <Stack.Screen 
      name="MotivationalContent" 
      component={() => <PlaceholderScreen title="Daily Motivation" />}
      options={{ title: 'Motivation' }} 
    />
    <Stack.Screen 
      name="WeatherInfo" 
      component={() => <PlaceholderScreen title="Weather & Training Conditions" />}
      options={{ title: 'Weather Info' }} 
    />
    <Stack.Screen 
      name="NotificationCenter" 
      component={() => <PlaceholderScreen title="Notifications" />}
      options={{ title: 'Notifications' }} 
    />
    
    {/* Quick Access to Core Features */}
    <Stack.Screen 
      name="MyTrainingPlans" 
      component={() => <PlaceholderScreen title="My Training Plans" />}
      options={{ title: 'Training Plans' }} 
    />
    <Stack.Screen 
      name="CoachConnection" 
      component={() => <PlaceholderScreen title="My Coach" />}
      options={{ title: 'My Coach' }} 
    />
    <Stack.Screen 
      name="TeamConnection" 
      component={() => <PlaceholderScreen title="My Team" />}
      options={{ title: 'My Team' }} 
    />
    <Stack.Screen 
      name="TrainingHistory" 
      component={() => <PlaceholderScreen title="Training History" />}
      options={{ title: 'Training History' }} 
    />
  </Stack.Navigator>
);

// Training Stack - Comprehensive training and workout management
const TrainingStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TrainingMain" 
      component={() => <PlaceholderScreen title="Training Hub" />}
      options={{ 
        title: 'Training Hub',
        headerShown: false 
      }} 
    />
    
    {/* Training Plans & Programs */}
    <Stack.Screen 
      name="MyTrainingPlans" 
      component={() => <PlaceholderScreen title="My Training Plans" />}
      options={{ title: 'My Training Plans' }} 
    />
    <Stack.Screen 
      name="ActiveWorkouts" 
      component={() => <PlaceholderScreen title="Active Workouts" />}
      options={{ title: 'Active Workouts' }} 
    />
    <Stack.Screen 
      name="TodaysWorkout" 
      component={() => <PlaceholderScreen title="Today's Workout" />}
      options={{ title: "Today's Workout" }} 
    />
    <Stack.Screen 
      name="WorkoutHistory" 
      component={() => <PlaceholderScreen title="Workout History" />}
      options={{ title: 'Workout History' }} 
    />
    <Stack.Screen 
      name="CustomWorkouts" 
      component={() => <PlaceholderScreen title="Create Custom Workout" />}
      options={{ title: 'Custom Workouts' }} 
    />
    <Stack.Screen 
      name="WorkoutLibrary" 
      component={() => <PlaceholderScreen title="Workout Library" />}
      options={{ title: 'Workout Library' }} 
    />
    
    {/* Exercise & Instructions */}
    <Stack.Screen 
      name="ExerciseInstructions" 
      component={() => <PlaceholderScreen title="Exercise Instructions" />}
      options={{ title: 'Exercise Guide' }} 
    />
    <Stack.Screen 
      name="TechniqueVideos" 
      component={() => <PlaceholderScreen title="Technique Videos" />}
      options={{ title: 'Technique Videos' }} 
    />
    <Stack.Screen 
      name="DrillPractice" 
      component={() => <PlaceholderScreen title="Drill Practice" />}
      options={{ title: 'Drill Practice' }} 
    />
    <Stack.Screen 
      name="SkillDevelopment" 
      component={() => <PlaceholderScreen title="Skill Development" />}
      options={{ title: 'Skill Development' }} 
    />
    
    {/* Workout Tracking Tools */}
    <Stack.Screen 
      name="WorkoutTimer" 
      component={() => <PlaceholderScreen title="Workout Timer" />}
      options={{ title: 'Workout Timer' }} 
    />
    <Stack.Screen 
      name="SetRepsTracker" 
      component={() => <PlaceholderScreen title="Sets & Reps Tracker" />}
      options={{ title: 'Sets & Reps' }} 
    />
    <Stack.Screen 
      name="RestTimer" 
      component={() => <PlaceholderScreen title="Rest Timer" />}
      options={{ title: 'Rest Timer' }} 
    />
    <Stack.Screen 
      name="WorkoutNotes" 
      component={() => <PlaceholderScreen title="Workout Notes" />}
      options={{ title: 'Workout Notes' }} 
    />
    
    {/* Specialized Training */}
    <Stack.Screen 
      name="StrengthTraining" 
      component={() => <PlaceholderScreen title="Strength Training" />}
      options={{ title: 'Strength Training' }} 
    />
    <Stack.Screen 
      name="CardioWorkouts" 
      component={() => <PlaceholderScreen title="Cardio Workouts" />}
      options={{ title: 'Cardio Training' }} 
    />
    <Stack.Screen 
      name="FlexibilityMobility" 
      component={() => <PlaceholderScreen title="Flexibility & Mobility" />}
      options={{ title: 'Flexibility & Mobility' }} 
    />
    <Stack.Screen 
      name="SportSpecificTraining" 
      component={() => <PlaceholderScreen title="Sport-Specific Training" />}
      options={{ title: 'Sport-Specific' }} 
    />
    <Stack.Screen 
      name="MentalTraining" 
      component={() => <PlaceholderScreen title="Mental Training" />}
      options={{ title: 'Mental Training' }} 
    />
    
    {/* Recovery & Wellness */}
    <Stack.Screen 
      name="RecoveryProtocols" 
      component={() => <PlaceholderScreen title="Recovery Protocols" />}
      options={{ title: 'Recovery' }} 
    />
    <Stack.Screen 
      name="SleepTracking" 
      component={() => <PlaceholderScreen title="Sleep Tracking" />}
      options={{ title: 'Sleep Tracking' }} 
    />
    <Stack.Screen 
      name="StressManagement" 
      component={() => <PlaceholderScreen title="Stress Management" />}
      options={{ title: 'Stress Management' }} 
    />
  </Stack.Navigator>
);

// Progress Stack - Comprehensive progress tracking and performance analytics
const ProgressStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProgressDashboard" 
      component={() => <PlaceholderScreen title="Progress Dashboard" />}
      options={{ 
        title: 'My Progress',
        headerShown: false 
      }} 
    />
    
    {/* Performance Metrics */}
    <Stack.Screen 
      name="PersonalBests" 
      component={() => <PlaceholderScreen title="Personal Bests" />}
      options={{ title: 'Personal Bests' }} 
    />
    <Stack.Screen 
      name="PerformanceMetrics" 
      component={() => <PlaceholderScreen title="Performance Metrics" />}
      options={{ title: 'Performance Metrics' }} 
    />
    <Stack.Screen 
      name="FitnessAssessments" 
      component={() => <PlaceholderScreen title="Fitness Assessments" />}
      options={{ title: 'Fitness Tests' }} 
    />
    <Stack.Screen 
      name="CompetitionResults" 
      component={() => <PlaceholderScreen title="Competition Results" />}
      options={{ title: 'Competition Results' }} 
    />
    <Stack.Screen 
      name="SeasonStats" 
      component={() => <PlaceholderScreen title="Season Statistics" />}
      options={{ title: 'Season Stats' }} 
    />
    
    {/* Body & Health Tracking */}
    <Stack.Screen 
      name="BodyComposition" 
      component={() => <PlaceholderScreen title="Body Composition" />}
      options={{ title: 'Body Composition' }} 
    />
    <Stack.Screen 
      name="MeasurementLog" 
      component={() => <PlaceholderScreen title="Body Measurements" />}
      options={{ title: 'Measurements' }} 
    />
    <Stack.Screen 
      name="WeightTracking" 
      component={() => <PlaceholderScreen title="Weight Tracking" />}
      options={{ title: 'Weight Tracking' }} 
    />
    <Stack.Screen 
      name="ProgressPhotos" 
      component={() => <PlaceholderScreen title="Progress Photos" />}
      options={{ title: 'Progress Photos' }} 
    />
    
    {/* Health & Recovery */}
    <Stack.Screen 
      name="InjuryLog" 
      component={() => <PlaceholderScreen title="Injury Log" />}
      options={{ title: 'Injury Log' }} 
    />
    <Stack.Screen 
      name="RecoveryTracking" 
      component={() => <PlaceholderScreen title="Recovery Tracking" />}
      options={{ title: 'Recovery Tracking' }} 
    />
    <Stack.Screen 
      name="SleepAnalysis" 
      component={() => <PlaceholderScreen title="Sleep Analysis" />}
      options={{ title: 'Sleep Analysis' }} 
    />
    <Stack.Screen 
      name="EnergyLevels" 
      component={() => <PlaceholderScreen title="Energy Levels" />}
      options={{ title: 'Energy Tracking' }} 
    />
    
    {/* Goals & Motivation */}
    <Stack.Screen 
      name="GoalTracking" 
      component={() => <PlaceholderScreen title="Goal Tracking" />}
      options={{ title: 'My Goals' }} 
    />
    <Stack.Screen 
      name="MotivationTracker" 
      component={() => <PlaceholderScreen title="Motivation Tracker" />}
      options={{ title: 'Motivation' }} 
    />
    <Stack.Screen 
      name="StreakCounter" 
      component={() => <PlaceholderScreen title="Training Streaks" />}
      options={{ title: 'Training Streaks' }} 
    />
    <Stack.Screen 
      name="Achievements" 
      component={() => <PlaceholderScreen title="Achievements & Badges" />}
      options={{ title: 'Achievements' }} 
    />
    
    {/* Analytics & Reports */}
    <Stack.Screen 
      name="ProgressReports" 
      component={() => <PlaceholderScreen title="Progress Reports" />}
      options={{ title: 'Progress Reports' }} 
    />
    <Stack.Screen 
      name="PerformanceAnalytics" 
      component={() => <PlaceholderScreen title="Performance Analytics" />}
      options={{ title: 'Analytics' }} 
    />
    <Stack.Screen 
      name="TrendAnalysis" 
      component={() => <PlaceholderScreen title="Trend Analysis" />}
      options={{ title: 'Trends' }} 
    />
    <Stack.Screen 
      name="DataExport" 
      component={() => <PlaceholderScreen title="Export Data" />}
      options={{ title: 'Export Data' }} 
    />
  </Stack.Navigator>
);

// Search Stack - Find coaches, academies, facilities, and opportunities
const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="SearchMain" 
      component={NewScreen}
      options={{ 
        title: 'Search & Discover',
        headerShown: false 
      }} 
    />
    
    {/* Find Coaches & Training */}
    <Stack.Screen 
      name="SearchCoaches" 
      component={() => <PlaceholderScreen title="Find Coaches" />}
      options={{ title: 'Find Coaches' }} 
    />
    <Stack.Screen 
      name="SearchAcademies" 
      component={() => <PlaceholderScreen title="Sports Academies" />}
      options={{ title: 'Sports Academies' }} 
    />
    <Stack.Screen 
      name="SearchTrainingPartners" 
      component={() => <PlaceholderScreen title="Find Training Partners" />}
      options={{ title: 'Training Partners' }} 
    />
    <Stack.Screen 
      name="NearbyFacilities" 
      component={() => <PlaceholderScreen title="Nearby Training Facilities" />}
      options={{ title: 'Nearby Facilities' }} 
    />
    <Stack.Screen 
      name="OpenTrainingSessions" 
      component={() => <PlaceholderScreen title="Join Open Sessions" />}
      options={{ title: 'Open Sessions' }} 
    />
    
    {/* Events & Opportunities */}
    <Stack.Screen 
      name="SportsEvents" 
      component={() => <PlaceholderScreen title="Sports Events" />}
      options={{ title: 'Sports Events' }} 
    />
    <Stack.Screen 
      name="Competitions" 
      component={() => <PlaceholderScreen title="Competitions" />}
      options={{ title: 'Competitions' }} 
    />
    <Stack.Screen 
      name="WorkshopsClinic" 
      component={() => <PlaceholderScreen title="Workshops & Clinics" />}
      options={{ title: 'Workshops' }} 
    />
    <Stack.Screen 
      name="TrialsScouts" 
      component={() => <PlaceholderScreen title="Trials & Scouting" />}
      options={{ title: 'Trials & Scouts' }} 
    />
    <Stack.Screen 
      name="TeamOpportunities" 
      component={() => <PlaceholderScreen title="Team Opportunities" />}
      options={{ title: 'Team Opportunities' }} 
    />
    <Stack.Screen 
      name="ScholarshipInfo" 
      component={() => <PlaceholderScreen title="Scholarship Information" />}
      options={{ title: 'Scholarships' }} 
    />
    
    {/* Community & Resources */}
    <Stack.Screen 
      name="SportsNews" 
      component={() => <PlaceholderScreen title="Sports News" />}
      options={{ title: 'Sports News' }} 
    />
    <Stack.Screen 
      name="CommunityGroups" 
      component={() => <PlaceholderScreen title="Community Groups" />}
      options={{ title: 'Community' }} 
    />
    <Stack.Screen 
      name="AthleteForum" 
      component={() => <PlaceholderScreen title="Athlete Forum" />}
      options={{ title: 'Forum' }} 
    />
    <Stack.Screen 
      name="EquipmentStores" 
      component={() => <PlaceholderScreen title="Sports Equipment" />}
      options={{ title: 'Equipment' }} 
    />
    <Stack.Screen 
      name="NutritionStores" 
      component={() => <PlaceholderScreen title="Nutrition & Supplements" />}
      options={{ title: 'Nutrition' }} 
    />
    
    {/* Bookings & Reservations */}
    <Stack.Screen 
      name="CoachBookings" 
      component={() => <PlaceholderScreen title="Book Coach Sessions" />}
      options={{ title: 'Book Coach' }} 
    />
    <Stack.Screen 
      name="FacilityBookings" 
      component={() => <PlaceholderScreen title="Book Facilities" />}
      options={{ title: 'Book Facilities' }} 
    />
    <Stack.Screen 
      name="SessionBookings" 
      component={() => <PlaceholderScreen title="Book Training Sessions" />}
      options={{ title: 'Book Sessions' }} 
    />
    <Stack.Screen 
      name="BookingCalendar" 
      component={() => <PlaceholderScreen title="Booking Calendar" />}
      options={{ title: 'My Bookings' }} 
    />
  </Stack.Navigator>
);

// Nutrition Stack - Comprehensive nutrition and wellness management
const NutritionStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="NutritionDashboard" 
      component={() => <PlaceholderScreen title="Nutrition Dashboard" />}
      options={{ 
        title: 'Nutrition & Wellness',
        headerShown: false 
      }} 
    />
    
    {/* Meal Planning & Tracking */}
    <Stack.Screen 
      name="MealPlanning" 
      component={() => <PlaceholderScreen title="Meal Planning" />}
      options={{ title: 'Meal Planning' }} 
    />
    <Stack.Screen 
      name="CalorieTracking" 
      component={() => <PlaceholderScreen title="Calorie Tracking" />}
      options={{ title: 'Calorie Tracking' }} 
    />
    <Stack.Screen 
      name="MacroTracking" 
      component={() => <PlaceholderScreen title="Macro Tracking" />}
      options={{ title: 'Macros' }} 
    />
    <Stack.Screen 
      name="FoodDiary" 
      component={() => <PlaceholderScreen title="Food Diary" />}
      options={{ title: 'Food Diary' }} 
    />
    <Stack.Screen 
      name="NutritionalGoals" 
      component={() => <PlaceholderScreen title="Nutritional Goals" />}
      options={{ title: 'Nutrition Goals' }} 
    />
    
    {/* Hydration & Supplements */}
    <Stack.Screen 
      name="HydrationMonitor" 
      component={() => <PlaceholderScreen title="Hydration Monitor" />}
      options={{ title: 'Hydration' }} 
    />
    <Stack.Screen 
      name="SupplementTracker" 
      component={() => <PlaceholderScreen title="Supplement Tracker" />}
      options={{ title: 'Supplements' }} 
    />
    <Stack.Screen 
      name="WeightManagement" 
      component={() => <PlaceholderScreen title="Weight Management" />}
      options={{ title: 'Weight Management' }} 
    />
    
    {/* Recipes & Education */}
    <Stack.Screen 
      name="RecipeLibrary" 
      component={() => <PlaceholderScreen title="Healthy Recipe Library" />}
      options={{ title: 'Recipes' }} 
    />
    <Stack.Screen 
      name="PrePostWorkoutMeals" 
      component={() => <PlaceholderScreen title="Pre/Post Workout Nutrition" />}
      options={{ title: 'Workout Nutrition' }} 
    />
    <Stack.Screen 
      name="NutritionalEducation" 
      component={() => <PlaceholderScreen title="Nutritional Education" />}
      options={{ title: 'Nutrition Education' }} 
    />
    <Stack.Screen 
      name="DietaryRestrictions" 
      component={() => <PlaceholderScreen title="Dietary Restrictions" />}
      options={{ title: 'Dietary Needs' }} 
    />
    
    {/* Wellness Integration */}
    <Stack.Screen 
      name="WellnessAssessment" 
      component={() => <PlaceholderScreen title="Wellness Assessment" />}
      options={{ title: 'Wellness Check' }} 
    />
    <Stack.Screen 
      name="EnergyTracking" 
      component={() => <PlaceholderScreen title="Energy Level Tracking" />}
      options={{ title: 'Energy Levels' }} 
    />
    <Stack.Screen 
      name="DigestiveHealth" 
      component={() => <PlaceholderScreen title="Digestive Health" />}
      options={{ title: 'Digestive Health' }} 
    />
  </Stack.Navigator>
);

// Profile Stack - Comprehensive athlete profile and settings
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AthleteProfile" 
      component={ProfileScreen} 
      options={{ title: 'My Profile' }} 
    />
    
    {/* Personal Information */}
    <Stack.Screen 
      name="PersonalInfo" 
      component={() => <PlaceholderScreen title="Personal Information" />}
      options={{ title: 'Personal Info' }} 
    />
    <Stack.Screen 
      name="SportsProfile" 
      component={() => <PlaceholderScreen title="Sports Profile" />}
      options={{ title: 'Sports Profile' }} 
    />
    <Stack.Screen 
      name="AthleteStats" 
      component={() => <PlaceholderScreen title="Athlete Statistics" />}
      options={{ title: 'My Stats' }} 
    />
    <Stack.Screen 
      name="SkillsAbilities" 
      component={() => <PlaceholderScreen title="Skills & Abilities" />}
      options={{ title: 'Skills & Abilities' }} 
    />
    <Stack.Screen 
      name="SportsHistory" 
      component={() => <PlaceholderScreen title="Sports History" />}
      options={{ title: 'Sports History' }} 
    />
    <Stack.Screen 
      name="Achievements" 
      component={() => <PlaceholderScreen title="Achievements & Awards" />}
      options={{ title: 'Achievements' }} 
    />
    
    {/* Health & Safety */}
    <Stack.Screen 
      name="HealthInformation" 
      component={() => <PlaceholderScreen title="Health Information" />}
      options={{ title: 'Health Info' }} 
    />
    <Stack.Screen 
      name="MedicalClearance" 
      component={() => <PlaceholderScreen title="Medical Clearance" />}
      options={{ title: 'Medical Clearance' }} 
    />
    <Stack.Screen 
      name="InjuryHistory" 
      component={() => <PlaceholderScreen title="Injury History" />}
      options={{ title: 'Injury History' }} 
    />
    <Stack.Screen 
      name="AllergiesMedications" 
      component={() => <PlaceholderScreen title="Allergies & Medications" />}
      options={{ title: 'Allergies & Meds' }} 
    />
    <Stack.Screen 
      name="EmergencyContacts" 
      component={() => <PlaceholderScreen title="Emergency Contacts" />}
      options={{ title: 'Emergency Contacts' }} 
    />
    <Stack.Screen 
      name="InsuranceInfo" 
      component={() => <PlaceholderScreen title="Insurance Information" />}
      options={{ title: 'Insurance' }} 
    />
    
    {/* Family & Parental */}
    <Stack.Screen 
      name="ParentalConsent" 
      component={() => <PlaceholderScreen title="Parental Consent" />}
      options={{ title: 'Parental Consent' }} 
    />
    <Stack.Screen 
      name="FamilyInformation" 
      component={() => <PlaceholderScreen title="Family Information" />}
      options={{ title: 'Family Info' }} 
    />
    <Stack.Screen 
      name="GuardianSettings" 
      component={() => <PlaceholderScreen title="Guardian Settings" />}
      options={{ title: 'Guardian Settings' }} 
    />
    
    {/* Coach & Team Connections */}
    <Stack.Screen 
      name="MyCoaches" 
      component={() => <PlaceholderScreen title="My Coaches" />}
      options={{ title: 'My Coaches' }} 
    />
    <Stack.Screen 
      name="MyTeams" 
      component={() => <PlaceholderScreen title="My Teams" />}
      options={{ title: 'My Teams' }} 
    />
    <Stack.Screen 
      name="TrainingPartners" 
      component={() => <PlaceholderScreen title="Training Partners" />}
      options={{ title: 'Training Partners' }} 
    />
    <Stack.Screen 
      name="MentorConnections" 
      component={() => <PlaceholderScreen title="Mentor Connections" />}
      options={{ title: 'Mentors' }} 
    />
    
    {/* Settings & Preferences */}
    <Stack.Screen 
      name="AccountSettings" 
      component={() => <PlaceholderScreen title="Account Settings" />}
      options={{ title: 'Account Settings' }} 
    />
    <Stack.Screen 
      name="NotificationSettings" 
      component={() => <PlaceholderScreen title="Notification Settings" />}
      options={{ title: 'Notifications' }} 
    />
    <Stack.Screen 
      name="PrivacySettings" 
      component={() => <PlaceholderScreen title="Privacy Settings" />}
      options={{ title: 'Privacy' }} 
    />
    <Stack.Screen 
      name="ProfileVisibility" 
      component={() => <PlaceholderScreen title="Profile Visibility" />}
      options={{ title: 'Profile Visibility' }} 
    />
    <Stack.Screen 
      name="AppPreferences" 
      component={() => <PlaceholderScreen title="App Preferences" />}
      options={{ title: 'App Settings' }} 
    />
    <Stack.Screen 
      name="LanguageSettings" 
      component={() => <PlaceholderScreen title="Language Settings" />}
      options={{ title: 'Language' }} 
    />
    
    {/* Data & Backup */}
    <Stack.Screen 
      name="DataBackup" 
      component={() => <PlaceholderScreen title="Data Backup & Sync" />}
      options={{ title: 'Data Backup' }} 
    />
    <Stack.Screen 
      name="DataExport" 
      component={() => <PlaceholderScreen title="Export My Data" />}
      options={{ title: 'Export Data' }} 
    />
    <Stack.Screen 
      name="AccountDeletion" 
      component={() => <PlaceholderScreen title="Delete Account" />}
      options={{ title: 'Delete Account' }} 
    />
    
    {/* Billing & Subscriptions */}
    <Stack.Screen 
      name="BillingInfo" 
      component={() => <PlaceholderScreen title="Billing Information" />}
      options={{ title: 'Billing' }} 
    />
    <Stack.Screen 
      name="SubscriptionStatus" 
      component={() => <PlaceholderScreen title="Subscription Status" />}
      options={{ title: 'Subscription' }} 
    />
    <Stack.Screen 
      name="PaymentMethods" 
      component={() => <PlaceholderScreen title="Payment Methods" />}
      options={{ title: 'Payment Methods' }} 
    />
    <Stack.Screen 
      name="PaymentHistory" 
      component={() => <PlaceholderScreen title="Payment History" />}
      options={{ title: 'Payment History' }} 
    />
    
    {/* Support & Help */}
    <Stack.Screen 
      name="SupportHelp" 
      component={() => <PlaceholderScreen title="Support & Help Center" />}
      options={{ title: 'Help & Support' }} 
    />
    <Stack.Screen 
      name="FAQs" 
      component={() => <PlaceholderScreen title="Frequently Asked Questions" />}
      options={{ title: 'FAQs' }} 
    />
    <Stack.Screen 
      name="ContactSupport" 
      component={() => <PlaceholderScreen title="Contact Support" />}
      options={{ title: 'Contact Support' }} 
    />
    <Stack.Screen 
      name="TutorialsGuides" 
      component={() => <PlaceholderScreen title="Tutorials & Guides" />}
      options={{ title: 'Tutorials' }} 
    />
    <Stack.Screen 
      name="FeedbackSuggestions" 
      component={() => <PlaceholderScreen title="Feedback & Suggestions" />}
      options={{ title: 'Feedback' }} 
    />
    <Stack.Screen 
      name="BugReports" 
      component={() => <PlaceholderScreen title="Report a Bug" />}
      options={{ title: 'Report Bug' }} 
    />
    <Stack.Screen 
      name="CommunityForum" 
      component={() => <PlaceholderScreen title="Community Forum" />}
      options={{ title: 'Community' }} 
    />
    
    {/* Legal & Compliance */}
    <Stack.Screen 
      name="TermsOfService" 
      component={() => <PlaceholderScreen title="Terms of Service" />}
      options={{ title: 'Terms of Service' }} 
    />
    <Stack.Screen 
      name="PrivacyPolicy" 
      component={() => <PlaceholderScreen title="Privacy Policy" />}
      options={{ title: 'Privacy Policy' }} 
    />
    <Stack.Screen 
      name="DataPolicy" 
      component={() => <PlaceholderScreen title="Data Policy" />}
      options={{ title: 'Data Policy' }} 
    />
    <Stack.Screen 
      name="CookieSettings" 
      component={() => <PlaceholderScreen title="Cookie Settings" />}
      options={{ title: 'Cookie Settings' }} 
    />
  </Stack.Navigator>
);

// Communication Stack - Messaging, social features, and community interaction
const CommunicationStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CommunicationMain" 
      component={() => <PlaceholderScreen title="Messages & Social" />}
      options={{ 
        title: 'Messages & Social',
        headerShown: false 
      }} 
    />
    
    {/* Direct Communication */}
    <Stack.Screen 
      name="CoachChat" 
      component={ChatScreen}
      options={{ title: 'Chat with Coach' }} 
    />
    <Stack.Screen 
      name="TeamChat" 
      component={ChatScreen}
      options={{ title: 'Team Chat' }} 
    />
    <Stack.Screen 
      name="TrainingPartnerChat" 
      component={() => <PlaceholderScreen title="Training Partner Chat" />}
      options={{ title: 'Partner Chat' }} 
    />
    <Stack.Screen 
      name="ParentUpdates" 
      component={() => <PlaceholderScreen title="Parent Updates" />}
      options={{ title: 'Parent Updates' }} 
    />
    <Stack.Screen 
      name="GroupMessages" 
      component={() => <PlaceholderScreen title="Group Messages" />}
      options={{ title: 'Group Messages' }} 
    />
    
    {/* Feedback & Reviews */}
    <Stack.Screen 
      name="FeedbackToCoach" 
      component={() => <PlaceholderScreen title="Feedback to Coach" />}
      options={{ title: 'Coach Feedback' }} 
    />
    <Stack.Screen 
      name="SessionReviews" 
      component={() => <PlaceholderScreen title="Session Reviews" />}
      options={{ title: 'Session Reviews' }} 
    />
    <Stack.Screen 
      name="FacilityReviews" 
      component={() => <PlaceholderScreen title="Facility Reviews" />}
      options={{ title: 'Facility Reviews' }} 
    />
    <Stack.Screen 
      name="AcademyReviews" 
      component={() => <PlaceholderScreen title="Academy Reviews" />}
      options={{ title: 'Academy Reviews' }} 
    />
    
    {/* Social & Community */}
    <Stack.Screen 
      name="SocialFeed" 
      component={() => <PlaceholderScreen title="Social Feed" />}
      options={{ title: 'Social Feed' }} 
    />
    <Stack.Screen 
      name="AchievementSharing" 
      component={() => <PlaceholderScreen title="Share Achievements" />}
      options={{ title: 'Share Achievements' }} 
    />
    <Stack.Screen 
      name="ProgressSharing" 
      component={() => <PlaceholderScreen title="Share Progress" />}
      options={{ title: 'Share Progress' }} 
    />
    <Stack.Screen 
      name="CommunityGroups" 
      component={() => <PlaceholderScreen title="Community Groups" />}
      options={{ title: 'Community Groups' }} 
    />
    <Stack.Screen 
      name="QuestionsForum" 
      component={() => <PlaceholderScreen title="Questions & Answers" />}
      options={{ title: 'Q&A Forum' }} 
    />
    <Stack.Screen 
      name="MotivationalPosts" 
      component={() => <PlaceholderScreen title="Motivational Posts" />}
      options={{ title: 'Motivation' }} 
    />
    
    {/* Support & Mentorship */}
    <Stack.Screen 
      name="MentorConnection" 
      component={() => <PlaceholderScreen title="Connect with Mentors" />}
      options={{ title: 'Find Mentors' }} 
    />
    <Stack.Screen 
      name="PeerSupport" 
      component={() => <PlaceholderScreen title="Peer Support Groups" />}
      options={{ title: 'Peer Support' }} 
    />
    <Stack.Screen 
      name="StudyGroups" 
      component={() => <PlaceholderScreen title="Study Groups" />}
      options={{ title: 'Study Groups' }} 
    />
    <Stack.Screen 
      name="SkillExchange" 
      component={() => <PlaceholderScreen title="Skill Exchange" />}
      options={{ title: 'Skill Exchange' }} 
    />
    
    {/* Announcements & Updates */}
    <Stack.Screen 
      name="Announcements" 
      component={() => <PlaceholderScreen title="Announcements" />}
      options={{ title: 'Announcements' }} 
    />
    <Stack.Screen 
      name="TeamUpdates" 
      component={() => <PlaceholderScreen title="Team Updates" />}
      options={{ title: 'Team Updates' }} 
    />
    <Stack.Screen 
      name="CoachUpdates" 
      component={() => <PlaceholderScreen title="Coach Updates" />}
      options={{ title: 'Coach Updates' }} 
    />
    <Stack.Screen 
      name="NewsAlerts" 
      component={() => <PlaceholderScreen title="Sports News Alerts" />}
      options={{ title: 'News Alerts' }} 
    />
  </Stack.Navigator>
);

// Custom Plus Button Component for Search tab
const PlusButton = ({ focused }) => (
  <View style={[
    styles.plusButton, 
    { backgroundColor: focused ? COLORS.primary : COLORS.primary }
  ]}>
    <Icon 
      name="search" 
      size={22} 
      color="#fff"
    />
  </View>
);

// Main Athlete Navigator Component
const AthleteNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Training':
              iconName = 'fitness-center';
              break;
            case 'Progress':
              iconName = 'trending-up';
              break;
            case 'Search':
              // Return custom plus button
              return <PlusButton focused={focused} />;
            case 'Social':
              iconName = 'chat';
              break;
            case 'Nutrition':
              iconName = 'restaurant';
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
        name="Dashboard" 
        component={DashboardStack}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Training" 
        component={TrainingStack}
        options={{
          tabBarLabel: 'Training',
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressStack}
        options={{
          tabBarLabel: 'Progress',
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchStack}
        options={{
          tabBarLabel: 'Search',
        }}
      />
      <Tab.Screen 
        name="Social" 
        component={CommunicationStack}
        options={{
          tabBarLabel: 'Social',
        }}
      />
      <Tab.Screen 
        name="Nutrition" 
        component={NutritionStack}
        options={{
          tabBarLabel: 'Nutrition',
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
  plusButton: {
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
  placeholderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 12,
    fontWeight: '600',
  },
  placeholderDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});

export default AthleteNavigator;