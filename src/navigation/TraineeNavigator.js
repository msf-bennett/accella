import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../styles/colors';

// Existing Trainee Screens (if any)
import TraineeDashboard from '../screens/trainee/dashboard/TraineeDashboard';
// import TrainingPlan from '../screens/trainee/TrainingPlan';
// import MyCoach from '../screens/trainee/MyCoach';
// import PerformanceTracking from '../screens/trainee/PerformanceTracking';
// import ChatScreen from '../screens/shared/ChatScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

// Dashboard & Overview Screens
//import TraineeDashboard from '../screens/trainee/dashboard/TraineeDashboard';
// import TodaysWorkout from '../screens/trainee/dashboard/TodaysWorkout';
// import WeeklySchedule from '../screens/trainee/dashboard/WeeklySchedule';
// import ProgressOverview from '../screens/trainee/dashboard/ProgressOverview';
// import RecentActivity from '../screens/trainee/dashboard/RecentActivity';
// import UpcomingSessions from '../screens/trainee/dashboard/UpcomingSessions';
// import CoachUpdates from '../screens/trainee/dashboard/CoachUpdates';
// import MotivationalQuotes from '../screens/trainee/dashboard/MotivationalQuotes';
// import PersonalBests from '../screens/trainee/dashboard/PersonalBests';
// import AttendanceStats from '../screens/trainee/dashboard/AttendanceStats';
// import GoalProgress from '../screens/trainee/dashboard/GoalProgress';
// import TeamUpdates from '../screens/trainee/dashboard/TeamUpdates';
// import QuickActions from '../screens/trainee/dashboard/QuickActions';

// Training & Workouts Screens
// import MyWorkouts from '../screens/trainee/training/MyWorkouts';
// import TodaysSession from '../screens/trainee/training/TodaysSession';
// import WorkoutHistory from '../screens/trainee/training/WorkoutHistory';
// import TrainingPrograms from '../screens/trainee/training/TrainingPrograms';
// import WorkoutLibrary from '../screens/trainee/training/WorkoutLibrary';
// import ExerciseGuides from '../screens/trainee/training/ExerciseGuides';
// import SkillDevelopment from '../screens/trainee/training/SkillDevelopment';
// import DrillPractice from '../screens/trainee/training/DrillPractice';
// import WorkoutTimer from '../screens/trainee/training/WorkoutTimer';
// import RestPeriods from '../screens/trainee/training/RestPeriods';
// import IntervalTraining from '../screens/trainee/training/IntervalTraining';
// import FormChecklist from '../screens/trainee/training/FormChecklist';
// import WorkoutFeedback from '../screens/trainee/training/WorkoutFeedback';
// import SessionRating from '../screens/trainee/training/SessionRating';
// import InjuryReporting from '../screens/trainee/training/InjuryReporting';
// import ModifiedWorkouts from '../screens/trainee/training/ModifiedWorkouts';
// import AlternativeExercises from '../screens/trainee/training/AlternativeExercises';

// Performance & Progress Screens
// import PerformanceTracking from '../screens/trainee/performance/PerformanceTracking';
// import FitnessTests from '../screens/trainee/performance/FitnessTests';
// import StrengthProgress from '../screens/trainee/performance/StrengthProgress';
// import CardioProgress from '../screens/trainee/performance/CardioProgress';
// import SkillAssessments from '../screens/trainee/performance/SkillAssessments';
// import PerformanceMetrics from '../screens/trainee/performance/PerformanceMetrics';
// import PersonalRecords from '../screens/trainee/performance/PersonalRecords';
// import GoalTracking from '../screens/trainee/performance/GoalTracking';
// import ProgressPhotos from '../screens/trainee/performance/ProgressPhotos';
// import BodyMeasurements from '../screens/trainee/performance/BodyMeasurements';
// import BiometricData from '../screens/trainee/performance/BiometricData';
// import PerformanceAnalytics from '../screens/trainee/performance/PerformanceAnalytics';
// import CompetitionResults from '../screens/trainee/performance/CompetitionResults';
// import SportSpecificMetrics from '../screens/trainee/performance/SportSpecificMetrics';
// import ImprovementAreas from '../screens/trainee/performance/ImprovementAreas';
// import AchievementBadges from '../screens/trainee/performance/AchievementBadges';

// Coach & Team Screens
// import MyCoach from '../screens/trainee/coach/MyCoach';
// import CoachCommunication from '../screens/trainee/coach/CoachCommunication';
// import CoachFeedback from '../screens/trainee/coach/CoachFeedback';
// import TrainingAssignments from '../screens/trainee/coach/TrainingAssignments';
// import CoachNotes from '../screens/trainee/coach/CoachNotes';
// import SessionBookings from '../screens/trainee/coach/SessionBookings';
// import CoachAvailability from '../screens/trainee/coach/CoachAvailability';
// import TeamMessages from '../screens/trainee/coach/TeamMessages';
// import GroupSessions from '../screens/trainee/coach/GroupSessions';
// import TeamCalendar from '../screens/trainee/coach/TeamCalendar';
// import TeamRoster from '../screens/trainee/coach/TeamRoster';
// import TeamStats from '../screens/trainee/coach/TeamStats';
// import TeamChallenges from '../screens/trainee/coach/TeamChallenges';
// import Announcements from '../screens/trainee/coach/Announcements';
// import LiveCoaching from '../screens/trainee/coach/LiveCoaching';
// import VideoConsultation from '../screens/trainee/coach/VideoConsultation';
// import CheckInReports from '../screens/trainee/coach/CheckInReports';

// Nutrition & Wellness Screens
// import NutritionPlan from '../screens/trainee/nutrition/NutritionPlan';
// import MealPlanning from '../screens/trainee/nutrition/MealPlanning';
// import FoodDiary from '../screens/trainee/nutrition/FoodDiary';
// import MacroTracking from '../screens/trainee/nutrition/MacroTracking';
// import CalorieCounter from '../screens/trainee/nutrition/CalorieCounter';
// import WaterIntake from '../screens/trainee/nutrition/WaterIntake';
// import SupplementTracker from '../screens/trainee/nutrition/SupplementTracker';
// import NutritionGoals from '../screens/trainee/nutrition/NutritionGoals';
// import HealthyRecipes from '../screens/trainee/nutrition/HealthyRecipes';
// import MealPrep from '../screens/trainee/nutrition/MealPrep';

// import DietaryRestrictions from '../screens/trainee/nutrition/DietaryRestrictions';// import NutritionalEducation from '../screens/trainee/nutrition/NutritionalEducation';
// import PreWorkoutNutrition from '../screens/trainee/nutrition/PreWorkoutNutrition';
// import PostWorkoutNutrition from '../screens/trainee/nutrition/PostWorkoutNutrition';
// import SportsNutrition from '../screens/trainee/nutrition/SportsNutrition';

// Recovery & Health Screens
// import RecoveryTracking from '../screens/trainee/recovery/RecoveryTracking';
// import SleepMonitoring from '../screens/trainee/recovery/SleepMonitoring';
// import StressLevels from '../screens/trainee/recovery/StressLevels';
// import MoodTracking from '../screens/trainee/recovery/MoodTracking';
// import EnergyLevels from '../screens/trainee/recovery/EnergyLevels';
// import RecoveryActivities from '../screens/trainee/recovery/RecoveryActivities';
// import StretchingRoutines from '../screens/trainee/recovery/StretchingRoutines';
// import MobilityWork from '../screens/trainee/recovery/MobilityWork';
// import InjuryPrevention from '../screens/trainee/recovery/InjuryPrevention';
// import PainManagement from '../screens/trainee/recovery/PainManagement';
// import RecoveryProtocols from '../screens/trainee/recovery/RecoveryProtocols';
// import MassageTherapy from '../screens/trainee/recovery/MassageTherapy';
// import ColdTherapy from '../screens/trainee/recovery/ColdTherapy';
// import HeatTherapy from '../screens/trainee/recovery/HeatTherapy';
// import ActiveRecovery from '../screens/trainee/recovery/ActiveRecovery';
// import RestDays from '../screens/trainee/recovery/RestDays';

