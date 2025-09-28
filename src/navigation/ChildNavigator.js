import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../styles/colors';

// Existing Child Screens
import ChildDashboard from '../screens/child/ChildDashboard';
//import MyTrainingPlan from '../screens/child/MyTrainingPlan';
//import TodaysSession from '../screens/child/TodaysSession';
//import ProgressTracking from '../screens/child/ProgressTracking';
//import CoachFeedback from '../screens/child/CoachFeedback';
import ChatScreen from '../screens/shared/ChatScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import NewScreen from '../screens/shared/NewScreen';

// Dashboard & Analytics Screens
// import ChildPerformanceDashboard from '../screens/child/dashboard/ChildPerformanceDashboard';
// import WeeklyOverview from '../screens/child/dashboard/WeeklyOverview';
// import MonthlyProgress from '../screens/child/dashboard/MonthlyProgress';
// import MySchedule from '../screens/child/dashboard/MySchedule';
// import UpcomingTraining from '../screens/child/dashboard/UpcomingTraining';
// import RecentActivity from '../screens/child/dashboard/RecentActivity';
// import Achievements from '../screens/child/dashboard/Achievements';
// import Badges from '../screens/child/dashboard/Badges';
// import PersonalBests from '../screens/child/dashboard/PersonalBests';
// import QuickStats from '../screens/child/dashboard/QuickStats';
// import MotivationalDashboard from '../screens/child/dashboard/MotivationalDashboard';
// import ParentUpdates from '../screens/child/dashboard/ParentUpdates';

// Training & Sessions Screens
// import MyTrainingSessions from '../screens/child/training/MyTrainingSessions';
// import SessionDetails from '../screens/child/training/SessionDetails';
// import WorkoutLibrary from '../screens/child/training/WorkoutLibrary';
// import ExerciseGuide from '../screens/child/training/ExerciseGuide';
// import TechniqueVideos from '../screens/child/training/TechniqueVideos';
// import SkillChallenges from '../screens/child/training/SkillChallenges';
// import PersonalWorkouts from '../screens/child/training/PersonalWorkouts';
// import CustomDrills from '../screens/child/training/CustomDrills';
// import SessionFeedback from '../screens/child/training/SessionFeedback';
// import TrainingHistory from '../screens/child/training/TrainingHistory';
// import SessionRating from '../screens/child/training/SessionRating';
// import WorkoutTimer from '../screens/child/training/WorkoutTimer';
// import RestTimer from '../screens/child/training/RestTimer';
// import SessionNotes from '../screens/child/training/SessionNotes';
// import TrainingCalendar from '../screens/child/training/TrainingCalendar';

// Performance & Tracking Screens
// import MyPerformance from '../screens/child/performance/MyPerformance';
// import ProgressCharts from '../screens/child/performance/ProgressCharts';
// import FitnessTests from '../screens/child/performance/FitnessTests';
// import SkillAssessments from '../screens/child/performance/SkillAssessments';
// import PersonalRecords from '../screens/child/performance/PersonalRecords';
// import ImprovementTracking from '../screens/child/performance/ImprovementTracking';
// import GoalSetting from '../screens/child/performance/GoalSetting';
// import GoalTracking from '../screens/child/performance/GoalTracking';
// import CompetitionResults from '../screens/child/performance/CompetitionResults';
// import PerformanceAnalysis from '../screens/child/performance/PerformanceAnalysis';
// import StrengthProgress from '../screens/child/performance/StrengthProgress';
// import EnduranceTracking from '../screens/child/performance/EnduranceTracking';
// import FlexibilityTests from '../screens/child/performance/FlexibilityTests';
// import SportSpecificMetrics from '../screens/child/performance/SportSpecificMetrics';

// Communication & Social Screens
// import TeamChat from '../screens/child/communication/TeamChat';
// import CoachMessages from '../screens/child/communication/CoachMessages';
// import ParentCommunication from '../screens/child/communication/ParentCommunication';
// import TeamAnnouncements from '../screens/child/communication/TeamAnnouncements';
// import PeerSupport from '../screens/child/communication/PeerSupport';
// import StudyGroups from '../screens/child/communication/StudyGroups';
// import TeamForum from '../screens/child/communication/TeamForum';
// import Notifications from '../screens/child/communication/Notifications';
// import MessageCenter from '../screens/child/communication/MessageCenter';
// import EmergencyContacts from '../screens/child/communication/EmergencyContacts';
// import SafetyReporting from '../screens/child/communication/SafetyReporting';

// Education & Learning Screens
// import SportEducation from '../screens/child/education/SportEducation';
// import RulesLearning from '../screens/child/education/RulesLearning';
// import TechniqueLibrary from '../screens/child/education/TechniqueLibrary';
// import TacticsLearning from '../screens/child/education/TacticsLearning';
// import VideoLessons from '../screens/child/education/VideoLessons';
// import InteractiveLearning from '../screens/child/education/InteractiveLearning';
// import Quizzes from '../screens/child/education/Quizzes';
// import LearningPath from '../screens/child/education/LearningPath';
// import Certifications from '../screens/child/education/Certifications';
// import KnowledgeBase from '../screens/child/education/KnowledgeBase';
// import SportHistory from '../screens/child/education/SportHistory';
// import FamousAthletes from '../screens/child/education/FamousAthletes';

