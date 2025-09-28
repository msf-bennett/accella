import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../styles/colors';

// Existing Trainer Screens (if any)
import TrainerDashboard from '../screens/trainer/dashboard/TrainerDashboard';
// import ClientList from '../screens/trainer/ClientList';
// import WorkoutBuilder from '../screens/trainer/WorkoutBuilder';
// import NutritionPlan from '../screens/trainer/NutritionPlan';
import ChatScreen from '../screens/shared/ChatScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
// import NewScreen from '../screens/shared/NewScreen';

// Dashboard & Analytics Screens (Comment out imports for unbuilt screens)
// import FitnessAnalytics from '../screens/trainer/dashboard/FitnessAnalytics';
// import ClientOverview from '../screens/trainer/dashboard/ClientOverview';
// import UpcomingWorkouts from '../screens/trainer/dashboard/UpcomingWorkouts';
// import RecentSessions from '../screens/trainer/dashboard/RecentSessions';
// import ClientAttendance from '../screens/trainer/dashboard/ClientAttendance';
// import RevenueTracking from '../screens/trainer/dashboard/RevenueTracking';
// import HealthMetrics from '../screens/trainer/dashboard/HealthMetrics';
// import GoalTracking from '../screens/trainer/dashboard/GoalTracking';
// import QuickActions from '../screens/trainer/dashboard/QuickActions';
// import WorkoutCalendar from '../screens/trainer/dashboard/WorkoutCalendar';

// Workout & Program Management Screens
// import WorkoutLibrary from '../screens/trainer/workouts/WorkoutLibrary';
// import ExerciseDatabase from '../screens/trainer/workouts/ExerciseDatabase';
// import ProgramTemplates from '../screens/trainer/workouts/ProgramTemplates';
// import CustomWorkouts from '../screens/trainer/workouts/CustomWorkouts';
// import WorkoutScheduler from '../screens/trainer/workouts/WorkoutScheduler';
// import ProgressiveOverload from '../screens/trainer/workouts/ProgressiveOverload';
// import WorkoutHistory from '../screens/trainer/workouts/WorkoutHistory';
// import ExerciseForm from '../screens/trainer/workouts/ExerciseForm';
// import WorkoutTracking from '../screens/trainer/workouts/WorkoutTracking';
// import RestPeriodTimer from '../screens/trainer/workouts/RestPeriodTimer';
// import SupersetBuilder from '../screens/trainer/workouts/SupersetBuilder';
// import CircuitTraining from '../screens/trainer/workouts/CircuitTraining';

// Client Management Screens
// import ClientProfiles from '../screens/trainer/clients/ClientProfiles';
// import ClientProgress from '../screens/trainer/clients/ClientProgress';
// import FitnessAssessments from '../screens/trainer/clients/FitnessAssessments';
// import BodyComposition from '../screens/trainer/clients/BodyComposition';
// import InjuryHistory from '../screens/trainer/clients/InjuryHistory';
// import ClientGoals from '../screens/trainer/clients/ClientGoals';
// import ClientInvitations from '../screens/trainer/clients/ClientInvitations';
// import GroupClasses from '../screens/trainer/clients/GroupClasses';
// import ClientRetention from '../screens/trainer/clients/ClientRetention';
// import ClientFeedback from '../screens/trainer/clients/ClientFeedback';
// import PersonalRecords from '../screens/trainer/clients/PersonalRecords';
// import ClientCheckins from '../screens/trainer/clients/ClientCheckins';

// Nutrition & Wellness Screens
// import NutritionPlanning from '../screens/trainer/nutrition/NutritionPlanning';
// import MealPlanning from '../screens/trainer/nutrition/MealPlanning';
// import MacroTracking from '../screens/trainer/nutrition/MacroTracking';
// import SupplementGuide from '../screens/trainer/nutrition/SupplementGuide';
// import HydrationTracking from '../screens/trainer/nutrition/HydrationTracking';
// import CalorieCalculator from '../screens/trainer/nutrition/CalorieCalculator';
// import NutritionEducation from '../screens/trainer/nutrition/NutritionEducation';
// import MealPrep from '../screens/trainer/nutrition/MealPrep';
// import FoodDiary from '../screens/trainer/nutrition/FoodDiary';
// import NutritionGoals from '../screens/trainer/nutrition/NutritionGoals';

// Recovery & Wellness Screens
// import RecoveryProtocols from '../screens/trainer/recovery/RecoveryProtocols';
// import SleepTracking from '../screens/trainer/recovery/SleepTracking';
// import StressManagement from '../screens/trainer/recovery/StressManagement';
// import MobilityRoutines from '../screens/trainer/recovery/MobilityRoutines';
// import InjuryPrevention from '../screens/trainer/recovery/InjuryPrevention';
// import RecoveryAssessment from '../screens/trainer/recovery/RecoveryAssessment';
// import MassageProtocols from '../screens/trainer/recovery/MassageProtocols';
// import ColdTherapy from '../screens/trainer/recovery/ColdTherapy';
// import HeatTherapy from '../screens/trainer/recovery/HeatTherapy';
// import ActiveRecovery from '../screens/trainer/recovery/ActiveRecovery';

// AI & Technology Screens
// import AIWorkoutGenerator from '../screens/trainer/ai/AIWorkoutGenerator';
// import SmartProgression from '../screens/trainer/ai/SmartProgression';
// import PersonalizedPlans from '../screens/trainer/ai/PersonalizedPlans';
// import FormAnalysis from '../screens/trainer/ai/FormAnalysis';
// import PredictiveAnalytics from '../screens/trainer/ai/PredictiveAnalytics';
// import AICoaching from '../screens/trainer/ai/AICoaching';
// import MotionCapture from '../screens/trainer/ai/MotionCapture';
// import SmartRecommendations from '../screens/trainer/ai/SmartRecommendations';

// Performance & Analytics Screens
// import PerformanceDashboard from '../screens/trainer/performance/PerformanceDashboard';
// import StrengthAnalytics from '../screens/trainer/performance/StrengthAnalytics';
// import CardioAnalytics from '../screens/trainer/performance/CardioAnalytics';
// import BiometricTracking from '../screens/trainer/performance/BiometricTracking';
// import PerformanceTests from '../screens/trainer/performance/PerformanceTests';
// import ProgressReports from '../screens/trainer/performance/ProgressReports';
// import CompetitionPrep from '../screens/trainer/performance/CompetitionPrep';
// import PerformanceGoals from '../screens/trainer/performance/PerformanceGoals';
// import DataVisualization from '../screens/trainer/performance/DataVisualization';

