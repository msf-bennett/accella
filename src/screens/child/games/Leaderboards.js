import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
  Vibration,
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
  Portal,
  Modal,
  Badge,
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const Leaderboards = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState('global');
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const globalLeaderboard = [
    { 
      id: 1, 
      name: 'Alex Champion', 
      points: 3450, 
      level: 18, 
      avatar: 'AC', 
      position: 1,
      streak: 25,
      location: 'New York',
      badges: 45,
      weeklyGain: '+150',
      specialty: 'Soccer',
      status: 'online'
    },
    { 
      id: 2, 
      name: 'Maya Swift', 
      points: 3200, 
      level: 16, 
      avatar: 'MS', 
      position: 2,
      streak: 18,
      location: 'California',
      badges: 38,
      weeklyGain: '+120',
      specialty: 'Basketball',
      status: 'online'
    },
    { 
      id: 3, 
      name: 'Jake Thunder', 
      points: 2950, 
      level: 15, 
      avatar: 'JT', 
      position: 3,
      streak: 22,
      location: 'Texas',
      badges: 41,
      weeklyGain: '+95',
      specialty: 'Football',
      status: 'offline'
    },
    { 
      id: 4, 
      name: 'Emma Flash', 
      points: 2800, 
      level: 14, 
      avatar: 'EF', 
      position: 4,
      streak: 12,
      location: 'Florida',
      badges: 32,
      weeklyGain: '+88',
      specialty: 'Track & Field',
      status: 'online'
    },
    { 
      id: 5, 
      name: user?.name || 'You', 
      points: 2650, 
      level: 13, 
      avatar: user?.name?.charAt(0) || 'Y', 
      position: 5,
      isCurrentUser: true,
      streak: 15,
      location: 'Your City',
      badges: 28,
      weeklyGain: '+75',
      specialty: 'Multi-Sport',
      status: 'online'
    },
    { 
      id: 6, 
      name: 'Sam Lightning', 
      points: 2500, 
      level: 12, 
      avatar: 'SL', 
      position: 6,
      streak: 8,
      location: 'Chicago',
      badges: 25,
      weeklyGain: '+65',
      specialty: 'Swimming',
      status: 'online'
    },
    { 
      id: 7, 
      name: 'Zoe Power', 
      points: 2350, 
      level: 12, 
      avatar: 'ZP', 
      position: 7,
      streak: 20,
      location: 'Seattle',
      badges: 30,
      weeklyGain: '+58',
      specialty: 'Gymnastics',
      status: 'offline'
    },
    { 
      id: 8, 
      name: 'Ryan Storm', 
      points: 2200, 
      level: 11, 
      avatar: 'RS', 
      position: 8,
      streak: 5,
      location: 'Denver',
      badges: 22,
      weeklyGain: '+42',
      specialty: 'Tennis',
      status: 'online'
    },
  ];

  const friendsLeaderboard = [
    globalLeaderboard[1], // Maya Swift
    globalLeaderboard[4], // You
    globalLeaderboard[5], // Sam Lightning
    { 
      id: 9, 
      name: 'Best Friend', 
      points: 2400, 
      level: 12, 
      avatar: 'BF', 
      position: 4,
      streak: 10,
      location: 'Your City',
      badges: 26,
      weeklyGain: '+60',
      specialty: 'Soccer',
      status: 'online',
      isFriend: true
    },
  ];

  const localLeaderboard = globalLeaderboard.filter(player => 
    player.location === 'Your City' || player.isCurrentUser
  );

  const leaderboardTypes = [
    { key: 'global', title: 'Global 🌍', icon: 'public', data: globalLeaderboard },
    { key: 'friends', title: 'Friends 👥', icon: 'people', data: friendsLeaderboard },
    { key: 'local', title: 'Local 📍', icon: 'location-on', data: localLeaderboard },
  ];

  const periods = [
    { key: 'daily', title: 'Today', icon: 'today' },
    { key: 'weekly', title: 'This Week', icon: 'date-range' },
    { key: 'monthly', title: 'This Month', icon: 'calendar-month' },
    { key: 'alltime', title: 'All Time', icon: 'timeline' },
  ];

  const getCurrentLeaderboard = () => {
    return leaderboardTypes.find(type => type.key === selectedLeaderboard)?.data || globalLeaderboard;
  };

  const filteredLeaderboard = getCurrentLeaderboard().filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayerPress = (player) => {
    Vibration.vibrate(10);
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  const sendCheerMessage = () => {
    Alert.alert(
      '🎉 Cheer Sent!',
      `You sent encouraging words to ${selectedPlayer?.name}! Spread the positivity! 💪`,
      [{ text: 'Awesome! 🌟', style: 'default' }]
    );
    setShowPlayerModal(false);
  };

  const challengePlayer = () => {
    Alert.alert(
      '🚀 Feature Coming Soon!',
      'Player challenges are being developed and will be available soon! Get ready for friendly competition!',
      [{ text: 'Can\'t wait! 🔥', style: 'default' }]
    );
    setShowPlayerModal(false);
  };

  const addFriend = () => {
    Alert.alert(
      '🚀 Feature Coming Soon!',
      'Friend system is being developed! Soon you\'ll be able to connect with other young athletes!',
      [{ text: 'Exciting! 🎊', style: 'default' }]
    );
    setShowPlayerModal(false);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
        <View style={{ flex: 1 }}>
          <Text style={[TEXT_STYLES.h1, { color: 'white', marginBottom: 4 }]}>
            🏆 Leaderboards
          </Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
            See how you stack up against other champions!
          </Text>
        </View>
        <IconButton
          icon="filter-list"
          iconColor="white"
          size={28}
          onPress={() => setShowFilters(!showFilters)}
        />
      </View>

      {/* Current User Highlight */}
      <Card style={styles.currentUserCard}>
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar.Text
              size={50}
              label={user?.name?.charAt(0) || 'Y'}
              style={{ backgroundColor: COLORS.primary }}
            />
            <View style={{ marginLeft: SPACING.md, flex: 1 }}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                Your Ranking 📊
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                #{globalLeaderboard.find(p => p.isCurrentUser)?.position || 5} • {globalLeaderboard.find(p => p.isCurrentUser)?.points || 2650} points
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="trending-up" size={24} color={COLORS.success} />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>+75 this week</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </LinearGradient>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <Animated.View style={[styles.filtersContainer, { opacity: fadeAnim }]}>
        <View style={{ marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>Leaderboard Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {leaderboardTypes.map((type) => (
              <Chip
                key={type.key}
                selected={selectedLeaderboard === type.key}
                onPress={() => setSelectedLeaderboard(type.key)}
                style={{ marginRight: SPACING.sm }}
                selectedColor={COLORS.primary}
              >
                {type.title}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <View>
          <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>Time Period</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {periods.map((period) => (
              <Chip
                key={period.key}
                selected={selectedPeriod === period.key}
                onPress={() => setSelectedPeriod(period.key)}
                style={{ marginRight: SPACING.sm }}
                selectedColor={COLORS.secondary}
              >
                {period.title}
              </Chip>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    );
  };

  const renderTopThree = () => (
    <View style={styles.podiumContainer}>
      <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginBottom: SPACING.lg }]}>
        🥇 Hall of Fame 🥇
      </Text>
      
      <View style={styles.podium}>
        {/* Second Place */}
        {filteredLeaderboard[1] && (
          <TouchableOpacity 
            style={styles.podiumItem}
            onPress={() => handlePlayerPress(filteredLeaderboard[1])}
          >
            <Surface style={[styles.podiumRank, { backgroundColor: '#C0C0C0', height: 80 }]}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>2</Text>
            </Surface>
            <Avatar.Text
              size={60}
              label={filteredLeaderboard[1].avatar}
              style={{ backgroundColor: COLORS.secondary, marginTop: -30, marginBottom: 8 }}
            />
            <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', textAlign: 'center' }]}>
              {filteredLeaderboard[1].name}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, textAlign: 'center' }]}>
              {filteredLeaderboard[1].points} pts
            </Text>
          </TouchableOpacity>
        )}

        {/* First Place */}
        {filteredLeaderboard[0] && (
          <TouchableOpacity 
            style={styles.podiumItem}
            onPress={() => handlePlayerPress(filteredLeaderboard[0])}
          >
            <Surface style={[styles.podiumRank, { backgroundColor: '#FFD700', height: 100 }]}>
              <Icon name="star" size={32} color="white" />
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>1</Text>
            </Surface>
            <Avatar.Text
              size={70}
              label={filteredLeaderboard[0].avatar}
              style={{ backgroundColor: COLORS.primary, marginTop: -35, marginBottom: 8 }}
            />
            <Text style={[TEXT_STYLES.h4, { fontWeight: 'bold', textAlign: 'center' }]}>
              {filteredLeaderboard[0].name}
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.primary, textAlign: 'center', fontWeight: 'bold' }]}>
              {filteredLeaderboard[0].points} pts
            </Text>
          </TouchableOpacity>
        )}

        {/* Third Place */}
        {filteredLeaderboard[2] && (
          <TouchableOpacity 
            style={styles.podiumItem}
            onPress={() => handlePlayerPress(filteredLeaderboard[2])}
          >
            <Surface style={[styles.podiumRank, { backgroundColor: '#CD7F32', height: 60 }]}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>3</Text>
            </Surface>
            <Avatar.Text
              size={50}
              label={filteredLeaderboard[2].avatar}
              style={{ backgroundColor: COLORS.warning, marginTop: -25, marginBottom: 8 }}
            />
            <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', textAlign: 'center' }]}>
              {filteredLeaderboard[2].name}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, textAlign: 'center' }]}>
              {filteredLeaderboard[2].points} pts
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderLeaderboardItem = ({ item, index }) => {
    const isCurrentUser = item.isCurrentUser;
    const isTopThree = index < 3;
    
    if (isTopThree) return null; // Already shown in podium

    return (
      <TouchableOpacity onPress={() => handlePlayerPress(item)} activeOpacity={0.7}>
        <Card style={[
          styles.leaderboardCard,
          isCurrentUser && styles.currentUserHighlight
        ]}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Rank */}
              <Surface style={[
                styles.rankBadge,
                { backgroundColor: isCurrentUser ? COLORS.primary : COLORS.surface }
              ]}>
                <Text style={[
                  TEXT_STYLES.h3,
                  { color: isCurrentUser ? 'white' : COLORS.text }
                ]}>
                  #{item.position}
                </Text>
              </Surface>

              {/* Avatar */}
              <Avatar.Text
                size={45}
                label={item.avatar}
                style={{
                  backgroundColor: isCurrentUser ? COLORS.primary : COLORS.secondary,
                  marginLeft: SPACING.md
                }}
              />

              {/* Player Info */}
              <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[
                    TEXT_STYLES.h4,
                    { color: isCurrentUser ? COLORS.primary : COLORS.text }
                  ]}>
                    {item.name}
                  </Text>
                  {isCurrentUser && (
                    <Badge style={{ marginLeft: SPACING.xs, backgroundColor: COLORS.primary }}>
                      You
                    </Badge>
                  )}
                  {item.status === 'online' && (
                    <Icon 
                      name="circle" 
                      size={8} 
                      color={COLORS.success} 
                      style={{ marginLeft: SPACING.xs }} 
                    />
                  )}
                </View>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Level {item.level} • {item.specialty} • {item.badges} badges
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Icon name="local-fire-department" size={12} color={COLORS.error} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: 2, color: COLORS.error }]}>
                    {item.streak} day streak
                  </Text>
                </View>
              </View>

              {/* Points and Growth */}
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
                  {item.points.toLocaleString()}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                  {item.weeklyGain}
                </Text>
                <Icon name="trending-up" size={16} color={COLORS.success} />
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderPlayerModal = () => (
    <Portal>
      <Modal
        visible={showPlayerModal}
        onDismiss={() => setShowPlayerModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedPlayer && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Player Header */}
            <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
              <Avatar.Text
                size={80}
                label={selectedPlayer.avatar}
                style={{ backgroundColor: COLORS.primary, marginBottom: SPACING.md }}
              />
              <Text style={[TEXT_STYLES.h2, { textAlign: 'center' }]}>
                {selectedPlayer.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                  Level {selectedPlayer.level} • #{selectedPlayer.position}
                </Text>
                {selectedPlayer.status === 'online' && (
                  <>
                    <Icon name="circle" size={8} color={COLORS.success} style={{ marginLeft: 8 }} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.success, marginLeft: 4 }]}>
                      Online
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* Player Stats */}
            <Card style={{ marginBottom: SPACING.lg }}>
              <Card.Content>
                <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>
                  🏆 Player Stats
                </Text>
                <View style={styles.statGrid}>
                  <View style={styles.statItem}>
                    <Icon name="star" size={24} color={COLORS.warning} />
                    <Text style={TEXT_STYLES.h3}>{selectedPlayer.points}</Text>
                    <Text style={TEXT_STYLES.caption}>Total Points</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="local-fire-department" size={24} color={COLORS.error} />
                    <Text style={TEXT_STYLES.h3}>{selectedPlayer.streak}</Text>
                    <Text style={TEXT_STYLES.caption}>Day Streak</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="military-tech" size={24} color={COLORS.primary} />
                    <Text style={TEXT_STYLES.h3}>{selectedPlayer.badges}</Text>
                    <Text style={TEXT_STYLES.caption}>Badges</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="trending-up" size={24} color={COLORS.success} />
                    <Text style={TEXT_STYLES.h3}>{selectedPlayer.weeklyGain}</Text>
                    <Text style={TEXT_STYLES.caption}>This Week</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Player Info */}
            <Card style={{ marginBottom: SPACING.lg }}>
              <Card.Content>
                <View style={styles.playerDetailRow}>
                  <Icon name="sports" size={20} color={COLORS.primary} />
                  <Text style={TEXT_STYLES.body}>Specialty: {selectedPlayer.specialty}</Text>
                </View>
                <View style={styles.playerDetailRow}>
                  <Icon name="location-on" size={20} color={COLORS.secondary} />
                  <Text style={TEXT_STYLES.body}>Location: {selectedPlayer.location}</Text>
                </View>
                <View style={styles.playerDetailRow}>
                  <Icon name="schedule" size={20} color={COLORS.success} />
                  <Text style={TEXT_STYLES.body}>
                    Status: {selectedPlayer.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                  </Text>
                </View>
              </Card.Content>
            </Card>

            {/* Action Buttons */}
            {!selectedPlayer.isCurrentUser && (
              <View style={{ gap: SPACING.sm }}>
                <Button
                  mode="contained"
                  onPress={sendCheerMessage}
                  buttonColor={COLORS.success}
                  icon="favorite"
                >
                  Send Cheer Message 🎉
                </Button>
                <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                  <Button
                    mode="outlined"
                    onPress={challengePlayer}
                    style={{ flex: 1 }}
                    icon="sports-mma"
                  >
                    Challenge
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={addFriend}
                    style={{ flex: 1 }}
                    icon="person-add"
                  >
                    Add Friend
                  </Button>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <Animated.View 
        style={{ 
          flex: 1, 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              progressBackgroundColor={COLORS.background}
            />
          }
        >
          {renderHeader()}
          {renderFilters()}

          {/* Search Bar */}
          <View style={{ padding: SPACING.md }}>
            <Searchbar
              placeholder="Search players... 🔍"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{ elevation: 2 }}
              inputStyle={{ fontSize: 16 }}
            />
          </View>

          {/* Top Three Podium */}
          {filteredLeaderboard.length >= 3 && renderTopThree()}

          {/* Full Leaderboard */}
          <View style={{ padding: SPACING.md }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              Complete Rankings 📊
            </Text>
            <FlatList
              data={filteredLeaderboard}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderLeaderboardItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </ScrollView>

        <FAB
          icon="person-search"
          style={[styles.fab, { backgroundColor: COLORS.primary }]}
          onPress={() => Alert.alert('🚀 Feature Coming Soon!', 'Player search and discovery features coming soon!')}
        />

        {renderPlayerModal()}
      </Animated.View>
    </View>
  );
};

const styles = {
  currentUserCard: {
    elevation: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  filtersContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  podiumContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 3,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: SPACING.md,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumRank: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    elevation: 3,
  },
  leaderboardCard: {
    marginBottom: SPACING.sm,
    elevation: 2,
    borderRadius: 12,
  },
  currentUserHighlight: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderRadius: 16,
    elevation: 5,
    maxHeight: height * 0.85,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  statItem: {
    width: (width - SPACING.lg * 4) / 2,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  playerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
};

export default Leaderboards;