// Health & Wellness Screens
// import HealthDashboard from '../screens/child/wellness/HealthDashboard';
// import NutritionGuide from '../screens/child/wellness/NutritionGuide';
// import MealPlanning from '../screens/child/wellness/MealPlanning';
// import HydrationTracker from '../screens/child/wellness/HydrationTracker';
// import SleepTracker from '../screens/child/wellness/SleepTracker';
// import RecoveryTips from '../screens/child/wellness/RecoveryTips';
// import InjuryPrevention from '../screens/child/wellness/InjuryPrevention';
// import WarmupRoutines from '../screens/child/wellness/WarmupRoutines';
// import CooldownGuide from '../screens/child/wellness/CooldownGuide';
// import MentalWellness from '../screens/child/wellness/MentalWellness';
// import StressManagement from '../screens/child/wellness/StressManagement';
// import MotivationTools from '../screens/child/wellness/MotivationTools';
// import HealthAssessments from '../screens/child/wellness/HealthAssessments';
// import MedicalRecords from '../screens/child/wellness/MedicalRecords';

// Games & Motivation Screens
// import GamificationHub from '../screens/child/games/GamificationHub';
// import Challenges from '../screens/child/games/Challenges';
// import Leaderboards from '../screens/child/games/Leaderboards';
// import AchievementCenter from '../screens/child/games/AchievementCenter';
// import Rewards from '../screens/child/games/Rewards';
// import VirtualTrophies from '../screens/child/games/VirtualTrophies';
// import PointsSystem from '../screens/child/games/PointsSystem';
// import SkillQuests from '../screens/child/games/SkillQuests';
// import DailyQuests from '../screens/child/games/DailyQuests';
// import WeeklyChallenge from '../screens/child/games/WeeklyChallenge';
// import TeamCompetitions from '../screens/child/games/TeamCompetitions';
// import FunActivities from '../screens/child/games/FunActivities';
// import MotivationalQuotes from '../screens/child/games/MotivationalQuotes';

// Discovery & Search Screens
// import ExploreTraining from '../screens/child/discovery/ExploreTraining';
// import FindCoaches from '../screens/child/discovery/FindCoaches';
// import FindTeammates from '../screens/child/discovery/FindTeammates';
// import DiscoverSports from '../screens/child/discovery/DiscoverSports';
// import LocalEvents from '../screens/child/discovery/LocalEvents';
// import Competitions from '../screens/child/discovery/Competitions';
// import CampSearch from '../screens/child/discovery/CampSearch';
// import ClubFinder from '../screens/child/discovery/ClubFinder';
// import FacilityFinder from '../screens/child/discovery/FacilityFinder';
// import SportsTours from '../screens/child/discovery/SportsTours';
// import TournamentFinder from '../screens/child/discovery/TournamentFinder';

// AI & Smart Features Screens
// import AITrainingAssistant from '../screens/child/ai/AITrainingAssistant';
// import PersonalizedRecommendations from '../screens/child/ai/PersonalizedRecommendations';
// import SmartGoalSetting from '../screens/child/ai/SmartGoalSetting';
// import TechniqueAnalysis from '../screens/child/ai/TechniqueAnalysis';
// import PerformancePrediction from '../screens/child/ai/PerformancePrediction';
// import AdaptiveTraining from '../screens/child/ai/AdaptiveTraining';
// import AICoach from '../screens/child/ai/AICoach';
// import SmartScheduling from '../screens/child/ai/SmartScheduling';
// import MotionCorrection from '../screens/child/ai/MotionCorrection';
// import PersonalizedNutrition from '../screens/child/ai/PersonalizedNutrition';

// Media & Content Screens
// import MyVideos from '../screens/child/media/MyVideos';
// import TechniqueVideos from '../screens/child/media/TechniqueVideos';
// import ProgressVideos from '../screens/child/media/ProgressVideos';
// import ShareProgress from '../screens/child/media/ShareProgress';
// import VideoAnalysis from '../screens/child/media/VideoAnalysis';
// import PhotoGallery from '../screens/child/media/PhotoGallery';
// import SkillDemos from '../screens/child/media/SkillDemos';
// import TrainingClips from '../screens/child/media/TrainingClips';
// import MediaLibrary from '../screens/child/media/MediaLibrary';
// import ContentCreation from '../screens/child/media/ContentCreation';

// Profile & Settings Screens
// import MyProfile from '../screens/child/profile/MyProfile';
// import EditProfile from '../screens/child/profile/EditProfile';
// import SportPreferences from '../screens/child/profile/SportPreferences';
// import GoalsPreferences from '../screens/child/profile/GoalsPreferences';
// import PrivacySettings from '../screens/child/profile/PrivacySettings';
// import NotificationSettings from '../screens/child/profile/NotificationSettings';
// import AccountSettings from '../screens/child/profile/AccountSettings';
// import ParentalControls from '../screens/child/profile/ParentalControls';
// import SafetySettings from '../screens/child/profile/SafetySettings';
// import DataManagement from '../screens/child/profile/DataManagement';
// import HelpCenter from '../screens/child/profile/HelpCenter';
// import ContactSupport from '../screens/child/profile/ContactSupport';
// import ReportIssue from '../screens/child/profile/ReportIssue';

