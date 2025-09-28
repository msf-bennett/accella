import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  Portal,
  Modal,
  Searchbar,
  Text,
  IconButton,
  ProgressBar,
  FAB
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0'
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: '600' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: COLORS.textLight }
};

const { width, height } = Dimensions.get('window');

const TrainerNetwork = ({ navigation }) => {
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [trainers, setTrainers] = useState([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Redux
  const dispatch = useDispatch();
  const { user, userLocation } = useSelector(state => state.auth);

  // Mock trainer data
  const mockTrainers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      specialization: ['Personal Training', 'Yoga', 'Nutrition'],
      rating: 4.8,
      reviews: 156,
      location: 'Westlands, Nairobi',
      distance: '2.3 km',
      price: 'KES 3,000/session',
      experience: '5+ years',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=1',
      bio: 'Certified personal trainer specializing in weight loss and strength training. Helped 200+ clients achieve their fitness goals.',
      achievements: ['NASM Certified', 'Nutrition Specialist', 'Top Rated'],
      availability: 'Available Today',
      sessions: 1250,
      responseTime: '< 1 hour'
    },
    {
      id: '2',
      name: 'Michael Chen',
      specialization: ['Boxing', 'HIIT', 'Conditioning'],
      rating: 4.9,
      reviews: 203,
      location: 'Karen, Nairobi',
      distance: '4.1 km',
      price: 'KES 3,500/session',
      experience: '8+ years',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=2',
      bio: 'Former professional boxer turned trainer. Specializes in high-intensity workouts and combat sports.',
      achievements: ['Boxing Coach Level 3', 'HIIT Specialist', 'Premium Trainer'],
      availability: 'Booked until Thursday',
      sessions: 2100,
      responseTime: '< 30 min'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      specialization: ['Pilates', 'Rehabilitation', 'Seniors'],
      rating: 4.7,
      reviews: 89,
      location: 'Kilimani, Nairobi',
      distance: '1.8 km',
      price: 'KES 2,800/session',
      experience: '4+ years',
      verified: false,
      avatar: 'https://i.pravatar.cc/150?img=3',
      bio: 'Physical therapist and Pilates instructor focusing on injury prevention and rehabilitation.',
      achievements: ['Pilates Certified', 'PT License', 'Rising Star'],
      availability: 'Available Tomorrow',
      sessions: 650,
      responseTime: '< 2 hours'
    }
  ];

  const filterOptions = [
    'All', 'Personal Training', 'Yoga', 'Boxing', 'Pilates', 
    'Nutrition', 'HIIT', 'Strength Training', 'Cardio', 
    'Rehabilitation', 'Seniors', 'Weight Loss'
  ];

  // Effects
  useEffect(() => {
    loadTrainers();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
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
      })
    ]).start();
  };

  const loadTrainers = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTrainers(mockTrainers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load trainers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrainers();
    setRefreshing(false);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  const handleFilterSelect = (filter) => {
    if (filter === 'All') {
      setSelectedFilters([]);
    } else {
      setSelectedFilters(prev => 
        prev.includes(filter) 
          ? prev.filter(f => f !== filter)
          : [...prev, filter]
      );
    }
  };

  const handleBookSession = (trainer) => {
    Alert.alert(
      '🚀 Feature Coming Soon!',
      `Booking system for ${trainer.name} is under development. You'll be able to book sessions directly through the app soon!`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleViewProfile = (trainer) => {
    setSelectedTrainer(trainer);
    setShowTrainerModal(true);
  };

  const handleMessageTrainer = (trainer) => {
    Alert.alert(
      '💬 Feature Coming Soon!',
      `Direct messaging with ${trainer.name} will be available soon!`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const getFilteredTrainers = () => {
    let filtered = trainers;
    
    if (searchQuery) {
      filtered = filtered.filter(trainer => 
        trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.specialization.some(spec => 
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        trainer.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(trainer =>
        trainer.specialization.some(spec => selectedFilters.includes(spec))
      );
    }
    
    return filtered;
  };

  const renderTrainerCard = ({ item: trainer }) => (
    <Animated.View
      style={[
        styles.trainerCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Card style={styles.card} elevation={3}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.cardHeader}
        >
          <View style={styles.headerContent}>
            <Avatar.Image
              size={60}
              source={{ uri: trainer.avatar }}
              style={styles.avatar}
            />
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
                  {trainer.name}
                </Text>
                {trainer.verified && (
                  <Icon name="verified" size={18} color={COLORS.success} />
                )}
              </View>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.9 }]}>
                📍 {trainer.location} • {trainer.distance}
              </Text>
              <View style={styles.ratingRow}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.white, marginLeft: 4 }]}>
                  {trainer.rating} ({trainer.reviews} reviews)
                </Text>
              </View>
            </View>
          </View>
          <IconButton
            icon="bookmark-outline"
            iconColor={COLORS.white}
            size={24}
            onPress={() => Alert.alert('Feature Coming Soon!', 'Bookmark functionality will be available soon!')}
          />
        </LinearGradient>

        <Card.Content style={styles.cardContent}>
          <View style={styles.specializationContainer}>
            {trainer.specialization.slice(0, 3).map((spec, index) => (
              <Chip
                key={index}
                mode="outlined"
                compact
                style={styles.specializationChip}
                textStyle={styles.chipText}
              >
                {spec}
              </Chip>
            ))}
            {trainer.specialization.length > 3 && (
              <Chip
                mode="outlined"
                compact
                style={styles.specializationChip}
                textStyle={styles.chipText}
              >
                +{trainer.specialization.length - 3} more
              </Chip>
            )}
          </View>

          <Text style={[TEXT_STYLES.caption, styles.bio]} numberOfLines={2}>
            {trainer.bio}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={TEXT_STYLES.h3}>{trainer.sessions.toLocaleString()}</Text>
              <Text style={TEXT_STYLES.caption}>Sessions</Text>
            </View>
            <View style={styles.stat}>
              <Text style={TEXT_STYLES.h3}>{trainer.experience}</Text>
              <Text style={TEXT_STYLES.caption}>Experience</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>{trainer.price}</Text>
              <Text style={TEXT_STYLES.caption}>Per Session</Text>
            </View>
          </View>

          <View style={styles.achievementContainer}>
            {trainer.achievements.map((achievement, index) => (
              <Surface key={index} style={styles.achievementBadge} elevation={1}>
                <Text style={styles.achievementText}>🏆 {achievement}</Text>
              </Surface>
            ))}
          </View>

          <View style={styles.availabilityRow}>
            <Icon
              name={trainer.availability.includes('Available') ? 'check-circle' : 'schedule'}
              size={16}
              color={trainer.availability.includes('Available') ? COLORS.success : COLORS.textLight}
            />
            <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
              {trainer.availability} • Responds {trainer.responseTime}
            </Text>
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => handleViewProfile(trainer)}
            style={styles.actionButton}
            labelStyle={styles.buttonLabel}
          >
            View Profile
          </Button>
          <Button
            mode="contained"
            onPress={() => handleBookSession(trainer)}
            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            labelStyle={styles.buttonLabel}
          >
            Book Session
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={styles.filterModal}
      >
        <BlurView
          style={styles.blurContainer}
          blurType="light"
          blurAmount={10}
        >
          <View style={styles.filterContent}>
            <View style={styles.filterHeader}>
              <Text style={TEXT_STYLES.h2}>Filter Trainers</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowFilters(false)}
              />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[TEXT_STYLES.body, styles.filterTitle]}>Specializations</Text>
              <View style={styles.filterGrid}>
                {filterOptions.map((filter) => (
                  <Chip
                    key={filter}
                    mode={selectedFilters.includes(filter) || (filter === 'All' && selectedFilters.length === 0) ? 'flat' : 'outlined'}
                    selected={selectedFilters.includes(filter) || (filter === 'All' && selectedFilters.length === 0)}
                    onPress={() => handleFilterSelect(filter)}
                    style={styles.filterChip}
                    selectedColor={COLORS.primary}
                  >
                    {filter}
                  </Chip>
                ))}
              </View>
            </ScrollView>

            <Button
              mode="contained"
              onPress={() => setShowFilters(false)}
              style={styles.applyButton}
              buttonColor={COLORS.primary}
            >
              Apply Filters ({getFilteredTrainers().length} trainers)
            </Button>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderTrainerModal = () => (
    <Portal>
      <Modal
        visible={showTrainerModal}
        onDismiss={() => setShowTrainerModal(false)}
        contentContainerStyle={styles.trainerModal}
      >
        <BlurView
          style={styles.blurContainer}
          blurType="light"
          blurAmount={10}
        >
          {selectedTrainer && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.modalHeader}
              >
                <View style={styles.modalHeaderContent}>
                  <Avatar.Image
                    size={80}
                    source={{ uri: selectedTrainer.avatar }}
                    style={styles.modalAvatar}
                  />
                  <View style={styles.modalHeaderInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
                        {selectedTrainer.name}
                      </Text>
                      {selectedTrainer.verified && (
                        <Icon name="verified" size={20} color={COLORS.success} />
                      )}
                    </View>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.9 }]}>
                      📍 {selectedTrainer.location}
                    </Text>
                    <View style={styles.ratingRow}>
                      <Icon name="star" size={18} color="#FFD700" />
                      <Text style={[TEXT_STYLES.body, { color: COLORS.white, marginLeft: 4 }]}>
                        {selectedTrainer.rating} ({selectedTrainer.reviews} reviews)
                      </Text>
                    </View>
                  </View>
                </View>
                <IconButton
                  icon="close"
                  iconColor={COLORS.white}
                  size={24}
                  onPress={() => setShowTrainerModal(false)}
                  style={styles.closeButton}
                />
              </LinearGradient>

              <View style={styles.modalBody}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>About</Text>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg }]}>
                  {selectedTrainer.bio}
                </Text>

                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Specializations</Text>
                <View style={styles.specializationContainer}>
                  {selectedTrainer.specialization.map((spec, index) => (
                    <Chip key={index} mode="outlined" compact style={styles.specializationChip}>
                      {spec}
                    </Chip>
                  ))}
                </View>

                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, marginTop: SPACING.lg }]}>
                  Achievements
                </Text>
                <View style={styles.achievementContainer}>
                  {selectedTrainer.achievements.map((achievement, index) => (
                    <Surface key={index} style={styles.achievementBadge} elevation={1}>
                      <Text style={styles.achievementText}>🏆 {achievement}</Text>
                    </Surface>
                  ))}
                </View>

                <View style={styles.quickStats}>
                  <View style={styles.quickStat}>
                    <Text style={TEXT_STYLES.h2}>{selectedTrainer.sessions.toLocaleString()}</Text>
                    <Text style={TEXT_STYLES.caption}>Total Sessions</Text>
                  </View>
                  <View style={styles.quickStat}>
                    <Text style={TEXT_STYLES.h2}>{selectedTrainer.experience}</Text>
                    <Text style={TEXT_STYLES.caption}>Experience</Text>
                  </View>
                  <View style={styles.quickStat}>
                    <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                      {selectedTrainer.responseTime}
                    </Text>
                    <Text style={TEXT_STYLES.caption}>Response Time</Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => handleMessageTrainer(selectedTrainer)}
                  style={styles.modalActionButton}
                  icon="message"
                >
                  Message
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleBookSession(selectedTrainer)}
                  style={[styles.modalActionButton, { backgroundColor: COLORS.primary }]}
                  icon="calendar"
                >
                  Book Session
                </Button>
              </View>
            </ScrollView>
          )}
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>
            🏋️ Find Your Perfect Trainer
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.9 }]}>
            Connect with certified fitness professionals near you
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search trainers, specializations, locations..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={TEXT_STYLES.body}
        />
        <IconButton
          icon="tune"
          mode="contained"
          iconColor={COLORS.white}
          containerColor={COLORS.primary}
          size={24}
          onPress={() => setShowFilters(true)}
        />
      </View>

      {selectedFilters.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFilters}
          contentContainerStyle={styles.activeFiltersContent}
        >
          {selectedFilters.map((filter) => (
            <Chip
              key={filter}
              mode="flat"
              selected
              onClose={() => handleFilterSelect(filter)}
              style={styles.activeFilterChip}
              selectedColor={COLORS.primary}
            >
              {filter}
            </Chip>
          ))}
        </ScrollView>
      )}

      <View style={styles.resultsHeader}>
        <Text style={TEXT_STYLES.h3}>
          {getFilteredTrainers().length} Trainers Found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
            Sort by Rating ↓
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ProgressBar indeterminate color={COLORS.primary} />
        </View>
      )}

      <FlatList
        data={getFilteredTrainers()}
        renderItem={renderTrainerCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Icon name="search-off" size={64} color={COLORS.textLight} />
              <Text style={[TEXT_STYLES.h3, { color: COLORS.textLight, marginTop: SPACING.md }]}>
                No trainers found
              </Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          )
        }
      />

      <FAB
        icon="map"
        style={styles.fab}
        color={COLORS.white}
        customSize={56}
        onPress={() => Alert.alert('🗺️ Feature Coming Soon!', 'Map view will be available soon!')}
      />

      {renderFilterModal()}
      {renderTrainerModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    marginRight: SPACING.md,
    elevation: 0,
    backgroundColor: COLORS.background,
  },
  activeFilters: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
  },
  activeFiltersContent: {
    paddingHorizontal: SPACING.md,
  },
  activeFilterChip: {
    marginRight: SPACING.sm,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  sortButton: {
    paddingVertical: SPACING.sm,
  },
  loadingContainer: {
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 80,
  },
  trainerCard: {
    marginVertical: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  specializationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  specializationChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  chipText: {
    fontSize: 12,
  },
  bio: {
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  stat: {
    alignItems: 'center',
  },
  achievementContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  achievementBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  achievementText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActions: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  // Filter Modal
  filterModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurContainer: {
    flex: 1,
  },
  filterContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    maxHeight: height * 0.8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  applyButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  // Trainer Modal
  trainerModal: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop: StatusBar.currentHeight + SPACING.lg,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
  },
  modalHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalAvatar: {
    marginRight: SPACING.lg,
  },
  modalHeaderInfo: {
    flex: 1,
  },
  closeButton: {
    marginLeft: SPACING.md,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quickStat: {
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalActionButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  });
  
export default TrainerNetwork;