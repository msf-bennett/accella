import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../styles/colors';

// Existing Coach Screens
import CoachDashboard from '../screens/coach/CoachDashboard';
import CreateTrainingPlan from '../screens/coach/CreateTrainingPlan';
import CoachingPlanUploadScreen from '../screens/coach/training/CoachingPlanUploadScreen';
import PlanProcessingScreen from '../screens/coach/training/PlanProcessingScreen';
import TrainingPlanDetails from '../screens/coach/training/TrainingPlanDetails';
import DocumentViewer from '../screens/shared/DocumentViewer';
import DocumentLibrary from '../screens/shared/DocumentLibrary';
import IntegratedDocumentManager from '../screens/shared/IntegratedDocumentManager';
import SessionBuilder from '../screens/coach/SessionBuilder';
import PlayerList from '../screens/coach/PlayerList';
import PlayerProgress from '../screens/coach/PlayerProgress';
import ChatScreen from '../screens/shared/ChatScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import NewScreen from '../screens/shared/NewScreen';
import LoginScreen from '../screens/auth/LoginScreen';

// Dashboard & Analytics Screens (Comment out imports for unbuilt screens)
import PerformanceAnalytics from '../screens/coach/dashboard/PerformanceAnalytics';
import TeamOverview from '../screens/coach/dashboard/TeamOverview';
import UpcomingSessions from '../screens/coach/dashboard/UpcomingSessions';
import RecentActivity from '../screens/coach/dashboard/RecentActivity';
import AttendanceTracking from '../screens/coach/dashboard/AttendanceTracking';
import RevenueTracking from '../screens/coach/dashboard/RevenueTracking';
import WeatherIntegration from '../screens/coach/dashboard/WeatherIntegration';
import NotificationsCenter from '../screens/coach/dashboard/NotificationsCenter';
import QuickActions from '../screens/coach/dashboard/QuickActions';
import SessionScheduleScreen from '../screens/coach/training/SessionScheduleScreen';
// Training & Session Management Screens
import TrainingPlanLibrary from '../screens/coach/training/TrainingPlanLibrary';
import SessionTemplates from '../screens/coach/training/SessionTemplates';
import DrillLibrary from '../screens/coach/training/DrillLibrary';
import ExerciseDatabase from '../screens/coach/training/ExerciseDatabase';
import WorkoutGenerator from '../screens/coach/training/WorkoutGenerator';
import SessionScheduler from '../screens/coach/training/SessionScheduler';
import RecurringSessionSetup from '../screens/coach/training/RecurringSessionSetup';
import SessionHistory from '../screens/coach/training/SessionHistory';
import SessionFeedback from '../screens/coach/training/SessionFeedback';
import LiveSessionTracking from '../screens/coach/training/LiveSessionTracking';
import VideoAnalysis from '../screens/coach/training/VideoAnalysis';
import AssignmentManager from '../screens/coach/training/AssignmentManager';

// Player/Team Management Screens
import TeamRoster from '../screens/coach/players/TeamRoster';
import PlayerProfiles from '../screens/coach/players/PlayerProfiles';
import PlayerStats from '../screens/coach/players/PlayerStats';
import InjuryTracking from '../screens/coach/players/InjuryTracking';
import PlayerInvitations from '../screens/coach/players/PlayerInvitations';
import GroupManagement from '../screens/coach/players/GroupManagement';
import SkillAssessments from '../screens/coach/players/SkillAssessments';
import PlayerComparison from '../screens/coach/players/PlayerComparison';
import AttendanceReports from '../screens/coach/players/AttendanceReports';
import PlayerCommunication from '../screens/coach/players/PlayerCommunication';
import ParentCommunication from '../screens/coach/players/ParentCommunication';
import PlayerGoals from '../screens/coach/players/PlayerGoals';

// AI & Technology Screens
import AISettingsScreen from '../screens/settings/AISettingsScreen';
import AIWorkoutGenerator from '../screens/coach/ai/AIWorkoutGenerator';
import PerformancePrediction from '../screens/coach/ai/PerformancePrediction';
import PersonalizedPlans from '../screens/coach/ai/PersonalizedPlans';
import SmartRecommendations from '../screens/coach/ai/SmartRecommendations';
import AutoProgressTracking from '../screens/coach/ai/AutoProgressTracking';
import AICoachingAssistant from '../screens/coach/ai/AICoachingAssistant';
import MotionAnalysis from '../screens/coach/ai/MotionAnalysis';
import TechniqueFeedback from '../screens/coach/ai/TechniqueFeedback';

// Performance & Analytics Screens
import PerformanceDashboard from '../screens/coach/performance/PerformanceDashboard';
import ProgressTracking from '../screens/coach/performance/ProgressTracking';
import FitnessTests from '../screens/coach/performance/FitnessTests';
import BiometricData from '../screens/coach/performance/BiometricData';
import CompetitionResults from '../screens/coach/performance/CompetitionResults';
import SeasonReports from '../screens/coach/performance/SeasonReports';
import BenchmarkComparisons from '../screens/coach/performance/BenchmarkComparisons';
import PerformanceGoals from '../screens/coach/performance/PerformanceGoals';
//import DataExport from '../screens/coach/performance/DataExport';