// Equipment & Resources Screens
// import EquipmentGuide from '../screens/child/resources/EquipmentGuide';
// import MyEquipment from '../screens/child/resources/MyEquipment';
// import EquipmentMaintenance from '../screens/child/resources/EquipmentMaintenance';
// import GearRecommendations from '../screens/child/resources/GearRecommendations';
// import SafetyGear from '../screens/child/resources/SafetyGear';
// import TrainingTools from '../screens/child/resources/TrainingTools';
// import ResourceLibrary from '../screens/child/resources/ResourceLibrary';
// import TrainingTips from '../screens/child/resources/TrainingTips';
// import ExpertAdvice from '../screens/child/resources/ExpertAdvice';

// Emergency & Safety Screens
// import EmergencyInfo from '../screens/child/safety/EmergencyInfo';
// import SafetyGuidelines from '../screens/child/safety/SafetyGuidelines';
// import InjuryReporting from '../screens/child/safety/InjuryReporting';
// import SafetyChecklist from '../screens/child/safety/SafetyChecklist';
// import ParentNotification from '../screens/child/safety/ParentNotification';
// import EmergencyContacts from '../screens/child/safety/EmergencyContacts';
// import IncidentReporting from '../screens/child/safety/IncidentReporting';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Placeholder screen for features under development
const PlaceholderScreen = ({ screenName }) => (
  <View style={styles.placeholderContainer}>
    <Icon name="construction" size={60} color={COLORS.primary} />
    <Text style={styles.placeholderText}>Feature Under Development</Text>
    <Text style={styles.screenNameText}>{screenName}</Text>
  </View>
);