// Discovery & Search Screens
// import FindCoaches from '../screens/trainee/discovery/FindCoaches';
// import AcademySearch from '../screens/trainee/discovery/AcademySearch';
// import SportsFacilities from '../screens/trainee/discovery/SportsFacilities';
// import TrainingPartners from '../screens/trainee/discovery/TrainingPartners';
// import LocalEvents from '../screens/trainee/discovery/LocalEvents';
// import Competitions from '../screens/trainee/discovery/Competitions';
// import Tournaments from '../screens/trainee/discovery/Tournaments';
// import SportsClubs from '../screens/trainee/discovery/SportsClubs';
// import TrainingCamps from '../screens/trainee/discovery/TrainingCamps';
// import Workshops from '../screens/trainee/discovery/Workshops';
// import CoachReviews from '../screens/trainee/discovery/CoachReviews';
// import FacilityReviews from '../screens/trainee/discovery/FacilityReviews';
// import LocationBasedSearch from '../screens/trainee/discovery/LocationBasedSearch';
// import SportSpecificSearch from '../screens/trainee/discovery/SportSpecificSearch';
// import SkillLevelMatching from '../screens/trainee/discovery/SkillLevelMatching';
// import PriceComparison from '../screens/trainee/discovery/PriceComparison';
// import AvailabilityChecker from '../screens/trainee/discovery/AvailabilityChecker';

// Social & Community Screens
// import TraineeCommunity from '../screens/trainee/social/TraineeCommunity';
// import TeamChat from '../screens/trainee/social/TeamChat';
// import TrainingBuddies from '../screens/trainee/social/TrainingBuddies';
// import SocialFeed from '../screens/trainee/social/SocialFeed';
// import ProgressSharing from '../screens/trainee/social/ProgressSharing';
// import Leaderboards from '../screens/trainee/social/Leaderboards';
// import Challenges from '../screens/trainee/social/Challenges';
// import WorkoutChallenges from '../screens/trainee/social/WorkoutChallenges';
// import FitnessCompetitions from '../screens/trainee/social/FitnessCompetitions';
// import MotivationalPosts from '../screens/trainee/social/MotivationalPosts';
// import SuccessStories from '../screens/trainee/social/SuccessStories';
// import CommunitySupport from '../screens/trainee/social/CommunitySupport';
// import MentorshipProgram from '../screens/trainee/social/MentorshipProgram';
// import PeerReviews from '../screens/trainee/social/PeerReviews';
// import GroupGoals from '../screens/trainee/social/GroupGoals';

// Learning & Education Screens
// import SportTheory from '../screens/trainee/learning/SportTheory';
// import TechniqueVideos from '../screens/trainee/learning/TechniqueVideos';
// import SkillTutorials from '../screens/trainee/learning/SkillTutorials';
// import RulesAndRegulations from '../screens/trainee/learning/RulesAndRegulations';
// import StrategyGuides from '../screens/trainee/learning/StrategyGuides';
// import AnatomyBasics from '../screens/trainee/learning/AnatomyBasics';
// import InjuryEducation from '../screens/trainee/learning/InjuryEducation';
// import NutritionBasics from '../screens/trainee/learning/NutritionBasics';
// import SportsPsychology from '../screens/trainee/learning/SportsPsychology';
// import MentalTraining from '../screens/trainee/learning/MentalTraining';
// import MotivationTechniques from '../screens/trainee/learning/MotivationTechniques';
// import GoalSetting from '../screens/trainee/learning/GoalSetting';
// import TimeManagement from '../screens/trainee/learning/TimeManagement';
// import StudyPlans from '../screens/trainee/learning/StudyPlans';
// import QuizzesTests from '../screens/trainee/learning/QuizzesTests';

// Equipment & Gear Screens
// import EquipmentTracker from '../screens/trainee/equipment/EquipmentTracker';
// import GearRecommendations from '../screens/trainee/equipment/GearRecommendations';
// import MaintenanceSchedule from '../screens/trainee/equipment/MaintenanceSchedule';
// import EquipmentReviews from '../screens/trainee/equipment/EquipmentReviews';
// import SizingGuides from '../screens/trainee/equipment/SizingGuides';
// import BudgetTracker from '../screens/trainee/equipment/BudgetTracker';
// import WishList from '../screens/trainee/equipment/WishList';
// import MarketplaceDeals from '../screens/trainee/equipment/MarketplaceDeals';
// import SecondHandGear from '../screens/trainee/equipment/SecondHandGear';
// import EquipmentSharing from '../screens/trainee/equipment/EquipmentSharing';

// Profile & Settings Screens
// import TraineeProfile from '../screens/trainee/profile/TraineeProfile';
// import PersonalInfo from '../screens/trainee/profile/PersonalInfo';
// import SportsBackground from '../screens/trainee/profile/SportsBackground';
// import FitnessLevel from '../screens/trainee/profile/FitnessLevel';
// import Goals from '../screens/trainee/profile/Goals';
// import Preferences from '../screens/trainee/profile/Preferences';
// import MedicalInfo from '../screens/trainee/profile/MedicalInfo';
// import EmergencyContacts from '../screens/trainee/profile/EmergencyContacts';
// import ParentalControls from '../screens/trainee/profile/ParentalControls';
// import Privacy from '../screens/trainee/profile/Privacy';
// import Notifications from '../screens/trainee/profile/Notifications';
// import DataSync from '../screens/trainee/profile/DataSync';
// import AppSettings from '../screens/trainee/profile/AppSettings';
// import AccountManagement from '../screens/trainee/profile/AccountManagement';
// import Subscription from '../screens/trainee/profile/Subscription';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Placeholder Component for unbuilt screens
const PlaceholderScreen = ({ title }) => (
  <View style={styles.placeholderScreen}>
    <Icon name="sports" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>{title || 'Feature Coming Soon'}</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're building amazing training tools just for athletes and trainees. Stay tuned for updates!
    </Text>
  </View>
);

