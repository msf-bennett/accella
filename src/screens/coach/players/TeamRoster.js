import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
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
  Surface,
  Searchbar,
  FAB,
  Portal,
  Modal,
  Badge,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
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
};

const TEXT_STYLES = {
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 14,
    color: COLORS.text,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
};

const { width, height } = Dimensions.get('window');

const TeamRoster = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, currentTeam, isLoading } = useSelector(state => ({
    user: state.auth.user,
    currentTeam: state.team.currentTeam || {},
    isLoading: state.team.isLoading || false,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('roster');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [sortBy, setSortBy] = useState('position');
  const [filterPosition, setFilterPosition] = useState('all');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Mock team data
  const mockTeam = {
    name: 'Thunder Bolts FC',
    logo: '⚡',
    division: 'Premier League',
    founded: '2020',
    coach: {
      id: 'coach1',
      name: 'John Martinez',
      avatar: null,
      experience: '8 years',
      achievements: ['Championship Winner 2022', 'Coach of the Year 2023'],
    },
    captain: 'player3',
    stats: {
      wins: 12,
      losses: 3,
      draws: 2,
      goalsFor: 45,
      goalsAgainst: 18,
      cleanSheets: 8,
    },
    players: [
      {
        id: 'player1',
        name: 'Alex Johnson',
        jersey: 1,
        position: 'Goalkeeper',
        age: 24,
        avatar: null,
        status: 'active',
        stats: { matches: 15, goals: 0, assists: 2, rating: 7.8 },
        contact: { phone: '+1234567890', email: 'alex@email.com' },
        joined: '2023-08-15',
        nationality: '🇺🇸',
        fitness: 92,
        form: 'excellent',
        lastSeen: '2024-01-16',
      },
      {
        id: 'player2',
        name: 'Marcus Silva',
        jersey: 4,
        position: 'Defender',
        age: 22,
        avatar: null,
        status: 'active',
        stats: { matches: 14, goals: 2, assists: 5, rating: 8.1 },
        contact: { phone: '+1234567891', email: 'marcus@email.com' },
        joined: '2023-07-20',
        nationality: '🇧🇷',
        fitness: 88,
        form: 'good',
        lastSeen: '2024-01-15',
      },
      {
        id: 'player3',
        name: 'David Rodriguez',
        jersey: 10,
        position: 'Midfielder',
        age: 26,
        avatar: null,
        status: 'active',
        stats: { matches: 16, goals: 8, assists: 12, rating: 9.2 },
        contact: { phone: '+1234567892', email: 'david@email.com' },
        joined: '2023-06-01',
        nationality: '🇪🇸',
        fitness: 95,
        form: 'excellent',
        lastSeen: '2024-01-16',
        isCaptain: true,
      },
      {
        id: 'player4',
        name: 'Tommy Lee',
        jersey: 9,
        position: 'Forward',
        age: 23,
        avatar: null,
        status: 'injured',
        stats: { matches: 12, goals: 15, assists: 4, rating: 8.7 },
        contact: { phone: '+1234567893', email: 'tommy@email.com' },
        joined: '2023-09-10',
        nationality: '🇰🇷',
        fitness: 65,
        form: 'poor',
        lastSeen: '2024-01-10',
        injury: 'Hamstring strain - 2 weeks',
      },
      {
        id: 'player5',
        name: 'James Wilson',
        jersey: 7,
        position: 'Midfielder',
        age: 25,
        avatar: null,
        status: 'active',
        stats: { matches: 13, goals: 5, assists: 8, rating: 7.9 },
        contact: { phone: '+1234567894', email: 'james@email.com' },
        joined: '2023-08-01',
        nationality: '🇬🇧',
        fitness: 90,
        form: 'good',
        lastSeen: '2024-01-16',
      },
      {
        id: 'player6',
        name: 'Luis Santos',
        jersey: 11,
        position: 'Forward',
        age: 21,
        avatar: null,
        status: 'suspended',
        stats: { matches: 10, goals: 7, assists: 3, rating: 7.5 },
        contact: { phone: '+1234567895', email: 'luis@email.com' },
        joined: '2023-10-15',
        nationality: '🇲🇽',
        fitness: 85,
        form: 'average',
        lastSeen: '2024-01-12',
        suspension: 'Yellow card accumulation - 1 match',
      },
    ],
  };

  const positions = ['all', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
  const sortOptions = ['position', 'jersey', 'name', 'age', 'rating'];

  // Component mount animations
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Team Updated! ⚽', 'Latest roster and stats have been synced.');
    } catch (error) {
      Alert.alert('Sync Error', 'Unable to update team roster.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter and sort players
  const filteredPlayers = mockTeam.players
    .filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           player.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           player.jersey.toString().includes(searchQuery);
      const matchesPosition = filterPosition === 'all' || player.position === filterPosition;
      return matchesSearch && matchesPosition;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'jersey':
          return a.jersey - b.jersey;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return a.age - b.age;
        case 'rating':
          return b.stats.rating - a.stats.rating;
        case 'position':
        default:
          const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
          return positions.indexOf(a.position) - positions.indexOf(b.position);
      }
    });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'injured':
        return COLORS.error;
      case 'suspended':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  // Get form color
  const getFormColor = (form) => {
    switch (form) {
      case 'excellent':
        return COLORS.success;
      case 'good':
        return COLORS.primary;
      case 'average':
        return COLORS.warning;
      case 'poor':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  // Handle player selection
  const handlePlayerPress = (player) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
    Vibration.vibrate(30);
  };

  // Handle contact player
  const handleContactPlayer = (player) => {
    Alert.alert(
      `Contact ${player.name}`,
      'Choose contact method:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Alert.alert('Feature Coming Soon', 'Direct calling feature will be available soon! 📞')
        },
        { 
          text: 'Message', 
          onPress: () => navigation.navigate('Chat', { playerId: player.id, playerName: player.name })
        },
      ]
    );
  };

  // Render header
  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Surface
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.2)',
              marginRight: SPACING.md,
            }}
          >
            <Text style={{ fontSize: 32 }}>{mockTeam.logo}</Text>
          </Surface>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.header, { color: 'white', marginBottom: SPACING.xs }]}>
              {mockTeam.name}
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
              {mockTeam.division} • Founded {mockTeam.founded}
            </Text>
          </View>
          <IconButton
            icon="dots-vertical"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert('Team Menu', 'Team settings coming soon! ⚙️')}
          />
        </View>

        {/* Quick Stats */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[
            { label: 'W', value: mockTeam.stats.wins, color: COLORS.success },
            { label: 'D', value: mockTeam.stats.draws, color: COLORS.warning },
            { label: 'L', value: mockTeam.stats.losses, color: COLORS.error },
            { label: 'GF', value: mockTeam.stats.goalsFor, color: COLORS.primary },
          ].map((stat, index) => (
            <Surface
              key={index}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                {stat.value}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                {stat.label}
              </Text>
            </Surface>
          ))}
        </View>

        <Searchbar
          placeholder="Search players..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            marginTop: SPACING.md,
            backgroundColor: 'rgba(255,255,255,0.95)',
          }}
          inputStyle={{ fontSize: 14 }}
          iconColor={COLORS.primary}
        />
      </Animated.View>
    </LinearGradient>
  );

  // Render filters
  const renderFilters = () => (
    <View style={{ paddingVertical: SPACING.md, backgroundColor: COLORS.surface, elevation: 2 }}>
      {/* Position Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        style={{ marginBottom: SPACING.sm }}
      >
        {positions.map((position) => (
          <TouchableOpacity
            key={position}
            onPress={() => setFilterPosition(position)}
            style={{
              marginRight: SPACING.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 16,
              backgroundColor: filterPosition === position ? COLORS.primary : COLORS.background,
            }}
          >
            <Text style={[
              TEXT_STYLES.caption,
              {
                color: filterPosition === position ? 'white' : COLORS.textSecondary,
                fontWeight: filterPosition === position ? 'bold' : 'normal',
                textTransform: 'capitalize',
              }
            ]}>
              {position}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      >
        <Text style={[TEXT_STYLES.caption, { marginRight: SPACING.md, alignSelf: 'center' }]}>
          Sort by:
        </Text>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setSortBy(option)}
            style={{
              marginRight: SPACING.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.xs,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: sortBy === option ? COLORS.primary : COLORS.textSecondary,
              backgroundColor: sortBy === option ? `${COLORS.primary}20` : 'transparent',
            }}
          >
            <Text style={[
              TEXT_STYLES.caption,
              {
                color: sortBy === option ? COLORS.primary : COLORS.textSecondary,
                fontWeight: sortBy === option ? 'bold' : 'normal',
                textTransform: 'capitalize',
              }
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render player card
  const renderPlayerCard = ({ item: player, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
      }}
    >
      <TouchableOpacity onPress={() => handlePlayerPress(player)}>
        <Card style={{ elevation: 3 }}>
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Jersey Number */}
              <Surface
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: COLORS.primary,
                  marginRight: SPACING.md,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                  {player.jersey}
                </Text>
              </Surface>

              {/* Player Info */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <Text style={[TEXT_STYLES.subheader, { flex: 1 }]}>
                    {player.name}
                  </Text>
                  {player.isCaptain && (
                    <Chip
                      mode="outlined"
                      textStyle={{ fontSize: 10, color: COLORS.warning }}
                      style={{ borderColor: COLORS.warning }}
                    >
                      👑 Captain
                    </Chip>
                  )}
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <Text style={[TEXT_STYLES.body, { marginRight: SPACING.md }]}>
                    {player.position}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { marginRight: SPACING.md }]}>
                    Age: {player.age}
                  </Text>
                  <Text style={TEXT_STYLES.caption}>
                    {player.nationality}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Chip
                      mode="flat"
                      textStyle={{ fontSize: 10, color: getStatusColor(player.status) }}
                      style={{ 
                        backgroundColor: `${getStatusColor(player.status)}20`,
                        marginRight: SPACING.sm,
                      }}
                    >
                      {player.status.toUpperCase()}
                    </Chip>
                    <Text style={[TEXT_STYLES.caption, { color: getFormColor(player.form) }]}>
                      Form: {player.form}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="star" size={16} color={COLORS.warning} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                      {player.stats.rating}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ alignItems: 'center' }}>
                <IconButton
                  icon="message"
                  size={20}
                  iconColor={COLORS.primary}
                  onPress={() => handleContactPlayer(player)}
                />
                {player.status === 'injured' && (
                  <Icon name="local-hospital" size={16} color={COLORS.error} />
                )}
                {player.status === 'suspended' && (
                  <Icon name="block" size={16} color={COLORS.warning} />
                )}
              </View>
            </View>

            {/* Additional Info for Injured/Suspended Players */}
            {(player.injury || player.suspension) && (
              <View style={{
                marginTop: SPACING.md,
                padding: SPACING.sm,
                backgroundColor: player.injury ? `${COLORS.error}10` : `${COLORS.warning}10`,
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: player.injury ? COLORS.error : COLORS.warning,
              }}>
                <Text style={[TEXT_STYLES.caption, { 
                  color: player.injury ? COLORS.error : COLORS.warning,
                  fontWeight: '600'
                }]}>
                  {player.injury || player.suspension}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render coach section
  const renderCoachSection = () => (
    <View style={{ margin: SPACING.md }}>
      <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
        👨‍🏫 Coaching Staff
      </Text>
      <Card style={{ elevation: 3 }}>
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar.Text
              size={60}
              label={mockTeam.coach.name.split(' ').map(n => n[0]).join('')}
              style={{ backgroundColor: COLORS.secondary, marginRight: SPACING.md }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.xs }]}>
                {mockTeam.coach.name}
              </Text>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.xs }]}>
                Head Coach • {mockTeam.coach.experience}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {mockTeam.coach.achievements.map((achievement, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    textStyle={{ fontSize: 10 }}
                    style={{ marginRight: SPACING.sm }}
                  >
                    {achievement}
                  </Chip>
                ))}
              </ScrollView>
            </View>
            <IconButton
              icon="message"
              size={24}
              iconColor={COLORS.primary}
              onPress={() => Alert.alert('Contact Coach', 'Messaging coach feature coming soon! 💬')}
            />
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  // Render team stats
  const renderTeamStats = () => (
    <View style={{ margin: SPACING.md }}>
      <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
        📊 Team Statistics
      </Text>
      <Card style={{ elevation: 3 }}>
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {[
              { label: 'Matches', value: mockTeam.stats.wins + mockTeam.stats.draws + mockTeam.stats.losses },
              { label: 'Win Rate', value: `${Math.round((mockTeam.stats.wins / (mockTeam.stats.wins + mockTeam.stats.draws + mockTeam.stats.losses)) * 100)}%` },
              { label: 'Goals For', value: mockTeam.stats.goalsFor },
              { label: 'Goals Against', value: mockTeam.stats.goalsAgainst },
              { label: 'Goal Difference', value: `+${mockTeam.stats.goalsFor - mockTeam.stats.goalsAgainst}` },
              { label: 'Clean Sheets', value: mockTeam.stats.cleanSheets },
            ].map((stat, index) => (
              <View key={index} style={{ width: '48%', marginBottom: SPACING.md, alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.header, { color: COLORS.primary }]}>
                  {stat.value}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      {renderFilters()}
      
      <FlatList
        data={filteredPlayers}
        renderItem={renderPlayerCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={() => (
          <View>
            {renderCoachSection()}
            {activeTab === 'stats' && renderTeamStats()}
            <Text style={[TEXT_STYLES.subheader, { margin: SPACING.md, marginBottom: SPACING.sm }]}>
              👥 Squad ({filteredPlayers.length} players)
            </Text>
          </View>
        )}
        ListFooterComponent={() => <View style={{ height: 100 }} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.accent,
        }}
        color="white"
        onPress={() => Alert.alert('Add Player', 'Invite new players feature coming soon! 📧')}
      />

      {/* Player Detail Modal */}
      <Portal>
        <Modal
          visible={showPlayerModal}
          onDismiss={() => setShowPlayerModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.md,
            borderRadius: 12,
            maxHeight: height * 0.8,
          }}
        >
          {selectedPlayer && (
            <ScrollView style={{ flex: 1 }}>
              {/* Player Header */}
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={{
                  padding: SPACING.lg,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Surface
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    marginBottom: SPACING.md,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 32 }}>
                    {selectedPlayer.jersey}
                  </Text>
                </Surface>
                <Text style={[TEXT_STYLES.header, { color: 'white', textAlign: 'center' }]}>
                  {selectedPlayer.name}
                </Text>
                <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', textAlign: 'center' }]}>
                  {selectedPlayer.position} • {selectedPlayer.nationality}
                </Text>
              </LinearGradient>

              {/* Player Details */}
              <View style={{ padding: SPACING.lg }}>
                {/* Basic Info */}
                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                    📋 Player Information
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <Text style={TEXT_STYLES.body}>Status:</Text>
                    <Chip
                      mode="flat"
                      textStyle={{ fontSize: 12, color: getStatusColor(selectedPlayer.status) }}
                      style={{ backgroundColor: `${getStatusColor(selectedPlayer.status)}20` }}
                    >
                      {selectedPlayer.status.toUpperCase()}
                    </Chip>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <Text style={TEXT_STYLES.body}>Fitness Level:</Text>
                    <View style={{ alignItems: 'flex-end', flex: 1, marginLeft: SPACING.md }}>
                      <ProgressBar
                        progress={selectedPlayer.fitness / 100}
                        color={selectedPlayer.fitness >= 90 ? COLORS.success : 
                               selectedPlayer.fitness >= 70 ? COLORS.warning : COLORS.error}
                        style={{ width: 100, height: 6 }}
                      />
                      <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                        {selectedPlayer.fitness}%
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={TEXT_STYLES.body}>Last Seen:</Text>
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>{selectedPlayer.lastSeen}</Text>
                  </View>
                </View>

                {/* Season Stats */}
                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                    📈 Season Statistics
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Matches', value: selectedPlayer.stats.matches, icon: 'sports-soccer' },
                      { label: 'Goals', value: selectedPlayer.stats.goals, icon: 'sports-soccer' },
                      { label: 'Assists', value: selectedPlayer.stats.assists, icon: 'trending-up' },
                      { label: 'Rating', value: selectedPlayer.stats.rating, icon: 'star' },
                    ].map((stat, index) => (
                      <Surface
                        key={index}
                        style={{
                          width: '48%',
                          padding: SPACING.md,
                          borderRadius: 8,
                          elevation: 2,
                          marginBottom: SPACING.md,
                          alignItems: 'center',
                        }}
                      >
                        <Icon name={stat.icon} size={24} color={COLORS.primary} />
                        <Text style={[TEXT_STYLES.header, { color: COLORS.primary, marginTop: SPACING.xs }]}>
                          {stat.value}
                        </Text>
                        <Text style={TEXT_STYLES.caption}>
                          {stat.label}
                        </Text>
                      </Surface>
                    ))}
                  </View>
                </View>

                {/* Contact Information */}
                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                    📞 Contact Information
                  </Text>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: SPACING.md,
                      backgroundColor: COLORS.background,
                      borderRadius: 8,
                      marginBottom: SPACING.sm,
                    }}
                    onPress={() => Alert.alert('Call Player', 'Direct calling feature coming soon! 📞')}
                  >
                    <Icon name="phone" size={20} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.md, flex: 1 }]}>
                      {selectedPlayer.contact.phone}
                    </Text>
                    <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: SPACING.md,
                      backgroundColor: COLORS.background,
                      borderRadius: 8,
                    }}
                    onPress={() => Alert.alert('Email Player', 'Email integration coming soon! 📧')}
                  >
                    <Icon name="email" size={20} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.md, flex: 1 }]}>
                      {selectedPlayer.contact.email}
                    </Text>
                    <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Injury/Suspension Details */}
                {(selectedPlayer.injury || selectedPlayer.suspension) && (
                  <View style={{ marginBottom: SPACING.lg }}>
                    <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                      {selectedPlayer.injury ? '🏥 Injury Details' : '⚠️ Suspension Details'}
                    </Text>
                    <Surface
                      style={{
                        padding: SPACING.md,
                        borderRadius: 8,
                        backgroundColor: selectedPlayer.injury ? `${COLORS.error}10` : `${COLORS.warning}10`,
                        borderLeftWidth: 4,
                        borderLeftColor: selectedPlayer.injury ? COLORS.error : COLORS.warning,
                      }}
                    >
                      <Text style={[TEXT_STYLES.body, { 
                        color: selectedPlayer.injury ? COLORS.error : COLORS.warning,
                        fontWeight: '600'
                      }]}>
                        {selectedPlayer.injury || selectedPlayer.suspension}
                      </Text>
                    </Surface>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowPlayerModal(false)}
                    style={{ flex: 1 }}
                  >
                    Close
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleContactPlayer(selectedPlayer)}
                    buttonColor={COLORS.primary}
                    style={{ flex: 1 }}
                    icon="message"
                  >
                    Message
                  </Button>
                </View>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

export default TeamRoster;