// Home Stack Navigator
const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="ChildDashboard" 
        component={ChildDashboard}
        options={{ title: 'My Training Dashboard' }}
      />
      <Stack.Screen 
        name="MyTrainingPlan" 
        component={() => <PlaceholderScreen screenName="Weekly Overview" />}
        options={{ title: 'My Training Plan' }}
      />
      <Stack.Screen 
        name="TodaysSession" 
        component={() => <PlaceholderScreen screenName="Weekly Overview" />}
        options={{ title: "Today's Session" }}
      />
      
      {/* Dashboard Screens */}
      <Stack.Screen 
        name="WeeklyOverview" 
        component={() => <PlaceholderScreen screenName="Weekly Overview" />}
        options={{ title: 'Weekly Overview' }}
      />
      <Stack.Screen 
        name="MonthlyProgress" 
        component={() => <PlaceholderScreen screenName="Monthly Progress" />}
        options={{ title: 'Monthly Progress' }}
      />
      <Stack.Screen 
        name="MySchedule" 
        component={() => <PlaceholderScreen screenName="My Schedule" />}
        options={{ title: 'My Schedule' }}
      />
      <Stack.Screen 
        name="UpcomingTraining" 
        component={() => <PlaceholderScreen screenName="Upcoming Training" />}
        options={{ title: 'Upcoming Training' }}
      />
      <Stack.Screen 
        name="RecentActivity" 
        component={() => <PlaceholderScreen screenName="Recent Activity" />}
        options={{ title: 'Recent Activity' }}
      />
      <Stack.Screen 
        name="Achievements" 
        component={() => <PlaceholderScreen screenName="My Achievements" />}
        options={{ title: 'My Achievements' }}
      />
      <Stack.Screen 
        name="Badges" 
        component={() => <PlaceholderScreen screenName="My Badges" />}
        options={{ title: 'My Badges' }}
      />
      <Stack.Screen 
        name="PersonalBests" 
        component={() => <PlaceholderScreen screenName="Personal Bests" />}
        options={{ title: 'Personal Bests' }}
      />
      <Stack.Screen 
        name="QuickStats" 
        component={() => <PlaceholderScreen screenName="Quick Stats" />}
        options={{ title: 'Quick Stats' }}
      />
      <Stack.Screen 
        name="MotivationalDashboard" 
        component={() => <PlaceholderScreen screenName="Motivational Dashboard" />}
        options={{ title: 'Motivational Dashboard' }}
      />
      <Stack.Screen 
        name="ParentUpdates" 
        component={() => <PlaceholderScreen screenName="Parent Updates" />}
        options={{ title: 'Parent Updates' }}
      />

      {/* Training Screens */}
      <Stack.Screen 
        name="MyTrainingSessions" 
        component={() => <PlaceholderScreen screenName="My Training Sessions" />}
        options={{ title: 'My Training Sessions' }}
      />
      <Stack.Screen 
        name="SessionDetails" 
        component={() => <PlaceholderScreen screenName="Session Details" />}
        options={{ title: 'Session Details' }}
      />
      <Stack.Screen 
        name="WorkoutLibrary" 
        component={() => <PlaceholderScreen screenName="Workout Library" />}
        options={{ title: 'Workout Library' }}
      />
      <Stack.Screen 
        name="ExerciseGuide" 
        component={() => <PlaceholderScreen screenName="Exercise Guide" />}
        options={{ title: 'Exercise Guide' }}
      />
      <Stack.Screen 
        name="TechniqueVideos" 
        component={() => <PlaceholderScreen screenName="Technique Videos" />}
        options={{ title: 'Technique Videos' }}
      />
      <Stack.Screen 
        name="SkillChallenges" 
        component={() => <PlaceholderScreen screenName="Skill Challenges" />}
        options={{ title: 'Skill Challenges' }}
      />
      <Stack.Screen 
        name="PersonalWorkouts" 
        component={() => <PlaceholderScreen screenName="Personal Workouts" />}
        options={{ title: 'Personal Workouts' }}
      />
      <Stack.Screen 
        name="CustomDrills" 
        component={() => <PlaceholderScreen screenName="Custom Drills" />}
        options={{ title: 'Custom Drills' }}
      />
      <Stack.Screen 
        name="SessionFeedback" 
        component={() => <PlaceholderScreen screenName="Session Feedback" />}
        options={{ title: 'Session Feedback' }}
      />
      <Stack.Screen 
        name="TrainingHistory" 
        component={() => <PlaceholderScreen screenName="Training History" />}
        options={{ title: 'Training History' }}
      />
      <Stack.Screen 
        name="SessionRating" 
        component={() => <PlaceholderScreen screenName="Session Rating" />}
        options={{ title: 'Session Rating' }}
      />
      <Stack.Screen 
        name="WorkoutTimer" 
        component={() => <PlaceholderScreen screenName="Workout Timer" />}
        options={{ title: 'Workout Timer' }}
      />
      <Stack.Screen 
        name="RestTimer" 
        component={() => <PlaceholderScreen screenName="Rest Timer" />}
        options={{ title: 'Rest Timer' }}
      />
      <Stack.Screen 
        name="SessionNotes" 
        component={() => <PlaceholderScreen screenName="Session Notes" />}
        options={{ title: 'Session Notes' }}
      />
      <Stack.Screen 
        name="TrainingCalendar" 
        component={() => <PlaceholderScreen screenName="Training Calendar" />}
        options={{ title: 'Training Calendar' }}
      />

      {/* Performance Screens */}
      <Stack.Screen 
        name="MyPerformance" 
        component={() => <PlaceholderScreen screenName="My Performance" />}
        options={{ title: 'My Performance' }}
      />
      <Stack.Screen 
        name="FitnessTests" 
        component={() => <PlaceholderScreen screenName="Fitness Tests" />}
        options={{ title: 'Fitness Tests' }}
      />
      <Stack.Screen 
        name="GoalSetting" 
        component={() => <PlaceholderScreen screenName="Goal Setting" />}
        options={{ title: 'Set My Goals' }}
      />
      <Stack.Screen 
        name="GoalTracking" 
        component={() => <PlaceholderScreen screenName="Goal Tracking" />}
        options={{ title: 'Track My Goals' }}
      />

      {/* Health & Wellness Screens */}
      <Stack.Screen 
        name="HealthDashboard" 
        component={() => <PlaceholderScreen screenName="Health Dashboard" />}
        options={{ title: 'Health Dashboard' }}
      />
      <Stack.Screen 
        name="NutritionGuide" 
        component={() => <PlaceholderScreen screenName="Nutrition Guide" />}
        options={{ title: 'Nutrition Guide' }}
      />
      <Stack.Screen 
        name="MealPlanning" 
        component={() => <PlaceholderScreen screenName="Meal Planning" />}
        options={{ title: 'Meal Planning' }}
      />
      <Stack.Screen 
        name="HydrationTracker" 
        component={() => <PlaceholderScreen screenName="Hydration Tracker" />}
        options={{ title: 'Hydration Tracker' }}
      />
      <Stack.Screen 
        name="SleepTracker" 
        component={() => <PlaceholderScreen screenName="Sleep Tracker" />}
        options={{ title: 'Sleep Tracker' }}
      />
      <Stack.Screen 
        name="RecoveryTips" 
        component={() => <PlaceholderScreen screenName="Recovery Tips" />}
        options={{ title: 'Recovery Tips' }}
      />
      <Stack.Screen 
        name="InjuryPrevention" 
        component={() => <PlaceholderScreen screenName="Injury Prevention" />}
        options={{ title: 'Injury Prevention' }}
      />
      <Stack.Screen 
        name="WarmupRoutines" 
        component={() => <PlaceholderScreen screenName="Warmup Routines" />}
        options={{ title: 'Warmup Routines' }}
      />
      <Stack.Screen 
        name="CooldownGuide" 
        component={() => <PlaceholderScreen screenName="Cooldown Guide" />}
        options={{ title: 'Cooldown Guide' }}
      />
      <Stack.Screen 
        name="MentalWellness" 
        component={() => <PlaceholderScreen screenName="Mental Wellness" />}
        options={{ title: 'Mental Wellness' }}
      />
      <Stack.Screen 
        name="StressManagement" 
        component={() => <PlaceholderScreen screenName="Stress Management" />}
        options={{ title: 'Stress Management' }}
      />
      <Stack.Screen 
        name="MotivationTools" 
        component={() => <PlaceholderScreen screenName="Motivation Tools" />}
        options={{ title: 'Motivation Tools' }}
      />
      <Stack.Screen 
        name="HealthAssessments" 
        component={() => <PlaceholderScreen screenName="Health Assessments" />}
        options={{ title: 'Health Assessments' }}
      />
      <Stack.Screen 
        name="MedicalRecords" 
        component={() => <PlaceholderScreen screenName="Medical Records" />}
        options={{ title: 'Medical Records' }}
      />

      {/* Games & Motivation Screens */}
      <Stack.Screen 
        name="GamificationHub" 
        component={() => <PlaceholderScreen screenName="Games Hub" />}
        options={{ title: 'Games Hub' }}
      />
      <Stack.Screen 
        name="Challenges" 
        component={() => <PlaceholderScreen screenName="My Challenges" />}
        options={{ title: 'My Challenges' }}
      />
      <Stack.Screen 
        name="Leaderboards" 
        component={() => <PlaceholderScreen screenName="Leaderboards" />}
        options={{ title: 'Leaderboards' }}
      />
      <Stack.Screen 
        name="AchievementCenter" 
        component={() => <PlaceholderScreen screenName="Achievement Center" />}
        options={{ title: 'Achievement Center' }}
      />
      <Stack.Screen 
        name="Rewards" 
        component={() => <PlaceholderScreen screenName="My Rewards" />}
        options={{ title: 'My Rewards' }}
      />
      <Stack.Screen 
        name="VirtualTrophies" 
        component={() => <PlaceholderScreen screenName="Virtual Trophies" />}
        options={{ title: 'Virtual Trophies' }}
      />
      <Stack.Screen 
        name="PointsSystem" 
        component={() => <PlaceholderScreen screenName="Points System" />}
        options={{ title: 'Points System' }}
      />
      <Stack.Screen 
        name="SkillQuests" 
        component={() => <PlaceholderScreen screenName="Skill Quests" />}
        options={{ title: 'Skill Quests' }}
      />
      <Stack.Screen 
        name="DailyQuests" 
        component={() => <PlaceholderScreen screenName="Daily Quests" />}
        options={{ title: 'Daily Quests' }}
      />
      <Stack.Screen 
        name="WeeklyChallenge" 
        component={() => <PlaceholderScreen screenName="Weekly Challenge" />}
        options={{ title: 'Weekly Challenge' }}
      />
      <Stack.Screen 
        name="TeamCompetitions" 
        component={() => <PlaceholderScreen screenName="Team Competitions" />}
        options={{ title: 'Team Competitions' }}
      />
      <Stack.Screen 
        name="FunActivities" 
        component={() => <PlaceholderScreen screenName="Fun Activities" />}
        options={{ title: 'Fun Activities' }}
      />
      <Stack.Screen 
        name="MotivationalQuotes" 
        component={() => <PlaceholderScreen screenName="Motivational Quotes" />}
        options={{ title: 'Motivational Quotes' }}
      />

      {/* AI Features */}
      <Stack.Screen 
        name="AITrainingAssistant" 
        component={() => <PlaceholderScreen screenName="AI Training Assistant" />}
        options={{ title: 'AI Training Assistant' }}
      />
      <Stack.Screen 
        name="PersonalizedRecommendations" 
        component={() => <PlaceholderScreen screenName="Personalized Recommendations" />}
        options={{ title: 'Personalized Recommendations' }}
      />
      <Stack.Screen 
        name="SmartGoalSetting" 
        component={() => <PlaceholderScreen screenName="Smart Goal Setting" />}
        options={{ title: 'Smart Goal Setting' }}
      />
      <Stack.Screen 
        name="TechniqueAnalysis" 
        component={() => <PlaceholderScreen screenName="Technique Analysis" />}
        options={{ title: 'Technique Analysis' }}
      />
      <Stack.Screen 
        name="PerformancePrediction" 
        component={() => <PlaceholderScreen screenName="Performance Prediction" />}
        options={{ title: 'Performance Prediction' }}
      />
      <Stack.Screen 
        name="AdaptiveTraining" 
        component={() => <PlaceholderScreen screenName="Adaptive Training" />}
        options={{ title: 'Adaptive Training' }}
      />
      <Stack.Screen 
        name="AICoach" 
        component={() => <PlaceholderScreen screenName="AI Coach" />}
        options={{ title: 'AI Coach' }}
      />
      <Stack.Screen 
        name="SmartScheduling" 
        component={() => <PlaceholderScreen screenName="Smart Scheduling" />}
        options={{ title: 'Smart Scheduling' }}
      />
      <Stack.Screen 
        name="MotionCorrection" 
        component={() => <PlaceholderScreen screenName="Motion Correction" />}
        options={{ title: 'Motion Correction' }}
      />
      <Stack.Screen 
        name="PersonalizedNutrition" 
        component={() => <PlaceholderScreen screenName="Personalized Nutrition" />}
        options={{ title: 'Personalized Nutrition' }}
      />

      {/* Media Screens */}
      <Stack.Screen 
        name="MyVideos" 
        component={() => <PlaceholderScreen screenName="My Videos" />}
        options={{ title: 'My Videos' }}
      />
      <Stack.Screen 
        name="ProgressVideos" 
        component={() => <PlaceholderScreen screenName="Progress Videos" />}
        options={{ title: 'Progress Videos' }}
      />
      <Stack.Screen 
        name="ShareProgress" 
        component={() => <PlaceholderScreen screenName="Share Progress" />}
        options={{ title: 'Share Progress' }}
      />
      <Stack.Screen 
        name="VideoAnalysis" 
        component={() => <PlaceholderScreen screenName="Video Analysis" />}
        options={{ title: 'Video Analysis' }}
      />
      <Stack.Screen 
        name="PhotoGallery" 
        component={() => <PlaceholderScreen screenName="Photo Gallery" />}
        options={{ title: 'Photo Gallery' }}
      />
      <Stack.Screen 
        name="SkillDemos" 
        component={() => <PlaceholderScreen screenName="Skill Demos" />}
        options={{ title: 'Skill Demos' }}
      />
      <Stack.Screen 
        name="TrainingClips" 
        component={() => <PlaceholderScreen screenName="Training Clips" />}
        options={{ title: 'Training Clips' }}
      />
      <Stack.Screen 
        name="MediaLibrary" 
        component={() => <PlaceholderScreen screenName="Media Library" />}
        options={{ title: 'Media Library' }}
      />
      <Stack.Screen 
        name="ContentCreation" 
        component={() => <PlaceholderScreen screenName="Content Creation" />}
        options={{ title: 'Content Creation' }}
      />

      {/* Equipment & Resources Screens */}
      <Stack.Screen 
        name="EquipmentGuide" 
        component={() => <PlaceholderScreen screenName="Equipment Guide" />}
        options={{ title: 'Equipment Guide' }}
      />
      <Stack.Screen 
        name="MyEquipment" 
        component={() => <PlaceholderScreen screenName="My Equipment" />}
        options={{ title: 'My Equipment' }}
      />
      <Stack.Screen 
        name="EquipmentMaintenance" 
        component={() => <PlaceholderScreen screenName="Equipment Maintenance" />}
        options={{ title: 'Equipment Maintenance' }}
      />
      <Stack.Screen 
        name="GearRecommendations" 
        component={() => <PlaceholderScreen screenName="Gear Recommendations" />}
        options={{ title: 'Gear Recommendations' }}
      />
      <Stack.Screen 
        name="SafetyGear" 
        component={() => <PlaceholderScreen screenName="Safety Gear" />}
        options={{ title: 'Safety Gear' }}
      />
      <Stack.Screen 
        name="TrainingTools" 
        component={() => <PlaceholderScreen screenName="Training Tools" />}
        options={{ title: 'Training Tools' }}
      />
      <Stack.Screen 
        name="ResourceLibrary" 
        component={() => <PlaceholderScreen screenName="Resource Library" />}
        options={{ title: 'Resource Library' }}
      />
      <Stack.Screen 
        name="TrainingTips" 
        component={() => <PlaceholderScreen screenName="Training Tips" />}
        options={{ title: 'Training Tips' }}
      />
      <Stack.Screen 
        name="ExpertAdvice" 
        component={() => <PlaceholderScreen screenName="Expert Advice" />}
        options={{ title: 'Expert Advice' }}
      />
    </Stack.Navigator>
  );
};