// Communication & Community Screens
// import ClientChat from '../screens/trainer/communication/ClientChat';
// import GroupDiscussions from '../screens/trainer/communication/GroupDiscussions';
// import MotivationalMessages from '../screens/trainer/communication/MotivationalMessages';
// import CheckInReminders from '../screens/trainer/communication/CheckInReminders';
// import ProgressCelebrations from '../screens/trainer/communication/ProgressCelebrations';
// import CommunityFeed from '../screens/trainer/communication/CommunityFeed';
// import LiveCoaching from '../screens/trainer/communication/LiveCoaching';
// import VideoConsultations from '../screens/trainer/communication/VideoConsultations';

// Business & Marketplace Screens
// import ServiceOfferings from '../screens/trainer/business/ServiceOfferings';
// import PricingPackages from '../screens/trainer/business/PricingPackages';
// import SessionBookings from '../screens/trainer/business/SessionBookings';
// import PaymentProcessing from '../screens/trainer/business/PaymentProcessing';
// import ClientContracts from '../screens/trainer/business/ClientContracts';
// import MarketplaceProfile from '../screens/trainer/business/MarketplaceProfile';
// import ReviewsManagement from '../screens/trainer/business/ReviewsManagement';
// import EarningsTracker from '../screens/trainer/business/EarningsTracker';
// import MarketingTools from '../screens/trainer/business/MarketingTools';
// import ReferralProgram from '../screens/trainer/business/ReferralProgram';

// Discovery & Network Screens
// import TrainerNetwork from '../screens/trainer/discovery/TrainerNetwork';
// import GymnasiumDirectory from '../screens/trainer/discovery/GymnasiumDirectory';
// import EquipmentSharing from '../screens/trainer/discovery/EquipmentSharing';
// import ProfessionalEvents from '../screens/trainer/discovery/ProfessionalEvents';
// import CertificationHub from '../screens/trainer/discovery/CertificationHub';
// import ContinuingEducation from '../screens/trainer/discovery/ContinuingEducation';
// import MentorshipNetwork from '../screens/trainer/discovery/MentorshipNetwork';
// import JobOpportunities from '../screens/trainer/discovery/JobOpportunities';
// import FitnessConferences from '../screens/trainer/discovery/FitnessConferences';

// Education & Content Screens
// import ExerciseLibrary from '../screens/trainer/education/ExerciseLibrary';
// import VideoTutorials from '../screens/trainer/education/VideoTutorials';
// import AnatomyGuide from '../screens/trainer/education/AnatomyGuide';
// import BiomechanicsLearning from '../screens/trainer/education/BiomechanicsLearning';
// import NutritionEducation from '../screens/trainer/education/NutritionEducation';
// import CourseCreation from '../screens/trainer/education/CourseCreation';
// import WebinarHosting from '../screens/trainer/education/WebinarHosting';
// import KnowledgeBase from '../screens/trainer/education/KnowledgeBase';

// Profile & Settings Screens
// import TrainerProfile from '../screens/trainer/profile/TrainerProfile';
// import Certifications from '../screens/trainer/profile/Certifications';
// import Specializations from '../screens/trainer/profile/Specializations';
// import Portfolio from '../screens/trainer/profile/Portfolio';
// import TrainerSettings from '../screens/trainer/profile/TrainerSettings';
// import PrivacySettings from '../screens/trainer/profile/PrivacySettings';
// import AccountManagement from '../screens/trainer/profile/AccountManagement';
// import BackupSettings from '../screens/trainer/profile/BackupSettings';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Placeholder Component for unbuilt screens
const PlaceholderScreen = ({ title }) => (
  <View style={styles.placeholderScreen}>
    <Icon name="fitness-center" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>{title || 'Feature Coming Soon'}</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're building amazing fitness tools just for trainers. Stay tuned for updates!
    </Text>
  </View>
);

// Dashboard Stack - Main hub for trainer analytics and quick actions
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TrainerDashboard" 
      component={TrainerDashboard} 
      options={{ 
        headerShown: false,
        title: 'Dashboard'
      }} 
    />
    
    {/* Analytics & Overview */}
    <Stack.Screen 
      name="FitnessAnalytics" 
      component={() => <PlaceholderScreen title="Fitness Analytics" />}
      options={{ title: 'Analytics' }} 
    />
    <Stack.Screen 
      name="ClientOverview" 
      component={() => <PlaceholderScreen title="Client Overview" />}
      options={{ title: 'Client Overview' }} 
    />
    <Stack.Screen 
      name="UpcomingWorkouts" 
      component={() => <PlaceholderScreen title="Upcoming Workouts" />}
      options={{ title: 'Upcoming Workouts' }} 
    />
    <Stack.Screen 
      name="RecentSessions" 
      component={() => <PlaceholderScreen title="Recent Sessions" />}
      options={{ title: 'Recent Sessions' }} 
    />
    <Stack.Screen 
      name="ClientAttendance" 
      component={() => <PlaceholderScreen title="Client Attendance" />}
      options={{ title: 'Attendance Tracking' }} 
    />
    <Stack.Screen 
      name="RevenueTracking" 
      component={() => <PlaceholderScreen title="Revenue Tracking" />}
      options={{ title: 'Revenue Tracking' }} 
    />
    <Stack.Screen 
      name="HealthMetrics" 
      component={() => <PlaceholderScreen title="Health Metrics Dashboard" />}
      options={{ title: 'Health Metrics' }} 
    />
    <Stack.Screen 
      name="GoalTracking" 
      component={() => <PlaceholderScreen title="Goal Tracking" />}
      options={{ title: 'Goal Tracking' }} 
    />
    <Stack.Screen 
      name="QuickActions" 
      component={() => <PlaceholderScreen title="Quick Actions" />}
      options={{ title: 'Quick Actions' }} 
    />
    <Stack.Screen 
      name="WorkoutCalendar" 
      component={() => <PlaceholderScreen title="Workout Calendar" />}
      options={{ title: 'Workout Calendar' }} 
    />

    {/* Workout Management Quick Access */}
    <Stack.Screen 
      name="WorkoutBuilder" 
      component={() => <PlaceholderScreen title="Workout Builder" />}
      options={{ title: 'Build Workout' }} 
    />
    <Stack.Screen 
      name="ClientList" 
      component={() => <PlaceholderScreen title="My Clients" />}
      options={{ title: 'My Clients' }} 
    />
    <Stack.Screen 
      name="WorkoutLibrary" 
      component={() => <PlaceholderScreen title="Workout Library" />}
      options={{ title: 'Workout Library' }} 
    />
    <Stack.Screen 
      name="PerformanceDashboard" 
      component={() => <PlaceholderScreen title="Performance Dashboard" />}
      options={{ title: 'Performance Dashboard' }} 
    />

    {/* AI Features Quick Access */}
    <Stack.Screen 
      name="AIWorkoutGenerator" 
      component={() => <PlaceholderScreen title="AI Workout Generator" />}
      options={{ title: 'AI Workout Generator' }} 
    />
    <Stack.Screen 
      name="SmartProgression" 
      component={() => <PlaceholderScreen title="Smart Progression" />}
      options={{ title: 'Smart Progression' }} 
    />
    <Stack.Screen 
      name="PersonalizedPlans" 
      component={() => <PlaceholderScreen title="Personalized Training Plans" />}
      options={{ title: 'Personalized Plans' }} 
    />
  </Stack.Navigator>
);