// Communication & Collaboration Screens
import TeamChat from '../screens/coach/communication/TeamChat';
import AnnouncementCenter from '../screens/coach/communication/AnnouncementCenter';
import ParentPortal from '../screens/coach/communication/ParentPortal';
import FeedbackCollection from '../screens/coach/communication/FeedbackCollection';
import MeetingScheduler from '../screens/coach/communication/MeetingScheduler';
import MessageTemplates from '../screens/coach/communication/MessageTemplates';
import EmergencyContacts from '../screens/coach/communication/EmergencyContacts';
import NotificationSettings from '../screens/coach/communication/NotificationSettings';
import ChatListScreen from '../screens/shared/ChatListScreen';
import NewChatScreen from '../screens/shared/NewChatScreen';

// Business & Marketplace Screens
import ServicesListing from '../screens/coach/business/ServicesListing';
import SessionBookings from '../screens/coach/business/SessionBookings';
import PaymentManagement from '../screens/coach/business/PaymentManagement';
import ClientManagement from '../screens/coach/business/ClientManagement';
import MarketplaceProfile from '../screens/coach/business/MarketplaceProfile';
import ReviewsRatings from '../screens/coach/business/ReviewsRatings';
import EarningsReports from '../screens/coach/business/EarningsReports';
import PromotionalTools from '../screens/coach/business/PromotionalTools';
import SubscriptionPlans from '../screens/coach/business/SubscriptionPlans';
import DigitalContracts from '../screens/coach/business/DigitalContracts';

// Discovery & Network Screens
import CoachNetwork from '../screens/coach/discovery/CoachNetwork';
import CollaborationHub from '../screens/coach/discovery/CollaborationHub';
import ProfessionalEvents from '../screens/coach/discovery/ProfessionalEvents';
import CertificationTracker from '../screens/coach/discovery/CertificationTracker';
import ContinuingEducation from '../screens/coach/discovery/ContinuingEducation';
import MentorshipPrograms from '../screens/coach/discovery/MentorshipPrograms';
import ExpertConsultations from '../screens/coach/discovery/ExpertConsultations';
import ResearchDatabase from '../screens/coach/discovery/ResearchDatabase';

// Nutrition & Recovery Screens
import NutritionPlanning from '../screens/coach/wellness/NutritionPlanning';
import MealPlanGenerator from '../screens/coach/wellness/MealPlanGenerator';
import HydrationTracking from '../screens/coach/wellness/HydrationTracking';
import RecoveryProtocols from '../screens/coach/wellness/RecoveryProtocols';
import SleepMonitoring from '../screens/coach/wellness/SleepMonitoring';
import StressManagement from '../screens/coach/wellness/StressManagement';
import WellnessAssessments from '../screens/coach/wellness/WellnessAssessments';
import SupplementTracking from '../screens/coach/wellness/SupplementTracking';

// Content & Education Screens
import VideoLibrary from '../screens/coach/content/VideoLibrary';
import TutorialCreator from '../screens/coach/content/TutorialCreator';
import ResourceSharing from '../screens/coach/content/ResourceSharing';
import CourseBuilder from '../screens/coach/content/CourseBuilder';
import WebinarHosting from '../screens/coach/content/WebinarHosting';
import KnowledgeBase from '../screens/coach/content/KnowledgeBase';
import DigitalLibrary from '../screens/coach/content/DigitalLibrary';

// Profile & Settings Screens
import CoachProfile from '../screens/coach/profile/CoachProfile';
import Credentials from '../screens/coach/profile/Credentials';
import Specializations from '../screens/coach/profile/Specializations';
import ProfileSettings from '../screens/coach/profile/ProfileSettings';
import PrivacySettings from '../screens/coach/profile/PrivacySettings';
import AccountManagement from '../screens/coach/profile/AccountManagement';
import SupportCenter from '../screens/coach/profile/SupportCenter';
import BackupRestore from '../screens/coach/profile/BackupRestore';

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