// Discovery Stack Navigator
const DiscoveryStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="ExploreTraining" 
        component={() => <PlaceholderScreen screenName="Explore Training" />}
        options={{ title: 'Explore Training' }}
      />
      <Stack.Screen 
        name="FindCoaches" 
        component={() => <PlaceholderScreen screenName="Find Coaches" />}
        options={{ title: 'Find Coaches' }}
      />
      <Stack.Screen 
        name="FindTeammates" 
        component={() => <PlaceholderScreen screenName="Find Teammates" />}
        options={{ title: 'Find Teammates' }}
      />
      <Stack.Screen 
        name="DiscoverSports" 
        component={() => <PlaceholderScreen screenName="Discover Sports" />}
        options={{ title: 'Discover Sports' }}
      />
      <Stack.Screen 
        name="LocalEvents" 
        component={() => <PlaceholderScreen screenName="Local Events" />}
        options={{ title: 'Local Events' }}
      />
      <Stack.Screen 
        name="Competitions" 
        component={() => <PlaceholderScreen screenName="Competitions" />}
        options={{ title: 'Competitions' }}
      />
      <Stack.Screen 
        name="CampSearch" 
        component={() => <PlaceholderScreen screenName="Sports Camps" />}
        options={{ title: 'Sports Camps' }}
      />
      <Stack.Screen 
        name="ClubFinder" 
        component={() => <PlaceholderScreen screenName="Find Clubs" />}
        options={{ title: 'Find Clubs' }}
      />
      <Stack.Screen 
        name="FacilityFinder" 
        component={() => <PlaceholderScreen screenName="Find Facilities" />}
        options={{ title: 'Find Facilities' }}
      />
      <Stack.Screen 
        name="SportsTours" 
        component={() => <PlaceholderScreen screenName="Sports Tours" />}
        options={{ title: 'Sports Tours' }}
      />
      <Stack.Screen 
        name="TournamentFinder" 
        component={() => <PlaceholderScreen screenName="Find Tournaments" />}
        options={{ title: 'Find Tournaments' }}
      />
    </Stack.Navigator>
  );
};

