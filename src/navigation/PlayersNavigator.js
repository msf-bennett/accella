import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../styles/colors';

// Existing Player Screens
import PlayerDashboard from '../screens/player/PlayerDashboard';
import PlayerProfile from '../screens/shared/ProfileScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import NewScreen from '../screens/shared/NewScreen';

// Dashboard & Overview Screens (Comment out imports for unbuilt screens)
// import PlayerOverview from '../screens/player/dashboard/PlayerOverview';
// import TrainingSchedule from '../screens/player/dashboard/TrainingSchedule';
// import UpcomingWorkouts from '../screens/player/dashboard/UpcomingWorkouts';
// import RecentActivity from '../screens/player/dashboard/RecentActivity';
// import WeeklyGoals from '../screens/player/dashboard/WeeklyGoals';
// import AchievementCenter from '../screens/player/dashboard/AchievementCenter';
// import MotivationalDashboard from '../screens/player/dashboard/MotivationalDashboard';
// import PlayerNotifications from '../screens/player/dashboard/PlayerNotifications';
// import QuickWorkouts from '../screens/player/dashboard/QuickWorkouts';
// import DailyCheckin from '../screens/player/dashboard/DailyCheckin';

// Training & Workout Screens
// import MyTrainingPlans from '../screens/player/training/MyTrainingPlans';
// import AssignedWorkouts from '../screens/player/training/AssignedWorkouts';
// import WorkoutHistory from '../screens/player/training/WorkoutHistory';
// import CustomWorkouts from '../screens/player/training/CustomWorkouts';
// import WorkoutLibrary from '../screens/player/training/WorkoutLibrary';
// import ExerciseGuides from '../screens/player/training/ExerciseGuides';
// import TechniqueVideos from '../screens/player/training/TechniqueVideos';
// import DrillPractice from '../screens/player/training/DrillPractice';
// import SkillChallenges from '../screens/player/training/SkillChallenges';
// import WorkoutReminders from '../screens/player/training/WorkoutReminders';
// import SessionFeedback from '../screens/player/training/SessionFeedback';
// import TrainingNotes from '../screens/player/training/TrainingNotes';
// import OfflineWorkouts from '../screens/player/training/OfflineWorkouts';
// import WorkoutSummary from '../screens/player/training/WorkoutSummary';

// Performance & Progress Screens
// import PerformanceDashboard from '../screens/player/performance/PerformanceDashboard';
// import ProgressTracking from '../screens/player/performance/ProgressTracking';
// import PersonalRecords from '../screens/player/performance/PersonalRecords';
// import FitnessTests from '../screens/player/performance/FitnessTests';
// import SkillAssessments from '../screens/player/performance/SkillAssessments';
// import WeakPointAnalysis from '../screens/player/performance/WeakPointAnalysis';
// import ImprovementSuggestions from '../screens/player/performance/ImprovementSuggestions';
// import CompetitionResults from '../screens/player/performance/CompetitionResults';
// import GoalSetting from '../screens/player/performance/GoalSetting';
// import SeasonStats from '../screens/player/performance/SeasonStats';
// import BenchmarkComparisons from '../screens/player/performance/BenchmarkComparisons';
// import VideoAnalysis from '../screens/player/performance/VideoAnalysis';
// import BiometricTracking from '../screens/player/performance/BiometricTracking';
// import PerformanceReports from '../screens/player/performance/PerformanceReports';

// AI & Personalization Screens
// import AITrainingAssistant from '../screens/player/ai/AITrainingAssistant';
// import PersonalizedWorkouts from '../screens/player/ai/PersonalizedWorkouts';
// import SmartRecommendations from '../screens/player/ai/SmartRecommendations';
// import TechniqueAnalysis from '../screens/player/ai/TechniqueAnalysis';
// import PerformancePrediction from '../screens/player/ai/PerformancePrediction';
// import InjuryPrevention from '../screens/player/ai/InjuryPrevention';
// import RecoveryOptimization from '../screens/player/ai/RecoveryOptimization';
// import MotionCapture from '../screens/player/ai/MotionCapture';
// import FormAnalysis from '../screens/player/ai/FormAnalysis';
// import AICoachChat from '../screens/player/ai/AICoachChat';