// Define all placeholder components separately to avoid inline functions
const TrainingMainScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Training Hub Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const MedicalRecordsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Medical Records Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const ProgressReportsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Progress Reports Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const SearchCoachesScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Search Coaches Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const SearchAcademiesScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Sports Academies Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const OpenSessionsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Join Sessions Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const JobOpportunitiesScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Job Board Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const PaymentManagementScreenPlaceholder = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Payments Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const InvoiceManagementScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Invoices Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const TaxReportingScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Tax Reports Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const ExpenseTrackingScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Expenses Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const PricingStrategyScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Pricing Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const PackageDealsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Packages Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const AvailabilityManagerScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Availability Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const LeadGenerationScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Leads Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const MarketingCampaignsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Marketing Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const SocialMediaToolsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Social Media Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const ReferralProgramScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Referrals Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const BusinessAnalyticsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Analytics Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const ClientRetentionScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Retention Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const MarketTrendsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Market Trends Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const CompetitorAnalysisScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Competition Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const ExperienceScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Experience Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const AchievementsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Achievements Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const PortfolioScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Portfolio Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const TestimonialsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Testimonials Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const DataSyncSettingsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Data Sync Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const BillingInformationScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Billing Info Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const SubscriptionStatusScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Subscription Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const AccountSecurityScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Security Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const TutorialsGuidesScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Tutorials Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const FeatureRequestsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Feature Requests Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const BugReportsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Report Bugs Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const AppFeedbackScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Feedback Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const CommunityForumScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Community Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const SkillDevelopmentScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Skill Development Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const CareerGoalsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Career Goals Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

const NetworkingOpportunitiesScreen = () => (
  <View style={styles.placeholderScreen}>
    <Icon name="construction" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
    <Text style={styles.placeholderTitle}>Networking Coming Soon</Text>
    <Text style={styles.placeholderSubtext}>This feature is under development</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this amazing feature. Stay tuned for updates!
    </Text>
  </View>
);

// Dashboard Stack - Main hub with comprehensive analytics and quick actions
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CoachDashboard" 
      component={CoachDashboard} 
      options={{ 
        headerShown: false
      }} 
    />

    {/* Auth */}
    <Stack.Screen 
      name="LoginScreen" 
      component={LoginScreen}
      options={{ title: 'Log In' }} 
    />
    
    {/* Analytics & Overview */}
    <Stack.Screen 
      name="PerformanceAnalytics" 
      component={PerformanceAnalytics}
      options={{ title: 'Performance Analytics' }} 
    />
    <Stack.Screen 
      name="TeamOverview" 
      component={TeamOverview}
      options={{ title: 'Team Overview' }} 
    />
    <Stack.Screen 
      name="UpcomingSessions" 
      component={UpcomingSessions}
      options={{ title: 'Upcoming Sessions' }} 
    />
    <Stack.Screen 
      name="AISettings" 
      component={AISettingsScreen}
      options={{ title: 'AI Configuration' }}
    />
    <Stack.Screen 
      name="RecentActivity" 
      component={RecentActivity}
      options={{ title: 'Recent Activity' }} 
    />
    <Stack.Screen 
      name="AttendanceTracking" 
      component={AttendanceTracking}
      options={{ title: 'Attendance Tracking' }} 
    />
    <Stack.Screen 
      name="RevenueTracking" 
      component={RevenueTracking}
      options={{ title: 'Revenue Tracking' }} 
    />
    <Stack.Screen 
      name="WeatherIntegration" 
      component={WeatherIntegration}
      options={{ title: 'Weather & Conditions' }} 
    />
    <Stack.Screen 
      name="NotificationsCenter" 
      component={NotificationsCenter}
      options={{ title: 'Notifications' }} 
    />
    <Stack.Screen 
      name="QuickActions" 
      component={QuickActions}
      options={{ title: 'Quick Actions' }} 
    />
    <Stack.Screen 
      name="PlanProcessing" 
      component={PlanProcessingScreen} 
      options={{ 
        title: 'Processing Plan',
        headerShown: true,
        gestureEnabled: false,
      }} 
    />

    {/* Training Management */}
    <Stack.Screen 
      name="CreateTrainingPlan" 
      component={CreateTrainingPlan} 
      options={{ title: 'Create Training Plan' }} 
    />
    <Stack.Screen 
      name="SessionScheduleScreen" 
      component={SessionScheduleScreen}
      options={{ 
        title: 'Session Details',
        headerShown: false // Since the component has its own header
      }} 
    />
    <Stack.Screen 
      name="CoachingPlanUploadScreen" 
      component={CoachingPlanUploadScreen} 
      options={{ title: 'Upload Coaching Plan' }} 
    />
    <Stack.Screen 
      name="DocumentLibrary" 
      component={DocumentLibrary} 
      options={{ title: 'Document Library' }} 
    />
    <Stack.Screen 
      name="DocumentViewer" 
      component={DocumentViewer}
      options={({ route }) => ({ 
        title: route.params?.document?.originalName || 'Document',
        headerShown: false 
      })} 
    />
    <Stack.Screen 
        name="DocumentManager" 
        component={IntegratedDocumentManager} 
        options={{ 
          title: 'Training Documents',
          headerShown: true
        }} 
      />
    <Stack.Screen 
      name="SessionBuilder" 
      component={SessionBuilder} 
      options={{ title: 'Session Builder' }} 
    />
    <Stack.Screen 
      name="TrainingPlanLibrary" 
      component={TrainingPlanLibrary}
      options={{ title: 'Training Plan Library' }} 
    />
    <Stack.Screen 
      name="TrainingPlanDetails" 
      component={TrainingPlanDetails}
      options={{ 
        title: 'Training Plan',
        headerShown: false // The component has its own header
      }} 
    />
    <Stack.Screen 
      name="SessionTemplates" 
      component={SessionTemplates}
      options={{ title: 'Session Templates' }} 
    />
    <Stack.Screen 
      name="LiveSessionTracking" 
      component={LiveSessionTracking}
      options={{ title: 'Live Session Tracking' }} 
    />

    {/* Player Management */}
    <Stack.Screen 
      name="PlayerList" 
      component={PlayerList} 
      options={{ title: 'My Players' }} 
    />
    <Stack.Screen 
      name="PlayerProgress" 
      component={PlayerProgress} 
      options={{ title: 'Player Progress' }} 
    />
    <Stack.Screen 
      name="TeamRoster" 
      component={TeamRoster}
      options={{ title: 'Team Roster' }} 
    />
    <Stack.Screen 
      name="InjuryTracking" 
      component={InjuryTracking}
      options={{ title: 'Injury Tracking' }} 
    />

    {/* Communication */}
    <Stack.Screen 
      name="TeamChat" 
      component={ChatScreen}
      options={{ title: 'Team Chat' }} 
    />
    <Stack.Screen 
      name="ParentPortal" 
      component={ParentPortal}
      options={{ title: 'Parent Portal' }} 
    />
    <Stack.Screen 
      name="AnnouncementCenter" 
      component={AnnouncementCenter}
      options={{ title: 'Announcements' }} 
    />
    <Stack.Screen 
      name="ChatList" 
      component={ChatListScreen}
      options={{ title: "Messages" }}
    />
    <Stack.Screen 
      name="NewChat" 
      component={NewChatScreen}
      options={{ title: "New Chat" }}
    />
    <Stack.Screen 
      name="Chat" 
      component={ChatScreen}
      options={({ route }) => ({ title: route.params.chatName })}
    />

    {/* AI Features */}
    <Stack.Screen 
      name="AIWorkoutGenerator" 
      component={AIWorkoutGenerator}
      options={{ title: 'AI Workout Generator' }} 
    />
    <Stack.Screen 
      name="PersonalizedPlans" 
      component={PersonalizedPlans}
      options={{ title: 'Personalized Plans' }} 
    />
    <Stack.Screen 
      name="SmartRecommendations" 
      component={SmartRecommendations}
      options={{ title: 'Smart Recommendations' }} 
    />
  </Stack.Navigator>
);