// Progress Stack Navigator
const ProgressStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="ProgressTracking" 
        component={() => <PlaceholderScreen screenName="Weekly Overview" />}
        options={{ title: 'My Progress' }}
      />
      <Stack.Screen 
        name="ProgressCharts" 
        component={() => <PlaceholderScreen screenName="Progress Charts" />}
        options={{ title: 'Progress Charts' }}
      />
      <Stack.Screen 
        name="SkillAssessments" 
        component={() => <PlaceholderScreen screenName="Skill Assessments" />}
        options={{ title: 'Skill Assessments' }}
      />
      <Stack.Screen 
        name="PersonalRecords" 
        component={() => <PlaceholderScreen screenName="Personal Records" />}
        options={{ title: 'Personal Records' }}
      />
      <Stack.Screen 
        name="ImprovementTracking" 
        component={() => <PlaceholderScreen screenName="Improvement Tracking" />}
        options={{ title: 'Improvement Tracking' }}
      />
      <Stack.Screen 
        name="CompetitionResults" 
        component={() => <PlaceholderScreen screenName="Competition Results" />}
        options={{ title: 'Competition Results' }}
      />
      <Stack.Screen 
        name="PerformanceAnalysis" 
        component={() => <PlaceholderScreen screenName="Performance Analysis" />}
        options={{ title: 'Performance Analysis' }}
      />
      <Stack.Screen 
        name="StrengthProgress" 
        component={() => <PlaceholderScreen screenName="Strength Progress" />}
        options={{ title: 'Strength Progress' }}
      />
      <Stack.Screen 
        name="EnduranceTracking" 
        component={() => <PlaceholderScreen screenName="Endurance Tracking" />}
        options={{ title: 'Endurance Tracking' }}
      />
      <Stack.Screen 
        name="FlexibilityTests" 
        component={() => <PlaceholderScreen screenName="Flexibility Tests" />}
        options={{ title: 'Flexibility Tests' }}
      />
      <Stack.Screen 
        name="SportSpecificMetrics" 
        component={() => <PlaceholderScreen screenName="Sport Specific Metrics" />}
        options={{ title: 'Sport Specific Metrics' }}
      />
    </Stack.Navigator>
  );
};

