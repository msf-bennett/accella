import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Vibration,
  TouchableOpacity,
  Dimensions,
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
  Text,
  TextInput,
  Portal,
  Modal,
  Searchbar,
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  medical: '#E53E3E',
  recovery: '#38A169',
  prevention: '#3182CE',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width } = Dimensions.get('window');

const INJURY_CATEGORIES = [
  { 
    id: 'prevention', 
    title: 'Prevention 🛡️', 
    icon: 'security', 
    color: COLORS.prevention,
    description: 'Learn how to prevent injuries before they happen'
  },
  { 
    id: 'recognition', 
    title: 'Recognition 👁️', 
    icon: 'visibility', 
    color: COLORS.warning,
    description: 'Identify early warning signs and symptoms'
  },
  { 
    id: 'recovery', 
    title: 'Recovery 💚', 
    icon: 'healing', 
    color: COLORS.recovery,
    description: 'Proper recovery and rehabilitation techniques'
  },
  { 
    id: 'emergency', 
    title: 'Emergency 🚨', 
    icon: 'local-hospital', 
    color: COLORS.medical,
    description: 'What to do in case of serious injury'
  },
];

const INJURY_TOPICS = [
  {
    id: 'muscle_strains',
    title: 'Muscle Strains & Pulls',
    category: 'prevention',
    icon: 'fitness-center',
    difficulty: 'Beginner',
    duration: '5 min read',
    image: '💪',
    content: {
      overview: 'Muscle strains are one of the most common fitness injuries, affecting athletes of all levels.',
      prevention: [
        'Always warm up before intense exercise',
        'Gradually increase workout intensity',
        'Stay properly hydrated',
        'Maintain good form during exercises',
        'Don\'t skip rest days'
      ],
      recognition: [
        'Sharp pain during movement',
        'Muscle stiffness or cramping',
        'Swelling in the affected area',
        'Bruising may appear after 24-48 hours',
        'Weakness in the muscle'
      ],
      treatment: [
        'Apply R.I.C.E. method (Rest, Ice, Compression, Elevation)',
        'Take anti-inflammatory medication if needed',
        'Gentle stretching after initial pain subsides',
        'Gradually return to activity'
      ]
    }
  },
  {
    id: 'joint_injuries',
    title: 'Joint Injuries & Sprains',
    category: 'recognition',
    icon: 'sync-alt',
    difficulty: 'Intermediate',
    duration: '7 min read',
    image: '🦴',
    content: {
      overview: 'Joint injuries can range from minor sprains to serious damage requiring medical attention.',
      prevention: [
        'Strengthen supporting muscles',
        'Improve flexibility and mobility',
        'Use proper equipment and footwear',
        'Practice good movement patterns',
        'Listen to your body\'s warning signals'
      ],
      recognition: [
        'Pain, especially when bearing weight',
        'Swelling and inflammation',
        'Limited range of motion',
        'Joint instability or giving way',
        'Grinding or popping sensations'
      ],
      treatment: [
        'Immediate medical evaluation for severe injuries',
        'R.I.C.E. protocol for minor sprains',
        'Physical therapy as recommended',
        'Gradual return to activity'
      ]
    }
  },
  {
    id: 'overuse_injuries',
    title: 'Overuse & Repetitive Stress',
    category: 'prevention',
    icon: 'repeat',
    difficulty: 'Advanced',
    duration: '8 min read',
    image: '⚡',
    content: {
      overview: 'Overuse injuries develop gradually from repeated stress on muscles, bones, and joints.',
      prevention: [
        'Follow the 10% rule - increase intensity by max 10% weekly',
        'Cross-train to avoid repetitive stress',
        'Ensure adequate recovery between sessions',
        'Vary your workout routines',
        'Address muscle imbalances'
      ],
      recognition: [
        'Gradual onset of pain',
        'Pain that worsens with activity',
        'Stiffness, especially in the morning',
        'Persistent soreness',
        'Decreased performance'
      ],
      treatment: [
        'Modify or reduce training intensity',
        'Address underlying biomechanical issues',
        'Focus on strengthening weak areas',
        'Consider professional assessment'
      ]
    }
  },
  {
    id: 'recovery_techniques',
    title: 'Active Recovery Methods',
    category: 'recovery',
    icon: 'spa',
    difficulty: 'Beginner',
    duration: '6 min read',
    image: '🧘',
    content: {
      overview: 'Proper recovery is just as important as training for preventing injuries and improving performance.',
      prevention: [
        'Schedule regular rest days',
        'Prioritize quality sleep (7-9 hours)',
        'Maintain proper nutrition',
        'Stay hydrated throughout the day',
        'Manage stress levels'
      ],
      recognition: [
        'Persistent fatigue',
        'Declining performance',
        'Increased injury susceptibility',
        'Mood changes or irritability',
        'Elevated resting heart rate'
      ],
      treatment: [
        'Light aerobic activity (walking, swimming)',
        'Gentle stretching and mobility work',
        'Foam rolling and self-massage',
        'Adequate sleep and nutrition',
        'Stress management techniques'
      ]
    }
  },
];

