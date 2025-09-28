import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Animated,
  Vibration,
  Alert,
  Dimensions,
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
  Portal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SkillLevelMatching = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { trainers, matchedTrainers } = useSelector(state => state.discovery);

  // State management
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedSports, setSelectedSports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Skill levels data
  const skillLevels = [
    {
      id: 'beginner',
      title: '🌱 Beginner',
      subtitle: 'New to fitness journey',
      description: 'Perfect for those starting their fitness adventure',
      color: '#4CAF50',
      sessions: '1-3 per week',
      focus: 'Basic movements & form'
    },
    {
      id: 'intermediate',
      title: '💪 Intermediate',
      subtitle: '6+ months experience',
      description: 'Ready to challenge yourself further',
      color: '#FF9800',
      sessions: '3-5 per week',
      focus: 'Progressive overload'
    },
    {
      id: 'advanced',
      title: '🚀 Advanced',
      subtitle: '2+ years experience',
      description: 'Pushing limits and optimizing performance',
      color: '#9C27B0',
      sessions: '5-7 per week',
      focus: 'Specialized training'
    },
    {
      id: 'athlete',
      title: '🏆 Athlete',
      subtitle: 'Competitive level',
      description: 'Elite performance and competition prep',
      color: '#F44336',
      sessions: '6+ per week',
      focus: 'Sport-specific training'
    }
  ];

  // Goals data
  const fitnessGoals = [
    { id: 'weight_loss', label: '🔥 Weight Loss', color: '#E91E63' },
    { id: 'muscle_gain', label: '💪 Muscle Gain', color: '#3F51B5' },
    { id: 'strength', label: '🏋️ Strength', color: '#795548' },
    { id: 'endurance', label: '🏃 Endurance', color: '#009688' },
    { id: 'flexibility', label: '🧘 Flexibility', color: '#9C27B0' },
    { id: 'athletic_performance', label: '⚡ Athletic Performance', color: '#FF5722' },
    { id: 'general_fitness', label: '🎯 General Fitness', color: '#607D8B' },
    { id: 'rehabilitation', label: '🩺 Rehabilitation', color: '#4CAF50' }
  ];

  // Sports data
  const sportsCategories = [
    { id: 'football', label: '⚽ Football', color: '#4CAF50' },
    { id: 'basketball', label: '🏀 Basketball', color: '#FF9800' },
    { id: 'tennis', label: '🎾 Tennis', color: '#FFEB3B' },
    { id: 'swimming', label: '🏊 Swimming', color: '#2196F3' },
    { id: 'running', label: '🏃 Running', color: '#9C27B0' },
    { id: 'gym', label: '🏋️ Gym Training', color: '#795548' },
    { id: 'yoga', label: '🧘 Yoga', color: '#E91E63' },
    { id: 'martial_arts', label: '🥋 Martial Arts', color: '#607D8B' }
  ];

  // Sample matched trainers data
  const sampleTrainers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      specialization: 'Weight Loss & Strength Training',
      rating: 4.9,
      reviews: 127,
      experience: '5 years',
      price: '$35/session',
      location: '2.3 km away',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      skillLevels: ['beginner', 'intermediate'],
      sports: ['gym', 'running'],
      matchPercentage: 95,
      availability: 'Available today'
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      specialization: 'Athletic Performance',
      rating: 4.8,
      reviews: 89,
      experience: '8 years',
      price: '$45/session',
      location: '1.8 km away',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      skillLevels: ['intermediate', 'advanced'],
      sports: ['football', 'basketball'],
      matchPercentage: 88,
      availability: 'Available tomorrow'
    },
    {
      id: '3',
      name: 'Emma Chen',
      specialization: 'Yoga & Flexibility',
      rating: 4.9,
      reviews: 156,
      experience: '6 years',
      price: '$30/session',
      location: '3.1 km away',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      skillLevels: ['beginner', 'intermediate', 'advanced'],
      sports: ['yoga', 'gym'],
      matchPercentage: 92,
      availability: 'Available now'
    }
  ];

  // Animation effects
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
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleSkillLevelSelect = (levelId) => {
    setSelectedSkillLevel(levelId);
    Vibration.vibrate(50);
  };

  const handleGoalToggle = (goalId) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
    Vibration.vibrate(30);
  };

  const handleSportToggle = (sportId) => {
    setSelectedSports(prev => 
      prev.includes(sportId) 
        ? prev.filter(id => id !== sportId)
        : [...prev, sportId]
    );
    Vibration.vibrate(30);
  };

  const handleFindMatches = async () => {
    if (!selectedSkillLevel) {
      Alert.alert(
        'Skill Level Required',
        'Please select your current fitness level to find the best matches.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsMatching(true);
    Vibration.vibrate(100);
    
    // Simulate matching process
    setTimeout(() => {
      setIsMatching(false);
      Alert.alert(
        'Perfect Matches Found! 🎉',
        `We found ${sampleTrainers.length} trainers that match your skill level and goals.`,
        [{ text: 'View Results' }]
      );
    }, 2000);
  };

  const handleTrainerPress = (trainer) => {
    Vibration.vibrate(50);
    Alert.alert(
      'Feature Coming Soon! 🚀',
      'Trainer profile and booking functionality is currently under development.',
      [{ text: 'OK' }]
    );
  };

  const renderSkillLevelCard = (level) => (
    <TouchableOpacity
      key={level.id}
      onPress={() => handleSkillLevelSelect(level.id)}
      style={{ marginRight: SPACING.md }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Surface
          style={[
            styles.skillCard,
            selectedSkillLevel === level.id && styles.selectedCard,
            { borderColor: level.color }
          ]}
        >
          <LinearGradient
            colors={
              selectedSkillLevel === level.id
                ? [level.color, `${level.color}80`]
                : ['#FFFFFF', '#F8F9FA']
            }
            style={styles.skillCardGradient}
          >
            <Text style={[
              TEXT_STYLES.h3,
              { color: selectedSkillLevel === level.id ? '#FFFFFF' : '#333' }
            ]}>
              {level.title}
            </Text>
            <Text style={[
              TEXT_STYLES.body,
              { 
                color: selectedSkillLevel === level.id ? '#FFFFFF' : '#666',
                marginTop: SPACING.xs
              }
            ]}>
              {level.subtitle}
            </Text>
            <Text style={[
              TEXT_STYLES.caption,
              { 
                color: selectedSkillLevel === level.id ? '#FFFFFF' : '#999',
                marginTop: SPACING.sm
              }
            ]}>
              {level.description}
            </Text>
            
            <View style={styles.skillDetails}>
              <View style={styles.skillDetailItem}>
                <Icon 
                  name="schedule" 
                  size={14} 
                  color={selectedSkillLevel === level.id ? '#FFFFFF' : '#666'} 
                />
                <Text style={[
                  TEXT_STYLES.caption,
                  { 
                    marginLeft: SPACING.xs,
                    color: selectedSkillLevel === level.id ? '#FFFFFF' : '#666'
                  }
                ]}>
                  {level.sessions}
                </Text>
              </View>
              <View style={styles.skillDetailItem}>
                <Icon 
                  name="fitness-center" 
                  size={14} 
                  color={selectedSkillLevel === level.id ? '#FFFFFF' : '#666'} 
                />
                <Text style={[
                  TEXT_STYLES.caption,
                  { 
                    marginLeft: SPACING.xs,
                    color: selectedSkillLevel === level.id ? '#FFFFFF' : '#666'
                  }
                ]}>
                  {level.focus}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Surface>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderTrainerCard = (trainer) => (
    <TouchableOpacity
      key={trainer.id}
      onPress={() => handleTrainerPress(trainer)}
      style={{ marginBottom: SPACING.md }}
    >
      <Card style={styles.trainerCard}>
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA']}
          style={styles.trainerCardContent}
        >
          <View style={styles.trainerHeader}>
            <Avatar.Image 
              size={50} 
              source={{ uri: trainer.avatar }} 
            />
            <View style={styles.trainerInfo}>
              <Text style={TEXT_STYLES.h3}>{trainer.name}</Text>
              <Text style={[TEXT_STYLES.body, { color: '#666' }]}>
                {trainer.specialization}
              </Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                  {trainer.rating} ({trainer.reviews} reviews)
                </Text>
              </View>
            </View>
            <View style={styles.matchBadge}>
              <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF' }]}>
                {trainer.matchPercentage}% match
              </Text>
            </View>
          </View>

          <View style={styles.trainerDetails}>
            <View style={styles.detailRow}>
              <Icon name="work" size={16} color="#666" />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                {trainer.experience} experience
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                {trainer.location}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color="#4CAF50" />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: '#4CAF50' }]}>
                {trainer.availability}
              </Text>
            </View>
          </View>

          <View style={styles.trainerFooter}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              {trainer.price}
            </Text>
            <Button
              mode="contained"
              onPress={() => handleTrainerPress(trainer)}
              style={styles.contactButton}
              labelStyle={{ color: '#FFFFFF' }}
            >
              Contact
            </Button>
          </View>
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="#FFFFFF"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: '#FFFFFF', flex: 1, textAlign: 'center' }]}>
            Find Your Perfect Match 🎯
          </Text>
          <IconButton
            icon="filter-list"
            iconColor="#FFFFFF"
            size={24}
            onPress={() => setShowFilters(!showFilters)}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Animated.View 
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>
            What's your current fitness level? 💪
          </Text>
          <Text style={[TEXT_STYLES.body, styles.sectionSubtitle]}>
            This helps us match you with trainers who specialize in your experience level
          </Text>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {skillLevels.map(renderSkillLevelCard)}
          </ScrollView>
        </Animated.View>

        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>
            What are your goals? 🎯
          </Text>
          <View style={styles.chipContainer}>
            {fitnessGoals.map(goal => (
              <Chip
                key={goal.id}
                selected={selectedGoals.includes(goal.id)}
                onPress={() => handleGoalToggle(goal.id)}
                style={[
                  styles.chip,
                  selectedGoals.includes(goal.id) && { backgroundColor: goal.color }
                ]}
                textStyle={[
                  selectedGoals.includes(goal.id) && { color: '#FFFFFF' }
                ]}
              >
                {goal.label}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>
            Preferred sports/activities? ⚽
          </Text>
          <View style={styles.chipContainer}>
            {sportsCategories.map(sport => (
              <Chip
                key={sport.id}
                selected={selectedSports.includes(sport.id)}
                onPress={() => handleSportToggle(sport.id)}
                style={[
                  styles.chip,
                  selectedSports.includes(sport.id) && { backgroundColor: sport.color }
                ]}
                textStyle={[
                  selectedSports.includes(sport.id) && { color: '#FFFFFF' }
                ]}
              >
                {sport.label}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Button
            mode="contained"
            onPress={handleFindMatches}
            loading={isMatching}
            disabled={!selectedSkillLevel || isMatching}
            style={styles.findButton}
            contentStyle={styles.findButtonContent}
            labelStyle={[TEXT_STYLES.h3, { color: '#FFFFFF' }]}
          >
            {isMatching ? 'Finding Perfect Matches...' : '🔍 Find My Matches'}
          </Button>
        </View>

        {selectedSkillLevel && (
          <View style={styles.section}>
            <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>
              Recommended Trainers 🌟
            </Text>
            <Text style={[TEXT_STYLES.body, styles.sectionSubtitle]}>
              Based on your skill level and preferences
            </Text>
            {sampleTrainers.map(renderTrainerCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
    color: '#333',
  },
  sectionSubtitle: {
    color: '#666',
    marginBottom: SPACING.lg,
  },
  horizontalScroll: {
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  skillCard: {
    width: width * 0.7,
    elevation: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: COLORS.primary,
    elevation: 8,
  },
  skillCardGradient: {
    padding: SPACING.lg,
    borderRadius: 14,
  },
  skillDetails: {
    marginTop: SPACING.md,
  },
  skillDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  findButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  findButtonContent: {
    paddingVertical: SPACING.sm,
  },
  trainerCard: {
    elevation: 2,
    borderRadius: 12,
  },
  trainerCardContent: {
    padding: SPACING.lg,
    borderRadius: 12,
  },
  trainerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  trainerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  matchBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  trainerDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  trainerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
};

export default SkillLevelMatching;