// Communication Stack Navigator
const CommunicationStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="ChatScreen" 
        component={ChatScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen 
        name="TeamChat" 
        component={() => <PlaceholderScreen screenName="Team Chat" />}
        options={{ title: 'Team Chat' }}
      />
      <Stack.Screen 
        name="CoachMessages" 
        component={() => <PlaceholderScreen screenName="Coach Messages" />}
        options={{ title: 'Coach Messages' }}
      />
      <Stack.Screen 
        name="ParentCommunication" 
        component={() => <PlaceholderScreen screenName="Parent Communication" />}
        options={{ title: 'Chat with Parents' }}
      />
      <Stack.Screen 
        name="TeamAnnouncements" 
        component={() => <PlaceholderScreen screenName="Team Announcements" />}
        options={{ title: 'Team Announcements' }}
      />
      <Stack.Screen 
        name="PeerSupport" 
        component={() => <PlaceholderScreen screenName="Peer Support" />}
        options={{ title: 'Peer Support' }}
      />
      <Stack.Screen 
        name="StudyGroups" 
        component={() => <PlaceholderScreen screenName="Study Groups" />}
        options={{ title: 'Study Groups' }}
      />
      <Stack.Screen 
        name="TeamForum" 
        component={() => <PlaceholderScreen screenName="Team Forum" />}
        options={{ title: 'Team Forum' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={() => <PlaceholderScreen screenName="Notifications" />}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="MessageCenter" 
        component={() => <PlaceholderScreen screenName="Message Center" />}
        options={{ title: 'Message Center' }}
      />
      <Stack.Screen 
        name="EmergencyContacts" 
        component={() => <PlaceholderScreen screenName="Emergency Contacts" />}
        options={{ title: 'Emergency Contacts' }}
      />
      <Stack.Screen 
        name="SafetyReporting" 
        component={() => <PlaceholderScreen screenName="Safety Reporting" />}
        options={{ title: 'Report Safety Issue' }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={() => <PlaceholderScreen screenName="Edit Profile" />}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen 
        name="SportPreferences" 
        component={() => <PlaceholderScreen screenName="Sport Preferences" />}
        options={{ title: 'Sport Preferences' }}
      />
      <Stack.Screen 
        name="GoalsPreferences" 
        component={() => <PlaceholderScreen screenName="Goals Preferences" />}
        options={{ title: 'My Goals' }}
      />
      <Stack.Screen 
        name="PrivacySettings" 
        component={() => <PlaceholderScreen screenName="Privacy Settings" />}
        options={{ title: 'Privacy Settings' }}
      />
      <Stack.Screen 
        name="NotificationSettings" 
        component={() => <PlaceholderScreen screenName="Notification Settings" />}
        options={{ title: 'Notification Settings' }}
      />
      <Stack.Screen 
        name="AccountSettings" 
        component={() => <PlaceholderScreen screenName="Account Settings" />}
        options={{ title: 'Account Settings' }}
      />
      <Stack.Screen 
        name="ParentalControls" 
        component={() => <PlaceholderScreen screenName="Parental Controls" />}
        options={{ title: 'Parental Controls' }}
      />
      <Stack.Screen 
        name="SafetySettings" 
        component={() => <PlaceholderScreen screenName="Safety Settings" />}
        options={{ title: 'Safety Settings' }}
      />
      <Stack.Screen 
        name="DataManagement" 
        component={() => <PlaceholderScreen screenName="Data Management" />}
        options={{ title: 'Data Management' }}
      />
      <Stack.Screen 
        name="HelpCenter" 
        component={() => <PlaceholderScreen screenName="Help Center" />}
        options={{ title: 'Help Center' }}
      />
      <Stack.Screen 
        name="ContactSupport" 
        component={() => <PlaceholderScreen screenName="Contact Support" />}
        options={{ title: 'Contact Support' }}
      />
      <Stack.Screen 
        name="ReportIssue" 
        component={() => <PlaceholderScreen screenName="Report Issue" />}
        options={{ title: 'Report Issue' }}
      />
      <Stack.Screen 
        name="EmergencyInfo" 
        component={() => <PlaceholderScreen screenName="Emergency Information" />}
        options={{ title: 'Emergency Info' }}
      />
      <Stack.Screen 
        name="SafetyGuidelines" 
        component={() => <PlaceholderScreen screenName="Safety Guidelines" />}
        options={{ title: 'Safety Guidelines' }}
      />
      <Stack.Screen 
        name="InjuryReporting" 
        component={() => <PlaceholderScreen screenName="Injury Reporting" />}
        options={{ title: 'Report Injury' }}
      />
      <Stack.Screen 
        name="SafetyChecklist" 
        component={() => <PlaceholderScreen screenName="Safety Checklist" />}
        options={{ title: 'Safety Checklist' }}
      />
      <Stack.Screen 
        name="ParentNotification" 
        component={() => <PlaceholderScreen screenName="Parent Notification" />}
        options={{ title: 'Notify Parents' }}
      />
      <Stack.Screen 
        name="IncidentReporting" 
        component={() => <PlaceholderScreen screenName="Incident Reporting" />}
        options={{ title: 'Report Incident' }}
      />
    </Stack.Navigator>
  );
};

// Education Stack Navigator
const EducationStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="SportEducation" 
        component={() => <PlaceholderScreen screenName="Sport Education" />}
        options={{ title: 'Learn About Sports' }}
      />
      <Stack.Screen 
        name="RulesLearning" 
        component={() => <PlaceholderScreen screenName="Rules Learning" />}
        options={{ title: 'Sport Rules' }}
      />
      <Stack.Screen 
        name="TechniqueLibrary" 
        component={() => <PlaceholderScreen screenName="Technique Library" />}
        options={{ title: 'Technique Library' }}
      />
      <Stack.Screen 
        name="TacticsLearning" 
        component={() => <PlaceholderScreen screenName="Tactics Learning" />}
        options={{ title: 'Sport Tactics' }}
      />
      <Stack.Screen 
        name="VideoLessons" 
        component={() => <PlaceholderScreen screenName="Video Lessons" />}
        options={{ title: 'Video Lessons' }}
      />
      <Stack.Screen 
        name="InteractiveLearning" 
        component={() => <PlaceholderScreen screenName="Interactive Learning" />}
        options={{ title: 'Interactive Learning' }}
      />
      <Stack.Screen 
        name="Quizzes" 
        component={() => <PlaceholderScreen screenName="Learning Quizzes" />}
        options={{ title: 'Learning Quizzes' }}
      />
      <Stack.Screen 
        name="LearningPath" 
        component={() => <PlaceholderScreen screenName="Learning Path" />}
        options={{ title: 'My Learning Path' }}
      />
      <Stack.Screen 
        name="Certifications" 
        component={() => <PlaceholderScreen screenName="Certifications" />}
        options={{ title: 'My Certifications' }}
      />
      <Stack.Screen 
        name="KnowledgeBase" 
        component={() => <PlaceholderScreen screenName="Knowledge Base" />}
        options={{ title: 'Knowledge Base' }}
      />
      <Stack.Screen 
        name="SportHistory" 
        component={() => <PlaceholderScreen screenName="Sport History" />}
        options={{ title: 'Sport History' }}
      />
      <Stack.Screen 
        name="FamousAthletes" 
        component={() => <PlaceholderScreen screenName="Famous Athletes" />}
        options={{ title: 'Famous Athletes' }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const ChildTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Discover':
              iconName = 'explore';
              break;
            case 'Progress':
              iconName = 'trending-up';
              break;
            case 'Messages':
              iconName = 'chat';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            case 'Education':
              iconName = 'school';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Discover" component={DiscoveryStackNavigator} />
      <Tab.Screen name="Progress" component={ProgressStackNavigator} />
      <Tab.Screen name="Messages" component={CommunicationStackNavigator} />
      <Tab.Screen name="Education" component={EducationStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

// StyleSheet for placeholder components
const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 20,
    textAlign: 'center',
  },
  screenNameText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ChildTabNavigator;