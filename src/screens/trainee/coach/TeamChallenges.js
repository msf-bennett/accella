import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  Vibration,
  ImageBackground,
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
  ProgressBar,
  Portal,
  Badge,
} from 'react-native-paper';
import { BlurView } from 'expo-blur';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  info: '#2196F3',
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
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const TeamChallenges = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, team, challenges } = useSelector(state => ({
    user: state.auth.user,
    team: state.team.currentTeam || {},
    challenges: state.challenges.teamChallenges || [],
  }));

  const [activeTab, setActiveTab] = useState('active');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    loadChallenges();
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual Redux action
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchTeamChallenges({ teamId: team.id }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }, [team.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  }, [loadChallenges]);

  const handleJoinChallenge = useCallback(async (challenge) => {
    try {
      setLoading(true);
      Vibration.vibrate(100);
      
      // Simulate joining challenge
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        '🎉 Challenge Joined!',
        `You've successfully joined "${challenge.title}". Good luck!`,
        [{ text: 'Let\'s Go!', onPress: () => setShowChallengeModal(false) }]
      );
      
      // dispatch(joinChallenge({ challengeId: challenge.id, teamId: team.id }));
      await loadChallenges();
    } catch (error) {
      Alert.alert('Join Failed', 'Please try again later');
    } finally {
      setLoading(false);
    }
  }, [loadChallenges, team.id]);

  const handleCompleteChallenge = useCallback(async (challenge) => {
    try {
      setLoading(true);
      
      // Simulate completion
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        '🏆 Challenge Completed!',
        `Congratulations! You've earned ${challenge.points} points and unlocked new achievements!`,
        [{ text: 'Awesome!', onPress: () => setShowChallengeModal(false) }]
      );
      
      // dispatch(completeChallenge({ challengeId: challenge.id }));
      await loadChallenges();
    } catch (error) {
      Alert.alert('Completion Failed', 'Please try again later');
    } finally {
      setLoading(false);
    }
  }, [loadChallenges]);

  const filterChallenges = useCallback((type) => {
    return mockChallenges.filter(challenge => {
      const matchesSearch = searchQuery === '' || 
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
        
      switch (type) {
        case 'active':
          return (challenge.status === 'active' || challenge.status === 'joined') && matchesSearch;
        case 'available':
          return challenge.status === 'available' && matchesSearch;
        case 'completed':
          return challenge.status === 'completed' && matchesSearch;
        default:
          return matchesSearch;
      }
    });
  }, [searchQuery]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return COLORS.success;
      case 'medium': return COLORS.warning;
      case 'hard': return COLORS.error;
      case 'extreme': return COLORS.secondary;
      default: return COLORS.textSecondary;
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'trending-up';
      case 'medium': return 'show-chart';
      case 'hard': return 'trending-up';
      case 'extreme': return 'whatshot';
      default: return 'help';
    }
  };

  const getChallengeTypeIcon = (type) => {
    switch (type) {
      case 'fitness': return 'fitness-center';
      case 'endurance': return 'directions-run';
      case 'strength': return 'sports-gymnastics';
      case 'team': return 'group';
      case 'skill': return 'sports-soccer';
      case 'mental': return 'psychology';
      default: return 'jump-rope';
    }
  };

  const formatDuration = (hours) => {
    if (hours < 24) {
      return `${hours} hours`;
    } else if (hours < 168) {
      return `${Math.floor(hours / 24)} days`;
    } else {
      return `${Math.floor(hours / 168)} weeks`;
    }
  };

  const renderChallengeCard = ({ item, index }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    const isActive = item.status === 'joined' || item.status === 'active';
    const progressPercentage = item.progress || 0;

    return (
      <Animated.View
        style={[
          styles.challengeCard,
          {
            opacity: cardAnim,
            transform: [{
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            setSelectedChallenge(item);
            setShowChallengeModal(true);
          }}
          activeOpacity={0.9}
        >
          <Card style={styles.card} elevation={4}>
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.cardBackground}
              imageStyle={styles.cardBackgroundImage}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.cardGradient}
              >
                <Card.Content style={styles.cardContent}>
                  {/* Challenge Header */}
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeMeta}>
                      <Chip
                        icon={getDifficultyIcon(item.difficulty)}
                        style={[
                          styles.difficultyChip,
                          { backgroundColor: getDifficultyColor(item.difficulty) + '20' }
                        ]}
                        textStyle={{ 
                          color: getDifficultyColor(item.difficulty), 
                          fontSize: 11,
                          fontWeight: '600'
                        }}
                        compact
                      >
                        {item.difficulty.toUpperCase()}
                      </Chip>
                      
                      {item.status === 'joined' && (
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                          <Badge
                            style={[styles.statusBadge, { backgroundColor: COLORS.success }]}
                          />
                        </Animated.View>
                      )}
                    </View>
                    
                    <View style={styles.pointsContainer}>
                      <Icon name="stars" size={16} color={COLORS.gold} />
                      <Text style={styles.pointsText}>{item.points}</Text>
                    </View>
                  </View>

                  {/* Challenge Title */}
                  <Text style={[TEXT_STYLES.h3, styles.challengeTitle]}>
                    {item.title}
                  </Text>
                  
                  <Text style={styles.challengeDescription} numberOfLines={2}>
                    {item.description}
                  </Text>

                  {/* Challenge Stats */}
                  <View style={styles.challengeStats}>
                    <View style={styles.statItem}>
                      <Icon name="schedule" size={16} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.statText}>{formatDuration(item.duration)}</Text>
                    </View>
                    
                    <View style={styles.statItem}>
                      <Icon name="group" size={16} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.statText}>{item.participants} joined</Text>
                    </View>
                    
                    <View style={styles.statItem}>
                      <Icon name={getChallengeTypeIcon(item.type)} size={16} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.statText}>{item.type}</Text>
                    </View>
                  </View>

                  {/* Progress Bar (for active challenges) */}
                  {isActive && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressText}>Progress</Text>
                        <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
                      </View>
                      <ProgressBar
                        progress={progressPercentage / 100}
                        color={COLORS.gold}
                        style={styles.progressBar}
                      />
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.challengeActions}>
                    {item.status === 'available' && (
                      <Button
                        mode="contained"
                        onPress={(e) => {
                          e.stopPropagation();
                          handleJoinChallenge(item);
                        }}
                        style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                        loading={loading}
                        disabled={loading}
                        compact
                      >
                        🚀 Join Challenge
                      </Button>
                    )}
                    
                    {item.status === 'joined' && progressPercentage < 100 && (
                      <Button
                        mode="outlined"
                        onPress={(e) => {
                          e.stopPropagation();
                          Alert.alert('Feature Coming Soon', 'Progress tracking will be available soon');
                        }}
                        style={[styles.actionButton, { borderColor: '#fff' }]}
                        textColor="#fff"
                        compact
                      >
                        📊 Update Progress
                      </Button>
                    )}
                    
                    {item.status === 'joined' && progressPercentage >= 100 && (
                      <Button
                        mode="contained"
                        onPress={(e) => {
                          e.stopPropagation();
                          handleCompleteChallenge(item);
                        }}
                        style={[styles.actionButton, { backgroundColor: COLORS.success }]}
                        loading={loading}
                        disabled={loading}
                        compact
                      >
                        🏆 Complete
                      </Button>
                    )}
                    
                    {item.status === 'completed' && (
                      <Chip
                        icon="check-circle"
                        style={[styles.completedChip, { backgroundColor: COLORS.success + '20' }]}
                        textStyle={{ color: COLORS.success, fontWeight: '600' }}
                        compact
                      >
                        COMPLETED
                      </Chip>
                    )}
                  </View>
                </Card.Content>
              </LinearGradient>
            </ImageBackground>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderLeaderboardItem = ({ item, index }) => {
    const getRankIcon = (rank) => {
      switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return `#${rank}`;
      }
    };

    const getRankColor = (rank) => {
      switch (rank) {
        case 1: return COLORS.gold;
        case 2: return COLORS.silver;
        case 3: return COLORS.bronze;
        default: return COLORS.textSecondary;
      }
    };

    return (
      <Surface style={styles.leaderboardItem}>
        <View style={styles.leaderboardRank}>
          <Text style={[styles.rankText, { color: getRankColor(item.rank) }]}>
            {getRankIcon(item.rank)}
          </Text>
        </View>
        
        <Avatar.Image 
          size={40} 
          source={{ uri: item.avatar }}
          style={styles.leaderboardAvatar}
        />
        
        <View style={styles.leaderboardInfo}>
          <Text style={styles.leaderboardName}>{item.name}</Text>
          <Text style={styles.leaderboardTeam}>{item.team}</Text>
        </View>
        
        <View style={styles.leaderboardPoints}>
          <Text style={styles.pointsValue}>{item.totalPoints}</Text>
          <Text style={styles.pointsLabel}>points</Text>
        </View>
      </Surface>
    );
  };

  // Mock data for demonstration
  const mockChallenges = [
    {
      id: '1',
      title: '30-Day Fitness Revolution',
      description: 'Complete 30 consecutive days of training with at least 45 minutes per session',
      type: 'fitness',
      difficulty: 'medium',
      duration: 720, // 30 days in hours
      points: 500,
      participants: 156,
      status: 'joined',
      progress: 65,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      title: 'Team Spirit Challenge',
      description: 'Work together as a team to achieve collective goals and boost team chemistry',
      type: 'team',
      difficulty: 'easy',
      duration: 168, // 1 week
      points: 300,
      participants: 89,
      status: 'available',
      progress: 0,
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop'
    },
    {
      id: '3',
      title: 'Iron Will Endurance',
      description: 'Push your limits with extreme endurance training sessions',
      type: 'endurance',
      difficulty: 'extreme',
      duration: 336, // 2 weeks
      points: 1000,
      participants: 23,
      status: 'available',
      progress: 0,
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop'
    },
    {
      id: '4',
      title: 'Strength Master',
      description: 'Increase your maximum lift by 15% across all major compound movements',
      type: 'strength',
      difficulty: 'hard',
      duration: 504, // 3 weeks
      points: 750,
      participants: 67,
      status: 'joined',
      progress: 100,
      image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      title: 'Mental Toughness',
      description: 'Develop mental resilience through meditation and mindfulness training',
      type: 'mental',
      difficulty: 'medium',
      duration: 240, // 10 days
      points: 400,
      participants: 134,
      status: 'completed',
      progress: 100,
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68e71?w=400&h=300&fit=crop'
    }
  ];

  const mockLeaderboard = [
    {
      id: '1',
      name: 'Alex Rodriguez',
      team: 'Thunder Hawks',
      totalPoints: 2350,
      rank: 1,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      team: 'Lightning Bolts',
      totalPoints: 2180,
      rank: 2,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c77e?w=150'
    },
    {
      id: '3',
      name: 'Mike Chen',
      team: 'Storm Eagles',
      totalPoints: 2050,
      rank: 3,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    {
      id: '4',
      name: 'Emma Davis',
      team: 'Fire Dragons',
      totalPoints: 1920,
      rank: 4,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
    },
    {
      id: '5',
      name: 'David Kim',
      team: 'Ice Wolves',
      totalPoints: 1850,
      rank: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    }
  ];

  const displayChallenges = filterChallenges(activeTab);
  const activeChallenges = filterChallenges('active').length;
  const completedChallenges = filterChallenges('completed').length;
  const totalPoints = mockLeaderboard.find(item => item.name === (user?.name || 'Alex Rodriguez'))?.totalPoints || 0;

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Team Challenges 🏆</Text>
              <Text style={styles.headerSubtitle}>
                Push your limits and earn rewards
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.leaderboardButton}
                onPress={() => setShowLeaderboard(true)}
              >
                <Icon name="leaderboard" size={24} color="#fff" />
                <Badge style={styles.leaderboardBadge}>!</Badge>
              </TouchableOpacity>
              <IconButton
                icon="notifications"
                iconColor="#fff"
                size={24}
                onPress={() => Alert.alert('Feature Coming Soon', 'Notifications will be available soon')}
              />
            </View>
          </View>
          
          <Searchbar
            placeholder="Search challenges..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            placeholderTextColor={COLORS.textSecondary}
          />
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Quick Stats */}
        <Animated.View 
          style={[
            styles.statsContainer,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.statsRow}>
            <Surface style={styles.statCard}>
              <Icon name="jump-rope" size={24} color={COLORS.gold} />
              <Text style={styles.statNumber}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </Surface>
            
            <Surface style={styles.statCard}>
              <Icon name="trending-up" size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>{activeChallenges}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </Surface>
            
            <Surface style={styles.statCard}>
              <Icon name="check-circle" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{completedChallenges}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Surface>
          </View>
        </Animated.View>

        {/* Challenge Tabs */}
        <View style={styles.tabContainer}>
          {['active', 'available', 'completed'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {tab === 'active' && activeChallenges > 0 && (
                <Badge style={styles.tabBadge}>{activeChallenges}</Badge>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Challenges List */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {displayChallenges.length > 0 ? (
            <FlatList
              data={displayChallenges}
              renderItem={renderChallengeCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.challengesList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="jump-rope" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No challenges found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new challenges!'}
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Challenge Detail Modal */}
      <Portal>
        <Modal
          visible={showChallengeModal}
          animationType="slide"
          onRequestClose={() => setShowChallengeModal(false)}
        >
          <BlurView style={styles.modalOverlay} blurType="dark" blurAmount={10}>
            <View style={styles.modalContainer}>
              <Surface style={styles.modalContent}>
                {selectedChallenge && (
                  <>
                    <ImageBackground
                      source={{ uri: selectedChallenge.image }}
                      style={styles.modalHeader}
                      imageStyle={styles.modalHeaderImage}
                    >
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.modalHeaderGradient}
                      >
                        <View style={styles.modalHeaderContent}>
                          <View style={styles.modalHeaderTop}>
                            <Chip
                              icon={getDifficultyIcon(selectedChallenge.difficulty)}
                              style={[
                                styles.difficultyChip,
                                { backgroundColor: getDifficultyColor(selectedChallenge.difficulty) + '20' }
                              ]}
                              textStyle={{ 
                                color: getDifficultyColor(selectedChallenge.difficulty), 
                                fontWeight: '600'
                              }}
                            >
                              {selectedChallenge.difficulty.toUpperCase()}
                            </Chip>
                            <IconButton
                              icon="close"
                              iconColor="#fff"
                              onPress={() => setShowChallengeModal(false)}
                            />
                          </View>
                          
                          <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
                            {selectedChallenge.title}
                          </Text>
                          
                          <View style={styles.modalHeaderStats}>
                            <View style={styles.modalStat}>
                              <Icon name="stars" size={20} color={COLORS.gold} />
                              <Text style={styles.modalStatText}>{selectedChallenge.points} Points</Text>
                            </View>
                            <View style={styles.modalStat}>
                              <Icon name="schedule" size={20} color="#fff" />
                              <Text style={styles.modalStatText}>{formatDuration(selectedChallenge.duration)}</Text>
                            </View>
                            <View style={styles.modalStat}>
                              <Icon name="group" size={20} color="#fff" />
                              <Text style={styles.modalStatText}>{selectedChallenge.participants} joined</Text>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </ImageBackground>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                      <View style={styles.modalSection}>
                        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Description</Text>
                        <Text style={styles.challengeDetailDescription}>
                          {selectedChallenge.description}
                        </Text>
                      </View>

                      {selectedChallenge.status === 'joined' && (
                        <View style={styles.modalSection}>
                          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Your Progress</Text>
                          <View style={styles.progressDetailContainer}>
                            <View style={styles.progressDetailHeader}>
                              <Text style={styles.progressDetailText}>
                                {selectedChallenge.progress}% Complete
                              </Text>
                              <Text style={styles.progressDetailSubtext}>
                                Keep pushing! You're doing great! 💪
                              </Text>
                            </View>
                            <ProgressBar
                              progress={selectedChallenge.progress / 100}
                              color={COLORS.success}
                              style={styles.progressDetailBar}
                            />
                          </View>
                        </View>
                      )}

                      <View style={styles.modalSection}>
                        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Challenge Rules</Text>
                        <View style={styles.rulesList}>
                          <Text style={styles.ruleItem}>• Complete all required activities within the time limit</Text>
                          <Text style={styles.ruleItem}>• Track your progress daily for best results</Text>
                          <Text style={styles.ruleItem}>• Support your teammates throughout the challenge</Text>
                          <Text style={styles.ruleItem}>• Maintain consistency for maximum points</Text>
                        </View>
                      </View>

                      <View style={styles.modalSection}>
                        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Rewards 🎁</Text>
                        <View style={styles.rewardsContainer}>
                          <View style={styles.rewardItem}>
                            <Icon name="stars" size={20} color={COLORS.gold} />
                            <Text style={styles.rewardText}>{selectedChallenge.points} XP Points</Text>
                          </View>
                          <View style={styles.rewardItem}>
                            <Icon name="jump-rope" size={20} color={COLORS.gold} />
                            <Text style={styles.rewardText}>Achievement Badge</Text>
                          </View>
                          <View style={styles.rewardItem}>
                            <Icon name="trending-up" size={20} color={COLORS.success} />
                            <Text style={styles.rewardText}>Leaderboard Boost</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.modalActions}>
                        {selectedChallenge.status === 'available' && (
                          <Button
                            mode="contained"
                            onPress={() => handleJoinChallenge(selectedChallenge)}
                            style={[styles.modalActionButton, { backgroundColor: COLORS.primary }]}
                            loading={loading}
                            disabled={loading}
                          >
                            🚀 Join This Challenge
                          </Button>
                        )}
                        
                        {selectedChallenge.status === 'joined' && selectedChallenge.progress < 100 && (
                          <Button
                            mode="contained"
                            onPress={() => Alert.alert('Feature Coming Soon', 'Progress tracking will be available soon')}
                            style={[styles.modalActionButton, { backgroundColor: COLORS.success }]}
                          >
                            📊 Update Progress
                          </Button>
                        )}
                        
                        {selectedChallenge.status === 'joined' && selectedChallenge.progress >= 100 && (
                          <Button
                            mode="contained"
                            onPress={() => handleCompleteChallenge(selectedChallenge)}
                            style={[styles.modalActionButton, { backgroundColor: COLORS.gold }]}
                            loading={loading}
                            disabled={loading}
                          >
                            🏆 Complete Challenge
                          </Button>
                        )}
                      </View>
                    </ScrollView>
                  </>
                )}
              </Surface>
            </View>
          </BlurView>
        </Modal>

        {/* Leaderboard Modal */}
        <Modal
          visible={showLeaderboard}
          animationType="slide"
          onRequestClose={() => setShowLeaderboard(false)}
        >
          <BlurView style={styles.modalOverlay} blurType="dark" blurAmount={10}>
            <View style={styles.modalContainer}>
              <Surface style={styles.modalContent}>
                <View style={styles.leaderboardHeader}>
                  <Text style={[TEXT_STYLES.h2, styles.leaderboardTitle]}>🏆 Leaderboard</Text>
                  <IconButton
                    icon="close"
                    onPress={() => setShowLeaderboard(false)}
                  />
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                  <FlatList
                    data={mockLeaderboard}
                    renderItem={renderLeaderboardItem}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.leaderboardList}
                  />
                </ScrollView>
              </Surface>
            </View>
          </BlurView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        label="Create Challenge"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Create Challenge',
            'Challenge creation feature coming soon! You\'ll be able to create custom team challenges.',
            [{ text: 'Got it!', style: 'default' }]
          );
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  leaderboardBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    fontSize: 8,
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    elevation: 0,
  },
  statsContainer: {
    margin: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    flexDirection: 'row',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: '#fff',
  },
  tabBadge: {
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.error,
    fontSize: 10,
  },
  challengesList: {
    paddingBottom: SPACING.lg,
  },
  challengeCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardBackground: {
    height: 240,
  },
  cardBackgroundImage: {
    borderRadius: 16,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardContent: {
    paddingBottom: SPACING.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  difficultyChip: {
    height: 28,
  },
  statusBadge: {
    backgroundColor: COLORS.success,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 15,
    gap: SPACING.xs,
  },
  pointsText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  challengeTitle: {
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  challengeDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercentage: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  challengeActions: {
    alignItems: 'center',
  },
  actionButton: {
    minWidth: 160,
  },
  completedChip: {
    alignSelf: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  bottomSpacing: {
    height: 80,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.95,
    maxHeight: height * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    height: 200,
  },
  modalHeaderImage: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeaderGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalHeaderContent: {
    padding: SPACING.lg,
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: '#fff',
    marginBottom: SPACING.md,
  },
  modalHeaderStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  modalStatText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalBody: {
    flex: 1,
    padding: SPACING.lg,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  challengeDetailDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  progressDetailContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
  },
  progressDetailHeader: {
    marginBottom: SPACING.md,
  },
  progressDetailText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressDetailSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  progressDetailBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  rulesList: {
    gap: SPACING.sm,
  },
  ruleItem: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  rewardsContainer: {
    gap: SPACING.md,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  modalActions: {
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalActionButton: {
    paddingVertical: SPACING.xs,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leaderboardTitle: {
    color: COLORS.text,
  },
  leaderboardList: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 1,
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaderboardAvatar: {
    marginLeft: SPACING.md,
  },
  leaderboardInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  leaderboardTeam: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  leaderboardPoints: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pointsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default TeamChallenges;