// Training Stack - Comprehensive training and session management
const TrainingStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TrainingMain" 
      component={TrainingMainScreen}
      options={{ 
        title: 'Training Hub',
        headerShown: false 
      }} 
    />
    
    {/* Training Plan Management */}
    <Stack.Screen 
      name="CreateTrainingPlan" 
      component={CreateTrainingPlan} 
      options={{ title: 'Create Training Plan' }} 
    />
    <Stack.Screen 
      name="SessionScheduleScreen" 
      component={SessionScheduleScreen}
      options={{ 
        title: 'Session Details',
        headerShown: false // Since the component has its own header
      }} 
    />
    <Stack.Screen 
      name="CoachingPlanUploadScreen" 
      component={CoachingPlanUploadScreen} 
      options={{ title: 'Upload Coaching Plan' }} 
    />
    <Stack.Screen 
      name="SessionBuilder" 
      component={SessionBuilder}
      options={{ title: 'Session Builder' }} 
    />
    <Stack.Screen 
      name="AISettings" 
      component={AISettingsScreen}
      options={{ title: 'AI Configuration' }}
    />
    <Stack.Screen 
      name="DocumentLibrary" 
      component={DocumentLibrary} 
      options={{ title: 'Document Library' }} 
    />
    <Stack.Screen 
        name="DocumentViewer" 
        component={DocumentViewer}
        options={({ route }) => ({ 
          title: route.params?.document?.originalName || 'Document',
          headerShown: false // Since DocumentViewer has its own header
        })} 
      />
      <Stack.Screen 
        name="DocumentManager" 
        component={IntegratedDocumentManager} 
        options={{ 
          title: 'Training Documents',
          headerShown: true
        }} 
      />
    <Stack.Screen 
      name="TrainingPlanLibrary" 
      component={TrainingPlanLibrary}
      options={{ 
        title: 'Training Plan Library',
        headerShown: true
      }} 
    />
    <Stack.Screen 
        name="TrainingPlanDetails" 
        component={TrainingPlanDetails}
        options={{ 
          title: 'Training Plan',
          headerShown: false // The component has its own header
        }} 
      />
    <Stack.Screen 
      name="SessionTemplates" 
      component={SessionTemplates}
      options={{ title: 'Session Templates' }} 
    />
    <Stack.Screen 
      name="DrillLibrary" 
      component={DrillLibrary}
      options={{ title: 'Drill Library' }} 
    />
    <Stack.Screen 
      name="ExerciseDatabase" 
      component={ExerciseDatabase}
      options={{ title: 'Exercise Database' }} 
    />
    <Stack.Screen 
      name="WorkoutGenerator" 
      component={WorkoutGenerator}
      options={{ title: 'Workout Generator' }} 
    />
    
    {/* Session Management */}
    <Stack.Screen 
      name="SessionScheduler" 
      component={SessionScheduler}
      options={{ title: 'Session Scheduler' }} 
    />
    <Stack.Screen 
      name="RecurringSessionSetup" 
      component={RecurringSessionSetup}
      options={{ title: 'Recurring Sessions' }} 
    />
    <Stack.Screen 
      name="SessionHistory" 
      component={SessionHistory}
      options={{ title: 'Session History' }} 
    />
    <Stack.Screen 
      name="SessionFeedback" 
      component={SessionFeedback}
      options={{ title: 'Session Feedback' }} 
    />
    <Stack.Screen 
      name="LiveSessionTracking" 
      component={LiveSessionTracking}
      options={{ title: 'Live Session' }} 
    />
    <Stack.Screen 
      name="VideoAnalysis" 
      component={VideoAnalysis}
      options={{ title: 'Video Analysis' }} 
    />
    <Stack.Screen 
      name="AssignmentManager" 
      component={AssignmentManager}
      options={{ title: 'Assignments' }} 
    />
    <Stack.Screen 
      name="PlanProcessing" 
      component={PlanProcessingScreen} 
      options={{ 
        title: 'Processing Plan',
        headerShown: true,
        gestureEnabled: false, // Prevent gesture-based back navigation during processing
      }} 
    />
    
    {/* Performance & Analytics */}
    <Stack.Screen 
      name="PerformanceDashboard" 
      component={PerformanceDashboard}
      options={{ title: 'Performance Dashboard' }} 
    />
    <Stack.Screen 
      name="ProgressTracking" 
      component={ProgressTracking}
      options={{ title: 'Progress Tracking' }} 
    />
    <Stack.Screen 
      name="FitnessTests" 
      component={FitnessTests}
      options={{ title: 'Fitness Tests' }} 
    />
    <Stack.Screen 
      name="BiometricData" 
      component={BiometricData}
      options={{ title: 'Biometric Data' }} 
    />

    {/* Nutrition & Recovery */}
    <Stack.Screen 
      name="NutritionPlanning" 
      component={NutritionPlanning}
      options={{ title: 'Nutrition Planning' }} 
    />
    <Stack.Screen 
      name="MealPlanGenerator" 
      component={MealPlanGenerator}
      options={{ title: 'Meal Plans' }} 
    />
    <Stack.Screen 
      name="RecoveryProtocols" 
      component={RecoveryProtocols}
      options={{ title: 'Recovery Protocols' }} 
    />
    <Stack.Screen 
      name="WellnessAssessments" 
      component={WellnessAssessments}
      options={{ title: 'Wellness Assessments' }} 
    />

    {/* Content Creation */}
    <Stack.Screen 
      name="VideoLibrary" 
      component={VideoLibrary}
      options={{ title: 'Video Library' }} 
    />
    <Stack.Screen 
      name="TutorialCreator" 
      component={TutorialCreator}
      options={{ title: 'Tutorial Creator' }} 
    />
    <Stack.Screen 
      name="CourseBuilder" 
      component={CourseBuilder}
      options={{ title: 'Course Builder' }} 
    />
  </Stack.Navigator>
);