// Home Stack - Main dashboard and quick access to key features
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TraineeDashboard" 
      component={TraineeDashboard} 
      options={{ 
        headerShown: false,
        title: 'Home'
      }} 
    />
    
    {/* Today's Focus */}
    <Stack.Screen 
      name="TodaysWorkout" 
      component={() => <PlaceholderScreen title="Today's Workout" />}
      options={{ title: "Today's Training" }} 
    />
    <Stack.Screen 
      name="WeeklySchedule" 
      component={() => <PlaceholderScreen title="Weekly Schedule" />}
      options={{ title: 'Weekly Schedule' }} 
    />
    <Stack.Screen 
      name="UpcomingSessions" 
      component={() => <PlaceholderScreen title="Upcoming Sessions" />}
      options={{ title: 'Upcoming Sessions' }} 
    />
    <Stack.Screen 
      name="TodaysNutrition" 
      component={() => <PlaceholderScreen title="Today's Nutrition Plan" />}
      options={{ title: 'Nutrition Today' }} 
    />
    
    {/* Quick Overview */}
    <Stack.Screen 
      name="ProgressOverview" 
      component={() => <PlaceholderScreen title="Progress Overview" />}
      options={{ title: 'Progress Overview' }} 
    />
    <Stack.Screen 
      name="RecentActivity" 
      component={() => <PlaceholderScreen title="Recent Activity" />}
      options={{ title: 'Recent Activity' }} 
    />
    <Stack.Screen 
      name="PersonalBests" 
      component={() => <PlaceholderScreen title="Personal Bests" />}
      options={{ title: 'Personal Records' }} 
    />
    <Stack.Screen 
      name="AttendanceStats" 
      component={() => <PlaceholderScreen title="Attendance Statistics" />}
      options={{ title: 'Attendance' }} 
    />
    <Stack.Screen 
      name="GoalProgress" 
      component={() => <PlaceholderScreen title="Goal Progress" />}
      options={{ title: 'Goals Progress' }} 
    />
    
    {/* Communications */}
    <Stack.Screen 
      name="CoachUpdates" 
      component={() => <PlaceholderScreen title="Coach Updates" />}
      options={{ title: 'Coach Updates' }} 
    />
    <Stack.Screen 
      name="TeamUpdates" 
      component={() => <PlaceholderScreen title="Team Updates" />}
      options={{ title: 'Team News' }} 
    />
    <Stack.Screen 
      name="Announcements" 
      component={() => <PlaceholderScreen title="Important Announcements" />}
      options={{ title: 'Announcements' }} 
    />
    
    {/* Quick Actions */}
    <Stack.Screen 
      name="QuickActions" 
      component={() => <PlaceholderScreen title="Quick Actions" />}
      options={{ title: 'Quick Actions' }} 
    />
    <Stack.Screen 
      name="CheckIn" 
      component={() => <PlaceholderScreen title="Session Check-in" />}
      options={{ title: 'Check In' }} 
    />
    <Stack.Screen 
      name="LogWorkout" 
      component={() => <PlaceholderScreen title="Log Workout" />}
      options={{ title: 'Log Workout' }} 
    />
    <Stack.Screen 
      name="ReportIssue" 
      component={() => <PlaceholderScreen title="Report Issue" />}
      options={{ title: 'Report Issue' }} 
    />
    
    {/* Motivational Content */}
    <Stack.Screen 
      name="MotivationalQuotes" 
      component={() => <PlaceholderScreen title="Daily Motivation" />}
      options={{ title: 'Daily Motivation' }} 
    />
    <Stack.Screen 
      name="AchievementBadges" 
      component={() => <PlaceholderScreen title="Achievement Badges" />}
      options={{ title: 'Achievements' }} 
    />
    <Stack.Screen 
      name="SuccessStories" 
      component={() => <PlaceholderScreen title="Success Stories" />}
      options={{ title: 'Success Stories' }} 
    />
  </Stack.Navigator>
);

// Training Stack - Comprehensive workout and training management
const TrainingStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MyWorkouts" 
      component={() => <PlaceholderScreen title="My Training Hub" />}
      options={{ 
        title: 'My Training',
        headerShown: false 
      }} 
    />
    
    {/* Current Training */}
    <Stack.Screen 
      name="TodaysSession" 
      component={() => <PlaceholderScreen title="Today's Training Session" />}
      options={{ title: "Today's Session" }} 
    />
    <Stack.Screen 
      name="TrainingPrograms" 
      component={() => <PlaceholderScreen title="My Training Programs" />}
      options={{ title: 'Training Programs' }} 
    />
    <Stack.Screen 
      name="WorkoutLibrary" 
      component={() => <PlaceholderScreen title="Workout Library" />}
      options={{ title: 'Workout Library' }} 
    />
    <Stack.Screen 
      name="CustomWorkouts" 
      component={() => <PlaceholderScreen title="Custom Workouts" />}
      options={{ title: 'Custom Workouts' }} 
    />
    
    {/* Exercise Guidance */}
    <Stack.Screen 
      name="ExerciseGuides" 
      component={() => <PlaceholderScreen title="Exercise Guides" />}
      options={{ title: 'Exercise Guides' }} 
    />
    <Stack.Screen 
      name="TechniqueVideos" 
      component={() => <PlaceholderScreen title="Technique Videos" />}
      options={{ title: 'Technique Videos' }} 
    />
    <Stack.Screen 
      name="FormChecklist" 
      component={() => <PlaceholderScreen title="Form Checklist" />}
      options={{ title: 'Form Check' }} 
    />
    <Stack.Screen 
      name="SkillDevelopment" 
      component={() => <PlaceholderScreen title="Skill Development" />}
      options={{ title: 'Skill Development' }} 
    />
    <Stack.Screen 
      name="DrillPractice" 
      component={() => <PlaceholderScreen title="Drill Practice" />}
      options={{ title: 'Practice Drills' }} 
    />
    
    {/* Workout Tools */}
    <Stack.Screen 
      name="WorkoutTimer" 
      component={() => <PlaceholderScreen title="Workout Timer" />}
      options={{ title: 'Workout Timer' }} 
    />
    <Stack.Screen 
      name="RestPeriods" 
      component={() => <PlaceholderScreen title="Rest Period Timer" />}
      options={{ title: 'Rest Timer' }} 
    />
    <Stack.Screen 
      name="IntervalTraining" 
      component={() => <PlaceholderScreen title="Interval Training" />}
      options={{ title: 'Interval Training' }} 
    />
    <Stack.Screen 
      name="WorkoutMusic" 
      component={() => <PlaceholderScreen title="Workout Music" />}
      options={{ title: 'Workout Music' }} 
    />
    
    {/* History & Progress */}
    <Stack.Screen 
      name="WorkoutHistory" 
      component={() => <PlaceholderScreen title="Workout History" />}
      options={{ title: 'Workout History' }} 
    />
    <Stack.Screen 
      name="TrainingCalendar" 
      component={() => <PlaceholderScreen title="Training Calendar" />}
      options={{ title: 'Training Calendar' }} 
    />
    <Stack.Screen 
      name="SessionNotes" 
      component={() => <PlaceholderScreen title="Session Notes" />}
      options={{ title: 'Session Notes' }} 
    />
    
    {/* Feedback & Communication */}
    <Stack.Screen 
      name="WorkoutFeedback" 
      component={() => <PlaceholderScreen title="Workout Feedback" />}
      options={{ title: 'Workout Feedback' }} 
    />
    <Stack.Screen 
      name="SessionRating" 
      component={() => <PlaceholderScreen title="Session Rating" />}
      options={{ title: 'Rate Session' }} 
    />
    <Stack.Screen 
      name="CoachFeedback" 
      component={() => <PlaceholderScreen title="Coach Feedback" />}
      options={{ title: 'Coach Feedback' }} 
    />
    
    {/* Injury & Modifications */}
    <Stack.Screen 
      name="InjuryReporting" 
      component={() => <PlaceholderScreen title="Injury Reporting" />}
      options={{ title: 'Report Injury' }} 
    />
    <Stack.Screen 
      name="ModifiedWorkouts" 
      component={() => <PlaceholderScreen title="Modified Workouts" />}
      options={{ title: 'Modified Workouts' }} 
    />
    <Stack.Screen 
      name="AlternativeExercises" 
      component={() => <PlaceholderScreen title="Alternative Exercises" />}
      options={{ title: 'Alternative Exercises' }} 
    />
    <Stack.Screen 
      name="RecoveryWorkouts" 
      component={() => <PlaceholderScreen title="Recovery Workouts" />}
      options={{ title: 'Recovery Sessions' }} 
    />
    
    {/* Sport-Specific Training */}
    <Stack.Screen 
      name="SportSpecificDrills" 
      component={() => <PlaceholderScreen title="Sport-Specific Drills" />}
      options={{ title: 'Sport Drills' }} 
    />
    <Stack.Screen 
      name="PositionTraining" 
      component={() => <PlaceholderScreen title="Position-Specific Training" />}
      options={{ title: 'Position Training' }} 
    />
    <Stack.Screen 
      name="TacticalTraining" 
      component={() => <PlaceholderScreen title="Tactical Training" />}
      options={{ title: 'Tactical Training' }} 
    />
  </Stack.Navigator>
);