// Coach Connection & Communication Screens
// import MyCoaches from '../screens/player/coaches/MyCoaches';
// import FindCoaches from '../screens/player/coaches/FindCoaches';
// import CoachRequests from '../screens/player/coaches/CoachRequests';
// import CoachRatings from '../screens/player/coaches/CoachRatings';
// import CoachMessages from '../screens/player/coaches/CoachMessages';
// import TeamCommunication from '../screens/player/coaches/TeamCommunication';
// import SessionBookings from '../screens/player/coaches/SessionBookings';
// import CoachFeedback from '../screens/player/coaches/CoachFeedback';
// import PrivateTraining from '../screens/player/coaches/PrivateTraining';
// import GroupSessions from '../screens/player/coaches/GroupSessions';
// import CoachDirectory from '../screens/player/coaches/CoachDirectory';
// import OnlineCoaching from '../screens/player/coaches/OnlineCoaching';

// Academy & Club Screens
// import FindAcademies from '../screens/player/academies/FindAcademies';
// import MyAcademy from '../screens/player/academies/MyAcademy';
// import AcademyPrograms from '../screens/player/academies/AcademyPrograms';
// import AcademyEvents from '../screens/player/academies/AcademyEvents';
// import AcademyRankings from '../screens/player/academies/AcademyRankings';
// import AcademyApplication from '../screens/player/academies/AcademyApplication';
// import AcademyNews from '../screens/player/academies/AcademyNews';
// import AcademyFacilities from '../screens/player/academies/AcademyFacilities';
// import AcademySchedule from '../screens/player/academies/AcademySchedule';
// import AcademyFees from '../screens/player/academies/AcademyFees';
// import ScholarshipPrograms from '../screens/player/academies/ScholarshipPrograms';

// Social & Community Screens
// import PlayerCommunity from '../screens/player/social/PlayerCommunity';
// import TeamMates from '../screens/player/social/TeamMates';
// import PlayerRankings from '../screens/player/social/PlayerRankings';
// import Competitions from '../screens/player/social/Competitions';
// import Challenges from '../screens/player/social/Challenges';
// import LeaderBoards from '../screens/player/social/LeaderBoards';
// import SocialFeed from '../screens/player/social/SocialFeed';
// import PlayerProfiles from '../screens/player/social/PlayerProfiles';
// import FriendsList from '../screens/player/social/FriendsList';
// import GroupChats from '../screens/player/social/GroupChats';
// import EventsCalendar from '../screens/player/social/EventsCalendar';
// import PlayerStats from '../screens/player/social/PlayerStats';
// import ShareProgress from '../screens/player/social/ShareProgress';

// Nutrition & Wellness Screens
// import NutritionDashboard from '../screens/player/wellness/NutritionDashboard';
// import MealPlans from '../screens/player/wellness/MealPlans';
// import NutritionTracking from '../screens/player/wellness/NutritionTracking';
// import HydrationTracker from '../screens/player/wellness/HydrationTracker';
// import RecoveryTracking from '../screens/player/wellness/RecoveryTracking';
// import SleepAnalysis from '../screens/player/wellness/SleepAnalysis';
// import StressManagement from '../screens/player/wellness/StressManagement';
// import MentalWellness from '../screens/player/wellness/MentalWellness';
// import InjuryPrevention from '../screens/player/wellness/InjuryPrevention';
// import WellnessGoals from '../screens/player/wellness/WellnessGoals';
// import SupplementTracker from '../screens/player/wellness/SupplementTracker';
// import HealthMetrics from '../screens/player/wellness/HealthMetrics';
// import MindfulnessCenter from '../screens/player/wellness/MindfulnessCenter';

// Learning & Education Screens
// import SportEducation from '../screens/player/education/SportEducation';
// import SkillTutorials from '../screens/player/education/SkillTutorials';
// import RuleBook from '../screens/player/education/RuleBook';
// import StrategyGuides from '../screens/player/education/StrategyGuides';
// import TechniqueLibrary from '../screens/player/education/TechniqueLibrary';
// import VideoLessons from '../screens/player/education/VideoLessons';
// import QuizChallenges from '../screens/player/education/QuizChallenges';
// import SportHistory from '../screens/player/education/SportHistory';
// import PlayerInspiration from '../screens/player/education/PlayerInspiration';
// import LearningPath from '../screens/player/education/LearningPath';
// import CertificationPrograms from '../screens/player/education/CertificationPrograms';

