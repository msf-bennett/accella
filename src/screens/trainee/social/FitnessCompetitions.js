import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  Vibration,
  FlatList,
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
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
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
  accent: '#FF6B6B',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  bodySmall: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const FitnessCompetitions = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Mock user stats
  const [userStats, setUserStats] = useState({
    rank: 15,
    points: 2340,
    competitions: 8,
    wins: 3,
    level: 'Gold',
    streak: 5,
    badges: 12,
  });

  // Mock competitions data
  const [competitions, setCompetitions] = useState([
    {
      id: 1,
      title: 'Iron Push-Up Challenge 💪',
      description: 'Maximum push-ups in 60 seconds',
      category: 'strength',
      type: 'individual',
      participants: 156,
      prize: '$500 Prize Pool',
      startDate: '2025-09-01',
      endDate: '2025-09-07',
      status: 'active',
      joined: true,
      progress: 0.4,
      userRank: 23,
      totalParticipants: 156,
      difficulty: 'Intermediate',
      requirements: ['Basic fitness level', 'Video submission required'],
      rules: 'Standard push-up form must be maintained throughout',
      image: 'https://picsum.photos/400/200?random=1',
      leaderboard: [
        { rank: 1, name: 'Mike Johnson', score: 87, avatar: 'https://picsum.photos/50/50?random=11' },
        { rank: 2, name: 'Sarah Chen', score: 82, avatar: 'https://picsum.photos/50/50?random=12' },
        { rank: 3, name: 'David Wilson', score: 79, avatar: 'https://picsum.photos/50/50?random=13' },
      ],
    },
    {
      id: 2,
      title: 'Marathon Madness 🏃‍♂️',
      description: '21-day running challenge - total distance',
      category: 'cardio',
      type: 'team',
      participants: 89,
      prize: 'Premium Gear Package',
      startDate: '2025-08-28',
      endDate: '2025-09-18',
      status: 'active',
      joined: false,
      progress: 0.6,
      userRank: null,
      totalParticipants: 89,
      difficulty: 'Advanced',
      requirements: ['Running experience', 'GPS tracking app'],
      rules: 'Minimum 5km per session, maximum 2 sessions per day',
      image: 'https://picsum.photos/400/200?random=2',
      leaderboard: [
        { rank: 1, name: 'Emma Rodriguez', score: 245, avatar: 'https://picsum.photos/50/50?random=14' },
        { rank: 2, name: 'John Smith', score: 232, avatar: 'https://picsum.photos/50/50?random=15' },
        { rank: 3, name: 'Lisa Park', score: 228, avatar: 'https://picsum.photos/50/50?random=16' },
      ],
    },
    {
      id: 3,
      title: 'Flexibility Master 🧘‍♀️',
      description: 'Yoga poses and flexibility challenges',
      category: 'flexibility',
      type: 'individual',
      participants: 134,
      prize: 'Yoga Equipment Set',
      startDate: '2025-09-05',
      endDate: '2025-09-19',
      status: 'upcoming',
      joined: true,
      progress: 0,
      userRank: null,
      totalParticipants: 134,
      difficulty: 'Beginner',
      requirements: ['Yoga mat', 'Basic poses knowledge'],
      rules: 'Hold each pose for minimum 30 seconds, photo verification',
      image: 'https://picsum.photos/400/200?random=3',
      leaderboard: [],
    },
    {
      id: 4,
      title: 'Weight Loss Warriors ⚖️',
      description: '8-week transformation challenge',
      category: 'weight-loss',
      type: 'team',
      participants: 67,
      prize: '$1000 Grand Prize',
      startDate: '2025-07-15',
      endDate: '2025-09-10',
      status: 'completed',
      joined: true,
      progress: 1,
      userRank: 12,
      totalParticipants: 67,
      difficulty: 'Intermediate',
      requirements: ['Medical clearance', 'Weekly weigh-ins'],
      rules: 'Healthy weight loss methods only, nutritionist supervised',
      image: 'https://picsum.photos/400/200?random=4',
      leaderboard: [
        { rank: 1, name: 'Maria Garcia', score: 18.5, avatar: 'https://picsum.photos/50/50?random=17' },
        { rank: 2, name: 'Tom Anderson', score: 16.2, avatar: 'https://picsum.photos/50/50?random=18' },
        { rank: 3, name: 'Anna Lee', score: 15.8, avatar: 'https://picsum.photos/50/50?random=19' },
      ],
    },
  ]);

  const [achievements, setAchievements] = useState([
    { id: 1, title: 'First Victory', icon: 'jump-rope', earned: true, description: 'Win your first competition' },
    { id: 2, title: 'Consistency King', icon: 'trending-up', earned: true, description: '5-day participation streak' },
    { id: 3, title: 'Team Player', icon: 'groups', earned: false, description: 'Join 3 team competitions' },
    { id: 4, title: 'Challenge Seeker', icon: 'explore', earned: true, description: 'Join 10 competitions' },
    { id: 5, title: 'Top Performer', icon: 'star', earned: false, description: 'Rank in top 10 globally' },
  ]);

  const categories = [
    { id: 'all', label: 'All', icon: 'fitness-center', color: COLORS.primary },
    { id: 'strength', label: 'Strength', icon: 'fitness-center', color: COLORS.accent },
    { id: 'cardio', label: 'Cardio', icon: 'directions-run', color: COLORS.success },
    { id: 'flexibility', label: 'Flexibility', icon: 'self-improvement', color: COLORS.warning },
    { id: 'weight-loss', label: 'Weight Loss', icon: 'monitor-weight', color: COLORS.secondary },
  ];

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleJoinCompetition = (competitionId) => {
    Vibration.vibrate(100);
    setCompetitions(comps => 
      comps.map(comp => 
        comp.id === competitionId 
          ? { 
              ...comp, 
              joined: !comp.joined,
              participants: comp.joined ? comp.participants - 1 : comp.participants + 1 
            }
          : comp
      )
    );
    Alert.alert(
      'Success! 🎉', 
      'You\'ve successfully joined the competition! Good luck!'
    );
  };

  const getRankColor = (rank) => {
    if (rank === 1) return COLORS.gold;
    if (rank === 2) return COLORS.silver;
    if (rank === 3) return COLORS.bronze;
    return COLORS.textSecondary;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return 'jump-rope';
    if (rank === 2) return 'jump-rope';
    if (rank === 3) return 'jump-rope';
    return 'person';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'upcoming': return COLORS.warning;
      case 'completed': return COLORS.textSecondary;
      default: return COLORS.primary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Live Now';
      case 'upcoming': return 'Starting Soon';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.lg,
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: SPACING.xs }]}>
              Competitions 🏆
            </Text>
            <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.8)' }]}>
              Compete, achieve, and win prizes
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Notifications feature is under development')}
            style={{ position: 'relative' }}
          >
            <Icon name="notifications" size={24} color="white" />
            <Badge
              size={16}
              style={{ position: 'absolute', top: -8, right: -8, backgroundColor: COLORS.accent }}
            >
              3
            </Badge>
          </TouchableOpacity>
        </View>
        
        {/* User Stats Row */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Surface style={{ borderRadius: 12, padding: SPACING.md, backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>#{userStats.rank}</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Rank</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>{userStats.points}</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Points</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>{userStats.wins}</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Wins</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>{userStats.streak}</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Streak</Text>
              </View>
            </View>
          </Surface>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <Surface style={{ elevation: 2, backgroundColor: 'white' }}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}
      >
        {[
          { id: 'active', label: 'Active', icon: 'play-circle-filled', badge: 2 },
          { id: 'upcoming', label: 'Upcoming', icon: 'schedule', badge: 1 },
          { id: 'completed', label: 'Completed', icon: 'check-circle', badge: null },
          { id: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard', badge: null },
          { id: 'achievements', label: 'Achievements', icon: 'military-tech', badge: null },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              marginRight: SPACING.sm,
              borderRadius: 20,
              backgroundColor: activeTab === tab.id ? COLORS.primary : 'transparent',
              position: 'relative',
            }}
          >
            <Icon 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.id ? 'white' : COLORS.textSecondary} 
            />
            <Text style={[
              TEXT_STYLES.bodySmall,
              { 
                marginLeft: SPACING.xs,
                color: activeTab === tab.id ? 'white' : COLORS.textSecondary,
                fontWeight: activeTab === tab.id ? '600' : 'normal',
              }
            ]}>
              {tab.label}
            </Text>
            {tab.badge && (
              <Badge
                size={16}
                style={{ 
                  marginLeft: SPACING.xs, 
                  backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : COLORS.accent 
                }}
              >
                {tab.badge}
              </Badge>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderCategoryFilter = () => (
    <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedFilter === category.id}
            onPress={() => setSelectedFilter(category.id)}
            icon={() => <Icon name={category.icon} size={16} color={
              selectedFilter === category.id ? 'white' : category.color
            } />}
            style={{
              marginRight: SPACING.sm,
              backgroundColor: selectedFilter === category.id 
                ? category.color 
                : 'rgba(255,255,255,0.9)',
            }}
            textStyle={{
              color: selectedFilter === category.id ? 'white' : category.color,
              fontWeight: '600',
            }}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderCompetitionCard = (competition) => (
    <Card key={competition.id} style={{ marginBottom: SPACING.md, elevation: 3 }}>
      <View style={{ position: 'relative' }}>
        <View style={{ height: 120, backgroundColor: COLORS.background }}>
          <LinearGradient
            colors={[categories.find(c => c.id === competition.category)?.color || COLORS.primary, 'rgba(0,0,0,0.3)']}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Icon name={categories.find(c => c.id === competition.category)?.icon || 'fitness-center'} size={40} color="white" />
          </LinearGradient>
        </View>
        <Chip
          compact
          style={{
            position: 'absolute',
            top: SPACING.sm,
            right: SPACING.sm,
            backgroundColor: getStatusColor(competition.status),
          }}
          textStyle={{ color: 'white', fontSize: 10, fontWeight: '600' }}
        >
          {getStatusLabel(competition.status)}
        </Chip>
        {competition.joined && (
          <Chip
            compact
            style={{
              position: 'absolute',
              top: SPACING.sm,
              left: SPACING.sm,
              backgroundColor: COLORS.success,
            }}
            textStyle={{ color: 'white', fontSize: 10, fontWeight: '600' }}
          >
            Joined ✓
          </Chip>
        )}
      </View>
      
      <Card.Content style={{ padding: SPACING.md }}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.xs }]}>{competition.title}</Text>
        <Text style={[TEXT_STYLES.bodySmall, { marginBottom: SPACING.sm }]}>{competition.description}</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="people" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
              {competition.participants} participants
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="card-giftcard" size={16} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, fontWeight: '600' }]}>
              {competition.prize}
            </Text>
          </View>
        </View>

        {competition.status === 'active' && competition.joined && (
          <View style={{ marginBottom: SPACING.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
              <Text style={TEXT_STYLES.bodySmall}>Your Progress</Text>
              <Text style={TEXT_STYLES.bodySmall}>Rank #{competition.userRank}</Text>
            </View>
            <ProgressBar 
              progress={competition.progress} 
              color={COLORS.success}
              style={{ height: 6, borderRadius: 3 }}
            />
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedCompetition(competition);
              setShowDetailsModal(true);
            }}
            style={{ borderColor: COLORS.primary, flex: 1, marginRight: SPACING.sm }}
            labelStyle={{ color: COLORS.primary }}
          >
            Details
          </Button>
          {competition.status !== 'completed' && (
            <Button
              mode={competition.joined ? "outlined" : "contained"}
              onPress={() => handleJoinCompetition(competition.id)}
              style={{ 
                borderColor: COLORS.primary,
                backgroundColor: competition.joined ? 'transparent' : COLORS.primary,
                flex: 1,
              }}
              labelStyle={{ color: competition.joined ? COLORS.primary : 'white' }}
            >
              {competition.joined ? 'Leave' : 'Join'}
            </Button>
          )}
          {competition.status === 'active' && competition.joined && (
            <IconButton
              icon="leaderboard"
              size={24}
              iconColor={COLORS.primary}
              onPress={() => {
                setSelectedCompetition(competition);
                setShowLeaderboardModal(true);
              }}
              style={{ marginLeft: SPACING.xs }}
            />
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderLeaderboardItem = ({ item, index }) => (
    <Surface style={{ 
      margin: SPACING.xs, 
      borderRadius: 12, 
      elevation: 2,
      backgroundColor: index < 3 ? `${getRankColor(index + 1)}15` : 'white'
    }}>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: SPACING.md,
        borderLeftWidth: 4,
        borderLeftColor: getRankColor(index + 1),
      }}>
        <View style={{ alignItems: 'center', marginRight: SPACING.md, minWidth: 40 }}>
          <Icon 
            name={getRankIcon(index + 1)} 
            size={24} 
            color={getRankColor(index + 1)} 
          />
          <Text style={[TEXT_STYLES.bodySmall, { color: getRankColor(index + 1), fontWeight: '600' }]}>
            #{index + 1}
          </Text>
        </View>
        <Avatar.Image size={40} source={{ uri: item.avatar }} style={{ marginRight: SPACING.md }} />
        <View style={{ flex: 1 }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>{item.name}</Text>
          <Text style={TEXT_STYLES.caption}>Score: {item.score}</Text>
        </View>
        {index < 3 && (
          <Icon name="jump-rope" size={20} color={getRankColor(index + 1)} />
        )}
      </View>
    </Surface>
  );

  const renderGlobalLeaderboard = () => (
    <View>
      <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
        <LinearGradient
          colors={[COLORS.gold, '#FFA000']}
          style={{ padding: SPACING.md, alignItems: 'center' }}
        >
          <Icon name="jump-rope" size={40} color="white" />
          <Text style={[TEXT_STYLES.h3, { color: 'white', marginVertical: SPACING.sm }]}>
            Global Rankings
          </Text>
          <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.9)', textAlign: 'center' }]}>
            Top performers across all competitions
          </Text>
        </LinearGradient>
      </Card>
      
      <FlatList
        data={[
          { rank: 1, name: 'Alex Champion', score: 4850, avatar: 'https://picsum.photos/50/50?random=21' },
          { rank: 2, name: 'Maria Fitness', score: 4720, avatar: 'https://picsum.photos/50/50?random=22' },
          { rank: 3, name: 'John Strong', score: 4580, avatar: 'https://picsum.photos/50/50?random=23' },
          { rank: 4, name: 'Emma Power', score: 4320, avatar: 'https://picsum.photos/50/50?random=24' },
          { rank: 5, name: 'You', score: userStats.points, avatar: 'https://picsum.photos/50/50?random=25' },
        ]}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item, index) => `leaderboard-${index}`}
        scrollEnabled={false}
      />
    </View>
  );

  const renderAchievements = () => (
    <View>
      <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
        <LinearGradient
          colors={[COLORS.secondary, COLORS.primary]}
          style={{ padding: SPACING.md, alignItems: 'center' }}
        >
          <Icon name="military-tech" size={40} color="white" />
          <Text style={[TEXT_STYLES.h3, { color: 'white', marginVertical: SPACING.sm }]}>
            Your Achievements
          </Text>
          <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.9)', textAlign: 'center' }]}>
            {achievements.filter(a => a.earned).length} of {achievements.length} earned
          </Text>
        </LinearGradient>
      </Card>

      {achievements.map((achievement) => (
        <Card key={achievement.id} style={{ 
          marginBottom: SPACING.md, 
          elevation: 2,
          opacity: achievement.earned ? 1 : 0.6,
        }}>
          <Card.Content style={{ 
            padding: SPACING.md,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: achievement.earned ? `${COLORS.success}10` : 'white',
          }}>
            <Surface style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: achievement.earned ? COLORS.success : COLORS.textSecondary,
              marginRight: SPACING.md,
            }}>
              <Icon name={achievement.icon} size={24} color="white" />
            </Surface>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h3, { 
                marginBottom: SPACING.xs,
                color: achievement.earned ? COLORS.text : COLORS.textSecondary,
              }]}>
                {achievement.title}
              </Text>
              <Text style={[TEXT_STYLES.bodySmall, {
                color: achievement.earned ? COLORS.textSecondary : COLORS.textSecondary,
              }]}>
                {achievement.description}
              </Text>
            </View>
            {achievement.earned && (
              <Icon name="check-circle" size={24} color={COLORS.success} />
            )}
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderContent = () => {
    const filteredCompetitions = competitions.filter(comp => {
      const matchesTab = activeTab === 'leaderboard' || activeTab === 'achievements' || comp.status === activeTab;
      const matchesCategory = selectedFilter === 'all' || comp.category === selectedFilter;
      return matchesTab && matchesCategory;
    });

    switch (activeTab) {
      case 'leaderboard':
        return renderGlobalLeaderboard();
      case 'achievements':
        return renderAchievements();
      default:
        return (
          <View>
            {renderCategoryFilter()}
            <View style={{ paddingHorizontal: SPACING.md }}>
              {filteredCompetitions.map(renderCompetitionCard)}
            </View>
          </View>
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {renderHeader()}
      {renderTabBar()}
      
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {(activeTab === 'active' || activeTab === 'upcoming' || activeTab === 'completed') && (
          <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
            <Searchbar
              placeholder="Search competitions..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{ elevation: 2 }}
              iconColor={COLORS.primary}
            />
          </View>
        )}
        
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {renderContent()}
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      <FAB
        icon="add"
        label="Create"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Competition creation feature is under development')}
      />

      {/* Competition Details Modal */}
      <Portal>
        <Modal
          visible={showDetailsModal}
          onDismiss={() => setShowDetailsModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.lg,
            borderRadius: 12,
            maxHeight: '80%',
          }}
        >
          {selectedCompetition && (
            <ScrollView style={{ maxHeight: height * 0.7 }}>
              <LinearGradient
                colors={[categories.find(c => c.id === selectedCompetition.category)?.color || COLORS.primary, 'rgba(0,0,0,0.3)']}
                style={{ height: 150, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              >
                <Icon name={categories.find(c => c.id === selectedCompetition.category)?.icon || 'fitness-center'} size={50} color="white" />
                <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center', marginTop: SPACING.sm }]}>
                  {selectedCompetition.title}
                </Text>
              </LinearGradient>
              
              <View style={{ padding: SPACING.lg }}>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg }]}>
                  {selectedCompetition.description}
                </Text>
                
                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>Competition Details</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <Text style={TEXT_STYLES.bodySmall}>Type:</Text>
                    <Text style={[TEXT_STYLES.bodySmall, { fontWeight: '600', textTransform: 'capitalize' }]}>
                      {selectedCompetition.type}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <Text style={TEXT_STYLES.bodySmall}>Difficulty:</Text>
                    <Text style={[TEXT_STYLES.bodySmall, { fontWeight: '600' }]}>
                      {selectedCompetition.difficulty}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <Text style={TEXT_STYLES.bodySmall}>Prize:</Text>
                    <Text style={[TEXT_STYLES.bodySmall, { fontWeight: '600', color: COLORS.warning }]}>
                      {selectedCompetition.prize}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <Text style={TEXT_STYLES.bodySmall}>Participants:</Text>
                    <Text style={[TEXT_STYLES.bodySmall, { fontWeight: '600' }]}>
                      {selectedCompetition.participants}
                    </Text>
                  </View>
                </View>

                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>Requirements</Text>
                  {selectedCompetition.requirements.map((req, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                      <Icon name="check-circle" size={16} color={COLORS.success} />
                      <Text style={[TEXT_STYLES.bodySmall, { marginLeft: SPACING.sm }]}>{req}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>Rules</Text>
                  <Text style={TEXT_STYLES.bodySmall}>{selectedCompetition.rules}</Text>
                </View>

                {selectedCompetition.leaderboard.length > 0 && (
                  <View style={{ marginBottom: SPACING.lg }}>
                    <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>Current Leaders</Text>
                    {selectedCompetition.leaderboard.slice(0, 3).map((leader, index) => (
                      <View key={index} style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        marginBottom: SPACING.sm,
                        padding: SPACING.sm,
                        backgroundColor: index === 0 ? `${COLORS.gold}20` : 'transparent',
                        borderRadius: 8,
                      }}>
                        <Text style={[TEXT_STYLES.body, { 
                          fontWeight: '600', 
                          color: getRankColor(leader.rank),
                          marginRight: SPACING.sm,
                          minWidth: 30,
                        }]}>
                          #{leader.rank}
                        </Text>
                        <Avatar.Image size={30} source={{ uri: leader.avatar }} style={{ marginRight: SPACING.sm }} />
                        <Text style={[TEXT_STYLES.bodySmall, { flex: 1 }]}>{leader.name}</Text>
                        <Text style={[TEXT_STYLES.bodySmall, { fontWeight: '600' }]}>{leader.score}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Button onPress={() => setShowDetailsModal(false)} style={{ flex: 1, marginRight: SPACING.sm }}>
                    Close
                  </Button>
                  {selectedCompetition.status !== 'completed' && (
                    <Button
                      mode="contained"
                      onPress={() => {
                        handleJoinCompetition(selectedCompetition.id);
                        setShowDetailsModal(false);
                      }}
                      style={{ backgroundColor: COLORS.primary, flex: 1 }}
                    >
                      {selectedCompetition.joined ? 'Leave' : 'Join Competition'}
                    </Button>
                  )}
                </View>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {/* Leaderboard Modal */}
      <Portal>
        <Modal
          visible={showLeaderboardModal}
          onDismiss={() => setShowLeaderboardModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.lg,
            borderRadius: 12,
            maxHeight: '70%',
          }}
        >
          {selectedCompetition && (
            <View>
              <LinearGradient
                colors={[COLORS.gold, '#FFA000']}
                style={{ padding: SPACING.lg, alignItems: 'center', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              >
                <Icon name="leaderboard" size={40} color="white" />
                <Text style={[TEXT_STYLES.h3, { color: 'white', marginTop: SPACING.sm }]}>
                  {selectedCompetition.title}
                </Text>
                <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.8)', textAlign: 'center' }]}>
                  Live Rankings
                </Text>
              </LinearGradient>
              
              <ScrollView style={{ maxHeight: height * 0.5, padding: SPACING.md }}>
                {selectedCompetition.leaderboard.map((leader, index) => (
                  <Surface key={index} style={{ 
                    marginBottom: SPACING.sm, 
                    borderRadius: 12, 
                    elevation: 1,
                    backgroundColor: index < 3 ? `${getRankColor(index + 1)}15` : 'white'
                  }}>
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      padding: SPACING.md,
                      borderLeftWidth: 4,
                      borderLeftColor: getRankColor(index + 1),
                    }}>
                      <View style={{ alignItems: 'center', marginRight: SPACING.md, minWidth: 40 }}>
                        <Icon 
                          name={getRankIcon(index + 1)} 
                          size={24} 
                          color={getRankColor(index + 1)} 
                        />
                        <Text style={[TEXT_STYLES.bodySmall, { color: getRankColor(index + 1), fontWeight: '600' }]}>
                          #{index + 1}
                        </Text>
                      </View>
                      <Avatar.Image size={40} source={{ uri: leader.avatar }} style={{ marginRight: SPACING.md }} />
                      <View style={{ flex: 1 }}>
                        <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>{leader.name}</Text>
                        <Text style={TEXT_STYLES.caption}>Score: {leader.score}</Text>
                      </View>
                      {index < 3 && (
                        <Icon name="jump-rope" size={20} color={getRankColor(index + 1)} />
                      )}
                    </View>
                  </Surface>
                ))}
              </ScrollView>
              
              <View style={{ padding: SPACING.md, borderTop: `1px solid ${COLORS.background}` }}>
                <Button onPress={() => setShowLeaderboardModal(false)}>
                  Close
                </Button>
              </View>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

export default FitnessCompetitions;