// Progress Stack - Performance tracking and analytics
const ProgressStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="PerformanceTracking" 
      component={() => <PlaceholderScreen title="Performance Dashboard" />}
      options={{ 
        title: 'My Progress',
        headerShown: false 
      }} 
    />
    
    {/* Performance Metrics */}
    <Stack.Screen 
      name="FitnessTests" 
      component={() => <PlaceholderScreen title="Fitness Tests" />}
      options={{ title: 'Fitness Tests' }} 
    />
    <Stack.Screen 
      name="StrengthProgress" 
      component={() => <PlaceholderScreen title="Strength Progress" />}
      options={{ title: 'Strength Progress' }} 
    />
    <Stack.Screen 
      name="CardioProgress" 
      component={() => <PlaceholderScreen title="Cardio Progress" />}
      options={{ title: 'Cardio Progress' }} 
    />
    <Stack.Screen 
      name="SkillAssessments" 
      component={() => <PlaceholderScreen title="Skill Assessments" />}
      options={{ title: 'Skill Assessments' }} 
    />
    <Stack.Screen 
      name="PerformanceMetrics" 
      component={() => <PlaceholderScreen title="Performance Metrics" />}
      options={{ title: 'Performance Metrics' }} 
    />
    <Stack.Screen 
      name="SportSpecificMetrics" 
      component={() => <PlaceholderScreen title="Sport-Specific Metrics" />}
      options={{ title: 'Sport Metrics' }} 
    />
    
    {/* Records & Achievements */}
    <Stack.Screen 
      name="PersonalRecords" 
      component={() => <PlaceholderScreen title="Personal Records" />}
      options={{ title: 'Personal Records' }} 
    />
    <Stack.Screen 
      name="SeasonalRecords" 
      component={() => <PlaceholderScreen title="Seasonal Records" />}
      options={{ title: 'Seasonal Records' }} 
    />
    <Stack.Screen 
      name="CompetitionResults" 
      component={() => <PlaceholderScreen title="Competition Results" />}
      options={{ title: 'Competition Results' }} 
    />
    <Stack.Screen 
      name="AchievementBadges" 
      component={() => <PlaceholderScreen title="Achievement Badges" />}
      options={{ title: 'Achievements' }} 
    />
    <Stack.Screen 
      name="MilestoneTracking" 
      component={() => <PlaceholderScreen title="Milestone Tracking" />}
      options={{ title: 'Milestones' }} 
    />
    
    {/* Goal Management */}
    <Stack.Screen 
      name="GoalTracking" 
      component={() => <PlaceholderScreen title="Goal Tracking" />}
      options={{ title: 'Goal Tracking' }} 
    />
    <Stack.Screen 
      name="GoalSetting" 
      component={() => <PlaceholderScreen title="Goal Setting" />}
      options={{ title: 'Set Goals' }} 
    />
    <Stack.Screen 
      name="ShortTermGoals" 
      component={() => <PlaceholderScreen title="Short-term Goals" />}
      options={{ title: 'Short-term Goals' }} 
    />
    <Stack.Screen 
      name="LongTermGoals" 
      component={() => <PlaceholderScreen title="Long-term Goals" />}
      options={{ title: 'Long-term Goals' }} 
    />
    <Stack.Screen 
      name="SeasonGoals" 
      component={() => <PlaceholderScreen title="Season Goals" />}
      options={{ title: 'Season Goals' }} 
    />
    
    {/* Body & Health Tracking */}
    <Stack.Screen 
      name="BodyMeasurements" 
      component={() => <PlaceholderScreen title="Body Measurements" />}
      options={{ title: 'Body Measurements' }} 
    />
    <Stack.Screen 
      name="ProgressPhotos" 
      component={() => <PlaceholderScreen title="Progress Photos" />}
      options={{ title: 'Progress Photos' }} 
    />
    <Stack.Screen 
      name="BiometricData" 
      component={() => <PlaceholderScreen title="Biometric Data" />}
      options={{ title: 'Biometric Data' }} 
    />
    <Stack.Screen 
      name="HealthMetrics" 
      component={() => <PlaceholderScreen title="Health Metrics" />}
      options={{ title: 'Health Metrics' }} 
    />
    <Stack.Screen 
      name="InjuryHistory" 
      component={() => <PlaceholderScreen title="Injury History" />}
      options={{ title: 'Injury History' }} 
    />
    
    {/* Analytics & Insights */}
    <Stack.Screen 
      name="PerformanceAnalytics" 
      component={() => <PlaceholderScreen title="Performance Analytics" />}
      options={{ title: 'Analytics' }} 
    />
    <Stack.Screen 
      name="ImprovementAreas" 
      component={() => <PlaceholderScreen title="Improvement Areas" />}
      options={{ title: 'Areas to Improve' }} 
    />
    <Stack.Screen 
      name="StrengthWeakness" 
      component={() => <PlaceholderScreen title="Strengths & Weaknesses" />}
      options={{ title: 'Strengths & Weaknesses' }} 
    />
    <Stack.Screen 
      name="TrendAnalysis" 
      component={() => <PlaceholderScreen title="Performance Trends" />}
      options={{ title: 'Performance Trends' }} 
    />
    <Stack.Screen 
      name="ComparisonCharts" 
      component={() => <PlaceholderScreen title="Progress Comparisons" />}
      options={{ title: 'Progress Comparison' }} 
    />
  </Stack.Navigator>
);