// Workouts Stack - Comprehensive workout and program management
const WorkoutsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="WorkoutsMain" 
      component={() => <PlaceholderScreen title="Workout Hub" />}
      options={{ 
        title: 'Workout Hub',
        headerShown: false 
      }} 
    />
    
    {/* Workout Creation & Management */}
    <Stack.Screen 
      name="WorkoutBuilder" 
      component={() => <PlaceholderScreen title="Workout Builder" />}
      options={{ title: 'Build Workout' }} 
    />
    <Stack.Screen 
      name="WorkoutLibrary" 
      component={() => <PlaceholderScreen title="Workout Library" />}
      options={{ title: 'Workout Library' }} 
    />
    <Stack.Screen 
      name="ExerciseDatabase" 
      component={() => <PlaceholderScreen title="Exercise Database" />}
      options={{ title: 'Exercise Database' }} 
    />
    <Stack.Screen 
      name="ProgramTemplates" 
      component={() => <PlaceholderScreen title="Program Templates" />}
      options={{ title: 'Program Templates' }} 
    />
    <Stack.Screen 
      name="CustomWorkouts" 
      component={() => <PlaceholderScreen title="Custom Workouts" />}
      options={{ title: 'Custom Workouts' }} 
    />
    <Stack.Screen 
      name="WorkoutScheduler" 
      component={() => <PlaceholderScreen title="Workout Scheduler" />}
      options={{ title: 'Schedule Workouts' }} 
    />
    <Stack.Screen 
      name="ProgressiveOverload" 
      component={() => <PlaceholderScreen title="Progressive Overload" />}
      options={{ title: 'Progressive Overload' }} 
    />
    <Stack.Screen 
      name="WorkoutHistory" 
      component={() => <PlaceholderScreen title="Workout History" />}
      options={{ title: 'Workout History' }} 
    />
    <Stack.Screen 
      name="ExerciseForm" 
      component={() => <PlaceholderScreen title="Exercise Form Guide" />}
      options={{ title: 'Exercise Form' }} 
    />
    <Stack.Screen 
      name="WorkoutTracking" 
      component={() => <PlaceholderScreen title="Workout Tracking" />}
      options={{ title: 'Track Workout' }} 
    />
    
    {/* Specialized Training */}
    <Stack.Screen 
      name="SupersetBuilder" 
      component={() => <PlaceholderScreen title="Superset Builder" />}
      options={{ title: 'Build Supersets' }} 
    />
    <Stack.Screen 
      name="CircuitTraining" 
      component={() => <PlaceholderScreen title="Circuit Training" />}
      options={{ title: 'Circuit Training' }} 
    />
    <Stack.Screen 
      name="HIITWorkouts" 
      component={() => <PlaceholderScreen title="HIIT Workouts" />}
      options={{ title: 'HIIT Workouts' }} 
    />
    <Stack.Screen 
      name="StrengthTraining" 
      component={() => <PlaceholderScreen title="Strength Training" />}
      options={{ title: 'Strength Training' }} 
    />
    <Stack.Screen 
      name="CardioWorkouts" 
      component={() => <PlaceholderScreen title="Cardio Workouts" />}
      options={{ title: 'Cardio Workouts' }} 
    />
    <Stack.Screen 
      name="FlexibilityRoutines" 
      component={() => <PlaceholderScreen title="Flexibility Routines" />}
      options={{ title: 'Flexibility & Mobility' }} 
    />
    <Stack.Screen 
      name="FunctionalTraining" 
      component={() => <PlaceholderScreen title="Functional Training" />}
      options={{ title: 'Functional Training' }} 
    />
    
    {/* Tools & Utilities */}
    <Stack.Screen 
      name="RestPeriodTimer" 
      component={() => <PlaceholderScreen title="Rest Period Timer" />}
      options={{ title: 'Rest Timer' }} 
    />
    <Stack.Screen 
      name="RMCalculator" 
      component={() => <PlaceholderScreen title="1RM Calculator" />}
      options={{ title: '1RM Calculator' }} 
    />
    <Stack.Screen 
      name="VolumeCalculator" 
      component={() => <PlaceholderScreen title="Training Volume Calculator" />}
      options={{ title: 'Volume Calculator' }} 
    />
    <Stack.Screen 
      name="WorkoutPlanner" 
      component={() => <PlaceholderScreen title="Workout Planner" />}
      options={{ title: 'Workout Planner' }} 
    />

    {/* Performance Tracking */}
    <Stack.Screen 
      name="StrengthAnalytics" 
      component={() => <PlaceholderScreen title="Strength Analytics" />}
      options={{ title: 'Strength Analytics' }} 
    />
    <Stack.Screen 
      name="CardioAnalytics" 
      component={() => <PlaceholderScreen title="Cardio Analytics" />}
      options={{ title: 'Cardio Analytics' }} 
    />
    <Stack.Screen 
      name="PerformanceTests" 
      component={() => <PlaceholderScreen title="Performance Tests" />}
      options={{ title: 'Performance Tests' }} 
    />
  </Stack.Navigator>
);

