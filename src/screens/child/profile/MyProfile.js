import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
  RefreshControl,
  StatusBar,
  Vibration,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import {
  Card,
  Button,
  Avatar,
  IconButton,
  Surface,
  Chip,
  ProgressBar,
  Portal,
  Modal,
  FAB,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const MyProfile = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const scrollViewRef = useRef();
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // Mock profile data - in real app this would come from Redux/API
  const profileData = {
    displayName: user?.displayName || 'Young Champion',
    nickname: user?.nickname || 'Future Star',
    age: user?.age || '12',
    avatarColor: user?.avatarColor || '#667eea',
    sports: user?.sports || ['Football', 'Swimming', 'Tennis'],
    level: user?.level || 'Champion',
    totalPoints: user?.totalPoints || 1250,
    streak: user?.streak || 7,
    completedSessions: user?.completedSessions || 23,
    achievements: user?.achievements || 12,
    joinedDate: user?.joinedDate || '3 months ago',
    favoriteQuote: user?.favoriteQuote || 'Train hard, dream big! 🌟',
    goals: user?.goals || ['Get stronger 💪', 'Have fun 🎉', 'Make friends 👫'],
    recentBadges: user?.recentBadges || [
      { id: 1, name: 'First Goal!', icon: 'star', color: '#ffd700', date: '2 days ago' },
      { id: 2, name: 'Team Player', icon: 'group', color: '#4facfe', date: '1 week ago' },
      { id: 3, name: '7-Day Streak', icon: 'local-fire-department', color: '#f5576c', date: 'Today' },
    ],
  };

  const statsData = [
    { label: 'Training Sessions', value: profileData.completedSessions, icon: 'fitness-center', color: '#667eea' },
    { label: 'Current Streak', value: `${profileData.streak} days`, icon: 'local-fire-department', color: '#f5576c' },
    { label: 'Total Points', value: profileData.totalPoints, icon: 'stars', color: '#ffd700' },
    { label: 'Achievements', value: profileData.achievements, icon: 'jump-rope', color: '#43e97b' },
  ];

  const quickActions = [
    { id: 'edit', title: 'Edit Profile', icon: 'edit', color: '#667eea', route: 'EditProfile' },
    { id: 'goals', title: 'My Goals', icon: 'flag', color: '#43e97b', route: 'GoalsPreferences' },
    { id: 'achievements', title: 'Badges', icon: 'jump-rope', color: '#ffd700', action: () => setShowAchievementsModal(true) },
    { id: 'stats', title: 'Stats', icon: 'bar-chart', color: '#4facfe', action: () => setShowStatsModal(true) },
  ];

  const levelProgress = {
    current: 'Champion 🏆',
    next: 'Superstar ⭐',
    progress: 0.7, // 70% to next level
    pointsNeeded: 250,
  };

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce animation for achievements
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );
    bounceLoop.start();

    return () => bounceLoop.stop();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1500);
  }, []);

  const handleQuickAction = (action) => {
    Vibration.vibrate(25);
    
    if (action.route) {
      navigation.navigate(action.route);
    } else if (action.action) {
      action.action();
    }
  };

  const handleShareProfile = async () => {
    try {
      const shareData = {
        title: `${profileData.displayName}'s Training Profile! 🏆`,
        message: `Check out my training progress! I've completed ${profileData.completedSessions} sessions and earned ${profileData.achievements} badges! 🌟`,
      };
      
      await Share.share(shareData);
      Vibration.vibrate([25, 50, 25]);
    } catch (error) {
      Alert.alert(
        "📱 Sharing Not Available",
        "Ask your parent to help you share your awesome progress!",
        [{ text: "OK! 👍", onPress: () => Vibration.vibrate(25) }]
      );
    }
  };

  const handleLevelInfo = () => {
    Alert.alert(
      "🏆 Level Progress",
      `You're a ${levelProgress.current}! Complete ${levelProgress.pointsNeeded} more points to become a ${levelProgress.next}! Keep training! 💪`,
      [{ text: "Awesome! 🌟", onPress: () => Vibration.vibrate(25) }]
    );
  };

  const renderRecentBadge = (badge, index) => (
    <TouchableOpacity
      key={badge.id}
      style={styles.badgeItem}
      onPress={() => {
        Vibration.vibrate(25);
        Alert.alert(
          `🎉 ${badge.name}`,
          `Earned ${badge.date}! You're doing amazing!`,
          [{ text: "Thanks! 😊", onPress: () => Vibration.vibrate(25) }]
        );
      }}
    >
      <Surface style={[styles.badgeSurface, { backgroundColor: badge.color + '20' }]}>
        <Icon name={badge.icon} size={20} color={badge.color} />
      </Surface>
      <Text style={styles.badgeText} numberOfLines={1}>
        {badge.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with Profile Info */}
      <LinearGradient 
        colors={['#667eea', '#764ba2']} 
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.headerTop}>
            <IconButton
              icon="menu"
              size={24}
              iconColor="white"
              onPress={() => navigation.openDrawer?.() || navigation.goBack()}
            />
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>My Profile 👤</Text>
            </View>
            <IconButton
              icon="share"
              size={24}
              iconColor="white"
              onPress={handleShareProfile}
            />
          </View>

          {/* Avatar and Basic Info */}
          <View style={styles.profileSection}>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile')}
              style={styles.avatarContainer}
            >
              <Avatar.Text 
                size={100} 
                label={profileData.displayName?.charAt(0) || 'K'} 
                style={[styles.avatar, { backgroundColor: profileData.avatarColor }]}
              />
              <Surface style={styles.editBadge}>
                <Icon name="edit" size={16} color={COLORS.primary} />
              </Surface>
            </TouchableOpacity>
            
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>{profileData.displayName}</Text>
              <Text style={styles.nickname}>"{profileData.nickname}"</Text>
              <View style={styles.basicInfo}>
                <Chip style={styles.ageChip} textStyle={styles.chipText}>
                  Age {profileData.age} 🎂
                </Chip>
                <Chip style={styles.levelChip} textStyle={styles.chipText}>
                  {levelProgress.current}
                </Chip>
              </View>
            </View>
          </View>

          {/* Level Progress */}
          <TouchableOpacity onPress={handleLevelInfo} style={styles.levelProgress}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelText}>
                {Math.round(levelProgress.progress * 100)}% to {levelProgress.next}
              </Text>
              <Text style={styles.pointsNeeded}>
                {levelProgress.pointsNeeded} points to go! 🎯
              </Text>
            </View>
            <ProgressBar
              progress={levelProgress.progress}
              color="rgba(255,255,255,0.9)"
              style={styles.progressBar}
            />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>📊 My Amazing Stats</Text>
          
          <View style={styles.statsGrid}>
            {statsData.map((stat, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setShowStatsModal(true)}
                style={styles.statCard}
              >
                <Card style={styles.statCardInner}>
                  <LinearGradient
                    colors={[stat.color, stat.color + '99']}
                    style={styles.statGradient}
                  >
                    <Card.Content style={styles.statContent}>
                      <Icon name={stat.icon} size={28} color="white" />
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </Card.Content>
                  </LinearGradient>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Recent Achievements */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim, scale: bounceAnim }],
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Recent Badges</Text>
            <TouchableOpacity onPress={() => setShowAchievementsModal(true)}>
              <Text style={styles.seeAll}>See All ({profileData.achievements})</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
            {profileData.recentBadges.map((badge, index) => renderRecentBadge(badge, index))}
          </ScrollView>
        </Animated.View>

        {/* My Sports */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>⚽ My Sports</Text>
          
          <View style={styles.sportsContainer}>
            {profileData.sports.map((sport, index) => (
              <Chip
                key={index}
                style={styles.sportChip}
                textStyle={styles.sportChipText}
                icon="sports"
              >
                {sport}
              </Chip>
            ))}
          </View>
        </Animated.View>

        {/* My Goals */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 My Goals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GoalsPreferences')}>
              <Text style={styles.seeAll}>Edit Goals</Text>
            </TouchableOpacity>
          </View>
          
          <Card style={styles.goalsCard}>
            <Card.Content>
              {profileData.goals.map((goal, index) => (
                <View key={index} style={styles.goalItem}>
                  <Icon name="flag" size={20} color={COLORS.primary} />
                  <Text style={styles.goalText}>{goal}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Favorite Quote */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>💭 My Motto</Text>
          
          <Card style={styles.quoteCard}>
            <LinearGradient 
              colors={['#ffecd2', '#fcb69f']} 
              style={styles.quoteGradient}
            >
              <Card.Content style={styles.quoteContent}>
                <Icon name="format-quote" size={32} color="#ff6b35" />
                <Text style={styles.quoteText}>{profileData.favoriteQuote}</Text>
              </Card.Content>
            </LinearGradient>
          </Card>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => handleQuickAction(action)}
                style={styles.actionCard}
              >
                <Surface style={[styles.actionSurface, { backgroundColor: action.color + '20' }]}>
                  <Icon name={action.icon} size={32} color={action.color} />
                  <Text style={styles.actionText}>{action.title}</Text>
                </Surface>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Profile Info */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>ℹ️ Profile Info</Text>
          
          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.infoItem}>
                <Icon name="cake" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Joined</Text>
                <Text style={styles.infoValue}>{profileData.joinedDate}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Icon name="trending-up" size={20} color={COLORS.success} />
                <Text style={styles.infoLabel}>Progress</Text>
                <Text style={styles.infoValue}>Getting stronger every day! 💪</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Icon name="family-restroom" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Parent Control</Text>
                <Text style={styles.infoValue}>Protected & Safe 🛡️</Text>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="edit"
        style={styles.fab}
        onPress={() => navigation.navigate('EditProfile')}
        label="Edit"
      />

      {/* Stats Modal */}
      <Portal>
        <Modal
          visible={showStatsModal}
          onDismiss={() => setShowStatsModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.modalBlur}
            blurType="light"
            blurAmount={10}
          >
            <Card style={styles.modalCard}>
              <Card.Content style={styles.modalContent}>
                <Icon name="bar-chart" size={48} color={COLORS.primary} />
                <Text style={styles.modalTitle}>My Training Stats! 📊</Text>
                
                <View style={styles.statsModalGrid}>
                  {statsData.map((stat, index) => (
                    <View key={index} style={styles.statsModalItem}>
                      <Icon name={stat.icon} size={24} color={stat.color} />
                      <Text style={styles.statsModalValue}>{stat.value}</Text>
                      <Text style={styles.statsModalLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>
                
                <Text style={styles.statsModalDescription}>
                  🌟 You're doing amazing! Keep up the great work and watch your stats grow! 📈
                </Text>
                
                <Button
                  mode="contained"
                  onPress={() => setShowStatsModal(false)}
                  style={styles.modalButton}
                >
                  Awesome! 🚀
                </Button>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>

      {/* Achievements Modal */}
      <Portal>
        <Modal
          visible={showAchievementsModal}
          onDismiss={() => setShowAchievementsModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.modalBlur}
            blurType="light"
            blurAmount={10}
          >
            <Card style={styles.modalCard}>
              <Card.Content style={styles.modalContent}>
                <Icon name="jump-rope" size={48} color="#ffd700" />
                <Text style={styles.modalTitle}>My Badge Collection! 🏆</Text>
                
                <ScrollView style={styles.achievementsModalScroll}>
                  {profileData.recentBadges.map((badge, index) => (
                    <View key={badge.id} style={styles.achievementModalItem}>
                      <Surface style={[styles.achievementModalIcon, { backgroundColor: badge.color + '20' }]}>
                        <Icon name={badge.icon} size={32} color={badge.color} />
                      </Surface>
                      <View style={styles.achievementModalText}>
                        <Text style={styles.achievementModalName}>{badge.name}</Text>
                        <Text style={styles.achievementModalDate}>Earned {badge.date}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                
                <Text style={styles.achievementsModalDescription}>
                  🎉 You've earned {profileData.achievements} badges! Each one shows how awesome you are! 🌟
                </Text>
                
                <Button
                  mode="contained"
                  onPress={() => setShowAchievementsModal(false)}
                  style={styles.modalButton}
                >
                  Keep Earning! ⭐
                </Button>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    elevation: 3,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 15,
    padding: SPACING.xs,
    elevation: 3,
  },
  profileInfo: {
    alignItems: 'center',
  },
  displayName: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: '800',
    marginBottom: SPACING.xs / 2,
  },
  nickname: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  basicInfo: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  ageChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  levelChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chipText: {
    color: 'white',
    fontWeight: '600',
  },
  levelProgress: {
    width: '100%',
    alignItems: 'center',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.xs,
  },
  levelText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '600',
  },
  pointsNeeded: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginVertical: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: '600',
  },
  seeAll: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  statCardInner: {
    elevation: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 0,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: '800',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: SPACING.xs / 2,
  },
  badgesScroll: {
    marginBottom: SPACING.md,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    width: 80,
  },
  badgeSurface: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    marginBottom: SPACING.xs,
  },
  badgeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  sportChip: {
    backgroundColor: COLORS.primary + '20',
    marginBottom: SPACING.xs,
  },
  sportChipText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  goalsCard: {
    elevation: 2,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  goalText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
  },
  quoteCard: {
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quoteGradient: {
    padding: 0,
  },
  quoteContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  quoteText: {
    ...TEXT_STYLES.body,
    color: '#ff6b35',
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 22,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  actionSurface: {
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  actionText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  infoCard: {
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomPadding: {
    height: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    elevation: 5,
    maxHeight: '80%',
  },
  modalContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  modalButton: {
    borderRadius: 25,
    marginTop: SPACING.lg,
  },
  statsModalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: SPACING.lg,
    width: '100%',
  },
  statsModalItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statsModalValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: '800',
    marginTop: SPACING.xs,
  },
  statsModalLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs / 2,
  },
  statsModalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  achievementsModalScroll: {
    maxHeight: 300,
    width: '100%',
    marginVertical: SPACING.lg,
  },
  achievementModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  achievementModalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  achievementModalText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  achievementModalName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  achievementModalDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  achievementsModalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: SPACING.md,
  },
});

export default MyProfile;