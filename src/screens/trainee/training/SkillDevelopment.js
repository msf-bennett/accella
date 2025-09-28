import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  Vibration,
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
  Searchbar,
  Portal,
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SkillDevelopment = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, skills, achievements } = useSelector(state => ({
    user: state.auth.user,
    skills: state.skills.userSkills || [],
    achievements: state.achievements.unlocked || [],
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loading, setLoading] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data - replace with Redux store data
  const mockSkillCategories = [
    'All', 'Strength', 'Cardio', 'Flexibility', 'Balance', 'Coordination', 'Speed', 'Endurance'
  ];

  const mockSkills = [
    {
      id: 1,
      name: 'Push-up Form',
      category: 'Strength',
      level: 'Intermediate',
      progress: 75,
      currentLevel: 3,
      totalLevels: 5,
      xp: 750,
      nextLevelXp: 1000,
      description: 'Master proper push-up technique and build upper body strength',
      icon: 'fitness-center',
      color: COLORS.primary,
      achievements: ['Form Master', 'Strength Builder'],
      lastPracticed: '2024-01-15',
      streak: 5,
    },
    {
      id: 2,
      name: 'Running Endurance',
      category: 'Cardio',
      level: 'Advanced',
      progress: 90,
      currentLevel: 4,
      totalLevels: 5,
      xp: 1800,
      nextLevelXp: 2000,
      description: 'Build cardiovascular endurance and running efficiency',
      icon: 'directions-run',
      color: '#e74c3c',
      achievements: ['Endurance Pro', 'Distance Runner'],
      lastPracticed: '2024-01-14',
      streak: 12,
    },
    {
      id: 3,
      name: 'Yoga Flow',
      category: 'Flexibility',
      level: 'Beginner',
      progress: 40,
      currentLevel: 2,
      totalLevels: 5,
      xp: 200,
      nextLevelXp: 500,
      description: 'Improve flexibility and mindful movement',
      icon: 'self-improvement',
      color: '#9b59b6',
      achievements: [],
      lastPracticed: '2024-01-13',
      streak: 3,
    },
    {
      id: 4,
      name: 'Balance Training',
      category: 'Balance',
      level: 'Intermediate',
      progress: 60,
      currentLevel: 3,
      totalLevels: 5,
      xp: 600,
      nextLevelXp: 750,
      description: 'Enhance stability and proprioception',
      icon: 'accessibility',
      color: '#f39c12',
      achievements: ['Steady Progress'],
      lastPracticed: '2024-01-12',
      streak: 7,
    },
  ];

  const mockRecommendations = [
    {
      id: 1,
      title: 'Focus on Push-up Progression',
      description: 'You\'re close to mastering push-ups! Practice 3 more sessions this week.',
      action: 'Start Practice',
      priority: 'high',
      icon: 'trending-up',
    },
    {
      id: 2,
      title: 'Balance Challenge Available',
      description: 'New single-leg balance drills unlocked based on your progress.',
      action: 'Try Challenge',
      priority: 'medium',
      icon: 'stars',
    },
  ];

  // Component lifecycle
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(COLORS.primary, true);
    StatusBar.setTranslucent(true);

    // Animate screen entrance
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

    // Load skills data
    loadSkillsData();
  }, []);

  // Data loading functions
  const loadSkillsData = useCallback(async () => {
    try {
      setLoading(true);
      // Dispatch Redux action to load skills
      // dispatch(loadUserSkills(user.id));
      // dispatch(loadUserAchievements(user.id));
    } catch (error) {
      console.error('Error loading skills data:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSkillsData();
    setRefreshing(false);
  }, [loadSkillsData]);

  // Filter functions
  const filteredSkills = mockSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Event handlers
  const handleSkillPress = useCallback((skill) => {
    setSelectedSkill(skill);
    setShowSkillModal(true);
    Vibration.vibrate(50);
  }, []);

  const handlePracticeSkill = useCallback((skill) => {
    Vibration.vibrate(100);
    Alert.alert(
      '🚀 Practice Session',
      `Ready to practice ${skill.name}? This will start a guided training session.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Practice', 
          onPress: () => {
            setShowSkillModal(false);
            // Navigate to practice session
            navigation.navigate('PracticeSession', { skill });
          }
        },
      ]
    );
  }, [navigation]);

  const handleViewProgress = useCallback((skill) => {
    setShowSkillModal(false);
    navigation.navigate('SkillProgress', { skillId: skill.id });
  }, [navigation]);

  // Render functions
  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>Skill Development 🎯</Text>
          <IconButton
            icon="analytics"
            iconColor="white"
            size={24}
            onPress={() => navigation.navigate('SkillAnalytics')}
          />
        </View>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Master new skills and track your progress
        </Text>
        
        {/* Overall Progress */}
        <Surface style={styles.progressCard} elevation={2}>
          <View style={styles.progressHeader}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>Overall Progress</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
              Level {Math.floor(mockSkills.reduce((sum, skill) => sum + skill.currentLevel, 0) / mockSkills.length)}
            </Text>
          </View>
          <ProgressBar 
            progress={0.68} 
            color={COLORS.primary} 
            style={styles.progressBar}
          />
          <View style={styles.progressStats}>
            <View style={styles.stat}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
                {mockSkills.filter(skill => skill.progress >= 75).length}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                Nearly Mastered
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                {mockSkills.reduce((sum, skill) => sum + skill.xp, 0)}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                Total XP
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>
                {Math.max(...mockSkills.map(skill => skill.streak))}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                Best Streak
              </Text>
            </View>
          </View>
        </Surface>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search skills..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={TEXT_STYLES.body}
        iconColor={COLORS.primary}
      />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {mockSkillCategories.map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.filterChip,
              selectedCategory === category && styles.selectedChip
            ]}
            textStyle={[
              TEXT_STYLES.caption,
              selectedCategory === category && styles.selectedChipText
            ]}
            mode={selectedCategory === category ? 'flat' : 'outlined'}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderRecommendations = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[TEXT_STYLES.h2, { color: COLORS.text.primary }]}>
          🎯 AI Recommendations
        </Text>
        <IconButton
          icon="refresh"
          size={20}
          iconColor={COLORS.primary}
          onPress={() => {
            Vibration.vibrate(50);
            // Refresh recommendations
          }}
        />
      </View>
      
      {mockRecommendations.map((recommendation) => (
        <Card key={recommendation.id} style={styles.recommendationCard}>
          <Card.Content style={styles.recommendationContent}>
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationInfo}>
                <Icon 
                  name={recommendation.icon} 
                  size={24} 
                  color={recommendation.priority === 'high' ? COLORS.error : COLORS.primary}
                />
                <View style={styles.recommendationText}>
                  <Text style={[TEXT_STYLES.h4, { color: COLORS.text.primary }]}>
                    {recommendation.title}
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.text.secondary }]}>
                    {recommendation.description}
                  </Text>
                </View>
              </View>
              <Button
                mode="contained"
                compact
                onPress={() => {
                  Vibration.vibrate(50);
                  Alert.alert('🚀 Feature Coming Soon', 'AI recommendations are being developed!');
                }}
                buttonColor={COLORS.primary}
              >
                {recommendation.action}
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderSkillCard = (skill) => (
    <TouchableOpacity
      key={skill.id}
      onPress={() => handleSkillPress(skill)}
      activeOpacity={0.7}
    >
      <Card style={styles.skillCard}>
        <Card.Content style={styles.skillContent}>
          <View style={styles.skillHeader}>
            <View style={styles.skillInfo}>
              <Avatar.Icon
                size={48}
                icon={skill.icon}
                style={[styles.skillIcon, { backgroundColor: skill.color }]}
              />
              <View style={styles.skillDetails}>
                <View style={styles.skillTitleRow}>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.text.primary }]}>
                    {skill.name}
                  </Text>
                  {skill.streak > 0 && (
                    <View style={styles.streakBadge}>
                      <Icon name="local-fire-department" size={12} color={COLORS.warning} />
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.warning }]}>
                        {skill.streak}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[TEXT_STYLES.body, { color: COLORS.text.secondary }]}>
                  {skill.description}
                </Text>
                <View style={styles.skillMeta}>
                  <Chip
                    compact
                    style={[styles.levelChip, { backgroundColor: skill.color + '20' }]}
                    textStyle={[TEXT_STYLES.caption, { color: skill.color }]}
                  >
                    {skill.level}
                  </Chip>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                    Level {skill.currentLevel}/{skill.totalLevels}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                Progress: {skill.progress}%
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                {skill.xp}/{skill.nextLevelXp} XP
              </Text>
            </View>
            <ProgressBar
              progress={skill.progress / 100}
              color={skill.color}
              style={styles.skillProgressBar}
            />
          </View>

          {/* Achievements */}
          {skill.achievements.length > 0 && (
            <View style={styles.achievementsSection}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                Achievements:
              </Text>
              <View style={styles.achievementsList}>
                {skill.achievements.map((achievement, index) => (
                  <Chip
                    key={index}
                    compact
                    icon="military-tech"
                    style={styles.achievementChip}
                    textStyle={TEXT_STYLES.caption}
                  >
                    {achievement}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              compact
              onPress={() => handleViewProgress(skill)}
              style={styles.actionButton}
              textColor={COLORS.primary}
            >
              View Progress
            </Button>
            <Button
              mode="contained"
              compact
              onPress={() => handlePracticeSkill(skill)}
              style={styles.actionButton}
              buttonColor={skill.color}
            >
              Practice Now
            </Button>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderSkillModal = () => (
    <Portal>
      <Modal
        visible={showSkillModal}
        onDismiss={() => setShowSkillModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedSkill && (
          <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
            <Surface style={styles.modalContent} elevation={5}>
              <View style={styles.modalHeader}>
                <Avatar.Icon
                  size={64}
                  icon={selectedSkill.icon}
                  style={[styles.modalIcon, { backgroundColor: selectedSkill.color }]}
                />
                <View style={styles.modalTitleSection}>
                  <Text style={[TEXT_STYLES.h2, { color: COLORS.text.primary }]}>
                    {selectedSkill.name}
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.text.secondary }]}>
                    {selectedSkill.description}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowSkillModal(false)}
                />
              </View>

              {/* Detailed Progress */}
              <View style={styles.modalProgress}>
                <View style={styles.modalProgressHeader}>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                    Level {selectedSkill.currentLevel}/{selectedSkill.totalLevels}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                    {selectedSkill.xp}/{selectedSkill.nextLevelXp} XP
                  </Text>
                </View>
                <ProgressBar
                  progress={selectedSkill.progress / 100}
                  color={selectedSkill.color}
                  style={styles.modalProgressBar}
                />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary, textAlign: 'center' }]}>
                  {100 - selectedSkill.progress}% to next level
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  onPress={() => handlePracticeSkill(selectedSkill)}
                  style={[styles.modalButton, { backgroundColor: selectedSkill.color }]}
                  icon="play-arrow"
                >
                  Start Practice Session
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleViewProgress(selectedSkill)}
                  style={styles.modalButton}
                  textColor={COLORS.primary}
                  icon="analytics"
                >
                  View Detailed Progress
                </Button>
              </View>
            </Surface>
          </BlurView>
        )}
      </Modal>
    </Portal>
  );

  const renderFAB = () => (
    <FAB
      icon="add"
      style={styles.fab}
      onPress={() => {
        Vibration.vibrate(50);
        Alert.alert(
          '🎯 Add New Skill',
          'Would you like to explore new skills or get AI recommendations?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Browse Skills', onPress: () => navigation.navigate('SkillBrowser') },
            { text: 'Get AI Suggestions', onPress: () => {
              Alert.alert('🚀 Feature Coming Soon', 'AI skill recommendations are being developed!');
            }},
          ]
        );
      }}
    />
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {renderHeader()}
        
        <ScrollView
          style={styles.scrollView}
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
          {renderSearchAndFilters()}
          {renderRecommendations()}
          
          <View style={styles.section}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text.primary, marginBottom: SPACING.md }]}>
              🏃‍♀️ Your Skills ({filteredSkills.length})
            </Text>
            
            {filteredSkills.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Icon name="search-off" size={48} color={COLORS.text.secondary} />
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.text.secondary, marginTop: SPACING.sm }]}>
                    No skills found
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.text.secondary, textAlign: 'center' }]}>
                    Try adjusting your search or filter criteria
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              filteredSkills.map(renderSkillCard)
            )}
          </View>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {renderSkillModal()}
      {renderFAB()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingHorizontal: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.lg,
  },
  progressCard: {
    borderRadius: 16,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.background.secondary,
    marginBottom: SPACING.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background.primary,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  filterContainer: {
    paddingVertical: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background.secondary,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  selectedChipText: {
    color: 'white',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recommendationCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    backgroundColor: COLORS.background.primary,
  },
  recommendationContent: {
    padding: SPACING.md,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendationInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: SPACING.md,
  },
  recommendationText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  skillCard: {
    marginBottom: SPACING.lg,
    elevation: 3,
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
  },
  skillContent: {
    padding: SPACING.lg,
  },
  skillHeader: {
    marginBottom: SPACING.md,
  },
  skillInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  skillIcon: {
    marginRight: SPACING.md,
  },
  skillDetails: {
    flex: 1,
  },
  skillTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  skillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  levelChip: {
    marginRight: SPACING.sm,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  skillProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  achievementsSection: {
    marginBottom: SPACING.md,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  achievementChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.success + '20',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
  },
  emptyCard: {
    backgroundColor: COLORS.background.primary,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 24,
    padding: SPACING.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  modalIcon: {
    marginRight: SPACING.md,
  },
  modalTitleSection: {
    flex: 1,
  },
  modalProgress: {
    marginBottom: SPACING.lg,
  },
  modalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  modalActions: {
    gap: SPACING.md,
  },
  modalButton: {
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default SkillDevelopment;