// Players Stack - Comprehensive player and team management
const PlayersStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="PlayerList" 
      component={PlayerList} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="PlayerProgress" 
      component={PlayerProgress} 
      options={{ title: 'Player Progress' }} 
    />
    
    {/* Team Management */}
    <Stack.Screen 
      name="TeamRoster" 
      component={TeamRoster}
      options={{ title: 'Team Roster' }} 
    />
    <Stack.Screen 
      name="GroupManagement" 
      component={GroupManagement}
      options={{ title: 'Manage Groups' }} 
    />
    <Stack.Screen 
      name="PlayerInvitations" 
      component={PlayerInvitations}
      options={{ title: 'Invite Players' }} 
    />
    
    {/* Player Profiles & Stats */}
    <Stack.Screen 
      name="PlayerProfiles" 
      component={PlayerProfiles}
      options={{ title: 'Player Profiles' }} 
    />
    <Stack.Screen 
      name="PlayerStats" 
      component={PlayerStats}
      options={{ title: 'Player Stats' }} 
    />
    <Stack.Screen 
      name="PlayerComparison" 
      component={PlayerComparison}
      options={{ title: 'Compare Players' }} 
    />
    <Stack.Screen 
      name="SkillAssessments" 
      component={SkillAssessments}
      options={{ title: 'Skill Assessments' }} 
    />
    <Stack.Screen 
      name="PlayerGoals" 
      component={PlayerGoals}
      options={{ title: 'Player Goals' }} 
    />
    
    {/* Health & Safety */}
    <Stack.Screen 
      name="InjuryTracking" 
      component={InjuryTracking}
      options={{ title: 'Injury Tracking' }} 
    />
    <Stack.Screen 
      name="MedicalRecords" 
      component={MedicalRecordsScreen}
      options={{ title: 'Medical Records' }} 
    />
    <Stack.Screen 
      name="EmergencyContacts" 
      component={EmergencyContacts}
      options={{ title: 'Emergency Contacts' }} 
    />
    
    {/* Attendance & Reports */}
    <Stack.Screen 
      name="AttendanceReports" 
      component={AttendanceReports}
      options={{ title: 'Attendance Reports' }} 
    />
    <Stack.Screen 
      name="ProgressReports" 
      component={ProgressReportsScreen}
      options={{ title: 'Progress Reports' }} 
    />
    <Stack.Screen 
      name="CompetitionResults" 
      component={CompetitionResults}
      options={{ title: 'Competition Results' }} 
    />
    
    {/* Communication */}
    <Stack.Screen 
      name="PlayerCommunication" 
      component={PlayerCommunication}
      options={{ title: 'Message Players' }} 
    />
    <Stack.Screen 
      name="ParentCommunication" 
      component={ParentCommunication}
      options={{ title: 'Message Parents' }} 
    />
    <Stack.Screen 
      name="TeamChat" 
      component={ChatScreen}
      options={{ title: 'Team Chat' }} 
    />
    <Stack.Screen 
      name="FeedbackCollection" 
      component={FeedbackCollection}
      options={{ title: 'Collect Feedback' }} 
    />
  </Stack.Navigator>
);

