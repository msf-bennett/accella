import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Vibration,
  Alert,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  ProgressBar,
  Badge,
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const TeamCompetitions = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, team, competitions } = useSelector((state) => state.user);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const trophyAnim = useRef(new Animated.Value(0)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Mock data - in real app this would come from Redux/API
  const [userTeam, setUserTeam] = useState({
    id: 1,
    name: 'Lightning Bolts',
    emoji: '⚡',
    color: ['#667eea', '#764ba2'],
    members: 8,
    rank: 3,
    points: 2450,
    captain: 'Sarah M.',
    motto: 'Fast as Lightning!',
  });

  // Active competitions
  const activeCompetitions = [
    {
      id: 1,
      title: 'Weekly Training Challenge',
      description: 'Complete 5 training sessions this week!',
      type: 'training',
      prize: '500 points + team trophy',
      timeLeft: '2 days',
      participants: 12,
      maxParticipants: 16,
      difficulty: 'Easy',
      icon: 'fitness-center',
      color: ['#4ecdc4', '#44a08d'],
      progress: 0.75,
      myTeamRank: 2,
      totalTeams: 8,
      requirements: ['Complete 5 training sessions', 'Team average 80%+ attendance'],
      rewards: ['500 team points', 'Training trophy', 'Special team badge'],
      isJoined: true,
    },
    {
      id: 2,
      title: 'Skill Master Tournament',
      description: 'Show off your best skills in this week-long challenge!',
      type: 'skills',
      prize: '1000 points + skill badges',
      timeLeft: '5 days',
      participants: 8,
      maxParticipants: 12,
      difficulty: 'Medium',
      icon: 'sports-soccer',
      color: ['#ffa726', '#ff7043'],
      progress: 0.4,
      myTeamRank: 5,
      totalTeams: 12,
      requirements: ['Submit 3 skill videos', 'Peer review 2 teammates'],
      rewards: ['1000 team points', 'Skill master badges', 'Coach recognition'],
      isJoined: true,
    },
    {
      id: 3,
      title: 'Team Spirit Week',
      description: 'Spread positivity and support your teammates!',
      type: 'teamwork',
      prize: 'Team building rewards',
      timeLeft: '1 week',
      participants: 15,
      maxParticipants: 20,
      difficulty: 'Easy',
      icon: 'people',
      color: ['#ab47bc', '#8e24aa'],
      progress: 0.6,
      myTeamRank: 1,
      totalTeams: 6,
      requirements: ['Give 5 encouragements', 'Help 2 teammates', 'Share motivational content'],
      rewards: ['Team spirit badge', 'Special recognition', 'Group celebration'],
      isJoined: false,
    },
  ];

  // Upcoming competitions
  const upcomingCompetitions = [
    {
      id: 4,
      title: 'Championship Qualifier',
      description: 'Qualify for the regional championship!',
      type: 'tournament',
      startDate: 'Next Monday',
      prize: 'Championship entry + 2000 points',
      difficulty: 'Hard',
      icon: 'jump-rope',
      color: ['#ef5350', '#e53935'],
      estimatedDuration: '2 weeks',
      requirements: ['Team level 5+', 'Complete pre-qualifier', 'Coach approval'],
    },
    {
      id: 5,
      title: 'Fitness Challenge Month',
      description: 'Month-long fitness and wellness competition',
      type: 'fitness',
      startDate: 'Next week',
      prize: 'Fitness gear + wellness rewards',
      difficulty: 'Medium',
      icon: 'favorite',
      color: ['#26a69a', '#00897b'],
      estimatedDuration: '1 month',
      requirements: ['Log daily activities', 'Nutrition tracking', 'Team coordination'],
    },
  ];

  // Team leaderboard
  const teamLeaderboard = [
    { rank: 1, name: 'Thunder Hawks', emoji: '🦅', points: 3250, members: 10, trend: 'up' },
    { rank: 2, name: 'Fire Dragons', emoji: '🐲', points: 2980, members: 9, trend: 'up' },
    { rank: 3, name: 'Lightning Bolts', emoji: '⚡', points: 2450, members: 8, trend: 'same', isMyTeam: true },
    { rank: 4, name: 'Ice Wolves', emoji: '🐺', points: 2200, members: 11, trend: 'down' },
    { rank: 5, name: 'Wind Runners', emoji: '💨', points: 1950, members: 7, trend: 'up' },
  ];

  // Animation functions
  const startEntryAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const bounceAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 100,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bounceAnim]);

  const waveAnimation = useCallback(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [waveAnim]);

  const trophyAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(trophyAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(trophyAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [trophyAnim]);

  // Effects
  useEffect(() => {
    startEntryAnimation();
    waveAnimation();
  }, [startEntryAnimation, waveAnimation]);

  // Handlers
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      Vibration.vibrate(50);
      
      // Simulate refreshing competitions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRefreshing(false);
    } catch (error) {
      console.error('Refresh error:', error);
      setRefreshing(false);
    }
  }, []);

  const handleJoinCompetition = (competition) => {
    bounceAnimation();
    trophyAnimation();
    Vibration.vibrate(100);
    
    Alert.alert(
      `Join ${competition.title}? 🏆`,
      `Your team "${userTeam.name}" wants to compete!\n\nRequirements:\n${competition.requirements?.join('\n• ') || 'Complete the challenge goals'}`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        {
          text: 'Join Competition!',
          style: 'default',
          onPress: () => {
            Alert.alert('Joined! 🎉', 'Your team is now competing! Good luck!');
            // In real app, dispatch action to join competition
          }
        }
      ]
    );
  };

  const handleViewCompetitionDetails = (competition) => {
    setSelectedCompetition(competition);
    bounceAnimation();
  };

  const renderHeader = () => (
    <LinearGradient
      colors={userTeam.color}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View style={styles.teamContainer}>
            <Animated.View
              style={[
                styles.teamBadge,
                {
                  transform: [{ scale: bounceAnim }]
                }
              ]}
            >
              <Text style={styles.teamEmoji}>{userTeam.emoji}</Text>
            </Animated.View>
            
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{userTeam.name}</Text>
              <Text style={styles.teamMotto}>"{userTeam.motto}"</Text>
              <View style={styles.teamStats}>
                <Text style={styles.teamStatsText}>
                  👥 {userTeam.members} members • #{userTeam.rank} ranked
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.teamPointsContainer}
            onPress={() => navigation.navigate('TeamDetails')}
          >
            <Animated.View
              style={[
                styles.pointsBadge,
                {
                  transform: [{
                    rotate: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }]
                }
              ]}
            >
              <MaterialIcons name="stars" size={20} color="#ffd700" />
            </Animated.View>
            <Text style={styles.teamPointsText}>{userTeam.points.toLocaleString()}</Text>
            <Text style={styles.teamPointsLabel}>Team Points</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStat}>
            <MaterialIcons name="jump-rope" size={20} color="#ffd700" />
            <Text style={styles.quickStatText}>3 Active</Text>
          </View>
          <View style={styles.quickStat}>
            <MaterialIcons name="trending-up" size={20} color="#4CAF50" />
            <Text style={styles.quickStatText}>Rank #3</Text>
          </View>
          <View style={styles.quickStat}>
            <MaterialIcons name="group" size={20} color="#fff" />
            <Text style={styles.quickStatText}>{userTeam.members} Members</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
        onPress={() => setSelectedTab('active')}
      >
        <MaterialIcons
          name="sports-esports"
          size={20}
          color={selectedTab === 'active' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[
          styles.tabText,
          selectedTab === 'active' && styles.activeTabText
        ]}>
          Active
        </Text>
        <Badge
          style={styles.tabBadge}
          visible={selectedTab !== 'active'}
          size={16}
        >
          3
        </Badge>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
        onPress={() => setSelectedTab('upcoming')}
      >
        <MaterialIcons
          name="schedule"
          size={20}
          color={selectedTab === 'upcoming' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[
          styles.tabText,
          selectedTab === 'upcoming' && styles.activeTabText
        ]}>
          Upcoming
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selectedTab === 'leaderboard' && styles.activeTab]}
        onPress={() => setSelectedTab('leaderboard')}
      >
        <MaterialIcons
          name="leaderboard"
          size={20}
          color={selectedTab === 'leaderboard' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[
          styles.tabText,
          selectedTab === 'leaderboard' && styles.activeTabText
        ]}>
          Rankings
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDifficultyChip = (difficulty) => {
    const colors = {
      Easy: '#4CAF50',
      Medium: '#FF9800',
      Hard: '#F44336',
    };

    return (
      <Chip
        mode="flat"
        style={[styles.difficultyChip, { backgroundColor: `${colors[difficulty]}20` }]}
        textStyle={[styles.difficultyText, { color: colors[difficulty] }]}
      >
        {difficulty}
      </Chip>
    );
  };

  const renderCompetitionCard = (competition) => (
    <TouchableOpacity
      key={competition.id}
      onPress={() => handleViewCompetitionDetails(competition)}
    >
      <Card style={styles.competitionCard}>
        <LinearGradient
          colors={competition.color}
          style={styles.competitionGradient}
        >
          <View style={styles.competitionHeader}>
            <View style={styles.competitionIcon}>
              <MaterialIcons name={competition.icon} size={28} color="#fff" />
            </View>
            
            <View style={styles.competitionBadges}>
              {renderDifficultyChip(competition.difficulty)}
              {competition.isJoined && (
                <Chip
                  mode="flat"
                  style={styles.joinedChip}
                  textStyle={styles.joinedText}
                >
                  Joined ✓
                </Chip>
              )}
            </View>
          </View>

          <View style={styles.competitionContent}>
            <Text style={styles.competitionTitle}>{competition.title}</Text>
            <Text style={styles.competitionDescription}>{competition.description}</Text>

            <View style={styles.competitionStats}>
              <View style={styles.statRow}>
                <MaterialIcons name="schedule" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.statText}>{competition.timeLeft} left</Text>
              </View>
              <View style={styles.statRow}>
                <MaterialIcons name="people" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.statText}>
                  {competition.participants}/{competition.maxParticipants} teams
                </Text>
              </View>
              <View style={styles.statRow}>
                <MaterialIcons name="jump-rope" size={16} color="#ffd700" />
                <Text style={styles.statText}>{competition.prize}</Text>
              </View>
            </View>

            {competition.isJoined && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Team Progress</Text>
                  <Text style={styles.progressRank}>
                    Rank #{competition.myTeamRank} of {competition.totalTeams}
                  </Text>
                </View>
                <ProgressBar
                  progress={competition.progress}
                  color="#ffd700"
                  style={styles.progressBar}
                />
                <Text style={styles.progressPercentage}>
                  {Math.round(competition.progress * 100)}% Complete
                </Text>
              </View>
            )}
          </View>

          <View style={styles.competitionActions}>
            {competition.isJoined ? (
              <Button
                mode="contained"
                buttonColor="rgba(255,255,255,0.2)"
                textColor="#fff"
                contentStyle={styles.actionButton}
                labelStyle={styles.actionButtonText}
                onPress={() => Alert.alert('Feature Coming Soon!', 'Competition details coming soon! 🚧')}
              >
                View Progress
              </Button>
            ) : (
              <Button
                mode="contained"
                buttonColor="#fff"
                textColor={competition.color[0]}
                contentStyle={styles.actionButton}
                labelStyle={styles.actionButtonText}
                onPress={() => handleJoinCompetition(competition)}
              >
                Join Competition
              </Button>
            )}
          </View>
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );

  const renderUpcomingCard = (competition) => (
    <Card key={competition.id} style={styles.upcomingCard}>
      <LinearGradient
        colors={[...competition.color, 'rgba(0,0,0,0.1)']}
        style={styles.upcomingGradient}
      >
        <View style={styles.upcomingHeader}>
          <View style={styles.upcomingIcon}>
            <MaterialIcons name={competition.icon} size={24} color="#fff" />
          </View>
          <View style={styles.upcomingInfo}>
            <Text style={styles.upcomingTitle}>{competition.title}</Text>
            <Text style={styles.upcomingDate}>Starts {competition.startDate}</Text>
          </View>
          {renderDifficultyChip(competition.difficulty)}
        </View>

        <Text style={styles.upcomingDescription}>{competition.description}</Text>

        <View style={styles.upcomingStats}>
          <View style={styles.upcomingStat}>
            <MaterialIcons name="schedule" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.upcomingStatText}>{competition.estimatedDuration}</Text>
          </View>
          <View style={styles.upcomingStat}>
            <MaterialIcons name="card-giftcard" size={16} color="#ffd700" />
            <Text style={styles.upcomingStatText}>{competition.prize}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notifyButton}>
          <MaterialIcons name="notifications" size={16} color={COLORS.primary} />
          <Text style={styles.notifyButtonText}>Notify Me</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Card>
  );

  const renderLeaderboardItem = (team, index) => (
    <TouchableOpacity key={team.rank}>
      <Surface style={[
        styles.leaderboardItem,
        team.isMyTeam && styles.myTeamItem
      ]}>
        <View style={styles.leaderboardLeft}>
          <View style={[
            styles.rankBadge,
            team.rank <= 3 && styles.topRankBadge
          ]}>
            {team.rank <= 3 ? (
              <MaterialIcons
                name={team.rank === 1 ? 'jump-rope' : team.rank === 2 ? 'workspace-premium' : 'military-tech'}
                size={20}
                color={team.rank === 1 ? '#FFD700' : team.rank === 2 ? '#C0C0C0' : '#CD7F32'}
              />
            ) : (
              <Text style={styles.rankNumber}>#{team.rank}</Text>
            )}
          </View>

          <Text style={styles.teamEmoji}>{team.emoji}</Text>
          
          <View style={styles.teamDetails}>
            <Text style={[
              styles.teamName,
              team.isMyTeam && styles.myTeamName
            ]}>
              {team.name}
              {team.isMyTeam && ' (Your Team)'}
            </Text>
            <Text style={styles.teamMembers}>{team.members} members</Text>
          </View>
        </View>

        <View style={styles.leaderboardRight}>
          <Text style={styles.teamPoints}>{team.points.toLocaleString()}</Text>
          <View style={styles.trendContainer}>
            <MaterialIcons
              name={
                team.trend === 'up' ? 'trending-up' :
                team.trend === 'down' ? 'trending-down' : 'trending-flat'
              }
              size={16}
              color={
                team.trend === 'up' ? '#4CAF50' :
                team.trend === 'down' ? '#F44336' : '#9E9E9E'
              }
            />
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderActiveTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Active Competitions 🏆</Text>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.competitionsList}
      >
        {activeCompetitions.map(renderCompetitionCard)}
        
        <Surface style={styles.createCompetitionCard}>
          <TouchableOpacity
            style={styles.createCompetitionButton}
            onPress={() => Alert.alert('Feature Coming Soon!', 'Create custom competitions coming soon! 🚧')}
          >
            <MaterialIcons name="add-circle" size={48} color={COLORS.primary} />
            <Text style={styles.createCompetitionText}>Create Team Competition</Text>
            <Text style={styles.createCompetitionSubtext}>
              Challenge other teams with custom competitions!
            </Text>
          </TouchableOpacity>
        </Surface>
      </ScrollView>
    </View>
  );

  const renderUpcomingTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Coming Soon 🚀</Text>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.upcomingList}
      >
        {upcomingCompetitions.map(renderUpcomingCard)}
        
        <Surface style={styles.suggestCompetitionCard}>
          <MaterialIcons name="lightbulb" size={32} color="#FFC107" />
          <Text style={styles.suggestTitle}>Have an idea?</Text>
          <Text style={styles.suggestDescription}>
            Suggest a competition theme and we might feature it next!
          </Text>
          <Button
            mode="outlined"
            style={styles.suggestButton}
            onPress={() => Alert.alert('Feature Coming Soon!', 'Competition suggestions coming soon! 💡')}
          >
            Suggest Competition
          </Button>
        </Surface>
      </ScrollView>
    </View>
  );

  const renderLeaderboardTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.sectionTitle}>Team Rankings 👑</Text>
        <Searchbar
          placeholder="Search teams..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.leaderboardList}
      >
        {teamLeaderboard
          .filter(team => 
            team.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(renderLeaderboardItem)
        }
        
        <Surface style={styles.leaderboardFooter}>
          <Text style={styles.footerText}>
            Keep competing to climb the rankings! 📈
          </Text>
        </Surface>
      </ScrollView>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'active':
        return renderActiveTab();
      case 'upcoming':
        return renderUpcomingTab();
      case 'leaderboard':
        return renderLeaderboardTab();
      default:
        return renderActiveTab();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              title="Loading competitions..."
              titleColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderTabBar()}
          {renderTabContent()}
        </ScrollView>

        {/* Trophy Animation Overlay */}
        <Animated.View
          style={[
            styles.trophyOverlay,
            {
              opacity: trophyAnim,
              transform: [{
                scale: trophyAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1.2]
                })
              }]
            }
          ]}
          pointerEvents="none"
        >
          <Text style={styles.trophyText}>🏆✨🎉✨🏆</Text>
        </Animated.View>

        <FAB
          style={styles.fab}
          icon="add"
          label="Join Competition"
          onPress={() => setSelectedTab('active')}
          color="#fff"
        />
      </Animated.View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    elevation: 4,
  },
  teamEmoji: {
    fontSize: 28,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
  },
  teamMotto: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
    marginTop: 2,
  },
  teamStats: {
    marginTop: SPACING.xs,
  },
  teamStatsText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  teamPointsContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: SPACING.md,
    borderRadius: 12,
    minWidth: 80,
  },
  pointsBadge: {
    marginBottom: SPACING.xs,
  },
  teamPointsText: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
  },
  teamPointsLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.md,
    borderRadius: 12,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStatText: {
    ...TEXT_STYLES.body,
    color: '#fff',
    marginLeft: SPACING.xs,
    fontSize: 13,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: `${COLORS.primary}15`,
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  tabBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
  },
  tabContent: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  competitionsList: {
    paddingBottom: SPACING.lg,
  },
  competitionCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  competitionGradient: {
    padding: SPACING.lg,
  },
  competitionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  competitionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  competitionBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyChip: {
    marginLeft: SPACING.sm,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  joinedChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    marginLeft: SPACING.sm,
  },
  joinedText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: 'bold',
  },
  competitionContent: {
    marginBottom: SPACING.lg,
  },
  competitionTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  competitionDescription: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  competitionStats: {
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statText: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: SPACING.sm,
    fontSize: 13,
  },
  progressContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: '#fff',
    fontWeight: '500',
  },
  progressRank: {
    ...TEXT_STYLES.caption,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.sm,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  competitionActions: {
    alignItems: 'center',
  },
  actionButton: {
    minWidth: 140,
    paddingVertical: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  createCompetitionCard: {
    padding: SPACING.xl,
    borderRadius: 16,
    elevation: 2,
    marginTop: SPACING.md,
  },
  createCompetitionButton: {
    alignItems: 'center',
  },
  createCompetitionText: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    marginTop: SPACING.md,
    fontWeight: 'bold',
  },
  createCompetitionSubtext: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  upcomingList: {
    paddingBottom: SPACING.lg,
  },
  upcomingCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  upcomingGradient: {
    padding: SPACING.lg,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  upcomingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    ...TEXT_STYLES.h4,
    color: '#fff',
    fontWeight: 'bold',
  },
  upcomingDate: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  upcomingDescription: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.md,
  },
  upcomingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  upcomingStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upcomingStatText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  notifyButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
    fontSize: 13,
  },
  suggestCompetitionCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: 16,
    elevation: 2,
    marginTop: SPACING.md,
  },
  suggestTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginTop: SPACING.md,
    fontWeight: 'bold',
  },
  suggestDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  suggestButton: {
    borderColor: '#FFC107',
  },
  leaderboardHeader: {
    marginBottom: SPACING.lg,
  },
  searchBar: {
    marginTop: SPACING.md,
    elevation: 2,
  },
  searchInput: {
    fontSize: 14,
  },
  leaderboardList: {
    paddingBottom: SPACING.lg,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
  },
  myTeamItem: {
    backgroundColor: `${COLORS.primary}15`,
    borderWidth: 2,
    borderColor: `${COLORS.primary}30`,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  topRankBadge: {
    backgroundColor: 'transparent',
  },
  rankNumber: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  teamDetails: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  myTeamName: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  teamMembers: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  leaderboardRight: {
    alignItems: 'flex-end',
  },
  teamPoints: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  trendContainer: {
    marginTop: 2,
  },
  leaderboardFooter: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  footerText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  trophyOverlay: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyText: {
    fontSize: 48,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
    elevation: 8,
  },
};

export default TeamCompetitions;