// Clients Stack - Comprehensive client management and progress tracking
const ClientsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ClientList" 
      component={() => <PlaceholderScreen title="My Clients" />}
      options={{ title: 'My Clients' }} 
    />
    
    {/* Client Management */}
    <Stack.Screen 
      name="ClientProfiles" 
      component={() => <PlaceholderScreen title="Client Profiles" />}
      options={{ title: 'Client Profiles' }} 
    />
    <Stack.Screen 
      name="ClientProgress" 
      component={() => <PlaceholderScreen title="Client Progress" />}
      options={{ title: 'Progress Tracking' }} 
    />
    <Stack.Screen 
      name="FitnessAssessments" 
      component={() => <PlaceholderScreen title="Fitness Assessments" />}
      options={{ title: 'Fitness Assessments' }} 
    />
    <Stack.Screen 
      name="BodyComposition" 
      component={() => <PlaceholderScreen title="Body Composition" />}
      options={{ title: 'Body Composition' }} 
    />
    <Stack.Screen 
      name="InjuryHistory" 
      component={() => <PlaceholderScreen title="Injury History" />}
      options={{ title: 'Injury History' }} 
    />
    <Stack.Screen 
      name="ClientGoals" 
      component={() => <PlaceholderScreen title="Client Goals" />}
      options={{ title: 'Client Goals' }} 
    />
    <Stack.Screen 
      name="PersonalRecords" 
      component={() => <PlaceholderScreen title="Personal Records" />}
      options={{ title: 'Personal Records' }} 
    />
    <Stack.Screen 
      name="ClientCheckins" 
      component={() => <PlaceholderScreen title="Client Check-ins" />}
      options={{ title: 'Client Check-ins' }} 
    />
    
    {/* Group Management */}
    <Stack.Screen 
      name="GroupClasses" 
      component={() => <PlaceholderScreen title="Group Classes" />}
      options={{ title: 'Group Classes' }} 
    />
    <Stack.Screen 
      name="ClassScheduling" 
      component={() => <PlaceholderScreen title="Class Scheduling" />}
      options={{ title: 'Class Scheduling' }} 
    />
    <Stack.Screen 
      name="GroupWorkouts" 
      component={() => <PlaceholderScreen title="Group Workouts" />}
      options={{ title: 'Group Workouts' }} 
    />
    <Stack.Screen 
      name="TeamChallenges" 
      component={() => <PlaceholderScreen title="Team Challenges" />}
      options={{ title: 'Team Challenges' }} 
    />
    
    {/* Client Acquisition & Retention */}
    <Stack.Screen 
      name="ClientInvitations" 
      component={() => <PlaceholderScreen title="Client Invitations" />}
      options={{ title: 'Invite Clients' }} 
    />
    <Stack.Screen 
      name="ClientRetention" 
      component={() => <PlaceholderScreen title="Client Retention" />}
      options={{ title: 'Client Retention' }} 
    />
    <Stack.Screen 
      name="ClientFeedback" 
      component={() => <PlaceholderScreen title="Client Feedback" />}
      options={{ title: 'Client Feedback' }} 
    />
    <Stack.Screen 
      name="ReferralProgram" 
      component={() => <PlaceholderScreen title="Referral Program" />}
      options={{ title: 'Referrals' }} 
    />
    
    {/* Health & Wellness Tracking */}
    <Stack.Screen 
      name="BiometricTracking" 
      component={() => <PlaceholderScreen title="Biometric Tracking" />}
      options={{ title: 'Biometric Data' }} 
    />
    <Stack.Screen 
      name="HealthScreening" 
      component={() => <PlaceholderScreen title="Health Screening" />}
      options={{ title: 'Health Screening' }} 
    />
    <Stack.Screen 
      name="MedicalClearance" 
      component={() => <PlaceholderScreen title="Medical Clearance" />}
      options={{ title: 'Medical Clearance' }} 
    />
    <Stack.Screen 
      name="HealthRiskAssessment" 
      component={() => <PlaceholderScreen title="Health Risk Assessment" />}
      options={{ title: 'Risk Assessment' }} 
    />
    
    {/* Communication */}
    <Stack.Screen 
      name="ClientChat" 
      component={() => <PlaceholderScreen title="Client Chat" />}
      options={{ title: 'Client Chat' }} 
    />
    <Stack.Screen 
      name="ProgressCelebrations" 
      component={() => <PlaceholderScreen title="Progress Celebrations" />}
      options={{ title: 'Celebrate Progress' }} 
    />
    <Stack.Screen 
      name="MotivationalMessages" 
      component={() => <PlaceholderScreen title="Motivational Messages" />}
      options={{ title: 'Motivational Messages' }} 
    />
    <Stack.Screen 
      name="CheckInReminders" 
      component={() => <PlaceholderScreen title="Check-in Reminders" />}
      options={{ title: 'Check-in Reminders' }} 
    />

    {/* Reports & Analytics */}
    <Stack.Screen 
      name="ProgressReports" 
      component={() => <PlaceholderScreen title="Progress Reports" />}
      options={{ title: 'Progress Reports' }} 
    />
    <Stack.Screen 
      name="ClientAnalytics" 
      component={() => <PlaceholderScreen title="Client Analytics" />}
      options={{ title: 'Client Analytics' }} 
    />
    <Stack.Screen 
      name="AttendanceReports" 
      component={() => <PlaceholderScreen title="Attendance Reports" />}
      options={{ title: 'Attendance Reports' }} 
    />
  </Stack.Navigator>
);