// Coach Stack - Communication and coaching relationship management
const CoachStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MyCoach" 
      component={() => <PlaceholderScreen title="My Coach" />}
      options={{ 
        title: 'My Coach',
        headerShown: false 
      }} 
    />
    
    {/* Coach Communication */}
    <Stack.Screen 
      name="CoachCommunication" 
      component={() => <PlaceholderScreen title="Coach Communication" />}
      options={{ title: 'Chat with Coach' }} 
    />
    <Stack.Screen 
      name="CoachFeedback" 
      component={() => <PlaceholderScreen title="Coach Feedback" />}
      options={{ title: 'Coach Feedback' }} 
    />
    <Stack.Screen 
      name="TrainingAssignments" 
      component={() => <PlaceholderScreen title="Training Assignments" />}
      options={{ title: 'My Assignments' }} 
    />
    <Stack.Screen 
      name="CoachNotes" 
      component={() => <PlaceholderScreen title="Coach Notes" />}
      options={{ title: 'Coach Notes' }} 
    />
    <Stack.Screen 
      name="PerformanceReviews" 
      component={() => <PlaceholderScreen title="Performance Reviews" />}
      options={{ title: 'Performance Reviews' }} 
    />
    
    {/* Session Management */}
    <Stack.Screen 
      name="SessionBookings" 
      component={() => <PlaceholderScreen title="Session Bookings" />}
      options={{ title: 'Book Sessions' }} 
    />
    <Stack.Screen 
      name="CoachAvailability" 
      component={() => <PlaceholderScreen title="Coach Availability" />}
      options={{ title: 'Coach Availability' }} 
    />
    <Stack.Screen 
      name="RescheduleSession" 
      component={() => <PlaceholderScreen title="Reschedule Session" />}
      options={{ title: 'Reschedule' }} 
    />
    <Stack.Screen 
      name="CancelSession" 
      component={() => <PlaceholderScreen title="Cancel Session" />}
      options={{ title: 'Cancel Session' }} 
    />
    <Stack.Screen 
      name="SessionHistory" 
      component={() => <PlaceholderScreen title="Session History" />}
      options={{ title: 'Session History' }} 
    />
    
    {/* Team & Group Activities */}
    <Stack.Screen 
      name="TeamMessages" 
      component={() => <PlaceholderScreen title="Team Messages" />}
      options={{ title: 'Team Chat' }} 
    />
    <Stack.Screen 
      name="GroupSessions" 
      component={() => <PlaceholderScreen title="Group Sessions" />}
      options={{ title: 'Group Training' }} 
    />
    <Stack.Screen 
      name="TeamCalendar" 
      component={() => <PlaceholderScreen title="Team Calendar" />}
      options={{ title: 'Team Calendar' }} 
    />
    <Stack.Screen 
      name="TeamRoster" 
      component={() => <PlaceholderScreen title="Team Roster" />}
      options={{ title: 'Team Roster' }} 
    />
    <Stack.Screen 
      name="TeamStats" 
      component={() => <PlaceholderScreen title="Team Statistics" />}
      options={{ title: 'Team Stats' }} 
    />
    <Stack.Screen 
      name="TeamChallenges" 
      component={() => <PlaceholderScreen title="Team Challenges" />}
      options={{ title: 'Team Challenges' }} 
    />
    <Stack.Screen 
      name="TeamRankings" 
      component={() => <PlaceholderScreen title="Team Rankings" />}
      options={{ title: 'Team Rankings' }} 
    />
    
    {/* Live & Virtual Sessions */}
    <Stack.Screen 
      name="LiveCoaching" 
      component={() => <PlaceholderScreen title="Live Coaching Session" />}
      options={{ title: 'Live Coaching' }} 
    />
    <Stack.Screen 
      name="VideoConsultation" 
      component={() => <PlaceholderScreen title="Video Consultation" />}
      options={{ title: 'Video Call' }} 
    />
    <Stack.Screen 
      name="VirtualTraining" 
      component={() => <PlaceholderScreen title="Virtual Training" />}
      options={{ title: 'Virtual Training' }} 
    />
    <Stack.Screen 
      name="OnlineWorkshops" 
      component={() => <PlaceholderScreen title="Online Workshops" />}
      options={{ title: 'Online Workshops' }} 
    />
    
    {/* Reports & Check-ins */}
    <Stack.Screen 
      name="CheckInReports" 
      component={() => <PlaceholderScreen title="Check-in Reports" />}
      options={{ title: 'Check-in Reports' }} 
    />
    <Stack.Screen 
      name="WeeklyReports" 
      component={() => <PlaceholderScreen title="Weekly Reports" />}
      options={{ title: 'Weekly Reports' }} 
    />
    <Stack.Screen 
      name="MonthlyReviews" 
      component={() => <PlaceholderScreen title="Monthly Reviews" />}
      options={{ title: 'Monthly Reviews' }} 
    />
    <Stack.Screen 
      name="ProgressSubmissions" 
      component={() => <PlaceholderScreen title="Progress Submissions" />}
      options={{ title: 'Submit Progress' }} 
    />
    
    {/* Coach Evaluation */}
    <Stack.Screen 
      name="CoachRating" 
      component={() => <PlaceholderScreen title="Rate Your Coach" />}
      options={{ title: 'Rate Coach' }} 
    />
    <Stack.Screen 
      name="CoachReviews" 
      component={() => <PlaceholderScreen title="Coach Reviews" />}
      options={{ title: 'Coach Reviews' }} 
    />
    <Stack.Screen 
      name="CoachSuggestions" 
      component={() => <PlaceholderScreen title="Suggestions for Coach" />}
      options={{ title: 'Coach Suggestions' }} 
    />
  </Stack.Navigator>
);

// Nutrition Stack - Comprehensive nutrition and wellness management
const NutritionStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="NutritionPlan" 
      component={() => <PlaceholderScreen title="My Nutrition Hub" />}
      options={{ 
        title: 'Nutrition',
        headerShown: false 
      }} 
    />
    
    {/* Daily Nutrition */}
    <Stack.Screen 
      name="TodaysNutrition" 
      component={() => <PlaceholderScreen title="Today's Nutrition" />}
      options={{ title: "Today's Nutrition" }} 
    />
    <Stack.Screen 
      name="MealPlanning" 
      component={() => <PlaceholderScreen title="Meal Planning" />}
      options={{ title: 'Meal Planning' }} 
    />
    <Stack.Screen 
      name="FoodDiary" 
      component={() => <PlaceholderScreen title="Food Diary" />}
      options={{ title: 'Food Diary' }} 
    />
    <Stack.Screen 
      name="CalorieCounter" 
      component={() => <PlaceholderScreen title="Calorie Counter" />}
      options={{ title: 'Calorie Counter' }} 
    />
    <Stack.Screen 
      name="MacroTracking" 
      component={() => <PlaceholderScreen title="Macro Tracking" />}
      options={{ title: 'Track Macros' }} 
    />
    <Stack.Screen 
      name="WaterIntake" 
      component={() => <PlaceholderScreen title="Water Intake Tracker" />}
      options={{ title: 'Hydration' }} 
    />
    
    {/* Meal Management */}
    <Stack.Screen 
      name="MealPrep" 
      component={() => <PlaceholderScreen title="Meal Prep Guide" />}
      options={{ title: 'Meal Prep' }} 
    />
    <Stack.Screen 
      name="HealthyRecipes" 
      component={() => <PlaceholderScreen title="Healthy Recipes" />}
      options={{ title: 'Healthy Recipes' }} 
    />
    <Stack.Screen 
      name="MealSchedule" 
      component={() => <PlaceholderScreen title="Meal Schedule" />}
      options={{ title: 'Meal Schedule' }} 
    />
    <Stack.Screen 
      name="SnackIdeas" 
      component={() => <PlaceholderScreen title="Healthy Snack Ideas" />}
      options={{ title: 'Healthy Snacks' }} 
    />
    <Stack.Screen 
      name="GroceryList" 
      component={() => <PlaceholderScreen title="Grocery Shopping List" />}
      options={{ title: 'Grocery List' }} 
    />
    
    {/* Sports Nutrition */}
    <Stack.Screen 
      name="PreWorkoutNutrition" 
      component={() => <PlaceholderScreen title="Pre-Workout Nutrition" />}
      options={{ title: 'Pre-Workout Fuel' }} 
    />
    <Stack.Screen 
      name="PostWorkoutNutrition" 
      component={() => <PlaceholderScreen title="Post-Workout Nutrition" />}
      options={{ title: 'Recovery Nutrition' }} 
    />
    <Stack.Screen 
      name="SportsNutrition" 
      component={() => <PlaceholderScreen title="Sports Nutrition Guide" />}
      options={{ title: 'Sports Nutrition' }} 
    />
    <Stack.Screen 
      name="CompetitionNutrition" 
      component={() => <PlaceholderScreen title="Competition Day Nutrition" />}
      options={{ title: 'Competition Nutrition' }} 
    />
    <Stack.Screen 
      name="SupplementTracker" 
      component={() => <PlaceholderScreen title="Supplement Tracker" />}
      options={{ title: 'Supplements' }} 
    />
    
    {/* Health & Dietary Management */}
    <Stack.Screen 
      name="DietaryRestrictions" 
      component={() => <PlaceholderScreen title="Dietary Restrictions" />}
      options={{ title: 'Dietary Restrictions' }} 
    />
    <Stack.Screen 
      name="AllergyManagement" 
      component={() => <PlaceholderScreen title="Allergy Management" />}
      options={{ title: 'Allergy Management' }} 
    />
    <Stack.Screen 
      name="WeightManagement" 
      component={() => <PlaceholderScreen title="Weight Management" />}
      options={{ title: 'Weight Management' }} 
    />
    <Stack.Screen 
      name="NutritionGoals" 
      component={() => <PlaceholderScreen title="Nutrition Goals" />}
      options={{ title: 'Nutrition Goals' }} 
    />
    
    {/* Education & Resources */}
    <Stack.Screen 
      name="NutritionalEducation" 
      component={() => <PlaceholderScreen title="Nutritional Education" />}
      options={{ title: 'Nutrition Education' }} 
    />
    <Stack.Screen 
      name="FoodGuide" 
      component={() => <PlaceholderScreen title="Food Guide" />}
      options={{ title: 'Food Guide' }} 
    />
    <Stack.Screen 
      name="NutritionMyths" 
      component={() => <PlaceholderScreen title="Nutrition Myths & Facts" />}
      options={{ title: 'Myths & Facts' }} 
    />
    <Stack.Screen 
      name="HealthyEatingTips" 
      component={() => <PlaceholderScreen title="Healthy Eating Tips" />}
      options={{ title: 'Eating Tips' }} 
    />
    
    {/* Recovery & Wellness */}
    <Stack.Screen 
      name="RecoveryTracking" 
      component={() => <PlaceholderScreen title="Recovery Tracking" />}
      options={{ title: 'Recovery Tracking' }} 
    />
    <Stack.Screen 
      name="SleepMonitoring" 
      component={() => <PlaceholderScreen title="Sleep Monitoring" />}
      options={{ title: 'Sleep Tracking' }} 
    />
    <Stack.Screen 
      name="StressLevels" 
      component={() => <PlaceholderScreen title="Stress Level Monitoring" />}
      options={{ title: 'Stress Levels' }} 
    />
    <Stack.Screen 
      name="MoodTracking" 
      component={() => <PlaceholderScreen title="Mood Tracking" />}
      options={{ title: 'Mood Tracking' }} 
    />
    <Stack.Screen 
      name="EnergyLevels" 
      component={() => <PlaceholderScreen title="Energy Level Tracking" />}
      options={{ title: 'Energy Levels' }} 
    />
    <Stack.Screen 
      name="WellnessJournal" 
      component={() => <PlaceholderScreen title="Wellness Journal" />}
      options={{ title: 'Wellness Journal' }} 
    />
  </Stack.Navigator>
);

