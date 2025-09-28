import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  Vibration,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  FlatList,
} from 'react-native';
import { 
  Card, 
  Button, 
  Searchbar, 
  Chip, 
  Avatar, 
  IconButton,
  Surface,
  Portal,
  Modal,
  ProgressBar,
  Badge,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
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
  h2: { fontSize: 22, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const MENTOR_CATEGORIES = [
  { id: 'all', label: 'All Mentors', icon: 'group', color: COLORS.primary },
  { id: 'performance', label: 'Performance', icon: 'trending-up', color: COLORS.success },
  { id: 'mental', label: 'Mental Health', icon: 'psychology', color: COLORS.warning },
  { id: 'career', label: 'Career', icon: 'business-center', color: COLORS.secondary },
  { id: 'nutrition', label: 'Nutrition', icon: 'restaurant', color: COLORS.accent },
  { id: 'recovery', label: 'Recovery', icon: 'spa', color: '#9c27b0' },
];

const MOCK_MENTORS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Former Olympic Swimmer',
    specialization: 'Performance Psychology',
    avatar: 'https://via.placeholder.com/150/667eea/ffffff?text=SJ',
    rating: 4.9,
    reviewCount: 127,
    experience: '15+ years',
    category: 'performance',
    tags: ['Mental Toughness', 'Competition', 'Goal Setting'],
    price: '$50/session',
    availability: 'Available',
    matchScore: 95,
    bio: 'Olympic medalist with expertise in performance psychology and mental training.',
    achievements: ['Olympic Gold Medal 2012', 'World Record Holder', 'Sports Psychology PhD'],
    isOnline: true,
    responseTime: '< 2 hours',
  },
  {
    id: '2',
    name: 'Marcus Chen',
    title: 'Sports Nutritionist',
    specialization: 'Nutrition & Recovery',
    avatar: 'https://via.placeholder.com/150/4caf50/ffffff?text=MC',
    rating: 4.8,
    reviewCount: 89,
    experience: '12+ years',
    category: 'nutrition',
    tags: ['Sports Nutrition', 'Meal Planning', 'Supplements'],
    price: '$40/session',
    availability: 'Busy',
    matchScore: 88,
    bio: 'Certified sports nutritionist working with professional athletes worldwide.',
    achievements: ['MS in Sports Nutrition', '200+ Athletes Coached', 'Published Researcher'],
    isOnline: false,
    responseTime: '< 4 hours',
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    title: 'Sports Psychologist',
    specialization: 'Mental Health & Wellness',
    avatar: 'https://via.placeholder.com/150/ff9800/ffffff?text=ER',
    rating: 5.0,
    reviewCount: 156,
    experience: '20+ years',
    category: 'mental',
    tags: ['Anxiety Management', 'Confidence Building', 'Stress Relief'],
    price: '$75/session',
    availability: 'Available',
    matchScore: 92,
    bio: 'Licensed psychologist specializing in athlete mental health and performance.',
    achievements: ['PhD in Psychology', 'Licensed Therapist', 'Author of 3 Books'],
    isOnline: true,
    responseTime: '< 1 hour',
  },
  {
    id: '4',
    name: 'Jake Thompson',
    title: 'Career Transition Coach',
    specialization: 'Athletic Career Development',
    avatar: 'https://via.placeholder.com/150/764ba2/ffffff?text=JT',
    rating: 4.7,
    reviewCount: 94,
    experience: '10+ years',
    category: 'career',
    tags: ['Career Planning', 'Retirement Planning', 'Skill Development'],
    price: '$60/session',
    availability: 'Available',
    matchScore: 85,
    bio: 'Former professional athlete turned career coach, helping athletes transition.',
    achievements: ['MBA in Business', '500+ Athletes Helped', 'Career Success Rate 92%'],
    isOnline: true,
    responseTime: '< 3 hours',
  },
];