// Equipment & Gear Screens
// import EquipmentTracker from '../screens/player/equipment/EquipmentTracker';
// import GearRecommendations from '../screens/player/equipment/GearRecommendations';
// import EquipmentMaintenance from '../screens/player/equipment/EquipmentMaintenance';
// import BrandPartnerships from '../screens/player/equipment/BrandPartnerships';
// import EquipmentReviews from '../screens/player/equipment/EquipmentReviews';
// import GearShoppingGuide from '../screens/player/equipment/GearShoppingGuide';
// import EquipmentCalendar from '../screens/player/equipment/EquipmentCalendar';
// import CustomEquipment from '../screens/player/equipment/CustomEquipment';

// Marketplace & Services Screens
// import PlayerMarketplace from '../screens/player/marketplace/PlayerMarketplace';
// import BookSessions from '../screens/player/marketplace/BookSessions';
// import PaymentHistory from '../screens/player/marketplace/PaymentHistory';
// import ServiceRatings from '../screens/player/marketplace/ServiceRatings';
// import SubscriptionPlans from '../screens/player/marketplace/SubscriptionPlans';
// import VoucherSystem from '../screens/player/marketplace/VoucherSystem';
// import RefundRequests from '../screens/player/marketplace/RefundRequests';
// import PaymentMethods from '../screens/player/marketplace/PaymentMethods';
// import InvoiceManagement from '../screens/player/marketplace/InvoiceManagement';

// Parent/Guardian Screens
// import ParentDashboard from '../screens/player/parent/ParentDashboard';
// import ChildProgress from '../screens/player/parent/ChildProgress';
// import ParentCoachChat from '../screens/player/parent/ParentCoachChat';
// import AttendanceReports from '../screens/player/parent/AttendanceReports';
// import ParentPayments from '../screens/player/parent/ParentPayments';
// import SafetyReports from '../screens/player/parent/SafetyReports';
// import ParentNotifications from '../screens/player/parent/ParentNotifications';
// import ParentSettings from '../screens/player/parent/ParentSettings';
// import ParentFeedback from '../screens/player/parent/ParentFeedback';
// import EmergencyContacts from '../screens/player/parent/EmergencyContacts';

// Analytics & Insights Screens
// import PlayerAnalytics from '../screens/player/analytics/PlayerAnalytics';
// import PerformanceInsights from '../screens/player/analytics/PerformanceInsights';
// import TrainingAnalytics from '../screens/player/analytics/TrainingAnalytics';
// import ComparisonAnalytics from '../screens/player/analytics/ComparisonAnalytics';
// import PredictiveAnalytics from '../screens/player/analytics/PredictiveAnalytics';
// import SeasonAnalysis from '../screens/player/analytics/SeasonAnalysis';
// import SkillProgressAnalytics from '../screens/player/analytics/SkillProgressAnalytics';
// import DataVisualization from '../screens/player/analytics/DataVisualization';

// Profile & Settings Screens
// import PlayerProfileEdit from '../screens/player/profile/PlayerProfileEdit';
// import PersonalInformation from '../screens/player/profile/PersonalInformation';
// import MedicalHistory from '../screens/player/profile/MedicalHistory';
// import SportsProfile from '../screens/player/profile/SportsProfile';
// import PrivacySettings from '../screens/player/profile/PrivacySettings';
// import AccountSettings from '../screens/player/profile/AccountSettings';
// import NotificationPreferences from '../screens/player/profile/NotificationPreferences';
// import DataManagement from '../screens/player/profile/DataManagement';
// import SupportCenter from '../screens/player/profile/SupportCenter';
// import AppSettings from '../screens/player/profile/AppSettings';

// Search & Discovery Screens
// import UniversalSearch from '../screens/player/search/UniversalSearch';
// import CoachSearch from '../screens/player/search/CoachSearch';
// import AcademySearch from '../screens/player/search/AcademySearch';
// import PlayerSearch from '../screens/player/search/PlayerSearch';
// import TrainingSearch from '../screens/player/search/TrainingSearch';
// import EventSearch from '../screens/player/search/EventSearch';
// import LocationSearch from '../screens/player/search/LocationSearch';
// import FilteredSearch from '../screens/player/search/FilteredSearch';
// import SavedSearches from '../screens/player/search/SavedSearches';
// import SearchHistory from '../screens/player/search/SearchHistory';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Placeholder component for unbuilt screens
const PlaceholderScreen = ({ route }) => {
  return (
    <NewScreen 
      title={route.name} 
      message="Feature Under Development" 
    />
  );
};

