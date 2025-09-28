import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text,
  Image,
  FlatList,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TrainingBuddies = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, buddies, nearbyUsers, buddyRequests } = useSelector(state => state.trainee);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('myBuddies');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    distance: '10km',
    sport: 'all',
    level: 'all',
    availability: 'all',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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

    loadBuddiesData();
  }, []);

  const loadBuddiesData = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement API calls to fetch buddies data
      // dispatch(fetchMyBuddies());
      // dispatch(fetchNearbyUsers());
      // dispatch(fetchBuddyRequests());
    } catch (error) {
      Alert.alert('Error', 'Failed to load buddies data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBuddiesData();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadBuddiesData]);

  const handleSendBuddyRequest = useCallback((userId) => {
    Vibration.vibrate(50);
    // TODO: Implement buddy request functionality
    Alert.alert('Feature Coming Soon', 'Buddy requests are under development! 🤝');
  }, []);

  const handleAcceptRequest = useCallback((requestId) => {
    Vibration.vibrate(50);
    // TODO: Implement accept request functionality
    Alert.alert('Feature Coming Soon', 'Request management is under development! ✅');
  }, []);

  const handleStartWorkout = useCallback((buddyId) => {
    Vibration.vibrate(50);
    // TODO: Implement start workout with buddy functionality
    Alert.alert('Feature Coming Soon', 'Workout sessions with buddies coming soon! 💪');
  }, []);

  // Mock data - replace with real data from Redux store
  const mockMyBuddies = [
    {
      id: '1',
      name: 'Alex Thompson',
      avatar: 'https://via.placeholder.com/60',
      level: 15,
      sport: 'Running',
      distance: '2.5km away',
      lastActive: '2 hours ago',
      compatibility: 92,
      streak: 12,
      workouts: 145,
      status: 'online',
    },
    {
      id: '2',
      name: 'Maria Rodriguez',
      avatar: 'https://via.placeholder.com/60',
      level: 11,
      sport: 'Yoga',
      distance: '1.8km away',
      lastActive: '30 min ago',
      compatibility: 88,
      streak: 8,
      workouts: 89,
      status: 'online',
    },
    {
      id: '3',
      name: 'James Wilson',
      avatar: 'https://via.placeholder.com/60',
      level: 18,
      sport: 'Weightlifting',
      distance: '3.2km away',
      lastActive: '1 day ago',
      compatibility: 85,
      streak: 25,
      workouts: 203,
      status: 'offline',
    },
  ];

  const mockNearbyUsers = [
    {
      id: '4',
      name: 'Sophie Chen',
      avatar: 'https://via.placeholder.com/60',
      level: 13,
      sport: 'Swimming',
      distance: '800m away',
      compatibility: 89,
      bio: 'Morning swimmer looking for training partners!',
      commonGoals: ['Endurance', 'Weight Loss'],
    },
    {
      id: '5',
      name: 'David Park',
      avatar: 'https://via.placeholder.com/60',
      level: 9,
      sport: 'CrossFit',
      distance: '1.2km away',
      compatibility: 76,
      bio: 'CrossFit enthusiast, always up for a challenge!',
      commonGoals: ['Strength', 'Flexibility'],
    },
  ];

  const mockRequests = [
    {
      id: '6',
      name: 'Lisa Johnson',
      avatar: 'https://via.placeholder.com/60',
      level: 14,
      sport: 'Running',
      mutualBuddies: 2,
      message: 'Hey! I saw we have similar running goals. Want to be training buddies?',
    },
  ];

  const renderTabButton = (tab, title, icon, count = 0) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton,
      ]}
    >
      <View style={styles.tabButtonContent}>
        <Icon 
          name={icon} 
          size={20} 
          color={activeTab === tab ? COLORS.primary : COLORS.textSecondary} 
        />
        <Text style={[
          styles.tabButtonText,
          activeTab === tab && styles.activeTabButtonText,
        ]}>
          {title}
        </Text>
        {count > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMyBuddy = ({ item }) => (
    <Animated.View style={[styles.buddyContainer, { opacity: fadeAnim }]}>
      <Card style={styles.buddyCard}>
        <TouchableOpacity 
          onPress={() => setSelectedBuddy(item)}
          style={styles.buddyCardContent}
        >
          <View style={styles.buddyHeader}>
            <View style={styles.buddyAvatarContainer}>
              <Avatar.Image source={{ uri: item.avatar }} size={50} />
              <View style={[
                styles.statusIndicator,
                { backgroundColor: item.status === 'online' ? COLORS.success : COLORS.textSecondary }
              ]} />
            </View>
            
            <View style={styles.buddyInfo}>
              <View style={styles.buddyNameRow}>
                <Text style={styles.buddyName}>{item.name}</Text>
                <Chip 
                  style={styles.levelChip} 
                  textStyle={styles.levelChipText}
                  compact
                >
                  Lvl {item.level}
                </Chip>
              </View>
              
              <Text style={styles.buddySport}>{item.sport}</Text>
              <Text style={styles.buddyDistance}>{item.distance} • {item.lastActive}</Text>
            </View>

            <View style={styles.compatibilityContainer}>
              <Text style={styles.compatibilityText}>{item.compatibility}%</Text>
              <Text style={styles.compatibilityLabel}>Match</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.buddyStats}>
            <View style={styles.statItem}>
              <Icon name="local-fire-department" size={16} color={COLORS.error} />
              <Text style={styles.statText}>{item.streak} day streak</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="fitness-center" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>{item.workouts} workouts</Text>
            </View>
          </View>

          <View style={styles.buddyActions}>
            <Button
              mode="contained"
              onPress={() => handleStartWorkout(item.id)}
              style={styles.workoutButton}
              contentStyle={styles.workoutButtonContent}
              labelStyle={styles.workoutButtonLabel}
              disabled={item.status === 'offline'}
            >
              Start Workout
            </Button>
            <IconButton
              icon="chat"
              size={20}
              iconColor={COLORS.primary}
              style={styles.chatButton}
              onPress={() => Alert.alert('Feature Coming Soon', 'Chat functionality coming soon! 💬')}
            />
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderNearbyUser = ({ item }) => (
    <Animated.View style={[styles.nearbyUserContainer, { opacity: fadeAnim }]}>
      <Card style={styles.nearbyUserCard}>
        <View style={styles.nearbyUserContent}>
          <View style={styles.nearbyUserHeader}>
            <Avatar.Image source={{ uri: item.avatar }} size={45} />
            
            <View style={styles.nearbyUserInfo}>
              <View style={styles.nearbyUserNameRow}>
                <Text style={styles.nearbyUserName}>{item.name}</Text>
                <Chip 
                  style={styles.levelChip} 
                  textStyle={styles.levelChipText}
                  compact
                >
                  Lvl {item.level}
                </Chip>
              </View>
              
              <Text style={styles.nearbyUserSport}>{item.sport}</Text>
              <Text style={styles.nearbyUserDistance}>{item.distance}</Text>
            </View>

            <View style={styles.matchContainer}>
              <Text style={styles.matchText}>{item.compatibility}%</Text>
              <Text style={styles.matchLabel}>Match</Text>
            </View>
          </View>

          {item.bio && <Text style={styles.nearbyUserBio}>{item.bio}</Text>}

          {item.commonGoals && (
            <View style={styles.commonGoals}>
              <Text style={styles.commonGoalsLabel}>Common Goals:</Text>
              <View style={styles.goalsContainer}>
                {item.commonGoals.map((goal, index) => (
                  <Chip key={index} style={styles.goalChip} textStyle={styles.goalChipText} compact>
                    {goal}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          <Button
            mode="contained"
            onPress={() => handleSendBuddyRequest(item.id)}
            style={styles.connectButton}
            contentStyle={styles.connectButtonContent}
            labelStyle={styles.connectButtonLabel}
          >
            Send Buddy Request
          </Button>
        </View>
      </Card>
    </Animated.View>
  );

  const renderRequest = ({ item }) => (
    <Animated.View style={[styles.requestContainer, { opacity: fadeAnim }]}>
      <Card style={styles.requestCard}>
        <View style={styles.requestContent}>
          <View style={styles.requestHeader}>
            <Avatar.Image source={{ uri: item.avatar }} size={40} />
            
            <View style={styles.requestInfo}>
              <View style={styles.requestNameRow}>
                <Text style={styles.requestName}>{item.name}</Text>
                <Chip 
                  style={styles.levelChip} 
                  textStyle={styles.levelChipText}
                  compact
                >
                  Lvl {item.level}
                </Chip>
              </View>
              
              <Text style={styles.requestSport}>{item.sport}</Text>
              {item.mutualBuddies > 0 && (
                <Text style={styles.mutualBuddies}>
                  {item.mutualBuddies} mutual training buddies
                </Text>
              )}
            </View>
          </View>

          {item.message && (
            <Text style={styles.requestMessage}>"{item.message}"</Text>
          )}

          <View style={styles.requestActions}>
            <Button
              mode="contained"
              onPress={() => handleAcceptRequest(item.id)}
              style={styles.acceptButton}
              contentStyle={styles.requestButtonContent}
              labelStyle={styles.acceptButtonLabel}
            >
              Accept
            </Button>
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Feature Coming Soon', 'Request management coming soon! ❌')}
              style={styles.declineButton}
              contentStyle={styles.requestButtonContent}
              labelStyle={styles.declineButtonLabel}
            >
              Decline
            </Button>
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderMyBuddiesContent = () => (
    <FlatList
      data={mockMyBuddies}
      renderItem={renderMyBuddy}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No Training Buddies Yet</Text>
          <Text style={styles.emptySubtitle}>
            Find nearby users and send buddy requests to get started!
          </Text>
        </View>
      )}
    />
  );

  const renderFindBuddiesContent = () => (
    <View style={styles.findBuddiesContainer}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search by name, sport, or location..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
        <IconButton
          icon="tune"
          size={24}
          iconColor={COLORS.primary}
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        />
      </View>

      <FlatList
        data={mockNearbyUsers}
        renderItem={renderNearbyUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );

  const renderRequestsContent = () => (
    <FlatList
      data={mockRequests}
      renderItem={renderRequest}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📮</Text>
          <Text style={styles.emptyTitle}>No Pending Requests</Text>
          <Text style={styles.emptySubtitle}>
            Buddy requests will appear here when you receive them.
          </Text>
        </View>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Training Buddies 🤝</Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="notifications-none"
              size={24}
              iconColor={COLORS.white}
              onPress={() => Alert.alert('Feature Coming Soon', 'Notifications coming soon! 🔔')}
            />
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {renderTabButton('myBuddies', 'My Buddies', 'people', mockMyBuddies.length)}
          {renderTabButton('findBuddies', 'Find Buddies', 'person-search')}
          {renderTabButton('requests', 'Requests', 'person-add', mockRequests.length)}
        </ScrollView>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {activeTab === 'myBuddies' && renderMyBuddiesContent()}
        {activeTab === 'findBuddies' && renderFindBuddiesContent()}
        {activeTab === 'requests' && renderRequestsContent()}
      </Animated.View>

      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
            <Card style={styles.filtersCard}>
              <Card.Title
                title="Filter Buddies"
                titleStyle={styles.modalTitle}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="close"
                    onPress={() => setShowFilters(false)}
                  />
                )}
              />
              <Card.Content>
                <Text style={styles.comingSoonModalText}>
                  Advanced filtering options coming soon! 🔍
                </Text>
                <Text style={styles.comingSoonModalSubtext}>
                  Filter by distance, sport, skill level, and availability preferences.
                </Text>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  tabScrollContainer: {
    paddingHorizontal: SPACING.lg,
  },
  tabButton: {
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTabButton: {
    backgroundColor: COLORS.white,
  },
  tabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  tabButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    marginLeft: SPACING.xs,
    fontSize: 14,
  },
  activeTabButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  tabBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  tabBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    padding: SPACING.md,
  },
  buddyContainer: {
    marginBottom: SPACING.md,
  },
  buddyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
  },
  buddyCardContent: {
    padding: SPACING.md,
  },
  buddyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  buddyAvatarContainer: {
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  buddyInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  buddyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  buddyName: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  levelChip: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
    height: 22,
  },
  levelChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    fontSize: 11,
  },
  buddySport: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  buddyDistance: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  compatibilityContainer: {
    alignItems: 'center',
  },
  compatibilityText: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  compatibilityLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  buddyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  buddyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  workoutButtonContent: {
    paddingVertical: 4,
  },
  workoutButtonLabel: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  chatButton: {
    marginLeft: SPACING.sm,
  },
  findBuddiesContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  searchBar: {
    flex: 1,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterButton: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  nearbyUserContainer: {
    marginBottom: SPACING.md,
  },
  nearbyUserCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
  },
  nearbyUserContent: {
    padding: SPACING.md,
  },
  nearbyUserHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  nearbyUserInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  nearbyUserNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  nearbyUserName: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  nearbyUserSport: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  nearbyUserDistance: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  matchContainer: {
    alignItems: 'center',
  },
  matchText: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  matchLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  nearbyUserBio: {
    ...TEXT_STYLES.body,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  commonGoals: {
    marginBottom: SPACING.md,
  },
  commonGoalsLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  goalChip: {
    backgroundColor: COLORS.secondary,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  goalChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
  },
  connectButton: {
    backgroundColor: COLORS.primary,
  },
  connectButtonContent: {
    paddingVertical: 4,
  },
  connectButtonLabel: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  requestContainer: {
    marginBottom: SPACING.md,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  requestContent: {
    padding: SPACING.md,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  requestInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  requestNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  requestName: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  requestSport: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  mutualBuddies: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
  },
  requestMessage: {
    ...TEXT_STYLES.body,
    fontStyle: 'italic',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  requestActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.success,
  },
  declineButton: {
    flex: 1,
    borderColor: COLORS.error,
  },
  requestButtonContent: {
    paddingVertical: 4,
  },
  acceptButtonLabel: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  declineButtonLabel: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: screenHeight * 0.1,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: screenWidth * 0.9,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filtersCard: {
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
  },
  comingSoonModalText: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  comingSoonModalSubtext: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
};

export default TrainingBuddies;