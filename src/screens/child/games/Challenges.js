import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Alert,
  StatusBar,
  Vibration,
  Dimensions,
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
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const Challenges = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, challenges, userProgress } = useSelector(state => state.challenges);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('active');
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [animatedValue] = useState(new Animated.Value(0));

  // Mock data for challenges
  const mockChallenges = [
    {
      id: 1,
      title: '7-Day Speed Boost! 🏃‍♂️',
      description: 'Improve your sprint speed every day for a week',
      category: 'speed',
      difficulty: 'easy',
      duration: '7 days',
      participants: 23,
      reward: 300,
      icon: 'flash-on',
      color: ['#FFD700', '#FFA500'],
      status: 'active',
      progress: 42,
      currentDay: 3,
      totalDays: 7,
      endDate: '2024-09-05',
      dailyTasks: [
        { day: 1, task: '10m sprint x3', completed: true },
        { day: 2, task: '15m sprint x3', completed: true },
        { day: 3, task: '20m sprint x3', completed: false },
        { day: 4, task: '25m sprint x3', completed: false },
      ],
      leaderboard: [
        { name: 'Alex M.', score: 85, avatar: 'A' },
        { name: 'Sarah K.', score: 78, avatar: 'S' },
        { name: 'You', score: 42, avatar: 'Y' },
      ]
    },
    {
      id: 2,
      title: 'Ball Control Master 🎯',
      description: 'Perfect your ball control skills with daily drills',
      category: 'skill',
      difficulty: 'medium',
      duration: '14 days',
      participants: 45,
      reward: 500,
      icon: 'sports-soccer',
      color: ['#4CAF50', '#2E7D32'],
      status: 'active',
      progress: 71,
      currentDay: 10,
      totalDays: 14,
      endDate: '2024-09-10',
      dailyTasks: [
        { day: 1, task: 'Juggling 20x', completed: true },
        { day: 2, task: 'Cone weaving 3 sets', completed: true },
        { day: 3, task: 'Wall passes 50x', completed: true },
      ],
      leaderboard: [
        { name: 'Emma L.', score: 95, avatar: 'E' },
        { name: 'You', score: 71, avatar: 'Y' },
        { name: 'Mike R.', score: 68, avatar: 'M' },
      ]
    },
    {
      id: 3,
      title: 'Team Spirit Challenge 🤝',
      description: 'Participate in team activities and help teammates',
      category: 'teamwork',
      difficulty: 'easy',
      duration: '10 days',
      participants: 67,
      reward: 400,
      icon: 'group',
      color: ['#2196F3', '#1565C0'],
      status: 'available',
      progress: 0,
      currentDay: 0,
      totalDays: 10,
      endDate: '2024-09-12',
      dailyTasks: [
        { day: 1, task: 'Help a teammate with drill', completed: false },
        { day: 2, task: 'Share training tip', completed: false },
        { day: 3, task: 'Encourage 3 teammates', completed: false },
      ],
      leaderboard: []
    },
    {
      id: 4,
      title: 'Fitness Beast Mode 💪',
      description: 'Complete strength and conditioning challenges',
      category: 'fitness',
      difficulty: 'hard',
      duration: '21 days',
      participants: 34,
      reward: 750,
      icon: 'fitness-center',
      color: ['#9C27B0', '#6A1B9A'],
      status: 'available',
      progress: 0,
      currentDay: 0,
      totalDays: 21,
      endDate: '2024-09-20',
      dailyTasks: [
        { day: 1, task: '20 push-ups, 30 sit-ups', completed: false },
        { day: 2, task: '25 squats, 1min plank', completed: false },
        { day: 3, task: '15 burpees, 40 jumping jacks', completed: false },
      ],
      leaderboard: []
    },
    {
      id: 5,
      title: 'Goal Scorer Supreme ⚽',
      description: 'Score goals in different ways and situations',
      category: 'goals',
      difficulty: 'medium',
      duration: '12 days',
      participants: 28,
      reward: 450,
      icon: 'sports-soccer',
      color: ['#FF5722', '#D84315'],
      status: 'completed',
      progress: 100,
      currentDay: 12,
      totalDays: 12,
      completedDate: '2024-08-25',
      finalScore: 88,
      position: 2,
      dailyTasks: [
        { day: 1, task: 'Score from penalty spot', completed: true },
        { day: 2, task: 'Score with weak foot', completed: true },
        { day: 3, task: 'Score from free kick', completed: true },
      ],
      leaderboard: [
        { name: 'Jordan P.', score: 92, avatar: 'J' },
        { name: 'You', score: 88, avatar: 'Y' },
        { name: 'Taylor S.', score: 85, avatar: 'T' },
      ]
    },
    {
      id: 6,
      title: 'Weekly Warrior 🏆',
      description: 'Complete all weekly training sessions',
      category: 'consistency',
      difficulty: 'easy',
      duration: '7 days',
      participants: 89,
      reward: 250,
      icon: 'event',
      color: ['#795548', '#5D4037'],
      status: 'expired',
      progress: 57,
      currentDay: 4,
      totalDays: 7,
      endDate: '2024-08-20',
      dailyTasks: [
        { day: 1, task: 'Complete training session', completed: true },
        { day: 2, task: 'Complete training session', completed: true },
        { day: 3, task: 'Complete training session', completed: true },
        { day: 4, task: 'Complete training session', completed: true },
      ],
      leaderboard: []
    }
  ];

  const tabs = [
    { key: 'active', label: 'Active', icon: 'play-arrow', count: 2 },
    { key: 'available', label: 'Available', icon: 'explore', count: 2 },
    { key: 'completed', label: 'Completed', icon: 'check-circle', count: 1 },
    { key: 'expired', label: 'Expired', icon: 'schedule', count: 1 }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return COLORS.primary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'available': return '#2196F3';
      case 'completed': return '#9C27B0';
      case 'expired': return '#757575';
      default: return COLORS.primary;
    }
  };

  const filteredChallenges = mockChallenges.filter(challenge => {
    const matchesTab = challenge.status === selectedTab;
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('🎯 Challenges Updated!', 'New challenges are available! Check them out!');
    }, 2000);
  }, []);

  const handleChallengePress = (challenge) => {
    Vibration.vibrate(50);
    setSelectedChallenge(challenge);
    setShowChallengeModal(true);
  };

  const handleJoinChallenge = (challenge) => {
    Vibration.vibrate(100);
    Alert.alert(
      '🎉 Challenge Joined!',
      `You've successfully joined "${challenge.title}"! Good luck and have fun!`,
      [
        {
          text: 'Let\'s Go! 💪',
          onPress: () => {
            setShowChallengeModal(false);
            // Update challenge status to active
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.headerGradient}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>🎯 Challenges</Text>
        <Text style={styles.headerSubtitle}>Take on fun challenges and compete with friends!</Text>
        
        <Searchbar
          placeholder="Search challenges..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </View>
    </LinearGradient>
  );

  const renderTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tabContainer}
      contentContainerStyle={styles.tabContent}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setSelectedTab(tab.key)}
          style={[
            styles.tab,
            selectedTab === tab.key && styles.selectedTab
          ]}
        >
          <Icon 
            name={tab.icon} 
            size={20} 
            color={selectedTab === tab.key ? '#FFF' : COLORS.primary} 
          />
          <Text style={[
            styles.tabText,
            selectedTab === tab.key && styles.selectedTabText
          ]}>
            {tab.label}
          </Text>
          {tab.count > 0 && (
            <Surface style={[
              styles.tabBadge,
              selectedTab === tab.key && styles.selectedTabBadge
            ]}>
              <Text style={[
                styles.tabBadgeText,
                selectedTab === tab.key && styles.selectedTabBadgeText
              ]}>
                {tab.count}
              </Text>
            </Surface>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderChallengeCard = (challenge, index) => {
    const animatedStyle = {
      opacity: animatedValue,
      transform: [{
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [50 + (index * 20), 0],
        }),
      }],
    };

    const timeLeft = new Date(challenge.endDate) - new Date();
    const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

    return (
      <Animated.View key={challenge.id} style={animatedStyle}>
        <TouchableOpacity onPress={() => handleChallengePress(challenge)}>
          <Card style={styles.challengeCard}>
            <LinearGradient
              colors={challenge.color}
              style={styles.cardHeader}
            >
              <View style={styles.cardHeaderContent}>
                <View style={styles.challengeIcon}>
                  <Icon name={challenge.icon} size={30} color="#FFF" />
                </View>
                <View style={styles.challengeHeaderInfo}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                </View>
                <View style={styles.challengeMeta}>
                  <Chip 
                    mode="outlined"
                    style={styles.difficultyChip}
                    textStyle={styles.difficultyText}
                  >
                    {challenge.difficulty.toUpperCase()}
                  </Chip>
                </View>
              </View>
            </LinearGradient>
            
            <Card.Content style={styles.cardContent}>
              <View style={styles.challengeStats}>
                <View style={styles.statItem}>
                  <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.statText}>{challenge.duration}</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="group" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.statText}>{challenge.participants} joined</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="stars" size={16} color="#FFD700" />
                  <Text style={styles.statText}>+{challenge.reward} XP</Text>
                </View>
              </View>
              
              {challenge.status === 'active' && (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>
                      Progress: Day {challenge.currentDay}/{challenge.totalDays}
                    </Text>
                    <Text style={styles.progressPercentage}>{challenge.progress}%</Text>
                  </View>
                  <ProgressBar 
                    progress={challenge.progress / 100}
                    color={challenge.color[0]}
                    style={styles.progressBar}
                  />
                  <Text style={styles.daysLeft}>
                    ⏰ {daysLeft} days left
                  </Text>
                </View>
              )}
              
              {challenge.status === 'completed' && (
                <View style={styles.completedSection}>
                  <Icon name="check-circle" size={24} color="#4CAF50" />
                  <Text style={styles.completedText}>
                    Challenge Completed! 🎉
                  </Text>
                  <Text style={styles.finalScoreText}>
                    Final Score: {challenge.finalScore} | Position: #{challenge.position}
                  </Text>
                </View>
              )}
              
              {challenge.status === 'available' && (
                <View style={styles.availableSection}>
                  <Text style={styles.availableText}>
                    Ready to take on this challenge? 💪
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => handleJoinChallenge(challenge)}
                    style={[styles.joinButton, { backgroundColor: challenge.color[0] }]}
                    labelStyle={styles.joinButtonText}
                  >
                    Join Challenge
                  </Button>
                </View>
              )}
              
              {challenge.status === 'expired' && (
                <View style={styles.expiredSection}>
                  <Icon name="schedule" size={20} color="#757575" />
                  <Text style={styles.expiredText}>
                    Challenge expired on {new Date(challenge.endDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderLeaderboard = (leaderboard) => (
    <View style={styles.leaderboardSection}>
      <Text style={styles.leaderboardTitle}>🏆 Leaderboard</Text>
      {leaderboard.map((player, index) => (
        <View key={index} style={styles.leaderboardItem}>
          <View style={styles.leaderboardRank}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
          <Avatar.Text 
            size={32} 
            label={player.avatar} 
            style={[
              styles.playerAvatar,
              player.name === 'You' && styles.currentPlayerAvatar
            ]}
          />
          <Text style={[
            styles.playerName,
            player.name === 'You' && styles.currentPlayerName
          ]}>
            {player.name}
          </Text>
          <Text style={styles.playerScore}>{player.score} pts</Text>
        </View>
      ))}
    </View>
  );

  const renderDailyTasks = (dailyTasks, currentDay) => (
    <View style={styles.tasksSection}>
      <Text style={styles.tasksTitle}>📋 Daily Tasks</Text>
      {dailyTasks.slice(0, Math.min(currentDay + 1, dailyTasks.length)).map((task, index) => (
        <View key={index} style={styles.taskItem}>
          <Icon 
            name={task.completed ? 'check-circle' : 'radio-button-unchecked'} 
            size={20} 
            color={task.completed ? '#4CAF50' : '#BDBDBD'} 
          />
          <Text style={[
            styles.taskText,
            task.completed && styles.completedTaskText
          ]}>
            Day {task.day}: {task.task}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderChallengeModal = () => (
    <Portal>
      <Modal
        visible={showChallengeModal}
        onDismiss={() => setShowChallengeModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          {selectedChallenge && (
            <Surface style={styles.modalContent}>
              <LinearGradient
                colors={selectedChallenge.color}
                style={styles.modalHeader}
              >
                <IconButton
                  icon="close"
                  size={24}
                  iconColor="#FFF"
                  style={styles.closeButton}
                  onPress={() => setShowChallengeModal(false)}
                />
                <Icon 
                  name={selectedChallenge.icon} 
                  size={60} 
                  color="#FFF"
                  style={styles.modalIcon}
                />
                <Text style={styles.modalTitle}>{selectedChallenge.title}</Text>
              </LinearGradient>
              
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalDescription}>{selectedChallenge.description}</Text>
                
                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Icon name="schedule" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.modalStatText}>{selectedChallenge.duration}</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Icon name="group" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.modalStatText}>{selectedChallenge.participants} joined</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Icon name="stars" size={20} color="#FFD700" />
                    <Text style={styles.modalStatText}>+{selectedChallenge.reward} XP</Text>
                  </View>
                </View>
                
                {selectedChallenge.dailyTasks && selectedChallenge.dailyTasks.length > 0 && (
                  renderDailyTasks(selectedChallenge.dailyTasks, selectedChallenge.currentDay)
                )}
                
                {selectedChallenge.leaderboard && selectedChallenge.leaderboard.length > 0 && (
                  renderLeaderboard(selectedChallenge.leaderboard)
                )}
                
                {selectedChallenge.status === 'available' && (
                  <Button
                    mode="contained"
                    onPress={() => handleJoinChallenge(selectedChallenge)}
                    style={[styles.modalJoinButton, { backgroundColor: selectedChallenge.color[0] }]}
                    labelStyle={styles.modalJoinButtonText}
                  >
                    Join This Challenge 🚀
                  </Button>
                )}
              </ScrollView>
            </Surface>
          )}
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Loading new challenges..."
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderTabs()}
        
        <View style={styles.challengesSection}>
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map((challenge, index) => 
              renderChallengeCard(challenge, index)
            )
          ) : (
            <View style={styles.emptyState}>
              <Icon name="explore-off" size={80} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>No challenges found</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery ? 'Try searching with different keywords' : 'Check back soon for new challenges!'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('🎯 Coming Soon!', 'Custom challenges feature is coming soon! Stay tuned!')}
      />
      
      {renderChallengeModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  searchBar: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    elevation: 0,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  scrollView: {
    flex: 1,
  },
  tabContainer: {
    backgroundColor: '#FFF',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabContent: {
    paddingHorizontal: SPACING.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  selectedTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    color: COLORS.primary,
  },
  selectedTabText: {
    color: '#FFF',
  },
  tabBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTabBadge: {
    backgroundColor: '#FFD700',
  },
  tabBadgeText: {
    ...TEXT_STYLES.caption,
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectedTabBadgeText: {
    color: '#333',
  },
  challengesSection: {
    padding: SPACING.md,
  },
  challengeCard: {
    marginBottom: SPACING.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  challengeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  challengeHeaderInfo: {
    flex: 1,
  },
  challengeTitle: {
    ...TEXT_STYLES.h3,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  challengeDescription: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
  },
  challengeMeta: {
    alignItems: 'flex-end',
  },
  difficultyChip: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  difficultyText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: SPACING.md,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  progressSection: {
    marginTop: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    marginBottom: SPACING.sm,
  },
  daysLeft: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  completedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  completedText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  finalScoreText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  availableSection: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  availableText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  joinButton: {
    borderRadius: 25,
    paddingHorizontal: SPACING.lg,
  },
  joinButtonText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  expiredSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(117, 117, 117, 0.1)',
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  expiredText: {
    ...TEXT_STYLES.body,
    color: '#757575',
    marginLeft: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomPadding: {
    height: 100,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
  },
  modalHeader: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: SPACING.lg,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  modalIcon: {
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalBody: {
    backgroundColor: '#FFF',
    padding: SPACING.lg,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    fontWeight: '500',
    color: COLORS.text,
  },
  // Tasks section styles
  tasksSection: {
    marginBottom: SPACING.lg,
  },
  tasksTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  taskText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.text,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  // Leaderboard styles
  leaderboardSection: {
    marginBottom: SPACING.lg,
  },
  leaderboardTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  leaderboardRank: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  playerAvatar: {
    marginHorizontal: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  currentPlayerAvatar: {
    backgroundColor: '#FFD700',
  },
  playerName: {
    ...TEXT_STYLES.body,
    flex: 1,
    fontWeight: '500',
    color: COLORS.text,
  },
  currentPlayerName: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  playerScore: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalJoinButton: {
    borderRadius: 25,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.lg,
  },
  modalJoinButtonText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Challenges;