// Dashboard Stack Navigator
const DashboardStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}>
      <Stack.Screen name="PlayerDashboard" component={PlayerDashboard} />
      
      {/* Dashboard Related Screens */}
      <Stack.Screen name="TrainingSchedule" component={PlaceholderScreen} />
      <Stack.Screen name="UpcomingWorkouts" component={PlaceholderScreen} />
      <Stack.Screen name="RecentActivity" component={PlaceholderScreen} />
      <Stack.Screen name="WeeklyGoals" component={PlaceholderScreen} />
      <Stack.Screen name="AchievementCenter" component={PlaceholderScreen} />
      <Stack.Screen name="MotivationalDashboard" component={PlaceholderScreen} />
      <Stack.Screen name="PlayerNotifications" component={PlaceholderScreen} />
      <Stack.Screen name="QuickWorkouts" component={PlaceholderScreen} />
      <Stack.Screen name="DailyCheckin" component={PlaceholderScreen} />

      {/* Training & Workout Screens */}
      <Stack.Screen name="MyTrainingPlans" component={PlaceholderScreen} />
      <Stack.Screen name="AssignedWorkouts" component={PlaceholderScreen} />
      <Stack.Screen name="WorkoutHistory" component={PlaceholderScreen} />
      <Stack.Screen name="CustomWorkouts" component={PlaceholderScreen} />
      <Stack.Screen name="WorkoutLibrary" component={PlaceholderScreen} />
      <Stack.Screen name="ExerciseGuides" component={PlaceholderScreen} />
      <Stack.Screen name="TechniqueVideos" component={PlaceholderScreen} />
      <Stack.Screen name="DrillPractice" component={PlaceholderScreen} />
      <Stack.Screen name="SkillChallenges" component={PlaceholderScreen} />
      <Stack.Screen name="WorkoutReminders" component={PlaceholderScreen} />
      <Stack.Screen name="SessionFeedback" component={PlaceholderScreen} />
      <Stack.Screen name="TrainingNotes" component={PlaceholderScreen} />
      <Stack.Screen name="OfflineWorkouts" component={PlaceholderScreen} />
      <Stack.Screen name="WorkoutSummary" component={PlaceholderScreen} />

      {/* Performance & Progress Screens */}
      <Stack.Screen name="PerformanceDashboard" component={PlaceholderScreen} />
      <Stack.Screen name="ProgressTracking" component={PlaceholderScreen} />
      <Stack.Screen name="PersonalRecords" component={PlaceholderScreen} />
      <Stack.Screen name="FitnessTests" component={PlaceholderScreen} />
      <Stack.Screen name="SkillAssessments" component={PlaceholderScreen} />
      <Stack.Screen name="WeakPointAnalysis" component={PlaceholderScreen} />
      <Stack.Screen name="ImprovementSuggestions" component={PlaceholderScreen} />
      <Stack.Screen name="CompetitionResults" component={PlaceholderScreen} />
      <Stack.Screen name="GoalSetting" component={PlaceholderScreen} />
      <Stack.Screen name="SeasonStats" component={PlaceholderScreen} />
      <Stack.Screen name="BenchmarkComparisons" component={PlaceholderScreen} />
      <Stack.Screen name="VideoAnalysis" component={PlaceholderScreen} />
      <Stack.Screen name="BiometricTracking" component={PlaceholderScreen} />
      <Stack.Screen name="PerformanceReports" component={PlaceholderScreen} />

      {/* AI & Personalization Screens */}
      <Stack.Screen name="AITrainingAssistant" component={PlaceholderScreen} />
      <Stack.Screen name="PersonalizedWorkouts" component={PlaceholderScreen} />
      <Stack.Screen name="SmartRecommendations" component={PlaceholderScreen} />
      <Stack.Screen name="TechniqueAnalysis" component={PlaceholderScreen} />
      <Stack.Screen name="PerformancePrediction" component={PlaceholderScreen} />
      <Stack.Screen name="InjuryPrevention" component={PlaceholderScreen} />
      <Stack.Screen name="RecoveryOptimization" component={PlaceholderScreen} />
      <Stack.Screen name="MotionCapture" component={PlaceholderScreen} />
      <Stack.Screen name="FormAnalysis" component={PlaceholderScreen} />
      <Stack.Screen name="AICoachChat" component={PlaceholderScreen} />

      {/* Coach Connection & Communication Screens */}
      <Stack.Screen name="MyCoaches" component={PlaceholderScreen} />
      <Stack.Screen name="CoachRequests" component={PlaceholderScreen} />
      <Stack.Screen name="CoachRatings" component={PlaceholderScreen} />
      <Stack.Screen name="CoachMessages" component={PlaceholderScreen} />
      <Stack.Screen name="TeamCommunication" component={PlaceholderScreen} />
      <Stack.Screen name="SessionBookings" component={PlaceholderScreen} />
      <Stack.Screen name="CoachFeedback" component={PlaceholderScreen} />
      <Stack.Screen name="PrivateTraining" component={PlaceholderScreen} />
      <Stack.Screen name="GroupSessions" component={PlaceholderScreen} />
      <Stack.Screen name="CoachDirectory" component={PlaceholderScreen} />
      <Stack.Screen name="OnlineCoaching" component={PlaceholderScreen} />

      {/* Academy & Club Screens */}
      <Stack.Screen name="MyAcademy" component={PlaceholderScreen} />
      <Stack.Screen name="AcademyPrograms" component={PlaceholderScreen} />
      <Stack.Screen name="AcademyEvents" component={PlaceholderScreen} />
      <Stack.Screen name="AcademyRankings" component={PlaceholderScreen} />
      <Stack.Screen name="AcademyApplication" component={PlaceholderScreen} />
      <Stack.Screen name="AcademyNews" component={PlaceholderScreen} />
      <Stack.Screen name="AcademyFacilities" component={PlaceholderScreen} />
      <Stack.Screen name="AcademySchedule" component={PlaceholderScreen} />
      <Stack.Screen name="AcademyFees" component={PlaceholderScreen} />
      <Stack.Screen name="ScholarshipPrograms" component={PlaceholderScreen} />

      {/* Social & Community Screens */}
      <Stack.Screen name="PlayerCommunity" component={PlaceholderScreen} />
      <Stack.Screen name="TeamMates" component={PlaceholderScreen} />
      <Stack.Screen name="PlayerRankings" component={PlaceholderScreen} />
      <Stack.Screen name="Competitions" component={PlaceholderScreen} />
      <Stack.Screen name="Challenges" component={PlaceholderScreen} />
      <Stack.Screen name="LeaderBoards" component={PlaceholderScreen} />
      <Stack.Screen name="SocialFeed" component={PlaceholderScreen} />
      <Stack.Screen name="PlayerProfiles" component={PlaceholderScreen} />
      <Stack.Screen name="FriendsList" component={PlaceholderScreen} />
      <Stack.Screen name="GroupChats" component={PlaceholderScreen} />
      <Stack.Screen name="EventsCalendar" component={PlaceholderScreen} />
      <Stack.Screen name="PlayerStats" component={PlaceholderScreen} />
      <Stack.Screen name="ShareProgress" component={PlaceholderScreen} />

      {/* Nutrition & Wellness Screens */}
      <Stack.Screen name="NutritionDashboard" component={PlaceholderScreen} />
      <Stack.Screen name="MealPlans" component={PlaceholderScreen} />
      <Stack.Screen name="NutritionTracking" component={PlaceholderScreen} />
      <Stack.Screen name="HydrationTracker" component={PlaceholderScreen} />
      <Stack.Screen name="RecoveryTracking" component={PlaceholderScreen} />
      <Stack.Screen name="SleepAnalysis" component={PlaceholderScreen} />
      <Stack.Screen name="StressManagement" component={PlaceholderScreen} />
      <Stack.Screen name="MentalWellness" component={PlaceholderScreen} />
      <Stack.Screen name="WellnessGoals" component={PlaceholderScreen} />
      <Stack.Screen name="SupplementTracker" component={PlaceholderScreen} />
      <Stack.Screen name="HealthMetrics" component={PlaceholderScreen} />
      <Stack.Screen name="MindfulnessCenter" component={PlaceholderScreen} />

      {/* Learning & Education Screens */}
      <Stack.Screen name="SportEducation" component={PlaceholderScreen} />
      <Stack.Screen name="SkillTutorials" component={PlaceholderScreen} />
      <Stack.Screen name="RuleBook" component={PlaceholderScreen} />
      <Stack.Screen name="StrategyGuides" component={PlaceholderScreen} />
      <Stack.Screen name="TechniqueLibrary" component={PlaceholderScreen} />
      <Stack.Screen name="VideoLessons" component={PlaceholderScreen} />
      <Stack.Screen name="QuizChallenges" component={PlaceholderScreen} />
      <Stack.Screen name="SportHistory" component={PlaceholderScreen} />
      <Stack.Screen name="PlayerInspiration" component={PlaceholderScreen} />
      <Stack.Screen name="LearningPath" component={PlaceholderScreen} />
      <Stack.Screen name="CertificationPrograms" component={PlaceholderScreen} />

      {/* Equipment & Gear Screens */}
      <Stack.Screen name="EquipmentTracker" component={PlaceholderScreen} />
      <Stack.Screen name="GearRecommendations" component={PlaceholderScreen} />
      <Stack.Screen name="EquipmentMaintenance" component={PlaceholderScreen} />
      <Stack.Screen name="BrandPartnerships" component={PlaceholderScreen} />
      <Stack.Screen name="EquipmentReviews" component={PlaceholderScreen} />
      <Stack.Screen name="GearShoppingGuide" component={PlaceholderScreen} />
      <Stack.Screen name="EquipmentCalendar" component={PlaceholderScreen} />
      <Stack.Screen name="CustomEquipment" component={PlaceholderScreen} />

      {/* Marketplace & Services Screens */}
      <Stack.Screen name="PlayerMarketplace" component={PlaceholderScreen} />
      <Stack.Screen name="BookSessions" component={PlaceholderScreen} />
      <Stack.Screen name="PaymentHistory" component={PlaceholderScreen} />
      <Stack.Screen name="ServiceRatings" component={PlaceholderScreen} />
      <Stack.Screen name="SubscriptionPlans" component={PlaceholderScreen} />
      <Stack.Screen name="VoucherSystem" component={PlaceholderScreen} />
      <Stack.Screen name="RefundRequests" component={PlaceholderScreen} />
      <Stack.Screen name="PaymentMethods" component={PlaceholderScreen} />
      <Stack.Screen name="InvoiceManagement" component={PlaceholderScreen} />

      {/* Parent/Guardian Screens */}
      <Stack.Screen name="ParentDashboard" component={PlaceholderScreen} />
      <Stack.Screen name="ChildProgress" component={PlaceholderScreen} />
      <Stack.Screen name="ParentCoachChat" component={PlaceholderScreen} />
      <Stack.Screen name="AttendanceReports" component={PlaceholderScreen} />
      <Stack.Screen name="ParentPayments" component={PlaceholderScreen} />
      <Stack.Screen name="SafetyReports" component={PlaceholderScreen} />
      <Stack.Screen name="ParentNotifications" component={PlaceholderScreen} />
      <Stack.Screen name="ParentSettings" component={PlaceholderScreen} />
      <Stack.Screen name="ParentFeedback" component={PlaceholderScreen} />
      <Stack.Screen name="EmergencyContacts" component={PlaceholderScreen} />

      {/* Analytics & Insights Screens */}
      <Stack.Screen name="PlayerAnalytics" component={PlaceholderScreen} />
      <Stack.Screen name="PerformanceInsights" component={PlaceholderScreen} />
      <Stack.Screen name="TrainingAnalytics" component={PlaceholderScreen} />
      <Stack.Screen name="ComparisonAnalytics" component={PlaceholderScreen} />
      <Stack.Screen name="PredictiveAnalytics" component={PlaceholderScreen} />
      <Stack.Screen name="SeasonAnalysis" component={PlaceholderScreen} />
      <Stack.Screen name="SkillProgressAnalytics" component={PlaceholderScreen} />
      <Stack.Screen name="DataVisualization" component={PlaceholderScreen} />

      {/* Profile & Settings Screens */}
      <Stack.Screen name="PlayerProfileEdit" component={PlaceholderScreen} />
      <Stack.Screen name="PersonalInformation" component={PlaceholderScreen} />
      <Stack.Screen name="MedicalHistory" component={PlaceholderScreen} />
      <Stack.Screen name="SportsProfile" component={PlaceholderScreen} />
      <Stack.Screen name="PrivacySettings" component={PlaceholderScreen} />
      <Stack.Screen name="AccountSettings" component={PlaceholderScreen} />
      <Stack.Screen name="NotificationPreferences" component={PlaceholderScreen} />
      <Stack.Screen name="DataManagement" component={PlaceholderScreen} />
      <Stack.Screen name="SupportCenter" component={PlaceholderScreen} />
      <Stack.Screen name="AppSettings" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};

