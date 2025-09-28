import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const MyAcademy = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);

  // Redux state
  const user = useSelector(state => state.auth.user);
  const academy = useSelector(state => state.player.enrolledAcademy);
  const dispatch = useDispatch();

  // Mock data for demonstration
  const [academyData] = useState({
    id: 1,
    name: 'Elite Football Academy',
    logo: 'https://via.placeholder.com/100',
    sport: 'Football',
    location: 'Nairobi Sports Center',
    rating: 4.8,
    studentsCount: 156,
    coachesCount: 8,
    establishedYear: 2018,
    description: 'Premier football training academy focusing on developing young talents through structured programs and professional coaching.',
    achievements: [
      '🏆 2023 Regional Champions',
      '⭐ Top Rated Academy',
      '🎖️ 50+ Players to Professional Teams',
    ],
    facilities: [
      '⚽ 3 Professional Fields',
      '🏋️ Fully Equipped Gym',
      '🏥 Medical Center',
      '📹 Video Analysis Room',
    ],
  });

  const [playerProgress] = useState({
    overallProgress: 78,
    sessionsCompleted: 42,
    totalSessions: 60,
    currentLevel: 'Intermediate',
    nextLevel: 'Advanced',
    points: 2840,
    streak: 12,
    attendance: 92,
    performance: {
      technical: 85,
      physical: 72,
      tactical: 78,
      mental: 88,
    },
  });

  const [upcomingSessions] = useState([
    {
      id: 1,
      title: 'Ball Control & Dribbling',
      date: '2025-08-18',
      time: '16:00',
      coach: 'Coach Michael',
      type: 'Training',
      location: 'Field A',
    },
    {
      id: 2,
      title: 'Tactical Awareness',
      date: '2025-08-20',
      time: '17:30',
      coach: 'Coach Sarah',
      type: 'Theory',
      location: 'Classroom 1',
    },
    {
      id: 3,
      title: 'Friendly Match',
      date: '2025-08-22',
      time: '15:00',
      coach: 'Coach Michael',
      type: 'Match',
      location: 'Main Field',
    },
  ]);

  const [teammates] = useState([
    { id: 1, name: 'John Doe', avatar: 'https://via.placeholder.com/40', position: 'Forward', level: 'Advanced' },
    { id: 2, name: 'Mike Johnson', avatar: 'https://via.placeholder.com/40', position: 'Midfielder', level: 'Intermediate' },
    { id: 3, name: 'David Wilson', avatar: 'https://via.placeholder.com/40', position: 'Defender', level: 'Intermediate' },
    { id: 4, name: 'Alex Brown', avatar: 'https://via.placeholder.com/40', position: 'Goalkeeper', level: 'Advanced' },
  ]);

  const [notifications] = useState([
    { id: 1, title: 'New Training Session Scheduled', message: 'Ball Control & Dribbling - Tomorrow 4:00 PM', time: '2h ago', unread: true },
    { id: 2, title: 'Performance Report Available', message: 'Your weekly progress report is ready', time: '1d ago', unread: true },
    { id: 3, title: 'Academy Announcement', message: 'New equipment has arrived!', time: '2d ago', unread: false },
  ]);

  // Effects
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Animate screen entrance
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing screen:', error);
        setLoading(false);
      }
    };

    initializeScreen();
  }, []);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Academy Data Updated! 📱',
        'Your academy information has been refreshed successfully.',
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleSessionPress = (session) => {
    Alert.alert(
      `${session.title} 📅`,
      `Date: ${session.date}\nTime: ${session.time}\nCoach: ${session.coach}\nLocation: ${session.location}`,
      [
        { text: 'View Details', onPress: () => navigation.navigate('SessionDetails', { sessionId: session.id }) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleTeammatePress = (teammate) => {
    Alert.alert(
      `${teammate.name} 👥`,
      `Position: ${teammate.position}\nLevel: ${teammate.level}`,
      [
        { text: 'View Profile', onPress: () => navigation.navigate('PlayerProfile', { playerId: teammate.id }) },
        { text: 'Send Message', onPress: () => navigation.navigate('Chat', { userId: teammate.id }) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleViewAllSessions = () => {
    navigation.navigate('TrainingSessions');
  };

  const handleViewProgress = () => {
    navigation.navigate('ProgressTracking');
  };

  const handleContactAcademy = () => {
    Alert.alert(
      'Contact Academy 📞',
      'How would you like to contact the academy?',
      [
        { text: 'Call', onPress: () => Alert.alert('Calling...', 'Feature coming soon!') },
        { text: 'Email', onPress: () => Alert.alert('Opening email...', 'Feature coming soon!') },
        { text: 'Message', onPress: () => navigation.navigate('Chat', { academyId: academyData.id }) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Render methods
  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>My Academy</Text>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotifications(true)}
          >
            <MaterialIcons name="notifications" size={24} color="#ffffff" />
            {notifications.filter(n => n.unread).length > 0 && (
              <Badge size={16} style={styles.notificationBadge}>
                {notifications.filter(n => n.unread).length}
              </Badge>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.academyInfo}>
          <Avatar.Image
            size={80}
            source={{ uri: academyData.logo }}
            style={styles.academyLogo}
          />
          <View style={styles.academyDetails}>
            <Text style={styles.academyName}>{academyData.name}</Text>
            <Text style={styles.academyLocation}>📍 {academyData.location}</Text>
            <View style={styles.academyStats}>
              <Text style={styles.academyStat}>⭐ {academyData.rating}</Text>
              <Text style={styles.academyStat}>👥 {academyData.studentsCount} Students</Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderProgressCard = () => (
    <Surface style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Your Progress 📈</Text>
        <TouchableOpacity onPress={handleViewProgress}>
          <Text style={styles.viewAllText}>View Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressStats}>
        <View style={styles.progressStat}>
          <Text style={styles.progressValue}>{playerProgress.overallProgress}%</Text>
          <Text style={styles.progressLabel}>Overall</Text>
        </View>
        <View style={styles.progressStat}>
          <Text style={styles.progressValue}>{playerProgress.streak}</Text>
          <Text style={styles.progressLabel}>🔥 Streak</Text>
        </View>
        <View style={styles.progressStat}>
          <Text style={styles.progressValue}>{playerProgress.points}</Text>
          <Text style={styles.progressLabel}>⭐ Points</Text>
        </View>
      </View>

      <ProgressBar
        progress={playerProgress.overallProgress / 100}
        color={COLORS.primary}
        style={styles.progressBar}
      />

      <Text style={styles.levelText}>
        Current Level: <Text style={styles.levelHighlight}>{playerProgress.currentLevel}</Text>
      </Text>
    </Surface>
  );

  const renderUpcomingSessions = () => (
    <Surface style={styles.sessionsCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Sessions 📅</Text>
        <TouchableOpacity onPress={handleViewAllSessions}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {upcomingSessions.slice(0, 3).map((session, index) => (
        <TouchableOpacity
          key={session.id}
          style={styles.sessionItem}
          onPress={() => handleSessionPress(session)}
        >
          <View style={styles.sessionIcon}>
            <MaterialIcons
              name={session.type === 'Training' ? 'sports-soccer' : session.type === 'Theory' ? 'school' : 'sports'}
              size={24}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>{session.title}</Text>
            <Text style={styles.sessionDetails}>
              {session.date} • {session.time} • {session.coach}
            </Text>
            <Text style={styles.sessionLocation}>📍 {session.location}</Text>
          </View>
          <Chip
            mode="outlined"
            style={styles.sessionChip}
            textStyle={styles.sessionChipText}
          >
            {session.type}
          </Chip>
        </TouchableOpacity>
      ))}
    </Surface>
  );

  const renderTeammates = () => (
    <Surface style={styles.teammatesCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Teammates 👥</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Teammates')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={teammates.slice(0, 4)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.teammateItem}
            onPress={() => handleTeammatePress(item)}
          >
            <Avatar.Image size={50} source={{ uri: item.avatar }} />
            <Text style={styles.teammateName}>{item.name.split(' ')[0]}</Text>
            <Text style={styles.teammatePosition}>{item.position}</Text>
            <Chip size="small" style={styles.levelChip}>
              {item.level}
            </Chip>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.teammatesList}
      />
    </Surface>
  );

  const renderAcademyFeatures = () => (
    <Surface style={styles.featuresCard}>
      <Text style={styles.sectionTitle}>Academy Features ⚡</Text>
      
      <View style={styles.featuresGrid}>
        <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate('DrillLibrary')}>
          <MaterialIcons name="sports-soccer" size={28} color={COLORS.primary} />
          <Text style={styles.featureText}>Drill Library</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate('VideoAnalysis')}>
          <MaterialIcons name="video-library" size={28} color={COLORS.primary} />
          <Text style={styles.featureText}>Video Analysis</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate('Nutrition')}>
          <MaterialIcons name="restaurant" size={28} color={COLORS.primary} />
          <Text style={styles.featureText}>Nutrition</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate('Performance')}>
          <MaterialIcons name="analytics" size={28} color={COLORS.primary} />
          <Text style={styles.featureText}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );

  const renderNotificationsModal = () => (
    showNotifications && (
      <BlurView
        style={styles.modalOverlay}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
      >
        <Surface style={styles.notificationsModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications 🔔</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowNotifications(false)}
            />
          </View>
          
          <ScrollView style={styles.notificationsList}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  notification.unread && styles.unreadNotification
                ]}
              >
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                {notification.unread && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Surface>
      </BlurView>
    )
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.loadingGradient}
        >
          <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
          <MaterialIcons name="school" size={60} color="#ffffff" />
          <Text style={styles.loadingText}>Loading Your Academy...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {renderHeader()}
        
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {renderProgressCard()}
            {renderUpcomingSessions()}
            {renderTeammates()}
            {renderAcademyFeatures()}
            
            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>

        <FAB
          icon="phone"
          label="Contact Academy"
          style={styles.fab}
          onPress={handleContactAcademy}
          color="#ffffff"
        />
      </Animated.View>

      {renderNotificationsModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TEXT_STYLES.h3,
    color: '#ffffff',
    marginTop: SPACING.md,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  notificationButton: {
    padding: SPACING.xs,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
  },
  academyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  academyLogo: {
    marginRight: SPACING.md,
  },
  academyDetails: {
    flex: 1,
  },
  academyName: {
    ...TEXT_STYLES.h2,
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  academyLocation: {
    ...TEXT_STYLES.body,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: SPACING.xs,
  },
  academyStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  academyStat: {
    ...TEXT_STYLES.caption,
    color: '#ffffff',
    opacity: 0.9,
    marginRight: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  progressCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    ...TEXT_STYLES.h3,
  },
  viewAllText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
  },
  progressLabel: {
    ...TEXT_STYLES.small,
    marginTop: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  levelText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
  },
  levelHighlight: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sessionsCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  sessionDetails: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  sessionLocation: {
    ...TEXT_STYLES.small,
    color: COLORS.primary,
  },
  sessionChip: {
    backgroundColor: `${COLORS.primary}15`,
  },
  sessionChipText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  teammatesCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  teammatesList: {
    paddingHorizontal: SPACING.xs,
  },
  teammateItem: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}08`,
    minWidth: 80,
  },
  teammateName: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  teammatePosition: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  levelChip: {
    marginTop: SPACING.xs,
    backgroundColor: COLORS.primary,
  },
  featuresCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  featureItem: {
    width: '48%',
    backgroundColor: `${COLORS.primary}08`,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  notificationsModal: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    borderRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
  },
  notificationsList: {
    padding: SPACING.md,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  unreadNotification: {
    backgroundColor: `${COLORS.primary}08`,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  notificationMessage: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  notificationTime: {
    ...TEXT_STYLES.small,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
    alignSelf: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
};

export default MyAcademy;