const MentorConnection = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mentors, setMentors] = useState(MOCK_MENTORS);
  const [filteredMentors, setFilteredMentors] = useState(MOCK_MENTORS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('match'); // 'match', 'rating', 'price'
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent', true);

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
  }, []);

  useEffect(() => {
    filterMentors();
  }, [searchQuery, selectedCategory, sortBy]);

  const filterMentors = useCallback(() => {
    let filtered = [...mentors];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(mentor => mentor.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(query) ||
        mentor.specialization.toLowerCase().includes(query) ||
        mentor.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort mentors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          const priceA = parseInt(a.price.replace(/\D/g, ''));
          const priceB = parseInt(b.price.replace(/\D/g, ''));
          return priceA - priceB;
        case 'match':
        default:
          return b.matchScore - a.matchScore;
      }
    });

    setFilteredMentors(filtered);
  }, [mentors, searchQuery, selectedCategory, sortBy]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    Vibration.vibrate(10);
  }, []);

  const handleCategorySelect = useCallback((categoryId) => {
    Vibration.vibrate(10);
    setSelectedCategory(categoryId);
  }, []);

  const handleMentorPress = useCallback((mentor) => {
    setSelectedMentor(mentor);
    setShowMentorModal(true);
    Vibration.vibrate(10);
  }, []);

  const handleConnectMentor = useCallback(async (mentorId) => {
    try {
      Vibration.vibrate([50, 100, 50]);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        '🎉 Connection Request Sent!',
        'Your mentorship request has been sent. The mentor will review your profile and respond within 24 hours! 🚀',
        [
          {
            text: 'Awesome! ⭐',
            style: 'default'
          }
        ]
      );

      setShowMentorModal(false);
    } catch (error) {
      Alert.alert(
        '❌ Connection Failed',
        'Unable to send connection request. Please try again later.',
        [{ text: 'Retry', style: 'default' }]
      );
    }
  }, []);

  const renderCategoryFilters = () => (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryRow}>
          {MENTOR_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategorySelect(category.id)}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && {
                  backgroundColor: category.color,
                  transform: [{ scale: 1.05 }],
                }
              ]}
            >
              <Icon 
                name={category.icon} 
                size={18} 
                color={selectedCategory === category.id ? '#fff' : category.color} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && { color: '#fff', fontWeight: 'bold' }
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderSortOptions = () => (
    <View style={styles.sortContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.sortRow}>
          {[
            { key: 'match', label: '🎯 Best Match', icon: 'analytics' },
            { key: 'rating', label: '⭐ Highest Rated', icon: 'star' },
            { key: 'price', label: '💰 Price Low-High', icon: 'attach-money' },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setSortBy(option.key)}
              style={[
                styles.sortChip,
                sortBy === option.key && styles.sortChipActive
              ]}
            >
              <Icon 
                name={option.icon} 
                size={16} 
                color={sortBy === option.key ? '#fff' : COLORS.textSecondary} 
              />
              <Text style={[
                styles.sortText,
                sortBy === option.key && styles.sortTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderMentorCard = ({ item: mentor }) => (
    <TouchableOpacity
      onPress={() => handleMentorPress(mentor)}
      style={styles.mentorCard}
    >
      <LinearGradient
        colors={['#ffffff', '#f8f9ff']}
        style={styles.mentorCardGradient}
      >
        <View style={styles.mentorHeader}>
          <View style={styles.mentorAvatarContainer}>
            <Avatar.Image
              size={60}
              source={{ uri: mentor.avatar }}
            />
            {mentor.isOnline && <View style={styles.onlineIndicator} />}
            <Badge
              style={[styles.matchBadge, { backgroundColor: getMatchColor(mentor.matchScore) }]}
              size={20}
            >
              {mentor.matchScore}%
            </Badge>
          </View>
          
          <View style={styles.mentorInfo}>
            <View style={styles.mentorNameRow}>
              <Text style={[TEXT_STYLES.h3, { fontSize: 16 }]} numberOfLines={1}>
                {mentor.name}
              </Text>
              <View style={styles.availabilityContainer}>
                <View style={[
                  styles.availabilityDot,
                  { backgroundColor: mentor.availability === 'Available' ? COLORS.success : COLORS.warning }
                ]} />
                <Text style={[TEXT_STYLES.caption, { fontSize: 10 }]}>
                  {mentor.availability}
                </Text>
              </View>
            </View>
            
            <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: 'bold' }]}>
              {mentor.title}
            </Text>
            <Text style={TEXT_STYLES.caption} numberOfLines={1}>
              {mentor.specialization}
            </Text>
            
            <View style={styles.mentorStats}>
              <View style={styles.statItem}>
                <Icon name="star" size={14} color={COLORS.warning} />
                <Text style={styles.statText}>{mentor.rating}</Text>
                <Text style={[styles.statText, { color: COLORS.textSecondary }]}>
                  ({mentor.reviewCount})
                </Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="schedule" size={14} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{mentor.responseTime}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.mentorTags}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mentor.tags.map((tag, index) => (
              <Chip
                key={index}
                style={styles.mentorTag}
                textStyle={styles.mentorTagText}
              >
                {tag}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <View style={styles.mentorFooter}>
          <View style={styles.priceContainer}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, fontSize: 16 }]}>
              {mentor.price}
            </Text>
            <Text style={TEXT_STYLES.caption}>{mentor.experience}</Text>
          </View>
          
          <Button
            mode="contained"
            onPress={() => handleMentorPress(mentor)}
            style={styles.viewProfileButton}
            labelStyle={styles.viewProfileButtonText}
          >
            View Profile 👁️
          </Button>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderMentorModal = () => (
    <Portal>
      <Modal
        visible={showMentorModal}
        onDismiss={() => setShowMentorModal(false)}
        contentContainerStyle={styles.mentorModal}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          {selectedMentor && (
            <Surface style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Avatar.Image
                    size={80}
                    source={{ uri: selectedMentor.avatar }}
                  />
                  <View style={styles.modalHeaderInfo}>
                    <Text style={[TEXT_STYLES.h2, { fontSize: 20 }]}>
                      {selectedMentor.name}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: 'bold' }]}>
                      {selectedMentor.title}
                    </Text>
                    <View style={styles.modalRating}>
                      <Icon name="star" size={16} color={COLORS.warning} />
                      <Text style={TEXT_STYLES.body}>
                        {selectedMentor.rating} ({selectedMentor.reviewCount} reviews)
                      </Text>
                    </View>
                  </View>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowMentorModal(false)}
                    style={styles.closeButton}
                  />
                </View>

                {/* Bio */}
                <View style={styles.modalSection}>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                    About 📖
                  </Text>
                  <Text style={TEXT_STYLES.body}>{selectedMentor.bio}</Text>
                </View>

                {/* Achievements */}
                <View style={styles.modalSection}>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                    Achievements 🏆
                  </Text>
                  {selectedMentor.achievements.map((achievement, index) => (
                    <View key={index} style={styles.achievementItem}>
                      <Icon name="check-circle" size={16} color={COLORS.success} />
                      <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                        {achievement}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Specialization Tags */}
                <View style={styles.modalSection}>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                    Specializations 🎯
                  </Text>
                  <View style={styles.modalTags}>
                    {selectedMentor.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        style={styles.modalTag}
                        textStyle={styles.modalTagText}
                      >
                        {tag}
                      </Chip>
                    ))}
                  </View>
                </View>

                {/* Pricing and Availability */}
                <View style={styles.modalSection}>
                  <View style={styles.modalPricing}>
                    <View style={styles.pricingItem}>
                      <Text style={TEXT_STYLES.caption}>Session Price</Text>
                      <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                        {selectedMentor.price}
                      </Text>
                    </View>
                    <View style={styles.pricingItem}>
                      <Text style={TEXT_STYLES.caption}>Response Time</Text>
                      <Text style={TEXT_STYLES.body}>{selectedMentor.responseTime}</Text>
                    </View>
                    <View style={styles.pricingItem}>
                      <Text style={TEXT_STYLES.caption}>Match Score</Text>
                      <Text style={[TEXT_STYLES.h3, { color: getMatchColor(selectedMentor.matchScore) }]}>
                        {selectedMentor.matchScore}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowMentorModal(false)}
                    style={styles.cancelButton}
                  >
                    Maybe Later 🤔
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleConnectMentor(selectedMentor.id)}
                    style={styles.connectButton}
                    labelStyle={styles.connectButtonText}
                  >
                    Connect Now 🚀
                  </Button>
                </View>
              </ScrollView>
            </Surface>
          )}
        </BlurView>
      </Modal>
    </Portal>
  );

  const getMatchColor = (score) => {
    if (score >= 90) return COLORS.success;
    if (score >= 75) return COLORS.warning;
    return COLORS.textSecondary;
  };

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
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: '#fff', flex: 1, textAlign: 'center' }]}>
            Find Your Mentor 🌟
          </Text>
          <IconButton
            icon={viewMode === 'list' ? 'grid-view' : 'list'}
            iconColor="#fff"
            size={24}
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          />
        </View>
        
        <Searchbar
          placeholder="Search mentors, specializations, or tags..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {renderCategoryFilters()}
        {renderSortOptions()}
        
        <View style={styles.resultsHeader}>
          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
            {filteredMentors.length} mentors found 🎯
          </Text>
          <Text style={TEXT_STYLES.caption}>
            Sorted by {sortBy === 'match' ? 'best match' : sortBy === 'rating' ? 'rating' : 'price'}
          </Text>
        </View>

        <FlatList
          data={filteredMentors}
          renderItem={renderMentorCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.mentorsList}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        />
      </Animated.View>

      {renderMentorModal()}
      
      <FAB
        icon="message"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            '💬 Message Center',
            'View your mentor conversations and connection requests.',
            [{ text: 'Coming Soon! 🚀', style: 'default' }]
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    elevation: 3,
  },
  searchInput: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  categoryContainer: {
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    elevation: 1,
  },
  categoryText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  sortContainer: {
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontSize: 11,
  },
  sortTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  mentorsList: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 100,
  },
  mentorCard: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mentorCardGradient: {
    borderRadius: 16,
    padding: SPACING.md,
  },
  mentorHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  mentorAvatarContainer: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: '#fff',
  },
  matchBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
  },
  mentorInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  mentorNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
  },
  mentorStats: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: 2,
    fontSize: 11,
  },
  mentorTags: {
    marginBottom: SPACING.sm,
  },
  mentorTag: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    marginRight: SPACING.xs,
    height: 24,
  },
  mentorTagText: {
    fontSize: 10,
    color: COLORS.primary,
  },
  mentorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  viewProfileButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  viewProfileButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  mentorModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    width: width * 0.95,
    maxHeight: height * 0.85,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  modalHeaderInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  closeButton: {
    margin: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  modalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalTag: {
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    height: 28,
  },
  modalTagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalPricing: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
  },
  pricingItem: {
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 0.45,
    borderColor: COLORS.textSecondary,
  },
  connectButton: {
    flex: 0.45,
    backgroundColor: COLORS.primary,
  },
  connectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MentorConnection;