// Search Stack Navigator
const SearchStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}>
      
      {/* Main Search Screen */}
      <Stack.Screen name="UniversalSearch" component={PlaceholderScreen} />
      
      {/* Search Categories */}
      <Stack.Screen name="FindCoaches" component={PlaceholderScreen} />
      <Stack.Screen name="FindAcademies" component={PlaceholderScreen} />
      <Stack.Screen name="CoachSearch" component={PlaceholderScreen} />
      <Stack.Screen name="AcademySearch" component={PlaceholderScreen} />
      <Stack.Screen name="PlayerSearch" component={PlaceholderScreen} />
      <Stack.Screen name="TrainingSearch" component={PlaceholderScreen} />
      <Stack.Screen name="EventSearch" component={PlaceholderScreen} />
      <Stack.Screen name="LocationSearch" component={PlaceholderScreen} />
      <Stack.Screen name="FilteredSearch" component={PlaceholderScreen} />
      <Stack.Screen name="SavedSearches" component={PlaceholderScreen} />
      <Stack.Screen name="SearchHistory" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};

// Training Stack Navigator
const TrainingStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}>
      
      {/* Main Training Screen */}
      <Stack.Screen name="MyTrainingPlans" component={PlaceholderScreen} />
      
      {/* Training Related Screens */}
      <Stack.Screen name="AssignedWorkouts" component={PlaceholderScreen} />
      <Stack.Screen name="WorkoutHistory" component={PlaceholderScreen} />
      <Stack.Screen name="CustomWorkouts" component={PlaceholderScreen} />
      <Stack.Screen name="WorkoutLibrary" component={PlaceholderScreen} />
      <Stack.Screen name="ExerciseGuides" component={PlaceholderScreen} />
      <Stack.Screen name="TechniqueVideos" component={PlaceholderScreen} />
      <Stack.Screen name="DrillPractice" component={PlaceholderScreen} />
      <Stack.Screen name="SkillChallenges" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};