// Discovery Stack - Find and connect with coaches, academies, and opportunities
const DiscoveryStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="DiscoveryMain" 
      component={NewScreen}
      options={{ 
        title: 'Discover & Connect',
        headerShown: false 
      }} 
    />
    
    {/* Professional Network */}
    <Stack.Screen 
      name="CoachNetwork" 
      component={CoachNetwork}
      options={{ title: 'Coach Network' }} 
    />
    <Stack.Screen 
      name="SearchCoaches" 
      component={SearchCoachesScreen}
      options={{ title: 'Find Coaches' }} 
    />
    <Stack.Screen 
      name="SearchAcademies" 
      component={SearchAcademiesScreen}
      options={{ title: 'Sports Academies' }} 
    />
    <Stack.Screen 
      name="CollaborationHub" 
      component={CollaborationHub}
      options={{ title: 'Collaborations' }} 
    />
    <Stack.Screen 
      name="MentorshipPrograms" 
      component={MentorshipPrograms}
      options={{ title: 'Mentorship' }} 
    />
    
    {/* Opportunities & Events */}
    <Stack.Screen 
      name="OpenSessions" 
      component={OpenSessionsScreen}
      options={{ title: 'Join Sessions' }} 
    />
    <Stack.Screen 
      name="ProfessionalEvents" 
      component={ProfessionalEvents}
      options={{ title: 'Events & Workshops' }} 
    />
    <Stack.Screen 
      name="JobOpportunities" 
      component={JobOpportunitiesScreen}
      options={{ title: 'Job Board' }} 
    />
    <Stack.Screen 
      name="CertificationTracker" 
      component={CertificationTracker}
      options={{ title: 'Certifications' }} 
    />
    <Stack.Screen 
      name="ContinuingEducation" 
      component={ContinuingEducation}
      options={{ title: 'Education' }} 
    />
    
    {/* Business & Marketplace */}
    <Stack.Screen 
      name="ServicesListing" 
      component={ServicesListing}
      options={{ title: 'My Services' }} 
    />
    <Stack.Screen 
      name="ClientManagement" 
      component={ClientManagement}
      options={{ title: 'Client Management' }} 
    />
    <Stack.Screen 
      name="SessionBookings" 
      component={SessionBookings}
      options={{ title: 'Bookings' }} 
    />
    <Stack.Screen 
      name="MarketplaceProfile" 
      component={MarketplaceProfile}
      options={{ title: 'Marketplace Profile' }} 
    />
    <Stack.Screen 
      name="ReviewsRatings" 
      component={ReviewsRatings}
      options={{ title: 'Reviews' }} 
    />
    <Stack.Screen 
      name="PromotionalTools" 
      component={PromotionalTools}
      options={{ title: 'Promotions' }} 
    />
    
    {/* Resources & Learning */}
    <Stack.Screen 
      name="ResearchDatabase" 
      component={ResearchDatabase}
      options={{ title: 'Research' }} 
    />
    <Stack.Screen 
      name="ExpertConsultations" 
      component={ExpertConsultations}
      options={{ title: 'Consultations' }} 
    />
    <Stack.Screen 
      name="KnowledgeBase" 
      component={KnowledgeBase}
      options={{ title: 'Knowledge Base' }} 
    />
    <Stack.Screen 
      name="DigitalLibrary" 
      component={DigitalLibrary}
      options={{ title: 'Library' }} 
    />
    <Stack.Screen 
      name="WebinarHosting" 
      component={WebinarHosting}
      options={{ title: 'Host Webinars' }} 
    />
  </Stack.Navigator>
);