// Nutrition Stack - Comprehensive nutrition and wellness management
const NutritionStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="NutritionMain" 
      component={() => <PlaceholderScreen title="Nutrition Hub" />}
      options={{ 
        title: 'Nutrition Hub',
        headerShown: false 
      }} 
    />
    
    {/* Nutrition Planning */}
    <Stack.Screen 
      name="NutritionPlanning" 
      component={() => <PlaceholderScreen title="Nutrition Planning" />}
      options={{ title: 'Nutrition Planning' }} 
    />
    <Stack.Screen 
      name="MealPlanning" 
      component={() => <PlaceholderScreen title="Meal Planning" />}
      options={{ title: 'Meal Planning' }} 
    />
    <Stack.Screen 
      name="MacroTracking" 
      component={() => <PlaceholderScreen title="Macro Tracking" />}
      options={{ title: 'Macro Tracking' }} 
    />
    <Stack.Screen 
      name="CalorieCalculator" 
      component={() => <PlaceholderScreen title="Calorie Calculator" />}
      options={{ title: 'Calorie Calculator' }} 
    />
    <Stack.Screen 
      name="NutritionGoals" 
      component={() => <PlaceholderScreen title="Nutrition Goals" />}
      options={{ title: 'Nutrition Goals' }} 
    />
    <Stack.Screen 
      name="MealPrep" 
      component={() => <PlaceholderScreen title="Meal Prep Guide" />}
      options={{ title: 'Meal Prep' }} 
    />
    <Stack.Screen 
      name="FoodDiary" 
      component={() => <PlaceholderScreen title="Food Diary" />}
      options={{ title: 'Food Diary' }} 
    />
    
    {/* Supplements & Hydration */}
    <Stack.Screen 
      name="SupplementGuide" 
      component={() => <PlaceholderScreen title="Supplement Guide" />}
      options={{ title: 'Supplements' }} 
    />
    <Stack.Screen 
      name="HydrationTracking" 
      component={() => <PlaceholderScreen title="Hydration Tracking" />}
      options={{ title: 'Hydration Tracking' }} 
    />
    <Stack.Screen 
      name="PreWorkoutNutrition" 
      component={() => <PlaceholderScreen title="Pre-Workout Nutrition" />}
      options={{ title: 'Pre-Workout Nutrition' }} 
    />
    <Stack.Screen 
      name="PostWorkoutNutrition" 
      component={() => <PlaceholderScreen title="Post-Workout Nutrition" />}
      options={{ title: 'Post-Workout Nutrition' }} 
    />
    
    {/* Education & Resources */}
    <Stack.Screen 
      name="NutritionEducation" 
      component={() => <PlaceholderScreen title="Nutrition Education" />}
      options={{ title: 'Nutrition Education' }} 
    />
    <Stack.Screen 
      name="RecipeDatabase" 
      component={() => <PlaceholderScreen title="Recipe Database" />}
      options={{ title: 'Healthy Recipes' }} 
    />
    <Stack.Screen 
      name="DietaryRestrictions" 
      component={() => <PlaceholderScreen title="Dietary Restrictions" />}
      options={{ title: 'Dietary Restrictions' }} 
    />
    <Stack.Screen 
      name="NutritionalDeficiencies" 
      component={() => <PlaceholderScreen title="Nutritional Deficiencies" />}
      options={{ title: 'Deficiency Screening' }} 
    />
    
    {/* Recovery & Wellness */}
    <Stack.Screen 
      name="RecoveryProtocols" 
      component={() => <PlaceholderScreen title="Recovery Protocols" />}
      options={{ title: 'Recovery Protocols' }} 
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
    <Stack.Screen 
      name="MobilityRoutines" 
      component={() => <PlaceholderScreen title="Mobility Routines" />}
      options={{ title: 'Mobility Routines' }} 
    />
    <Stack.Screen 
      name="InjuryPrevention" 
      component={() => <PlaceholderScreen title="Injury Prevention" />}
      options={{ title: 'Injury Prevention' }} 
    />
    <Stack.Screen 
      name="RecoveryAssessment" 
      component={() => <PlaceholderScreen title="Recovery Assessment" />}
      options={{ title: 'Recovery Assessment' }} 
    />
    <Stack.Screen 
      name="MassageProtocols" 
      component={() => <PlaceholderScreen title="Massage Protocols" />}
      options={{ title: 'Massage Protocols' }} 
    />
    <Stack.Screen 
      name="ColdTherapy" 
      component={() => <PlaceholderScreen title="Cold Therapy" />}
      options={{ title: 'Cold Therapy' }} 
    />
    <Stack.Screen 
      name="HeatTherapy" 
      component={() => <PlaceholderScreen title="Heat Therapy" />}
      options={{ title: 'Heat Therapy' }} 
    />
    <Stack.Screen 
      name="ActiveRecovery" 
      component={() => <PlaceholderScreen title="Active Recovery" />}
      options={{ title: 'Active Recovery' }} 
    />
  </Stack.Navigator>
);