// Social Stack Navigator
const SocialStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}>
      
      {/* Main Social Screen */}
      <Stack.Screen name="PlayerCommunity" component={PlaceholderScreen} />
      
      {/* Social Related Screens */}
      <Stack.Screen name="TeamMates" component={PlaceholderScreen} />
      <Stack.Screen name="PlayerRankings" component={PlaceholderScreen} />
      <Stack.Screen name="Competitions" component={PlaceholderScreen} />
      <Stack.Screen name="Challenges" component={PlaceholderScreen} />
      <Stack.Screen name="LeaderBoards" component={PlaceholderScreen} />
      <Stack.Screen name="SocialFeed" component={PlaceholderScreen} />
      <Stack.Screen name="FriendsList" component={PlaceholderScreen} />
      <Stack.Screen name="GroupChats" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}>
      
      {/* Main Profile Screen */}
      <Stack.Screen name="PlayerProfile" component={PlayerProfile} />
      
      {/* Profile Related Screens */}
      <Stack.Screen name="PlayerProfileEdit" component={PlaceholderScreen} />
      <Stack.Screen name="PersonalInformation" component={PlaceholderScreen} />
      <Stack.Screen name="MedicalHistory" component={PlaceholderScreen} />
      <Stack.Screen name="SportsProfile" component={PlaceholderScreen} />
      <Stack.Screen name="PrivacySettings" component={PlaceholderScreen} />
      <Stack.Screen name="AccountSettings" component={PlaceholderScreen} />
      <Stack.Screen name="NotificationPreferences" component={PlaceholderScreen} />
      <Stack.Screen name="DataManagement" component={PlaceholderScreen} />
      <Stack.Screen name="SupportCenter" component={PlaceholderScreen} />
      <Stack.Screen name="AppSettings" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};

// Main Player Navigator
const PlayerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'dashboard';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'Training') {
            iconName = 'fitness-center';
          } else if (route.name === 'Social') {
            iconName = 'people';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary || '#667eea',
        tabBarInactiveTintColor: COLORS.textSecondary || 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}>
      
      <Tab.Screen 
        name="Home" 
        component={DashboardStack} 
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchStack} 
        options={{
          tabBarLabel: 'Discover',
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
        name="Social" 
        component={SocialStack} 
        options={{
          tabBarLabel: 'Community',
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

export default PlayerNavigator;