// Business Stack - Revenue, payments, and business management
const BusinessStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="BusinessMain" 
      component={ClientManagement}
      options={{ 
        title: 'Business Hub',
        headerShown: false 
      }} 
    />
    
    {/* Financial Management */}
    <Stack.Screen 
      name="PaymentManagement" 
      component={PaymentManagementScreenPlaceholder}
      options={{ title: 'Payments' }} 
    />
    <Stack.Screen 
      name="EarningsReports" 
      component={EarningsReports}
      options={{ title: 'Earnings' }} 
    />
    <Stack.Screen 
      name="RevenueTracking" 
      component={RevenueTracking}
      options={{ title: 'Revenue Tracking' }} 
    />
    <Stack.Screen 
      name="InvoiceManagement" 
      component={InvoiceManagementScreen}
      options={{ title: 'Invoices' }} 
    />
    <Stack.Screen 
      name="TaxReporting" 
      component={TaxReportingScreen}
      options={{ title: 'Tax Reports' }} 
    />
    <Stack.Screen 
      name="ExpenseTracking" 
      component={ExpenseTrackingScreen}
      options={{ title: 'Expenses' }} 
    />
    <Stack.Screen 
      name="SubscriptionPlans" 
      component={SubscriptionPlans}
      options={{ title: 'Subscriptions' }} 
    />
    <Stack.Screen 
      name="DigitalContracts" 
      component={DigitalContracts}
      options={{ title: 'Contracts' }} 
    />
    
    {/* Service Management */}
    <Stack.Screen 
      name="ServicesListing" 
      component={ServicesListing}
      options={{ title: 'My Services' }} 
    />
    <Stack.Screen 
      name="PricingStrategy" 
      component={PricingStrategyScreen}
      options={{ title: 'Pricing' }} 
    />
    <Stack.Screen 
      name="PackageDeals" 
      component={PackageDealsScreen}
      options={{ title: 'Packages' }} 
    />
    <Stack.Screen 
      name="SessionBookings" 
      component={SessionBookings}
      options={{ title: 'Bookings' }} 
    />
    <Stack.Screen 
      name="AvailabilityManager" 
      component={AvailabilityManagerScreen}
      options={{ title: 'Availability' }} 
    />
    
    {/* Client & Marketing */}
    <Stack.Screen 
      name="ClientManagement" 
      component={ClientManagement}
      options={{ title: 'Clients' }} 
    />
    <Stack.Screen 
      name="LeadGeneration" 
      component={LeadGenerationScreen}
      options={{ title: 'Leads' }} 
    />
    <Stack.Screen 
      name="MarketingCampaigns" 
      component={MarketingCampaignsScreen}
      options={{ title: 'Marketing' }} 
    />
    <Stack.Screen 
      name="SocialMediaTools" 
      component={SocialMediaToolsScreen}
      options={{ title: 'Social Media' }} 
    />
    <Stack.Screen 
      name="ReferralProgram" 
      component={ReferralProgramScreen}
      options={{ title: 'Referrals' }} 
    />
    <Stack.Screen 
      name="ReviewsRatings" 
      component={ReviewsRatings}
      options={{ title: 'Reviews' }} 
    />
    
    {/* Analytics & Insights */}
    <Stack.Screen 
      name="BusinessAnalytics" 
      component={BusinessAnalyticsScreen}
      options={{ title: 'Analytics' }} 
    />
    <Stack.Screen 
      name="ClientRetention" 
      component={ClientRetentionScreen}
      options={{ title: 'Retention' }} 
    />
    <Stack.Screen 
      name="MarketTrends" 
      component={MarketTrendsScreen}
      options={{ title: 'Market Trends' }} 
    />
    <Stack.Screen 
      name="CompetitorAnalysis" 
      component={CompetitorAnalysisScreen}
      options={{ title: 'Competition' }} 
    />
  </Stack.Navigator>
);