// Discovery Stack - Find clients, gyms, equipment, and professional opportunities
const DiscoveryStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="DiscoveryMain" 
      component={() => <PlaceholderScreen title="Discover & Connect" />}
      options={{ 
        title: 'Discover & Connect',
        headerShown: false 
      }} 
    />
    
    {/* Professional Network */}
    <Stack.Screen 
      name="TrainerNetwork" 
      component={() => <PlaceholderScreen title="Trainer Network" />}
      options={{ title: 'Trainer Network' }} 
    />
    <Stack.Screen 
      name="FindClients" 
      component={() => <PlaceholderScreen title="Find Clients" />}
      options={{ title: 'Find Clients' }} 
    />
    <Stack.Screen 
      name="GymnasiumDirectory" 
      component={() => <PlaceholderScreen title="Gymnasium Directory" />}
      options={{ title: 'Find Gyms' }} 
    />
    <Stack.Screen 
      name="FitnessStudioRentals" 
      component={() => <PlaceholderScreen title="Studio Rentals" />}
      options={{ title: 'Rent Studios' }} 
    />
    <Stack.Screen 
      name="EquipmentSharing" 
      component={() => <PlaceholderScreen title="Equipment Sharing" />}
      options={{ title: 'Share Equipment' }} 
    />
    <Stack.Screen 
      name="TrainingPartners" 
      component={() => <PlaceholderScreen title="Training Partners" />}
      options={{ title: 'Find Partners' }} 
    />
    <Stack.Screen 
      name="MentorshipNetwork" 
      component={() => <PlaceholderScreen title="Mentorship Network" />}
      options={{ title: 'Mentorship' }} 
    />
    
    {/* Professional Development */}
    <Stack.Screen 
      name="CertificationHub" 
      component={() => <PlaceholderScreen title="Certification Hub" />}
      options={{ title: 'Certifications' }} 
    />
    <Stack.Screen 
      name="ContinuingEducation" 
      component={() => <PlaceholderScreen title="Continuing Education" />}
      options={{ title: 'Education' }} 
    />
    <Stack.Screen 
      name="ProfessionalEvents" 
      component={() => <PlaceholderScreen title="Professional Events" />}
      options={{ title: 'Events' }} 
    />
    <Stack.Screen 
      name="FitnessConferences" 
      component={() => <PlaceholderScreen title="Fitness Conferences" />}
      options={{ title: 'Conferences' }} 
    />
    <Stack.Screen 
      name="WorkshopsTraining" 
      component={() => <PlaceholderScreen title="Workshops & Training" />}
      options={{ title: 'Workshops' }} 
    />
    <Stack.Screen 
      name="IndustryNews" 
      component={() => <PlaceholderScreen title="Industry News" />}
      options={{ title: 'Industry News' }} 
    />
    
    {/* Job Opportunities */}
    <Stack.Screen 
      name="JobOpportunities" 
      component={() => <PlaceholderScreen title="Job Opportunities" />}
      options={{ title: 'Job Board' }} 
    />
    <Stack.Screen 
      name="FreelanceGigs" 
      component={() => <PlaceholderScreen title="Freelance Opportunities" />}
      options={{ title: 'Freelance Gigs' }} 
    />
    <Stack.Screen 
      name="GymPositions" 
      component={() => <PlaceholderScreen title="Gym Positions" />}
      options={{ title: 'Gym Jobs' }} 
    />
    <Stack.Screen 
      name="OnlineCoaching" 
      component={() => <PlaceholderScreen title="Online Coaching Opportunities" />}
      options={{ title: 'Online Coaching' }} 
    />
    
    {/* Marketplace & Services */}
    <Stack.Screen 
      name="ServiceMarketplace" 
      component={() => <PlaceholderScreen title="Service Marketplace" />}
      options={{ title: 'Marketplace' }} 
    />
    <Stack.Screen 
      name="ClientReferrals" 
      component={() => <PlaceholderScreen title="Client Referrals" />}
      options={{ title: 'Client Referrals' }} 
    />
    <Stack.Screen 
      name="BusinessPartnerships" 
      component={() => <PlaceholderScreen title="Business Partnerships" />}
      options={{ title: 'Partnerships' }} 
    />
    <Stack.Screen 
      name="InfluencerCollabs" 
      component={() => <PlaceholderScreen title="Influencer Collaborations" />}
      options={{ title: 'Collaborations' }} 
    />
    
    {/* Resources & Learning */}
    <Stack.Screen 
      name="ResearchDatabase" 
      component={() => <PlaceholderScreen title="Fitness Research" />}
      options={{ title: 'Research' }} 
    />
    <Stack.Screen 
      name="ExpertConsultations" 
      component={() => <PlaceholderScreen title="Expert Consultations" />}
      options={{ title: 'Expert Advice' }} 
    />
    <Stack.Screen 
      name="KnowledgeBase" 
      component={() => <PlaceholderScreen title="Knowledge Base" />}
      options={{ title: 'Knowledge Base' }} 
    />
    <Stack.Screen 
      name="CommunityForum" 
      component={() => <PlaceholderScreen title="Trainer Community" />}
      options={{ title: 'Community' }} 
    />
  </Stack.Navigator>
);