// Search Stack - Discovery and search for coaches, facilities, and opportunities
const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="SearchMain" 
      component={() => <PlaceholderScreen title="Discover & Search" />}
      options={{ 
        title: 'Discover',
        headerShown: false 
      }} 
    />
    
    {/* Coach & Trainer Search */}
    <Stack.Screen 
      name="FindCoaches" 
      component={() => <PlaceholderScreen title="Find Coaches & Trainers" />}
      options={{ title: 'Find Coaches' }} 
    />
    <Stack.Screen 
      name="CoachProfiles" 
      component={() => <PlaceholderScreen title="Coach Profiles" />}
      options={{ title: 'Coach Profiles' }} 
    />
    <Stack.Screen 
      name="CoachReviews" 
      component={() => <PlaceholderScreen title="Coach Reviews" />}
      options={{ title: 'Coach Reviews' }} 
    />
    <Stack.Screen 
      name="CoachComparison" 
      component={() => <PlaceholderScreen title="Compare Coaches" />}
      options={{ title: 'Compare Coaches' }} 
    />
    <Stack.Screen 
      name="SpecialtyCoaches" 
      component={() => <PlaceholderScreen title="Specialty Coaches" />}
      options={{ title: 'Specialty Coaches' }} 
    />
    <Stack.Screen 
      name="OnlineCoaches" 
      component={() => <PlaceholderScreen title="Online Coaches" />}
      options={{ title: 'Online Coaches' }} 
    />
    <Stack.Screen 
      name="LocalCoaches" 
      component={() => <PlaceholderScreen title="Local Coaches" />}
      options={{ title: 'Local Coaches' }} 
    />
    
    {/* Facilities & Academies */}
    <Stack.Screen 
      name="AcademySearch" 
      component={() => <PlaceholderScreen title="Sports Academies" />}
      options={{ title: 'Sports Academies' }} 
    />
    <Stack.Screen 
      name="SportsFacilities" 
      component={() => <PlaceholderScreen title="Sports Facilities" />}
      options={{ title: 'Sports Facilities' }} 
    />
    <Stack.Screen 
      name="GymsNearby" 
      component={() => <PlaceholderScreen title="Nearby Gyms" />}
      options={{ title: 'Nearby Gyms' }} 
    />
    <Stack.Screen 
      name="SportsClubs" 
      component={() => <PlaceholderScreen title="Sports Clubs" />}
      options={{ title: 'Sports Clubs' }} 
    />
    <Stack.Screen 
      name="FacilityReviews" 
      component={() => <PlaceholderScreen title="Facility Reviews" />}
      options={{ title: 'Facility Reviews' }} 
    />
    <Stack.Screen 
      name="FacilityAmenities" 
      component={() => <PlaceholderScreen title="Facility Amenities" />}
      options={{ title: 'Amenities' }} 
    />
    <Stack.Screen 
      name="VirtualTours" 
      component={() => <PlaceholderScreen title="Virtual Facility Tours" />}
      options={{ title: 'Virtual Tours' }} 
    />
    
    {/* Events & Opportunities */}
    <Stack.Screen 
      name="LocalEvents" 
      component={() => <PlaceholderScreen title="Local Sports Events" />}
      options={{ title: 'Local Events' }} 
    />
    <Stack.Screen 
      name="Competitions" 
      component={() => <PlaceholderScreen title="Competitions" />}
      options={{ title: 'Competitions' }} 
    />
    <Stack.Screen 
      name="Tournaments" 
      component={() => <PlaceholderScreen title="Tournaments" />}
      options={{ title: 'Tournaments' }} 
    />
    <Stack.Screen 
      name="TrainingCamps" 
      component={() => <PlaceholderScreen title="Training Camps" />}
      options={{ title: 'Training Camps' }} 
    />
    <Stack.Screen 
      name="Workshops" 
      component={() => <PlaceholderScreen title="Workshops & Clinics" />}
      options={{ title: 'Workshops' }} 
    />
    <Stack.Screen 
      name="SportsTrials" 
      component={() => <PlaceholderScreen title="Sports Trials" />}
      options={{ title: 'Sports Trials' }} 
    />
    <Stack.Screen 
      name="Scholarships" 
      component={() => <PlaceholderScreen title="Athletic Scholarships" />}
      options={{ title: 'Scholarships' }} 
    />
    
    {/* Social & Community */}
    <Stack.Screen 
      name="TrainingPartners" 
      component={() => <PlaceholderScreen title="Find Training Partners" />}
      options={{ title: 'Training Partners' }} 
    />
    <Stack.Screen 
      name="SportsGroups" 
      component={() => <PlaceholderScreen title="Sports Groups" />}
      options={{ title: 'Sports Groups' }} 
    />
    <Stack.Screen 
      name="LocalCommunity" 
      component={() => <PlaceholderScreen title="Local Sports Community" />}
      options={{ title: 'Local Community' }} 
    />
    <Stack.Screen 
      name="MentorshipPrograms" 
      component={() => <PlaceholderScreen title="Mentorship Programs" />}
      options={{ title: 'Mentorship' }} 
    />
    
    {/* Advanced Search */}
    <Stack.Screen 
      name="LocationBasedSearch" 
      component={() => <PlaceholderScreen title="Location-Based Search" />}
      options={{ title: 'Search by Location' }} 
    />
    <Stack.Screen 
      name="SportSpecificSearch" 
      component={() => <PlaceholderScreen title="Sport-Specific Search" />}
      options={{ title: 'Search by Sport' }} 
    />
    <Stack.Screen 
      name="SkillLevelMatching" 
      component={() => <PlaceholderScreen title="Skill Level Matching" />}
      options={{ title: 'Match Skill Level' }} 
    />
    <Stack.Screen 
      name="PriceComparison" 
      component={() => <PlaceholderScreen title="Price Comparison" />}
      options={{ title: 'Compare Prices' }} 
    />
    <Stack.Screen 
      name="AvailabilityChecker" 
      component={() => <PlaceholderScreen title="Availability Checker" />}
      options={{ title: 'Check Availability' }} 
    />
    <Stack.Screen 
      name="RecommendationsEngine" 
      component={() => <PlaceholderScreen title="Personalized Recommendations" />}
      options={{ title: 'Recommendations' }} 
    />
    
    {/* Equipment & Gear */}
    <Stack.Screen 
      name="EquipmentRentals" 
      component={() => <PlaceholderScreen title="Equipment Rentals" />}
      options={{ title: 'Rent Equipment' }} 
    />
    <Stack.Screen 
      name="GearMarketplace" 
      component={() => <PlaceholderScreen title="Sports Gear Marketplace" />}
      options={{ title: 'Buy/Sell Gear' }} 
    />
    <Stack.Screen 
      name="EquipmentReviews" 
      component={() => <PlaceholderScreen title="Equipment Reviews" />}
      options={{ title: 'Equipment Reviews' }} 
    />
  </Stack.Navigator>
);