// Profile Stack - Coach profile, settings, and professional development
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CoachProfile" 
      component={ProfileScreen} 
      options={{ title: 'My Profile' }} 
    />
    
    {/* Professional Information */}
    <Stack.Screen 
      name="Credentials" 
      component={Credentials}
      options={{ title: 'Credentials' }} 
    />
    <Stack.Screen 
      name="Specializations" 
      component={Specializations}
      options={{ title: 'Specializations' }} 
    />
    <Stack.Screen 
      name="Experience" 
      component={ExperienceScreen}
      options={{ title: 'Experience' }} 
    />
    <Stack.Screen 
      name="Achievements" 
      component={AchievementsScreen}
      options={{ title: 'Achievements' }} 
    />
    <Stack.Screen 
      name="Portfolio" 
      component={PortfolioScreen}
      options={{ title: 'Portfolio' }} 
    />
    <Stack.Screen 
      name="Testimonials" 
      component={TestimonialsScreen}
      options={{ title: 'Testimonials' }} 
    />
    
    {/* Settings & Preferences */}
    <Stack.Screen 
      name="ProfileSettings" 
      component={ProfileSettings}
      options={{ title: 'Profile Settings' }} 
    />
    <Stack.Screen 
      name="PrivacySettings" 
      component={PrivacySettings}
      options={{ title: 'Privacy' }} 
    />
    <Stack.Screen 
      name="NotificationSettings" 
      component={NotificationSettings}
      options={{ title: 'Notifications' }} 
    />
    <Stack.Screen 
      name="DataSyncSettings" 
      component={DataSyncSettingsScreen}
      options={{ title: 'Data Sync' }} 
    />
    <Stack.Screen 
      name="BackupRestore" 
      component={BackupRestore}
      options={{ title: 'Backup & Restore' }} 
    />
    
    {/* Account Management */}
    <Stack.Screen 
      name="AccountManagement" 
      component={AccountManagement}
      options={{ title: 'Account' }} 
    />
    <Stack.Screen 
      name="BillingInformation" 
      component={BillingInformationScreen}
      options={{ title: 'Billing Info' }} 
    />
    <Stack.Screen 
      name="SubscriptionStatus" 
      component={SubscriptionStatusScreen}
      options={{ title: 'Subscription' }} 
    />
    <Stack.Screen 
      name="AccountSecurity" 
      component={AccountSecurityScreen}
      options={{ title: 'Security' }} 
    />
    
    {/* Support & Resources */}
    <Stack.Screen 
      name="SupportCenter" 
      component={SupportCenter}
      options={{ title: 'Support' }} 
    />
    <Stack.Screen 
      name="TutorialsGuides" 
      component={TutorialsGuidesScreen}
      options={{ title: 'Tutorials' }} 
    />
    <Stack.Screen 
      name="FeatureRequests" 
      component={FeatureRequestsScreen}
      options={{ title: 'Feature Requests' }} 
    />
    <Stack.Screen 
      name="BugReports" 
      component={BugReportsScreen}
      options={{ title: 'Report Bugs' }} 
    />
    <Stack.Screen 
      name="AppFeedback" 
      component={AppFeedbackScreen}
      options={{ title: 'Feedback' }} 
    />
    <Stack.Screen 
      name="CommunityForum" 
      component={CommunityForumScreen}
      options={{ title: 'Community' }} 
    />
    
    {/* Professional Development */}
    <Stack.Screen 
      name="CertificationTracker" 
      component={CertificationTracker}
      options={{ title: 'Certifications' }} 
    />
    <Stack.Screen 
      name="ContinuingEducation" 
      component={ContinuingEducation}
      options={{ title: 'Education' }} 
    />
    <Stack.Screen 
      name="SkillDevelopment" 
      component={SkillDevelopmentScreen}
      options={{ title: 'Skill Development' }} 
    />
    <Stack.Screen 
      name="CareerGoals" 
      component={CareerGoalsScreen}
      options={{ title: 'Career Goals' }} 
    />
    <Stack.Screen 
      name="NetworkingOpportunities" 
      component={NetworkingOpportunitiesScreen}
      options={{ title: 'Networking' }} 
    />
  </Stack.Navigator>
);

// Chat Stack
const ChatStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ChatList" 
      component={ChatListScreen}
      options={{ 
        headerShown: false // Since ChatListScreen has its own header
      }}
    />
    <Stack.Screen 
      name="Chat" 
      component={ChatScreen}
      options={({ route }) => ({ 
        title: route.params?.chatName || 'Chat',
        headerShown: true
      })}
    />
    <Stack.Screen 
      name="NewChat" 
      component={NewChatScreen}
      options={{ 
        title: 'New Chat',
        headerShown: true,
        presentation: 'modal'
      }}
    />
  </Stack.Navigator>
);

// Custom Plus Button Component for Discovery tab
const PlusButton = ({ focused }) => (
  <View style={[
    styles.plusButton, 
    { backgroundColor: focused ? COLORS.primary : COLORS.primary }
  ]}>
    <Icon 
      name="explore" 
      size={22} 
      color="#fff"
    />
  </View>
);

// Main Coach Navigator Component
const CoachNavigator = () => {
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
            case 'Players':
              iconName = 'group';
              break;
            case 'Discovery':
              // Return custom plus button
              return <PlusButton focused={focused} />;
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
        name="Training" 
        component={UpcomingSessions}
        options={{
          tabBarLabel: 'Training',
        }}
      />
      <Tab.Screen 
        name="Players" 
        component={PlayersStack}
        options={{
          tabBarLabel: 'Players',
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
        name="Messages" 
        component={ChatStack}
        options={{
          tabBarLabel: 'Chat',
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

export default CoachNavigator;