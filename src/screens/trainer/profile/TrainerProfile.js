import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  Dimensions,
  TouchableOpacity,
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
  Portal,
  Modal,
  TextInput,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Design System Constants
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
  accent: '#FF6B35',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const TrainerProfile = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector(state => state.auth);
  const { trainerData, stats, clients } = useSelector(state => state.trainer);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editForm, setEditForm] = useState({
    bio: '',
    specializations: [],
    hourlyRate: '',
    experience: '',
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Mock data (replace with actual Redux state)
  const trainerProfile = {
    name: 'Alex Rodriguez',
    title: 'Certified Personal Trainer',
    avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    reviews: 127,
    experience: '5+ years',
    specializations: ['Weight Loss', 'Muscle Building', 'HIIT', 'Nutrition'],
    bio: 'Passionate fitness trainer with 5+ years of experience helping clients achieve their fitness goals. Specialized in weight training, cardiovascular fitness, and nutrition planning.',
    hourlyRate: 45,
    totalClients: 32,
    sessionsCompleted: 856,
    achievements: 12,
    level: 7,
    xp: 2850,
    nextLevelXp: 3000,
    streak: 15,
    location: 'Los Angeles, CA',
    certifications: ['NASM-CPT', 'ACSM', 'Nutrition Specialist'],
    availableSlots: 18,
  };

  const statsData = [
    { label: 'Active Clients', value: '32', icon: 'people', color: COLORS.primary },
    { label: 'Sessions This Month', value: '124', icon: 'fitness-center', color: COLORS.success },
    { label: 'Revenue This Month', value: '$2,480', icon: 'attach-money', color: COLORS.accent },
    { label: 'Avg Rating', value: '4.8⭐', icon: 'star', color: COLORS.warning },
  ];

  const recentClients = [
    { id: 1, name: 'Sarah Johnson', lastSession: '2 hours ago', progress: 85, avatar: 'SJ' },
    { id: 2, name: 'Mike Chen', lastSession: '1 day ago', progress: 72, avatar: 'MC' },
    { id: 3, name: 'Emma Davis', lastSession: '2 days ago', progress: 91, avatar: 'ED' },
    { id: 4, name: 'James Wilson', lastSession: '3 days ago', progress: 68, avatar: 'JW' },
  ];

  const achievements = [
    { id: 1, title: '100 Sessions', icon: 'military-tech', unlocked: true },
    { id: 2, title: 'Top Rated', icon: 'star', unlocked: true },
    { id: 3, title: 'Client Favorite', icon: 'favorite', unlocked: true },
    { id: 4, title: '1000 Sessions', icon: 'workspace-premium', unlocked: false },
  ];

  // Effects
  useEffect(() => {
    startAnimations();
    loadTrainerData();
  }, []);

  useEffect(() => {
    if (trainerData) {
      setEditForm({
        bio: trainerData.bio || '',
        specializations: trainerData.specializations || [],
        hourlyRate: trainerData.hourlyRate?.toString() || '',
        experience: trainerData.experience || '',
      });
    }
  }, [trainerData]);

  // Animation functions
  const startAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Data loading functions
  const loadTrainerData = useCallback(async () => {
    try {
      // Replace with actual API call
      // dispatch(fetchTrainerProfile());
      // dispatch(fetchTrainerStats());
      console.log('Loading trainer data...');
    } catch (error) {
      console.error('Error loading trainer data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    try {
      await loadTrainerData();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadTrainerData]);

  // Handler functions
  const handleEditProfile = () => {
    Vibration.vibrate(50);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      // Validation
      if (!editForm.bio.trim()) {
        Alert.alert('Error', 'Bio is required');
        return;
      }
      if (!editForm.hourlyRate || isNaN(editForm.hourlyRate)) {
        Alert.alert('Error', 'Please enter a valid hourly rate');
        return;
      }

      // Save profile
      // dispatch(updateTrainerProfile(editForm));
      setShowEditModal(false);
      Vibration.vibrate(50);
      Alert.alert('Success', 'Profile updated successfully! 🎉');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    }
  };

  const handleViewSchedule = () => {
    Vibration.vibrate(50);
    navigation.navigate('TrainerSchedule');
  };

  const handleViewClients = () => {
    Vibration.vibrate(50);
    navigation.navigate('ClientManagement');
  };

  const handleViewAnalytics = () => {
    Vibration.vibrate(50);
    navigation.navigate('TrainerAnalytics');
  };

  const handleSettings = () => {
    Vibration.vibrate(50);
    navigation.navigate('TrainerSettings');
  };

  const addSpecialization = (specialization) => {
    if (!editForm.specializations.includes(specialization) && specialization.trim()) {
      setEditForm(prev => ({
        ...prev,
        specializations: [...prev.specializations, specialization.trim()]
      }));
    }
  };

  const removeSpecialization = (specialization) => {
    setEditForm(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== specialization)
    }));
  };

  // Render functions
  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Animated.View
        style={[
          styles.headerContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.profileSection}>
          <Avatar.Image
            size={80}
            source={{ uri: trainerProfile.avatar }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              {trainerProfile.name}
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
              {trainerProfile.title}
            </Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: 4 }]}>
                {trainerProfile.rating} ({trainerProfile.reviews} reviews)
              </Text>
            </View>
          </View>
          <IconButton
            icon="edit"
            iconColor="white"
            size={24}
            onPress={handleEditProfile}
            style={styles.editButton}
          />
        </View>

        <View style={styles.levelSection}>
          <View style={styles.levelInfo}>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
              Level {trainerProfile.level} Trainer
            </Text>
            <Text style={[TEXT_STYLES.small, { color: 'rgba(255,255,255,0.7)' }]}>
              {trainerProfile.xp}/{trainerProfile.nextLevelXp} XP
            </Text>
          </View>
          <ProgressBar
            progress={trainerProfile.xp / trainerProfile.nextLevelXp}
            color="rgba(255,255,255,0.9)"
            style={styles.progressBar}
          />
        </View>

        <View style={styles.streakContainer}>
          <Icon name="local-fire-department" size={20} color="#FF6B35" />
          <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: 4 }]}>
            {trainerProfile.streak} day streak! 🔥
          </Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {['overview', 'clients', 'schedule', 'analytics'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tabItem,
            activeTab === tab && styles.activeTab,
          ]}
          onPress={() => {
            setActiveTab(tab);
            Vibration.vibrate(30);
          }}
        >
          <Icon
            name={
              tab === 'overview' ? 'dashboard' :
              tab === 'clients' ? 'people' :
              tab === 'schedule' ? 'schedule' : 'analytics'
            }
            size={20}
            color={activeTab === tab ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              TEXT_STYLES.caption,
              activeTab === tab && { color: COLORS.primary, fontWeight: '600' },
            ]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatsCards = () => (
    <Animated.View
      style={[
        styles.statsContainer,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {statsData.map((stat, index) => (
        <Surface key={index} style={styles.statCard} elevation={2}>
          <Icon name={stat.icon} size={24} color={stat.color} />
          <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.xs }]}>
            {stat.value}
          </Text>
          <Text style={TEXT_STYLES.caption}>{stat.label}</Text>
        </Surface>
      ))}
    </Animated.View>
  );

  const renderSpecializations = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          Specializations
        </Text>
        <View style={styles.chipContainer}>
          {trainerProfile.specializations.map((spec, index) => (
            <Chip
              key={index}
              mode="outlined"
              style={[styles.chip, { borderColor: COLORS.primary }]}
              textStyle={{ color: COLORS.primary }}
            >
              {spec}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderRecentClients = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={TEXT_STYLES.h3}>Recent Clients</Text>
          <Button
            mode="text"
            onPress={handleViewClients}
            textColor={COLORS.primary}
          >
            View All
          </Button>
        </View>
        {recentClients.map((client) => (
          <View key={client.id} style={styles.clientItem}>
            <Avatar.Text size={40} label={client.avatar} />
            <View style={styles.clientInfo}>
              <Text style={TEXT_STYLES.body}>{client.name}</Text>
              <Text style={TEXT_STYLES.caption}>{client.lastSession}</Text>
            </View>
            <View style={styles.progressContainer}>
              <Text style={TEXT_STYLES.caption}>{client.progress}%</Text>
              <ProgressBar
                progress={client.progress / 100}
                color={COLORS.success}
                style={styles.clientProgress}
              />
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          Achievements 🏆
        </Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <Surface
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.lockedAchievement,
              ]}
              elevation={1}
            >
              <Icon
                name={achievement.icon}
                size={32}
                color={achievement.unlocked ? COLORS.warning : COLORS.textSecondary}
              />
              <Text
                style={[
                  TEXT_STYLES.caption,
                  { textAlign: 'center', marginTop: SPACING.xs },
                  !achievement.unlocked && { color: COLORS.textSecondary },
                ]}
              >
                {achievement.title}
              </Text>
            </Surface>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickAction} onPress={handleViewSchedule}>
            <Icon name="schedule" size={32} color={COLORS.primary} />
            <Text style={TEXT_STYLES.caption}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleViewClients}>
            <Icon name="people" size={32} color={COLORS.success} />
            <Text style={TEXT_STYLES.caption}>Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleViewAnalytics}>
            <Icon name="analytics" size={32} color={COLORS.accent} />
            <Text style={TEXT_STYLES.caption}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleSettings}>
            <Icon name="settings" size={32} color={COLORS.warning} />
            <Text style={TEXT_STYLES.caption}>Settings</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEditModal = () => (
    <Portal>
      <Modal
        visible={showEditModal}
        onDismiss={() => setShowEditModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={10}
        />
        <Card style={styles.modalCard}>
          <Card.Title title="Edit Profile" />
          <Card.Content>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                label="Bio"
                value={editForm.bio}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.textInput}
              />
              
              <TextInput
                label="Hourly Rate ($)"
                value={editForm.hourlyRate}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, hourlyRate: text }))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.textInput}
              />
              
              <TextInput
                label="Years of Experience"
                value={editForm.experience}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, experience: text }))}
                mode="outlined"
                style={styles.textInput}
              />
              
              <Text style={[TEXT_STYLES.body, { marginTop: SPACING.md, marginBottom: SPACING.sm }]}>
                Specializations
              </Text>
              <View style={styles.chipContainer}>
                {editForm.specializations.map((spec, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    onClose={() => removeSpecialization(spec)}
                    style={styles.chip}
                  >
                    {spec}
                  </Chip>
                ))}
              </View>
              
              <Searchbar
                placeholder="Add specialization..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => {
                  if (searchQuery.trim()) {
                    addSpecialization(searchQuery);
                    setSearchQuery('');
                  }
                }}
                style={styles.searchBar}
              />
            </ScrollView>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => setShowEditModal(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSaveProfile}>
              Save Changes
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {renderStatsCards()}
            {renderSpecializations()}
            {renderRecentClients()}
            {renderAchievements()}
            {renderQuickActions()}
          </>
        );
      case 'clients':
        return (
          <Card style={styles.card}>
            <Card.Content style={styles.placeholderContainer}>
              <Icon name="construction" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginTop: SPACING.md }]}>
                Clients Management
              </Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
                Feature Coming Soon! 🚧
              </Text>
            </Card.Content>
          </Card>
        );
      case 'schedule':
        return (
          <Card style={styles.card}>
            <Card.Content style={styles.placeholderContainer}>
              <Icon name="construction" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginTop: SPACING.md }]}>
                Schedule Management
              </Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
                Feature Coming Soon! 🚧
              </Text>
            </Card.Content>
          </Card>
        );
      case 'analytics':
        return (
          <Card style={styles.card}>
            <Card.Content style={styles.placeholderContainer}>
              <Icon name="construction" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginTop: SPACING.md }]}>
                Performance Analytics
              </Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
                Feature Coming Soon! 🚧
              </Text>
            </Card.Content>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabBar()}
      <ScrollView
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
        {renderTabContent()}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <FAB
        icon="add"
        style={styles.fab}
        color="white"
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            'Quick Add',
            'What would you like to add?',
            [
              { text: 'New Client', onPress: () => navigation.navigate('AddClient') },
              { text: 'Training Session', onPress: () => navigation.navigate('AddSession') },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      />
      
      {renderEditModal()}
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  levelSection: {
    marginBottom: SPACING.md,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: (width - SPACING.md * 3) / 2,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderRadius: 12,
  },
  card: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  clientInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  progressContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  clientProgress: {
    width: 60,
    marginTop: SPACING.xs,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: (width - SPACING.md * 4) / 3,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderRadius: 8,
  },
  lockedAchievement: {
    opacity: 0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - SPACING.md * 4) / 3,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.accent,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 12,
  },
  textInput: {
    marginBottom: SPACING.md,
  },
  searchBar: {
    marginTop: SPACING.sm,
    elevation: 0,
  },
  bottomPadding: {
    height: 100,
  },
});

export default TrainerProfile;