// Profile Stack - Personal profile, settings, and account management
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TraineeProfile" 
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
      name="ContactDetails" 
      component={() => <PlaceholderScreen title="Contact Details" />}
      options={{ title: 'Contact Details' }} 
    />
    <Stack.Screen 
      name="EmergencyContacts" 
      component={() => <PlaceholderScreen title="Emergency Contacts" />}
      options={{ title: 'Emergency Contacts' }} 
    />
    <Stack.Screen 
      name="HealthProfile" 
      component={() => <PlaceholderScreen title="Health Profile" />}
      options={{ title: 'Health Profile' }} 
    />
    <Stack.Screen 
      name="MedicalInfo" 
      component={() => <PlaceholderScreen title="Medical Information" />}
      options={{ title: 'Medical Info' }} 
    />
    <Stack.Screen 
      name="Allergies" 
      component={() => <PlaceholderScreen title="Allergies & Restrictions" />}
      options={{ title: 'Allergies' }} 
    />
    <Stack.Screen 
      name="Medications" 
      component={() => <PlaceholderScreen title="Current Medications" />}
      options={{ title: 'Medications' }} 
    />
    
    {/* Sports & Fitness Profile */}
    <Stack.Screen 
      name="SportsBackground" 
      component={() => <PlaceholderScreen title="Sports Background" />}
      options={{ title: 'Sports Background' }} 
    />
    <Stack.Screen 
      name="FitnessLevel" 
      component={() => <PlaceholderScreen title="Current Fitness Level" />}
      options={{ title: 'Fitness Level' }} 
    />
    <Stack.Screen 
      name="SportsInterests" 
      component={() => <PlaceholderScreen title="Sports Interests" />}
      options={{ title: 'Sports Interests' }} 
    />
    <Stack.Screen 
      name="PreferredActivities" 
      component={() => <PlaceholderScreen title="Preferred Activities" />}
      options={{ title: 'Preferred Activities' }} 
    />
    <Stack.Screen 
      name="PlayingPosition" 
      component={() => <PlaceholderScreen title="Playing Position" />}
      options={{ title: 'Playing Position' }} 
    />
    <Stack.Screen 
      name="ExperienceLevel" 
      component={() => <PlaceholderScreen title="Experience Level" />}
      options={{ title: 'Experience Level' }} 
    />
    
    {/* Goals & Aspirations */}
    <Stack.Screen 
      name="Goals" 
      component={() => <PlaceholderScreen title="Training Goals" />}
      options={{ title: 'My Goals' }} 
    />
    <Stack.Screen 
      name="ShortTermGoals" 
      component={() => <PlaceholderScreen title="Short-term Goals" />}
      options={{ title: 'Short-term Goals' }} 
    />
    <Stack.Screen 
      name="LongTermGoals" 
      component={() => <PlaceholderScreen title="Long-term Goals" />}
      options={{ title: 'Long-term Goals' }} 
    />
    <Stack.Screen 
      name="CareerAspirations" 
      component={() => <PlaceholderScreen title="Athletic Career Aspirations" />}
      options={{ title: 'Career Goals' }} 
    />
    <Stack.Screen 
      name="CompetitionGoals" 
      component={() => <PlaceholderScreen title="Competition Goals" />}
      options={{ title: 'Competition Goals' }} 
    />
    
    {/* Preferences & Settings */}
    <Stack.Screen 
      name="TrainingPreferences" 
      component={() => <PlaceholderScreen title="Training Preferences" />}
      options={{ title: 'Training Preferences' }} 
    />
    <Stack.Screen 
      name="WorkoutPreferences" 
      component={() => <PlaceholderScreen title="Workout Preferences" />}
      options={{ title: 'Workout Preferences' }} 
    />
    <Stack.Screen 
      name="SchedulePreferences" 
      component={() => <PlaceholderScreen title="Schedule Preferences" />}
      options={{ title: 'Schedule Preferences' }} 
    />
    <Stack.Screen 
      name="CoachingStyle" 
      component={() => <PlaceholderScreen title="Preferred Coaching Style" />}
      options={{ title: 'Coaching Style' }} 
    />
    <Stack.Screen 
      name="CommunicationPrefs" 
      component={() => <PlaceholderScreen title="Communication Preferences" />}
      options={{ title: 'Communication' }} 
    />
    
    {/* App Settings */}
    <Stack.Screen 
      name="AppSettings" 
      component={() => <PlaceholderScreen title="App Settings" />}
      options={{ title: 'App Settings' }} 
    />
    <Stack.Screen 
      name="Notifications" 
      component={() => <PlaceholderScreen title="Notification Settings" />}
      options={{ title: 'Notifications' }} 
    />
    <Stack.Screen 
      name="Privacy" 
      component={() => <PlaceholderScreen title="Privacy Settings" />}
      options={{ title: 'Privacy' }} 
    />
    <Stack.Screen 
      name="DataSync" 
      component={() => <PlaceholderScreen title="Data Sync Settings" />}
      options={{ title: 'Data Sync' }} 
    />
    <Stack.Screen 
      name="UnitsPreferences" 
      component={() => <PlaceholderScreen title="Units & Measurements" />}
      options={{ title: 'Units' }} 
    />
    <Stack.Screen 
      name="Language" 
      component={() => <PlaceholderScreen title="Language Settings" />}
      options={{ title: 'Language' }} 
    />
    
    {/* Account Management */}
    <Stack.Screen 
      name="AccountManagement" 
      component={() => <PlaceholderScreen title="Account Management" />}
      options={{ title: 'Account' }} 
    />
    <Stack.Screen 
      name="Subscription" 
      component={() => <PlaceholderScreen title="Subscription Management" />}
      options={{ title: 'Subscription' }} 
    />
    <Stack.Screen 
      name="PaymentMethods" 
      component={() => <PlaceholderScreen title="Payment Methods" />}
      options={{ title: 'Payment Methods' }} 
    />
    <Stack.Screen 
      name="BillingHistory" 
      component={() => <PlaceholderScreen title="Billing History" />}
      options={{ title: 'Billing History' }} 
    />
    <Stack.Screen 
      name="AccountSecurity" 
      component={() => <PlaceholderScreen title="Account Security" />}
      options={{ title: 'Security' }} 
    />
    <Stack.Screen 
      name="PasswordChange" 
      component={() => <PlaceholderScreen title="Change Password" />}
      options={{ title: 'Change Password' }} 
    />
    <Stack.Screen 
      name="TwoFactorAuth" 
      component={() => <PlaceholderScreen title="Two-Factor Authentication" />}
      options={{ title: 'Two-Factor Auth' }} 
    />
    
    {/* Parent/Guardian Features */}
    <Stack.Screen 
      name="ParentalControls" 
      component={() => <PlaceholderScreen title="Parental Controls" />}
      options={{ title: 'Parental Controls' }} 
    />
    <Stack.Screen 
      name="ParentDashboard" 
      component={() => <PlaceholderScreen title="Parent Dashboard" />}
      options={{ title: 'Parent Dashboard' }} 
    />
    <Stack.Screen 
      name="ChildProgressReports" 
      component={() => <PlaceholderScreen title="Child Progress Reports" />}
      options={{ title: 'Child Progress' }} 
    />
    <Stack.Screen 
      name="ParentCoachComm" 
      component={() => <PlaceholderScreen title="Parent-Coach Communication" />}
      options={{ title: 'Coach Communication' }} 
    />
    <Stack.Screen 
      name="SafetySettings" 
      component={() => <PlaceholderScreen title="Safety Settings" />}
      options={{ title: 'Safety Settings' }} 
    />
    
    {/* Data & Export */}
    <Stack.Screen 
      name="DataExport" 
      component={() => <PlaceholderScreen title="Export My Data" />}
      options={{ title: 'Export Data' }} 
    />
    <Stack.Screen 
      name="DataBackup" 
      component={() => <PlaceholderScreen title="Data Backup" />}
      options={{ title: 'Backup Data' }} 
    />
    <Stack.Screen 
      name="ActivityHistory" 
      component={() => <PlaceholderScreen title="Activity History" />}
      options={{ title: 'Activity History' }} 
    />
    <Stack.Screen 
      name="ProgressReports" 
      component={() => <PlaceholderScreen title="Progress Reports" />}
      options={{ title: 'Progress Reports' }} 
    />
    
    {/* Social & Community Features */}
    <Stack.Screen 
      name="SocialProfile" 
      component={() => <PlaceholderScreen title="Social Profile" />}
      options={{ title: 'Social Profile' }} 
    />
    <Stack.Screen 
      name="ProfileVisibility" 
      component={() => <PlaceholderScreen title="Profile Visibility" />}
      options={{ title: 'Profile Visibility' }} 
    />
    <Stack.Screen 
      name="FollowersFollowing" 
      component={() => <PlaceholderScreen title="Followers & Following" />}
      options={{ title: 'Followers' }} 
    />
    <Stack.Screen 
      name="BlockedUsers" 
      component={() => <PlaceholderScreen title="Blocked Users" />}
      options={{ title: 'Blocked Users' }} 
    />
    
    {/* Support & Help */}
    <Stack.Screen 
      name="HelpCenter" 
      component={() => <PlaceholderScreen title="Help Center" />}
      options={{ title: 'Help Center' }} 
    />
    <Stack.Screen 
      name="ContactSupport" 
      component={() => <PlaceholderScreen title="Contact Support" />}
      options={{ title: 'Contact Support' }} 
    />
    <Stack.Screen 
      name="FAQ" 
      component={() => <PlaceholderScreen title="Frequently Asked Questions" />}
      options={{ title: 'FAQ' }} 
    />
    <Stack.Screen 
      name="UserGuide" 
      component={() => <PlaceholderScreen title="User Guide" />}
      options={{ title: 'User Guide' }} 
    />
    <Stack.Screen 
      name="AppTutorials" 
      component={() => <PlaceholderScreen title="App Tutorials" />}
      options={{ title: 'Tutorials' }} 
    />
    <Stack.Screen 
      name="ReportBug" 
      component={() => <PlaceholderScreen title="Report a Bug" />}
      options={{ title: 'Report Bug' }} 
    />
    <Stack.Screen 
      name="FeatureRequests" 
      component={() => <PlaceholderScreen title="Feature Requests" />}
      options={{ title: 'Feature Requests' }} 
    />
    <Stack.Screen 
      name="AppFeedback" 
      component={() => <PlaceholderScreen title="App Feedback" />}
      options={{ title: 'Give Feedback' }} 
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
      name="CommunityGuidelines" 
      component={() => <PlaceholderScreen title="Community Guidelines" />}
      options={{ title: 'Community Guidelines' }} 
    />
    <Stack.Screen 
      name="AgeVerification" 
      component={() => <PlaceholderScreen title="Age Verification" />}
      options={{ title: 'Age Verification' }} 
    />
    <Stack.Screen 
      name="ConsentForms" 
      component={() => <PlaceholderScreen title="Consent Forms" />}
      options={{ title: 'Consent Forms' }} 
    />
    
    {/* Achievements & Recognition */}
    <Stack.Screen 
      name="MyAchievements" 
      component={() => <PlaceholderScreen title="My Achievements" />}
      options={{ title: 'My Achievements' }} 
    />
    <Stack.Screen 
      name="Certificates" 
      component={() => <PlaceholderScreen title="Certificates & Awards" />}
      options={{ title: 'Certificates' }} 
    />
    <Stack.Screen 
      name="BadgeCollection" 
      component={() => <PlaceholderScreen title="Badge Collection" />}
      options={{ title: 'Badge Collection' }} 
    />
    <Stack.Screen 
      name="MilestoneHistory" 
      component={() => <PlaceholderScreen title="Milestone History" />}
      options={{ title: 'Milestones' }} 
    />
    
    {/* Equipment & Gear Management */}
    <Stack.Screen 
      name="MyEquipment" 
      component={() => <PlaceholderScreen title="My Equipment" />}
      options={{ title: 'My Equipment' }} 
    />
    <Stack.Screen 
      name="EquipmentTracker" 
      component={() => <PlaceholderScreen title="Equipment Tracker" />}
      options={{ title: 'Equipment Tracker' }} 
    />
    <Stack.Screen 
      name="MaintenanceSchedule" 
      component={() => <PlaceholderScreen title="Maintenance Schedule" />}
      options={{ title: 'Maintenance' }} 
    />
    <Stack.Screen 
      name="GearWishlist" 
      component={() => <PlaceholderScreen title="Gear Wishlist" />}
      options={{ title: 'Gear Wishlist' }} 
    />
    <Stack.Screen 
      name="BudgetTracker" 
      component={() => <PlaceholderScreen title="Equipment Budget Tracker" />}
      options={{ title: 'Budget Tracker' }} 
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

// Main Trainee Navigator Component
const TraineeNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Training':
              iconName = 'fitness-center';
              break;
            case 'Progress':
              iconName = 'trending-up';
              break;
            case 'Coach':
              iconName = 'person-outline';
              break;
            case 'Nutrition':
              iconName = 'restaurant';
              break;
            case 'Search':
              // Return custom discover button
              return <DiscoverButton focused={focused} />;
            case 'Profile':
              iconName = 'account-circle';
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
        name="Coach" 
        component={CoachStack}
        options={{
          tabBarLabel: 'Coach',
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
        name="Search" 
        component={SearchStack}
        options={{
          tabBarLabel: 'Discover',
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

export default TraineeNavigator;