// Business Stack - Revenue, payments, and business management for trainers
const BusinessStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="BusinessMain" 
      component={() => <PlaceholderScreen title="Business Hub" />}
      options={{ 
        title: 'Business Hub',
        headerShown: false 
      }} 
    />
    
    {/* Service Management */}
    <Stack.Screen 
      name="ServiceOfferings" 
      component={() => <PlaceholderScreen title="Service Offerings" />}
      options={{ title: 'My Services' }} 
    />
    <Stack.Screen 
      name="PricingPackages" 
      component={() => <PlaceholderScreen title="Pricing Packages" />}
      options={{ title: 'Pricing Packages' }} 
    />
    <Stack.Screen 
      name="SessionBookings" 
      component={() => <PlaceholderScreen title="Session Bookings" />}
      options={{ title: 'Bookings' }} 
    />
    <Stack.Screen 
      name="AvailabilityManager" 
      component={() => <PlaceholderScreen title="Availability Manager" />}
      options={{ title: 'Availability' }} 
    />
    <Stack.Screen 
      name="ClassScheduling" 
      component={() => <PlaceholderScreen title="Class Scheduling" />}
      options={{ title: 'Class Scheduling' }} 
    />
    <Stack.Screen 
      name="OnlineSessionsSetup" 
      component={() => <PlaceholderScreen title="Online Sessions Setup" />}
      options={{ title: 'Online Sessions' }} 
    />
    
    {/* Financial Management */}
    <Stack.Screen 
      name="PaymentProcessing" 
      component={() => <PlaceholderScreen title="Payment Processing" />}
      options={{ title: 'Payments' }} 
    />
    <Stack.Screen 
      name="EarningsTracker" 
      component={() => <PlaceholderScreen title="Earnings Tracker" />}
      options={{ title: 'Earnings' }} 
    />
    <Stack.Screen 
      name="InvoiceManagement" 
      component={() => <PlaceholderScreen title="Invoice Management" />}
      options={{ title: 'Invoices' }} 
    />
    <Stack.Screen 
      name="ExpenseTracking" 
      component={() => <PlaceholderScreen title="Expense Tracking" />}
      options={{ title: 'Expenses' }} 
    />
    <Stack.Screen 
      name="TaxReporting" 
      component={() => <PlaceholderScreen title="Tax Reporting" />}
      options={{ title: 'Tax Reports' }} 
    />
    <Stack.Screen 
      name="SubscriptionPlans" 
      component={() => <PlaceholderScreen title="Subscription Plans" />}
      options={{ title: 'Subscriptions' }} 
    />
    <Stack.Screen 
      name="RefundsDisputes" 
      component={() => <PlaceholderScreen title="Refunds & Disputes" />}
      options={{ title: 'Refunds' }} 
    />
    
    {/* Client & Contract Management */}
    <Stack.Screen 
      name="ClientContracts" 
      component={() => <PlaceholderScreen title="Client Contracts" />}
      options={{ title: 'Contracts' }} 
    />
    <Stack.Screen 
      name="LiabilityWaivers" 
      component={() => <PlaceholderScreen title="Liability Waivers" />}
      options={{ title: 'Waivers' }} 
    />
    <Stack.Screen 
      name="ClientAgreements" 
      component={() => <PlaceholderScreen title="Client Agreements" />}
      options={{ title: 'Agreements' }} 
    />
    <Stack.Screen 
      name="CancellationPolicies" 
      component={() => <PlaceholderScreen title="Cancellation Policies" />}
      options={{ title: 'Cancellation Policy' }} 
    />
    
    {/* Marketing & Promotion */}
    <Stack.Screen 
      name="MarketingTools" 
      component={() => <PlaceholderScreen title="Marketing Tools" />}
      options={{ title: 'Marketing' }} 
    />
    <Stack.Screen 
      name="SocialMediaManager" 
      component={() => <PlaceholderScreen title="Social Media Manager" />}
      options={{ title: 'Social Media' }} 
    />
    <Stack.Screen 
      name="PromotionalCampaigns" 
      component={() => <PlaceholderScreen title="Promotional Campaigns" />}
      options={{ title: 'Promotions' }} 
    />
    <Stack.Screen 
      name="ReferralProgram" 
      component={() => <PlaceholderScreen title="Referral Program" />}
      options={{ title: 'Referrals' }} 
    />
    <Stack.Screen 
      name="LeadGeneration" 
      component={() => <PlaceholderScreen title="Lead Generation" />}
      options={{ title: 'Lead Generation' }} 
    />
    <Stack.Screen 
      name="EmailMarketing" 
      component={() => <PlaceholderScreen title="Email Marketing" />}
      options={{ title: 'Email Marketing' }} 
    />
    
    {/* Professional Profile */}
    <Stack.Screen 
      name="MarketplaceProfile" 
      component={() => <PlaceholderScreen title="Marketplace Profile" />}
      options={{ title: 'My Profile' }} 
    />
    <Stack.Screen 
      name="ReviewsManagement" 
      component={() => <PlaceholderScreen title="Reviews Management" />}
      options={{ title: 'Reviews' }} 
    />
    <Stack.Screen 
      name="Portfolio" 
      component={() => <PlaceholderScreen title="Professional Portfolio" />}
      options={{ title: 'Portfolio' }} 
    />
    <Stack.Screen 
      name="ClientTestimonials" 
      component={() => <PlaceholderScreen title="Client Testimonials" />}
      options={{ title: 'Testimonials' }} 
    />
    <Stack.Screen 
      name="BeforeAfterGallery" 
      component={() => <PlaceholderScreen title="Before/After Gallery" />}
      options={{ title: 'Transformation Gallery' }} 
    />
    
    {/* Analytics & Insights */}
    <Stack.Screen 
      name="BusinessAnalytics" 
      component={() => <PlaceholderScreen title="Business Analytics" />}
      options={{ title: 'Analytics' }} 
    />
    <Stack.Screen 
      name="ClientRetentionMetrics" 
      component={() => <PlaceholderScreen title="Client Retention Metrics" />}
      options={{ title: 'Retention Metrics' }} 
    />
    <Stack.Screen 
      name="RevenueAnalysis" 
      component={() => <PlaceholderScreen title="Revenue Analysis" />}
      options={{ title: 'Revenue Analysis' }} 
    />
    <Stack.Screen 
      name="MarketTrends" 
      component={() => <PlaceholderScreen title="Market Trends" />}
      options={{ title: 'Market Trends' }} 
    />
    <Stack.Screen 
      name="CompetitorAnalysis" 
      component={() => <PlaceholderScreen title="Competitor Analysis" />}
      options={{ title: 'Competition' }} 
    />
  </Stack.Navigator>
);

