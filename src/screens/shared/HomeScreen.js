import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Animated,
  TouchableOpacity,
  Modal,
  StatusBar,
  ImageBackground,
  Vibration,
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import { 
  Text,
  Card,
  Button,
  Surface,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Searchbar,
  Portal,
  FAB
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';
import { USER_TYPES, SESSION_STATUS } from '../../utils/constants';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [quickSearchVisible, setQuickSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTimeSlot, setCurrentTimeSlot] = useState('');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const { user } = useSelector(state => state.auth);
  const { trainingPlans, sessions } = useSelector(state => state.training);

  useEffect(() => {
    // Animate components on load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Update time slot
    updateTimeSlot();
    const interval = setInterval(updateTimeSlot, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateTimeSlot = () => {
    const hour = new Date().getHours();
    if (hour < 6) setCurrentTimeSlot('Late Night');
    else if (hour < 12) setCurrentTimeSlot('Morning');
    else if (hour < 17) setCurrentTimeSlot('Afternoon');
    else if (hour < 21) setCurrentTimeSlot('Evening');
    else setCurrentTimeSlot('Night');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greetings = {
      morning: ['Rise & Grind', 'Good Morning', 'Morning Champion'],
      afternoon: ['Keep Pushing', 'Good Afternoon', 'Stay Strong'],
      evening: ['Evening Warrior', 'Good Evening', 'Wind Down'],
      night: ['Late Night Hustle', 'Good Night', 'Rest Well']
    };
    
    let timeKey = 'morning';
    if (hour >= 12 && hour < 17) timeKey = 'afternoon';
    else if (hour >= 17 && hour < 21) timeKey = 'evening';
    else if (hour >= 21 || hour < 6) timeKey = 'night';
    
    const options = greetings[timeKey];
    return options[Math.floor(Math.random() * options.length)];
  };

  const todayStats = {
    scheduled: 3,
    completed: 2,
    remaining: 1,
    weekProgress: 0.75,
    totalWorkouts: 47,
    currentStreak: 12,
    caloriesBurned: 2450,
    activeMinutes: 145
  };

  const liveStats = [
    { 
      icon: 'local-fire-department', 
      label: 'Today', 
      value: `${todayStats.remaining}`, 
      subtitle: 'sessions left',
      color: '#FF6B6B',
      bgGradient: ['#FF6B6B', '#FF8E8E']
    },
    { 
      icon: 'trending-up', 
      label: 'Week', 
      value: `${Math.round(todayStats.weekProgress * 100)}%`, 
      subtitle: 'complete',
      color: '#4ECDC4',
      bgGradient: ['#4ECDC4', '#44B3AA']
    },
    { 
      icon: 'fitness-center', 
      label: 'Workouts', 
      value: todayStats.totalWorkouts.toString(), 
      subtitle: 'completed',
      color: '#45B7D1',
      bgGradient: ['#45B7D1', '#3A9BC1']
    },
    { 
      icon: 'whatshot', 
      label: 'Streak', 
      value: `${todayStats.currentStreak}`, 
      subtitle: 'days active',
      color: '#F39C12',
      bgGradient: ['#F39C12', '#E67E22']
    },
  ];

  const todaySessions = [
    {
      id: 1,
      title: 'HIIT Cardio Blast',
      time: '07:00 AM',
      duration: 30,
      status: SESSION_STATUS.COMPLETED,
      type: 'Cardio',
      intensity: 'High',
      coach: 'Sarah Connor',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100',
      completionRate: 100
    },
    {
      id: 2,
      title: 'Functional Strength',
      time: '02:00 PM',
      duration: 45,
      status: SESSION_STATUS.COMPLETED,
      type: 'Strength',
      intensity: 'Medium',
      coach: 'Mike Johnson',
      image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=100',
      completionRate: 90
    },
    {
      id: 3,
      title: 'Recovery Yoga Flow',
      time: '07:30 PM',
      duration: 25,
      status: SESSION_STATUS.PENDING,
      type: 'Recovery',
      intensity: 'Low',
      coach: 'Emma Davis',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100',
      completionRate: 0
    }
  ];

  const featuredPrograms = [
    {
      id: 1,
      title: '12-Week Elite Performance',
      subtitle: 'Advanced Football Training',
      progress: 0.65,
      nextSession: 'Tomorrow • 7:00 AM',
      coach: 'Coach Rodriguez',
      participants: 24,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
      category: 'Football',
      difficulty: 'Advanced',
      bgGradient: ['#667eea', '#764ba2']
    },
    {
      id: 2,
      title: 'Speed & Agility Master',
      subtitle: 'Pro Level Training',
      progress: 0.88,
      nextSession: 'Friday • 5:00 PM',
      coach: 'Coach Martinez',
      participants: 18,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
      category: 'Athletics',
      difficulty: 'Expert',
      bgGradient: ['#f093fb', '#f5576c']
    }
  ];

  const quickActions = [
    { icon: 'search', label: 'Find Coach', action: () => navigation.navigate('CoachSearch') },
    { icon: 'video-library', label: 'Tutorials', action: () => navigation.navigate('VideoLibrary') },
    { icon: 'assessment', label: 'Progress', action: () => navigation.navigate('Analytics') },
    { icon: 'group', label: 'Community', action: () => navigation.navigate('Community') }
  ];

  const menuOptions = [
    { icon: 'search', label: 'Search Everything', action: () => setQuickSearchVisible(true) },
    { icon: 'location-on', label: 'Find Nearby', action: () => navigation.navigate('NearbyScreen') },
    { icon: 'star', label: 'Favorites', action: () => navigation.navigate('FavoritesScreen') },
    { icon: 'history', label: 'Activity History', action: () => navigation.navigate('HistoryScreen') },
    { icon: 'help', label: 'Help & Support', action: () => navigation.navigate('SupportScreen') },
    { icon: 'settings', label: 'Settings', action: () => navigation.navigate('SettingsScreen') }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case SESSION_STATUS.COMPLETED:
        return '#4CAF50';
      case SESSION_STATUS.PENDING:
        return '#2196F3';
      case SESSION_STATUS.IN_PROGRESS:
        return '#FF9800';
      default:
        return COLORS.textSecondary;
    }
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return COLORS.primary;
    }
  };

  const isCoachOrTrainer = user?.userType === USER_TYPES.COACH || user?.userType === USER_TYPES.TRAINER;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  const renderQuickSearchModal = () => (
    <Portal>
      <Modal
        visible={quickSearchVisible}
        onDismiss={() => setQuickSearchVisible(false)}
        contentContainerStyle={styles.searchModal}>
        <BlurView intensity={90} style={styles.searchBlur}>
          <View style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>Quick Search</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setQuickSearchVisible(false)}
              />
            </View>
            <Searchbar
              placeholder="Search coaches, programs, exercises..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
              autoFocus
            />
            <View style={styles.quickSearchOptions}>
              {['Popular Coaches', 'Trending Programs', 'Quick Workouts', 'Nearby Gyms'].map((option) => (
                <Chip
                  key={option}
                  mode="outlined"
                  onPress={() => {/* Handle search */}}
                  style={styles.searchChip}>
                  {option}
                </Chip>
              ))}
            </View>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Custom Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }]
          }
        ]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}>
          
          <View style={styles.headerTop}>
            <View style={styles.appBranding}>
              <Text style={styles.appName}>acceilla</Text>
              <Text style={styles.tagline}>Train • Track • Transform</Text>
            </View>
            
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => setQuickSearchVisible(true)}>
                <Icon name="search" size={24} color="white" style={styles.headerIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                <Icon name="notifications" size={24} color="white" style={styles.headerIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Icon name="dots-vertical" size={24} color="white" style={styles.headerIcon} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerContent}>
            <Avatar.Image 
              size={60} 
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }}
              style={styles.userAvatar}
            />
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.firstName || 'Athlete'}! 🔥</Text>
              <Text style={styles.timeSlot}>{currentTimeSlot} • Ready to dominate?</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#667eea"
            colors={['#667eea', '#764ba2']}
          />
        }>

        {/* Live Stats Grid */}
        <Animated.View 
          style={[
            styles.statsSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
          <Text style={styles.sectionTitle}>Live Stats</Text>
          <View style={styles.statsGrid}>
            {liveStats.map((stat, index) => (
              <Animated.View key={index} style={styles.statCard}>
                <LinearGradient
                  colors={stat.bgGradient}
                  style={styles.statGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <Icon name={stat.icon} size={28} color="white" />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Today's Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Journey</Text>
            <Button mode="text" onPress={() => navigation.navigate('Sessions')}>
              View All
            </Button>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sessionsScroll}>
            {todaySessions.map((session, index) => (
              <Card key={session.id} style={styles.sessionCard}>
                <ImageBackground
                  source={{ uri: session.image }}
                  style={styles.sessionImage}
                  imageStyle={styles.sessionImageStyle}>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.sessionOverlay}>
                    
                    <View style={styles.sessionHeader}>
                      <Chip 
                        mode="flat"
                        textStyle={styles.intensityText}
                        style={[styles.intensityChip, { backgroundColor: getIntensityColor(session.intensity) }]}>
                        {session.intensity}
                      </Chip>
                      <Chip 
                        mode="flat"
                        textStyle={styles.statusText}
                        style={[styles.statusChip, { backgroundColor: getStatusColor(session.status) }]}>
                        {session.status === SESSION_STATUS.COMPLETED ? '✓' : session.status === SESSION_STATUS.PENDING ? '○' : '▶'}
                      </Chip>
                    </View>

                    <View style={styles.sessionContent}>
                      <Text style={styles.sessionTitle}>{session.title}</Text>
                      <Text style={styles.sessionCoach}>with {session.coach}</Text>
                      
                      <View style={styles.sessionDetails}>
                        <View style={styles.sessionDetailItem}>
                          <Icon name="schedule" size={16} color="white" />
                          <Text style={styles.sessionDetailText}>{session.time}</Text>
                        </View>
                        <View style={styles.sessionDetailItem}>
                          <Icon name="timer" size={16} color="white" />
                          <Text style={styles.sessionDetailText}>{session.duration}m</Text>
                        </View>
                      </View>

                      {session.status === SESSION_STATUS.COMPLETED && (
                        <View style={styles.completionContainer}>
                          <Text style={styles.completionText}>Completion: {session.completionRate}%</Text>
                          <ProgressBar 
                            progress={session.completionRate / 100} 
                            color="#4CAF50"
                            style={styles.completionBar}
                          />
                        </View>
                      )}

                      <Button
                        mode={session.status === SESSION_STATUS.PENDING ? "contained" : "outlined"}
                        buttonColor={session.status === SESSION_STATUS.PENDING ? "#667eea" : "transparent"}
                        textColor="white"
                        style={styles.sessionButton}
                        onPress={() => navigation.navigate('SessionDetails', { sessionId: session.id })}>
                        {session.status === SESSION_STATUS.PENDING ? 'Start Workout' : 'View Details'}
                      </Button>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Featured Programs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Programs</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.programsScroll}>
            {featuredPrograms.map((program) => (
              <Card key={program.id} style={styles.programCard}>
                <LinearGradient
                  colors={program.bgGradient}
                  style={styles.programGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  
                  <View style={styles.programHeader}>
                    <Chip 
                      mode="flat" 
                      textStyle={styles.categoryText}
                      style={styles.categoryChip}>
                      {program.category}
                    </Chip>
                    <Text style={styles.difficultyText}>{program.difficulty}</Text>
                  </View>

                  <Text style={styles.programTitle}>{program.title}</Text>
                  <Text style={styles.programSubtitle}>{program.subtitle}</Text>
                  
                  <View style={styles.programMeta}>
                    <Text style={styles.programCoach}>by {program.coach}</Text>
                    <View style={styles.programStats}>
                      <Text style={styles.programStat}>⭐ {program.rating}</Text>
                      <Text style={styles.programStat}>👥 {program.participants}</Text>
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <Text style={styles.progressLabel}>
                      {Math.round(program.progress * 100)}% Complete
                    </Text>
                    <ProgressBar 
                      progress={program.progress} 
                      color="rgba(255,255,255,0.9)"
                      style={styles.programProgress}
                    />
                  </View>

                  <Text style={styles.nextSession}>{program.nextSession}</Text>
                  
                  <Button
                    mode="contained"
                    buttonColor="rgba(255,255,255,0.2)"
                    textColor="white"
                    style={styles.programButton}
                    onPress={() => navigation.navigate('ProgramDetails', { programId: program.id })}>
                    Continue Training
                  </Button>
                </LinearGradient>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickActionCard}
                onPress={action.action}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.quickActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <Icon name={action.icon} size={32} color="white" />
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Spacer for FAB */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon={isCoachOrTrainer ? "add" : "fitness-center"}
        style={styles.fab}
        color="white"
        onPress={() => {
          if (isCoachOrTrainer) {
            navigation.navigate('CreateProgram');
          } else {
            navigation.navigate('QuickWorkout');
          }
        }}
      />

      {/* Menu Modal */}
      <Portal>
        <Modal
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          contentContainerStyle={styles.menuModal}>
          <BlurView intensity={90} style={styles.menuBlur}>
            <View style={styles.menuContainer}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Quick Menu</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setMenuVisible(false)}
                />
              </View>
              {menuOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuOption}
                  onPress={() => {
                    setMenuVisible(false);
                    option.action();
                  }}>
                  <Icon name={option.icon} size={24} color={COLORS.primary} />
                  <Text style={styles.menuOptionText}>{option.label}</Text>
                  <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </Modal>
      </Portal>

      {renderQuickSearchModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: StatusBar.currentHeight || 44,
  },
  headerGradient: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  appBranding: {
    flex: 1,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: SPACING.md,
    padding: SPACING.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    marginRight: SPACING.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  timeSlot: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
    paddingTop: 220, // Account for header height
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsSection: {
    marginBottom: SPACING.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
  },
  statCard: {
    width: (width - SPACING.lg * 3) / 2,
    height: 120,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statGradient: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  sessionsScroll: {
    paddingHorizontal: SPACING.lg,
  },
  sessionCard: {
    width: CARD_WIDTH,
    height: 280,
    marginRight: SPACING.md,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sessionImage: {
    flex: 1,
    borderRadius: 20,
  },
  sessionImageStyle: {
    borderRadius: 20,
  },
  sessionOverlay: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: 20,
    justifyContent: 'space-between',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityChip: {
    height: 24,
  },
  intensityText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  statusChip: {
    height: 24,
    minWidth: 24,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  sessionContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  sessionCoach: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.md,
  },
  sessionDetails: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  sessionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  sessionDetailText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 4,
  },
  completionContainer: {
    marginBottom: SPACING.md,
  },
  completionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  completionBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  sessionButton: {
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  programsScroll: {
    paddingHorizontal: SPACING.lg,
  },
  programCard: {
    width: CARD_WIDTH * 0.9,
    height: 300,
    marginRight: SPACING.md,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  programGradient: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: 20,
    justifyContent: 'space-between',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 24,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  difficultyText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  programTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  programSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.lg,
  },
  programMeta: {
    marginBottom: SPACING.md,
  },
  programCoach: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  programStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  programStat: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
    fontWeight: '600',
  },
  programProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  nextSession: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  programButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
  },
  quickActionCard: {
    width: (width - SPACING.lg * 3) / 2,
    height: 100,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickActionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
    elevation: 8,
  },
  // Modal Styles
  menuModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuBlur: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: height * 0.6,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  menuOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: SPACING.md,
    fontWeight: '500',
  },
  searchModal: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  searchBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  searchContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: SPACING.lg,
    maxHeight: height * 0.5,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  searchBar: {
    marginBottom: SPACING.lg,
    elevation: 0,
    backgroundColor: '#f8f9fa',
  },
  quickSearchOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  searchChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
});

export default HomeScreen;