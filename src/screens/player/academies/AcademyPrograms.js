import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Alert,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Portal,
  Modal,
  Text,
  ProgressBar,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants';

const AcademyPrograms = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, programs, enrollments } = useSelector(state => ({
    user: state.auth.user,
    programs: state.programs.availablePrograms || [],
    enrollments: state.programs.userEnrollments || []
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [fadeAnim] = useState(new Animated.Value(0));

  const sports = ['All', 'Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Professional'];

  // Sample programs data - replace with actual data from Redux
  const programsData = [
    {
      id: '1',
      academyId: 'academy_1',
      academyName: 'Elite Football Academy',
      academyRating: 4.8,
      title: 'Youth Development Program',
      description: 'Comprehensive football training program designed for young athletes aged 8-16. Focus on technical skills, tactical understanding, and physical development.',
      sport: 'Football',
      level: 'Beginner',
      duration: '12 weeks',
      sessionsPerWeek: 3,
      price: 299,
      currency: 'USD',
      maxParticipants: 20,
      currentParticipants: 15,
      startDate: '2025-09-01',
      endDate: '2025-11-24',
      image: null,
      features: ['Professional Coaching', 'Equipment Provided', 'Match Analysis', 'Fitness Training'],
      schedule: [
        { day: 'Monday', time: '16:00 - 18:00' },
        { day: 'Wednesday', time: '16:00 - 18:00' },
        { day: 'Saturday', time: '09:00 - 11:00' }
      ],
      coach: {
        name: 'Coach Martinez',
        experience: '10 years',
        certifications: ['UEFA B License', 'Youth Development Specialist']
      },
      isEnrolled: false,
      isFavorite: false,
      rating: 4.9,
      reviewCount: 23
    },
    {
      id: '2',
      academyId: 'academy_2',
      academyName: 'Champions Basketball Camp',
      academyRating: 4.6,
      title: 'Elite Basketball Training',
      description: 'Advanced basketball program for serious players. Intensive training covering all aspects of the game including shooting, defense, and game strategy.',
      sport: 'Basketball',
      level: 'Advanced',
      duration: '8 weeks',
      sessionsPerWeek: 4,
      price: 450,
      currency: 'USD',
      maxParticipants: 15,
      currentParticipants: 12,
      startDate: '2025-08-25',
      endDate: '2025-10-20',
      image: null,
      features: ['1-on-1 Coaching', 'Video Analysis', 'Strength Training', 'Tournament Play'],
      schedule: [
        { day: 'Monday', time: '17:00 - 19:00' },
        { day: 'Tuesday', time: '17:00 - 19:00' },
        { day: 'Thursday', time: '17:00 - 19:00' },
        { day: 'Saturday', time: '10:00 - 12:00' }
      ],
      coach: {
        name: 'Coach Johnson',
        experience: '15 years',
        certifications: ['FIBA Certified', 'Performance Analytics Specialist']
      },
      isEnrolled: true,
      isFavorite: true,
      rating: 4.7,
      reviewCount: 34
    },
    {
      id: '3',
      academyId: 'academy_3',
      academyName: 'Aquatic Sports Center',
      academyRating: 4.5,
      title: 'Swimming Fundamentals',
      description: 'Learn proper swimming techniques and build endurance. Perfect for beginners and those looking to improve their swimming skills.',
      sport: 'Swimming',
      level: 'Beginner',
      duration: '6 weeks',
      sessionsPerWeek: 2,
      price: 180,
      currency: 'USD',
      maxParticipants: 12,
      currentParticipants: 8,
      startDate: '2025-09-15',
      endDate: '2025-10-27',
      image: null,
      features: ['Small Groups', 'All Levels Welcome', 'Safety First', 'Progress Tracking'],
      schedule: [
        { day: 'Tuesday', time: '18:00 - 19:00' },
        { day: 'Thursday', time: '18:00 - 19:00' }
      ],
      coach: {
        name: 'Coach Waters',
        experience: '8 years',
        certifications: ['Water Safety Instructor', 'Competitive Swimming Coach']
      },
      isEnrolled: false,
      isFavorite: false,
      rating: 4.4,
      reviewCount: 18
    }
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadPrograms();
  }, []);

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      // dispatch(loadProgramsAction());
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading programs:', error);
      Alert.alert('Error', 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPrograms();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadPrograms]);

  const handleEnrollProgram = useCallback((program) => {
    Vibration.vibrate(30);
    Alert.alert(
      'Enroll in Program',
      `Would you like to enroll in "${program.title}" for $${program.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enroll', 
          onPress: () => {
            // dispatch(enrollInProgramAction(program.id));
            Alert.alert('Feature Coming Soon', 'Enrollment functionality will be available in the next update! 🚀');
          }
        }
      ]
    );
  }, []);

  const handleToggleFavorite = useCallback((programId) => {
    Vibration.vibrate(30);
    // dispatch(toggleProgramFavoriteAction(programId));
    Alert.alert('Feature Coming Soon', 'Favorites functionality will be available in the next update! ❤️');
  }, []);

  const handleViewProgram = useCallback((program) => {
    setSelectedProgram(program);
    setModalVisible(true);
    Vibration.vibrate(30);
  }, []);

  const getAvailabilityColor = (current, max) => {
    const percentage = current / max;
    if (percentage < 0.5) return COLORS.success;
    if (percentage < 0.8) return '#FFA726';
    return COLORS.error;
  };

  const filteredPrograms = programsData.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.academyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'All' || program.sport === selectedSport;
    const matchesLevel = selectedLevel === 'All' || program.level === selectedLevel;
    return matchesSearch && matchesSport && matchesLevel;
  });

  const renderProgramCard = ({ item: program, index }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        viewMode === 'list' && styles.listCardContainer,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <Card style={[styles.programCard, viewMode === 'list' && styles.listProgramCard]} elevation={3}>
        <TouchableOpacity onPress={() => handleViewProgram(program)}>
          <LinearGradient
            colors={program.isEnrolled ? ['#4CAF50', '#66BB6A'] : ['#667eea', '#764ba2']}
            style={styles.cardHeader}
          >
            <View style={styles.headerTop}>
              <View style={styles.academyInfo}>
                <Avatar.Text
                  size={32}
                  label={program.academyName.charAt(0)}
                  style={styles.academyAvatar}
                />
                <View style={styles.academyDetails}>
                  <Text style={styles.academyName}>{program.academyName}</Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={styles.rating}>{program.academyRating}</Text>
                  </View>
                </View>
              </View>
              <IconButton
                icon={program.isFavorite ? 'favorite' : 'favorite-border'}
                size={20}
                onPress={() => handleToggleFavorite(program.id)}
                iconColor="white"
              />
            </View>
            {program.isEnrolled && (
              <Chip
                mode="flat"
                textStyle={styles.enrolledChipText}
                style={styles.enrolledChip}
              >
                ✅ Enrolled
              </Chip>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Card.Content style={styles.cardContent}>
          <Text style={styles.programTitle}>{program.title}</Text>
          <Text style={styles.programDescription} numberOfLines={2}>
            {program.description}
          </Text>

          <View style={styles.programDetails}>
            <View style={styles.detailRow}>
              <Icon name="sports" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{program.sport} • {program.level}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{program.duration} • {program.sessionsPerWeek}x/week</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="group" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>
                {program.currentParticipants}/{program.maxParticipants} participants
              </Text>
            </View>
          </View>

          <ProgressBar
            progress={program.currentParticipants / program.maxParticipants}
            color={getAvailabilityColor(program.currentParticipants, program.maxParticipants)}
            style={styles.progressBar}
          />

          <View style={styles.priceContainer}>
            <Text style={styles.price}>${program.price}</Text>
            <Text style={styles.priceSubtext}>for {program.duration}</Text>
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => handleViewProgram(program)}
            style={styles.viewButton}
            labelStyle={styles.viewButtonText}
          >
            View Details
          </Button>
          <Button
            mode="contained"
            onPress={() => handleEnrollProgram(program)}
            style={[
              styles.enrollButton,
              program.isEnrolled && styles.enrolledButton
            ]}
            disabled={program.isEnrolled || program.currentParticipants >= program.maxParticipants}
          >
            {program.isEnrolled ? 'Enrolled' : 
             program.currentParticipants >= program.maxParticipants ? 'Full' : 'Enroll'}
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderFilterChips = (items, selectedItem, onSelect, title) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
        {items.map((item) => (
          <Chip
            key={item}
            mode={selectedItem === item ? 'flat' : 'outlined'}
            selected={selectedItem === item}
            onPress={() => {
              onSelect(item);
              Vibration.vibrate(30);
            }}
            style={[
              styles.filterChip,
              selectedItem === item && styles.selectedFilterChip
            ]}
            textStyle={[
              styles.filterChipText,
              selectedItem === item && styles.selectedFilterChipText
            ]}
          >
            {item}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Training Programs 🏆</Text>
          <Text style={styles.headerSubtitle}>
            Find the perfect program for your goals
          </Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
            size={24}
            onPress={() => {
              setViewMode(viewMode === 'grid' ? 'list' : 'grid');
              Vibration.vibrate(30);
            }}
            iconColor="white"
          />
        </View>
      </LinearGradient>

      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Search programs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={TEXT_STYLES.body}
        />
      </Surface>

      <View style={styles.filtersContainer}>
        {renderFilterChips(sports, selectedSport, setSelectedSport, 'Sport')}
        {renderFilterChips(levels, selectedLevel, setSelectedLevel, 'Level')}
      </View>

      <View style={styles.content}>
        {filteredPrograms.length > 0 ? (
          <FlatList
            data={filteredPrograms}
            renderItem={renderProgramCard}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === 'grid' ? 1 : 1}
            key={viewMode}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Icon name="school" size={64} color={COLORS.primary} />
            <Text style={styles.emptyStateTitle}>No Programs Found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || selectedSport !== 'All' || selectedLevel !== 'All'
                ? 'Try adjusting your search or filters'
                : 'No training programs available at the moment'}
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                setSearchQuery('');
                setSelectedSport('All');
                setSelectedLevel('All');
              }}
              style={styles.resetButton}
            >
              Reset Filters
            </Button>
          </View>
        )}
      </View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
          >
            <ScrollView style={styles.modalScrollView}>
              <Card style={styles.modalCard}>
                <Card.Title
                  title={selectedProgram?.title}
                  subtitle={selectedProgram?.academyName}
                  left={(props) => (
                    <Avatar.Text
                      {...props}
                      label={selectedProgram?.academyName?.charAt(0)}
                    />
                  )}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon="close"
                      onPress={() => setModalVisible(false)}
                    />
                  )}
                />
                
                <Card.Content style={styles.modalContent}>
                  <Text style={styles.modalDescription}>
                    {selectedProgram?.description}
                  </Text>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Program Details</Text>
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Icon name="sports" size={20} color={COLORS.primary} />
                        <Text style={styles.detailLabel}>Sport & Level</Text>
                        <Text style={styles.detailValue}>
                          {selectedProgram?.sport} • {selectedProgram?.level}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Icon name="schedule" size={20} color={COLORS.primary} />
                        <Text style={styles.detailLabel}>Duration</Text>
                        <Text style={styles.detailValue}>{selectedProgram?.duration}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Icon name="group" size={20} color={COLORS.primary} />
                        <Text style={styles.detailLabel}>Class Size</Text>
                        <Text style={styles.detailValue}>
                          {selectedProgram?.currentParticipants}/{selectedProgram?.maxParticipants}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Icon name="attach-money" size={20} color={COLORS.primary} />
                        <Text style={styles.detailLabel}>Price</Text>
                        <Text style={styles.detailValue}>${selectedProgram?.price}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Features</Text>
                    <View style={styles.featuresList}>
                      {selectedProgram?.features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                          <Icon name="check-circle" size={16} color={COLORS.success} />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Schedule</Text>
                    {selectedProgram?.schedule.map((session, index) => (
                      <View key={index} style={styles.scheduleItem}>
                        <Text style={styles.scheduleDay}>{session.day}</Text>
                        <Text style={styles.scheduleTime}>{session.time}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Coach</Text>
                    <View style={styles.coachInfo}>
                      <Text style={styles.coachName}>{selectedProgram?.coach.name}</Text>
                      <Text style={styles.coachExperience}>
                        {selectedProgram?.coach.experience} experience
                      </Text>
                      <View style={styles.certifications}>
                        {selectedProgram?.coach.certifications.map((cert, index) => (
                          <Chip key={index} style={styles.certChip} textStyle={styles.certText}>
                            {cert}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  </View>
                </Card.Content>

                <Card.Actions style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setModalVisible(false)}
                    style={styles.modalCancelButton}
                  >
                    Close
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      setModalVisible(false);
                      handleEnrollProgram(selectedProgram);
                    }}
                    style={styles.modalEnrollButton}
                    disabled={selectedProgram?.isEnrolled || 
                             selectedProgram?.currentParticipants >= selectedProgram?.maxParticipants}
                  >
                    {selectedProgram?.isEnrolled ? 'Already Enrolled' : 
                     selectedProgram?.currentParticipants >= selectedProgram?.maxParticipants ? 'Program Full' : 
                     `Enroll for $${selectedProgram?.price}`}
                  </Button>
                </Card.Actions>
              </Card>
            </ScrollView>
          </BlurView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
  },
  searchContainer: {
    elevation: 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 1,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.sm,
  },
  filterSection: {
    marginBottom: SPACING.sm,
  },
  filterTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.primary,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: SPACING.md,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  listCardContainer: {
    marginBottom: SPACING.sm,
  },
  programCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  listProgramCard: {
    borderRadius: 8,
  },
  cardHeader: {
    padding: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  academyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  academyAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  academyDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  academyName: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rating: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 4,
    fontSize: 12,
  },
  enrolledChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
  },
  enrolledChipText: {
    color: 'white',
    fontSize: 12,
  },
  cardContent: {
    padding: SPACING.md,
  },
  programTitle: {
    ...TEXT_STYLES.h4,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  programDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  programDetails: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.text,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  price: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: '700',
  },
  priceSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  cardActions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    borderColor: COLORS.primary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  viewButtonText: {
    color: COLORS.primary,
  },
  enrollButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
  enrolledButton: {
    backgroundColor: COLORS.success,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalScrollView: {
    maxHeight: '90%',
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: SPACING.md,
  },
  modalContent: {
    paddingHorizontal: SPACING.md,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  detailLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  detailValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  featuresList: {
    // Features list styles
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    color: COLORS.text,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scheduleDay: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  scheduleTime: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  coachInfo: {
    // Coach info styles
  },
  coachName: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  coachExperience: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  certifications: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  certChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: '#E3F2FD',
  },
  certText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  modalActions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    borderColor: COLORS.textSecondary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  modalEnrollButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
})

export default AcademyPrograms;