// Profile Stack - Trainer profile, settings, and professional development
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TrainerProfile" 
      component={ProfileScreen} 
      options={{ title: 'My Profile' }} 
    />
    
    {/* Professional Information */}
    <Stack.Screen 
      name="Certifications" 
      component={() => <PlaceholderScreen title="Certifications" />}
      options={{ title: 'Certifications' }} 
    />
    <Stack.Screen 
      name="Specializations" 
      component={() => <PlaceholderScreen title="Specializations" />}
      options={{ title: 'Specializations' }} 
    />
    <Stack.Screen 
      name="TrainingPhilosophy" 
      component={() => <PlaceholderScreen title="Training Philosophy" />}
      options={{ title: 'Training Philosophy' }} 
    />
    <Stack.Screen 
      name="ProfessionalExperience" 
      component={() => <PlaceholderScreen title="Professional Experience" />}
      options={{ title: 'Experience' }} 
    />
    <Stack.Screen 
      name="Achievements" 
      component={() => <PlaceholderScreen title="Achievements & Awards" />}
      options={{ title: 'Achievements' }} 
    />
    <Stack.Screen 
      name="Education" 
      component={() => <PlaceholderScreen title="Education & Training" />}
      options={{ title: 'Education' }} 
    />
    <Stack.Screen 
      name="Languages" 
      component={() => <PlaceholderScreen title="Languages Spoken" />}
      options={{ title: 'Languages' }} 
    />
    
    {/* Portfolio & Media */}
    <Stack.Screen 
      name="Portfolio" 
      component={() => <PlaceholderScreen title="Professional Portfolio" />}
      options={{ title: 'Portfolio' }} 
    />
    <Stack.Screen 
      name="ClientSuccessStories" 
      component={() => <PlaceholderScreen title="Client Success Stories" />}
      options={{ title: 'Success Stories' }} 
    />
    <Stack.Screen 
      name="TransformationGallery" 
      component={() => <PlaceholderScreen title="Transformation Gallery" />}
      options={{ title: 'Transformations' }} 
    />
    <Stack.Screen 
      name="VideoLibrary" 
      component={() => <PlaceholderScreen title="Video Library" />}
      options={{ title: 'Video Library' }} 
    />
    <Stack.Screen 
      name="SocialMediaLinks" 
      component={() => <PlaceholderScreen title="Social Media Links" />}
      options={{ title: 'Social Media' }} 
    />
    
    {/* Settings & Preferences */}
    <Stack.Screen 
      name="TrainerSettings" 
      component={() => <PlaceholderScreen title="Trainer Settings" />}
      options={{ title: 'Settings' }} 
    />
    <Stack.Screen 
      name="PrivacySettings" 
      component={() => <PlaceholderScreen title="Privacy Settings" />}
      options={{ title: 'Privacy' }} 
    />
    <Stack.Screen 
      name="NotificationPreferences" 
      component={() => <PlaceholderScreen title="Notification Preferences" />}
      options={{ title: 'Notifications' }} 
    />
    <Stack.Screen 
      name="AppPreferences" 
      component={() => <PlaceholderScreen title="App Preferences" />}
      options={{ title: 'App Settings' }} 
    />
    <Stack.Screen 
      name="UnitsAndMeasurements" 
      component={() => <PlaceholderScreen title="Units & Measurements" />}
      options={{ title: 'Units' }} 
    />
    <Stack.Screen 
      name="DataSyncSettings" 
      component={() => <PlaceholderScreen title="Data Sync Settings" />}
      options={{ title: 'Data Sync' }} 
    />
    <Stack.Screen 
      name="BackupSettings" 
      component={() => <PlaceholderScreen title="Backup Settings" />}
      options={{ title: 'Backup' }} 
    />
    
    {/* Account Management */}
    <Stack.Screen 
      name="AccountManagement" 
      component={() => <PlaceholderScreen title="Account Management" />}
      options={{ title: 'Account' }} 
    />
    <Stack.Screen 
      name="BillingInformation" 
      component={() => <PlaceholderScreen title="Billing Information" />}
      options={{ title: 'Billing' }} 
    />
    <Stack.Screen 
      name="SubscriptionStatus" 
      component={() => <PlaceholderScreen title="Subscription Status" />}
      options={{ title: 'Subscription' }} 
    />
    <Stack.Screen 
      name="DataExport" 
      component={() => <PlaceholderScreen title="Data Export" />}
      options={{ title: 'Export Data' }} 
    />
    <Stack.Screen 
      name="AccountSecurity" 
      component={() => <PlaceholderScreen title="Account Security" />}
      options={{ title: 'Security' }} 
    />
    <Stack.Screen 
      name="TwoFactorAuth" 
      component={() => <PlaceholderScreen title="Two-Factor Authentication" />}
      options={{ title: '2FA' }} 
    />
    
    {/* Professional Development */}
    <Stack.Screen 
      name="CertificationTracker" 
      component={() => <PlaceholderScreen title="Certification Tracker" />}
      options={{ title: 'Certification Tracker' }} 
    />
    <Stack.Screen 
      name="ContinuingEducation" 
      component={() => <PlaceholderScreen title="Continuing Education" />}
      options={{ title: 'Education' }} 
    />
    <Stack.Screen 
      name="SkillDevelopment" 
      component={() => <PlaceholderScreen title="Skill Development" />}
      options={{ title: 'Skill Development' }} 
    />
    <Stack.Screen 
      name="CareerGoals" 
      component={() => <PlaceholderScreen title="Career Goals" />}
      options={{ title: 'Career Goals' }} 
    />
    <Stack.Screen 
      name="NetworkingProfile" 
      component={() => <PlaceholderScreen title="Professional Networking" />}
      options={{ title: 'Networking' }} 
    />
    <Stack.Screen 
      name="IndustryConnections" 
      component={() => <PlaceholderScreen title="Industry Connections" />}
      options={{ title: 'Connections' }} 
    />
    
    {/* Support & Resources */}
    <Stack.Screen 
      name="SupportCenter" 
      component={() => <PlaceholderScreen title="Support Center" />}
      options={{ title: 'Support' }} 
    />
    <Stack.Screen 
      name="TutorialsGuides" 
      component={() => <PlaceholderScreen title="Tutorials & Guides" />}
      options={{ title: 'Tutorials' }} 
    />
    <Stack.Screen 
      name="FeatureRequests" 
      component={() => <PlaceholderScreen title="Feature Requests" />}
      options={{ title: 'Feature Requests' }} 
    />
    <Stack.Screen 
      name="BugReports" 
      component={() => <PlaceholderScreen title="Bug Reports" />}
      options={{ title: 'Report Bugs' }} 
    />
    <Stack.Screen 
      name="AppFeedback" 
      component={() => <PlaceholderScreen title="App Feedback" />}
      options={{ title: 'Feedback' }} 
    />
    <Stack.Screen 
      name="CommunityForum" 
      component={() => <PlaceholderScreen title="Community Forum" />}
      options={{ title: 'Community' }} 
    />
    <Stack.Screen 
      name="ContactUs" 
      component={() => <PlaceholderScreen title="Contact Us" />}
      options={{ title: 'Contact' }} 
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
      name="LiabilityInsurance" 
      component={() => <PlaceholderScreen title="Liability Insurance" />}
      options={{ title: 'Insurance' }} 
    />
    <Stack.Screen 
      name="CertificationRenewal" 
      component={() => <PlaceholderScreen title="Certification Renewal" />}
      options={{ title: 'Cert Renewal' }} 
    />
  </Stack.Navigator>
);

// Custom Discover Button Component
const DiscoverButton = ({ focused }) => (
  <View style={[
    styles.discoverButton, 
    { backgroundColor: focused ? COLORS.primary : COLORS.primary }
  ]}>
    <Icon 
      name="explore" 
      size={22} 
      color="#fff"
    />
  </View>
);

// Main Trainer Navigator Component
const TrainerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Workouts':
              iconName = 'fitness-center';
              break;
            case 'Clients':
              iconName = 'people';
              break;
            case 'Nutrition':
              iconName = 'restaurant';
              break;
            case 'Discovery':
              // Return custom discover button
              return <DiscoverButton focused={focused} />;
            case 'Business':
              iconName = 'business-center';
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
        name="Workouts" 
        component={WorkoutsStack}
        options={{
          tabBarLabel: 'Workouts',
        }}
      />
      <Tab.Screen 
        name="Clients" 
        component={ClientsStack}
        options={{
          tabBarLabel: 'Clients',
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
        name="Discovery" 
        component={DiscoveryStack}
        options={{
          tabBarLabel: 'Discover',
        }}
      />
      <Tab.Screen 
        name="Business" 
        component={BusinessStack}
        options={{
          tabBarLabel: 'Business',
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
  discoverButton: {
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

export default TrainerNavigator;