const FIRST_AID_CHECKLIST = [
  { id: 'assess', text: 'Assess the situation and ensure safety', critical: true },
  { id: 'call', text: 'Call emergency services if serious', critical: true },
  { id: 'check', text: 'Check for consciousness and breathing', critical: true },
  { id: 'stop', text: 'Stop any bleeding with direct pressure', critical: false },
  { id: 'immobilize', text: 'Immobilize suspected fractures', critical: false },
  { id: 'comfort', text: 'Keep the person comfortable and calm', critical: false },
  { id: 'monitor', text: 'Monitor vital signs until help arrives', critical: false },
];

const InjuryEducation = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showFirstAidModal, setShowFirstAidModal] = useState(false);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [bookmarkedTopics, setBookmarkedTopics] = useState(new Set());

  useEffect(() => {
    // Entrance animations
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchInjuryEducationContent());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh content');
    }
    setRefreshing(false);
  }, []);

  const handleTopicSelect = useCallback((topic) => {
    Vibration.vibrate(50);
    setSelectedTopic(topic);
    setShowTopicModal(true);
  }, []);

  const handleTopicComplete = useCallback(() => {
    if (selectedTopic) {
      setCompletedTopics(prev => new Set([...prev, selectedTopic.id]));
      Alert.alert(
        '🎉 Topic Completed!',
        'Great job learning about injury prevention! You\'ve earned 10 knowledge points.',
        [{ text: 'Awesome!', style: 'default' }]
      );
    }
  }, [selectedTopic]);

  const handleBookmark = useCallback((topicId) => {
    setBookmarkedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
    Vibration.vibrate(50);
  }, []);

  const filteredTopics = INJURY_TOPICS.filter(topic => {
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderCategoryCard = (category) => (
    <Animated.View
      key={category.id}
      style={[
        styles.categoryCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => setSelectedCategory(category.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[category.color, `${category.color}CC`]}
          style={[
            styles.categoryGradient,
            selectedCategory === category.id && styles.selectedCategory
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name={category.icon} size={32} color="#fff" />
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderTopicCard = (topic, index) => (
    <Animated.View
      key={topic.id}
      style={[
        styles.topicCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={styles.card} elevation={3}>
        <TouchableOpacity onPress={() => handleTopicSelect(topic)} activeOpacity={0.9}>
          <View style={styles.topicHeader}>
            <View style={styles.topicImageContainer}>
              <Text style={styles.topicEmoji}>{topic.image}</Text>
              {completedTopics.has(topic.id) && (
                <Badge style={styles.completedBadge} size={16}>✓</Badge>
              )}
            </View>
            <View style={styles.topicInfo}>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <View style={styles.topicMeta}>
                <Chip
                  style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(topic.difficulty) }]}
                  textStyle={styles.chipText}
                >
                  {topic.difficulty}
                </Chip>
                <Text style={styles.topicDuration}>{topic.duration}</Text>
              </View>
            </View>
            <IconButton
              icon={bookmarkedTopics.has(topic.id) ? 'bookmark' : 'bookmark-border'}
              iconColor={bookmarkedTopics.has(topic.id) ? COLORS.warning : COLORS.textSecondary}
              size={20}
              onPress={() => handleBookmark(topic.id)}
            />
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success + '30';
      case 'Intermediate': return COLORS.warning + '30';
      case 'Advanced': return COLORS.error + '30';
      default: return COLORS.textSecondary + '30';
    }
  };

  const renderTopicModal = () => (
    <Portal>
      <Modal
        visible={showTopicModal}
        onDismiss={() => setShowTopicModal(false)}
        contentContainerStyle={styles.topicModalContainer}
      >
        {selectedTopic && (
          <View style={styles.topicModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTopic.title}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowTopicModal(false)}
              />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.topicOverview}>
                <Text style={styles.topicEmojiBig}>{selectedTopic.image}</Text>
                <Text style={styles.overviewText}>{selectedTopic.content.overview}</Text>
              </View>

              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>🛡️ Prevention</Text>
                {selectedTopic.content.prevention.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Icon name="check-circle" size={16} color={COLORS.success} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>👁️ Recognition</Text>
                {selectedTopic.content.recognition.map((sign, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Icon name="visibility" size={16} color={COLORS.warning} />
                    <Text style={styles.tipText}>{sign}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>💊 Treatment</Text>
                {selectedTopic.content.treatment.map((treatment, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Icon name="healing" size={16} color={COLORS.recovery} />
                    <Text style={styles.tipText}>{treatment}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  onPress={handleTopicComplete}
                  style={styles.completeButton}
                  disabled={completedTopics.has(selectedTopic.id)}
                >
                  {completedTopics.has(selectedTopic.id) ? 'Completed ✓' : 'Mark as Complete'}
                </Button>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </Portal>
  );

  const renderFirstAidModal = () => (
    <Portal>
      <Modal
        visible={showFirstAidModal}
        onDismiss={() => setShowFirstAidModal(false)}
        contentContainerStyle={styles.firstAidModalContainer}
      >
        <View style={styles.firstAidModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🚨 Emergency First Aid</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowFirstAidModal(false)}
            />
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Surface style={styles.emergencyWarning} elevation={2}>
              <Icon name="warning" size={24} color={COLORS.error} />
              <Text style={styles.warningText}>
                This is basic guidance only. Always seek professional medical help for serious injuries.
              </Text>
            </Surface>

            <Text style={styles.checklistTitle}>Emergency Response Checklist:</Text>
            
            {FIRST_AID_CHECKLIST.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.checklistItem,
                  item.critical && styles.criticalItem
                ]}
              >
                <View style={styles.checklistNumber}>
                  <Text style={styles.checklistNumberText}>{index + 1}</Text>
                </View>
                <Text style={[
                  styles.checklistText,
                  item.critical && styles.criticalText
                ]}>
                  {item.text}
                </Text>
                {item.critical && (
                  <Icon name="priority-high" size={20} color={COLORS.error} />
                )}
              </View>
            ))}

            <Surface style={styles.emergencyContacts} elevation={1}>
              <Text style={styles.emergencyTitle}>Emergency Contacts:</Text>
              <View style={styles.contactItem}>
                <Icon name="local-hospital" size={20} color={COLORS.error} />
                <Text style={styles.contactText}>Emergency Services: 911</Text>
              </View>
              <View style={styles.contactItem}>
                <Icon name="local-pharmacy" size={20} color={COLORS.recovery} />
                <Text style={styles.contactText}>Poison Control: 1-800-222-1222</Text>
              </View>
            </Surface>
          </ScrollView>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Injury Education 📚</Text>
            <Text style={styles.headerSubtitle}>
              Learn to train smart and stay injury-free
            </Text>
          </View>
          <Avatar.Text 
            size={40} 
            label={user?.name?.charAt(0) || 'U'} 
            style={styles.avatar}
          />
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Searchbar
          placeholder="Search injury topics..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />
      </Animated.View>

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
        {/* Progress Section */}
        <Animated.View 
          style={[
            styles.progressSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>📊 Your Learning Progress</Text>
          <Surface style={styles.progressCard} elevation={3}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Topics Completed</Text>
              <Text style={styles.progressCount}>
                {completedTopics.size}/{INJURY_TOPICS.length}
              </Text>
            </View>
            <ProgressBar 
              progress={completedTopics.size / INJURY_TOPICS.length} 
              color={COLORS.success}
              style={styles.progressBar}
            />
            <Text style={styles.progressSubtext}>
              Keep learning to unlock achievement badges! 🏆
            </Text>
          </Surface>
        </Animated.View>

        {/* Category Filter */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>📋 Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => setSelectedCategory('all')}
              style={[
                styles.allCategoryChip,
                selectedCategory === 'all' && styles.selectedCategoryChip
              ]}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === 'all' && styles.selectedCategoryChipText
              ]}>
                All Topics
              </Text>
            </TouchableOpacity>
            {INJURY_CATEGORIES.map(renderCategoryCard)}
          </ScrollView>
        </View>

        {/* Topics List */}
        <View style={styles.topicsSection}>
          <View style={styles.topicsSectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? '📚 All Topics' : 
               `📚 ${INJURY_CATEGORIES.find(cat => cat.id === selectedCategory)?.title || 'Topics'}`}
            </Text>
            <Text style={styles.topicsCount}>
              {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          {filteredTopics.map(renderTopicCard)}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="local-hospital"
        onPress={() => {
          Vibration.vibrate(50);
          setShowFirstAidModal(true);
        }}
        label="First Aid"
      />

      {renderTopicModal()}
      {renderFirstAidModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: '#fff',
    fontSize: 26,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.md,
    marginBottom: SPACING.md,
  },
  searchBar: {
    elevation: 4,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  progressSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.md,
    fontSize: 18,
    color: COLORS.text,
  },
  progressCard: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  },
  progressCount: {
    ...TEXT_STYLES.subheading,
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressSubtext: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  categoriesSection: {
    marginBottom: SPACING.lg,
  },
  categoryCard: {
    marginRight: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  categoryGradient: {
    width: Math.min(140, width * 0.35),
    height: 100,
    borderRadius: 12,
    padding: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCategory: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  categoryTitle: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  categoryDescription: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  allCategoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    alignSelf: 'flex-start',
    marginVertical: SPACING.sm,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  topicsSection: {
    marginBottom: SPACING.md,
  },
  topicsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  topicsCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  topicCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  topicImageContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  topicEmoji: {
    fontSize: 32,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.success,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    ...TEXT_STYLES.subheading,
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyChip: {
    height: 24,
    marginRight: SPACING.sm,
  },
  chipText: {
    fontSize: 12,
  },
  topicDuration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 20,
    backgroundColor: COLORS.medical,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  topicModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topicModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    maxHeight: '90%',
    width: '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  modalTitle: {
    ...TEXT_STYLES.subheading,
    flex: 1,
  },
  topicOverview: {
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    margin: SPACING.md,
    borderRadius: 12,
  },
  topicEmojiBig: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  overviewText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  contentSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  tipText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 22,
  },
  modalActions: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  firstAidModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  firstAidModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    maxHeight: '90%',
    width: '100%',
    overflow: 'hidden',
  },
  emergencyWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    margin: SPACING.md,
    backgroundColor: COLORS.error + '10',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  warningText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.error,
    fontWeight: '500',
  },
  checklistTitle: {
    ...TEXT_STYLES.subheading,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  criticalItem: {
    backgroundColor: COLORS.error + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  checklistNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  checklistNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  checklistText: {
    ...TEXT_STYLES.body,
    flex: 1,
    lineHeight: 22,
  },
  criticalText: {
    fontWeight: '600',
    color: COLORS.error,
  },
  emergencyContacts: {
    padding: SPACING.md,
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    elevation: 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    marginTop: SPACING.lg,
  },
  emergencyTitle: {
    ...TEXT_STYLES.subheading,
    fontSize: 16,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  contactText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  // Additional utility styles
  categoriesScrollView: {
    paddingVertical: SPACING.xs,
  },
  topicCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  categoryCardActive: {
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  bookmarkButton: {
    padding: SPACING.xs,
  },
  modalScrollContent: {
    paddingBottom: SPACING.xl,
  },
  checklistContainer: {
    paddingHorizontal: SPACING.md,
  },
  safeArea: {
    paddingTop: StatusBar.currentHeight || 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  accessibilityFocus: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
  },
});

export default InjuryEducation;