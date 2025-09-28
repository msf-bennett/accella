import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Searchbar,
  Chip,
  Button,
  Avatar,
  Surface,
  ProgressBar,
  Badge,
  IconButton,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const TrialScouts = ({ navigation }) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);

  // Redux hooks
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for trial scouts
  const [trials, setTrials] = useState([
    {
      id: 1,
      title: 'Premier League Academy Trials',
      organization: 'Manchester United Academy',
      sport: 'Football',
      level: 'Professional',
      location: 'Manchester, UK',
      date: '2024-09-15',
      deadline: '2024-09-01',
      spots: 50,
      spotsLeft: 12,
      requirements: ['Age 16-18', 'Previous club experience', 'Medical clearance'],
      description: 'Open trials for youth academy positions. Successful candidates will join our development program.',
      image: 'https://example.com/image1.jpg',
      rating: 4.8,
      reviews: 156,
      cost: 0,
      isBookmarked: false,
      badges: ['FREE', 'VERIFIED'],
      scouts: ['John Smith', 'David Wilson'],
    },
    {
      id: 2,
      title: 'Basketball Scholarship Showcase',
      organization: 'Elite Sports Academy',
      sport: 'Basketball',
      level: 'College',
      location: 'Los Angeles, CA',
      date: '2024-09-20',
      deadline: '2024-09-10',
      spots: 30,
      spotsLeft: 8,
      requirements: ['Age 17-19', 'High school completion', 'Height 6ft+'],
      description: 'College scholarship opportunities for talented basketball players.',
      image: 'https://example.com/image2.jpg',
      rating: 4.6,
      reviews: 89,
      cost: 150,
      isBookmarked: true,
      badges: ['SCHOLARSHIP', 'PREMIUM'],
      scouts: ['Coach Johnson', 'Mike Davis'],
    },
    {
      id: 3,
      title: 'Tennis Development Program',
      organization: 'National Tennis Center',
      sport: 'Tennis',
      level: 'Junior',
      location: 'New York, NY',
      date: '2024-10-05',
      deadline: '2024-09-20',
      spots: 20,
      spotsLeft: 15,
      requirements: ['Age 14-17', 'Regional ranking', 'Equipment provided'],
      description: 'Junior development program with professional coaching and tournament preparation.',
      image: 'https://example.com/image3.jpg',
      rating: 4.9,
      reviews: 203,
      cost: 300,
      isBookmarked: false,
      badges: ['DEVELOPMENT', 'TOP_RATED'],
      scouts: ['Maria Garcia', 'Steve Chen'],
    },
  ]);

  const sports = ['All', 'Football', 'Basketball', 'Tennis', 'Soccer', 'Baseball', 'Swimming'];
  const levels = ['All', 'Junior', 'College', 'Professional', 'Amateur'];
  const locations = ['All', 'New York, NY', 'Los Angeles, CA', 'Manchester, UK', 'London, UK'];

  // Effects
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
    ]).start();
  }, []);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Trial opportunities refreshed!');
    }, 1500);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    // Implement search logic
  }, []);

  const toggleBookmark = (trialId) => {
    setTrials(prevTrials =>
      prevTrials.map(trial =>
        trial.id === trialId
          ? { ...trial, isBookmarked: !trial.isBookmarked }
          : trial
      )
    );
  };

  const applyToTrial = (trial) => {
    Alert.alert(
      'Apply to Trial',
      `Apply for ${trial.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply', 
          onPress: () => {
            Alert.alert('Application Submitted', 'Your application has been sent to the organizers.');
          }
        },
      ]
    );
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'FREE': COLORS.success,
      'VERIFIED': COLORS.primary,
      'SCHOLARSHIP': '#FF6B35',
      'PREMIUM': '#8E44AD',
      'DEVELOPMENT': '#3498DB',
      'TOP_RATED': '#F1C40F',
    };
    return colors[badge] || COLORS.secondary;
  };

  const renderTrialCard = ({ item }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={styles.trialCard} elevation={4}>
        <LinearGradient
          colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
          style={styles.cardGradient}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Avatar.Text
                size={40}
                label={item.sport.charAt(0)}
                style={{ backgroundColor: COLORS.primary }}
              />
              <View style={styles.headerText}>
                <Text style={styles.trialTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.organizationText}>
                  {item.organization}
                </Text>
              </View>
            </View>
            <IconButton
              icon={item.isBookmarked ? 'bookmark' : 'bookmark-border'}
              size={24}
              iconColor={item.isBookmarked ? COLORS.primary : COLORS.secondary}
              onPress={() => toggleBookmark(item.id)}
            />
          </View>

          {/* Badges */}
          <View style={styles.badgeContainer}>
            {item.badges.map((badge, index) => (
              <Chip
                key={index}
                mode="flat"
                compact
                style={[styles.badge, { backgroundColor: getBadgeColor(badge) }]}
                textStyle={styles.badgeText}
              >
                {badge}
              </Chip>
            ))}
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color={COLORS.secondary} />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="calendar-today" size={16} color={COLORS.secondary} />
              <Text style={styles.detailText}>Trial: {item.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color={COLORS.secondary} />
              <Text style={styles.detailText}>Deadline: {item.deadline}</Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {item.spotsLeft} spots left of {item.spots}
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round((item.spotsLeft / item.spots) * 100)}%
              </Text>
            </View>
            <ProgressBar
              progress={(item.spots - item.spotsLeft) / item.spots}
              color={COLORS.primary}
              style={styles.progressBar}
            />
          </View>

          {/* Rating and Cost */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingLeft}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>
                {item.rating} ({item.reviews})
              </Text>
            </View>
            <Text style={styles.costText}>
              {item.cost === 0 ? 'FREE' : `$${item.cost}`}
            </Text>
          </View>

          {/* Scouts */}
          <View style={styles.scoutsContainer}>
            <Text style={styles.scoutsLabel}>Scouts:</Text>
            <Text style={styles.scoutsText}>
              {item.scouts.join(', ')}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Button
              mode="outlined"
              compact
              onPress={() => navigation.navigate('TrialDetails', { trial: item })}
              style={styles.detailsButton}
            >
              View Details
            </Button>
            <Button
              mode="contained"
              compact
              onPress={() => applyToTrial(item)}
              style={styles.applyButton}
              disabled={item.spotsLeft === 0}
            >
              {item.spotsLeft === 0 ? 'Full' : 'Apply Now'}
            </Button>
          </View>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Trial Scouts 🏆</Text>
            <View style={styles.headerIcons}>
              <IconButton
                icon="filter-list"
                size={24}
                iconColor="white"
                onPress={() => setFilterModalVisible(true)}
              />
              <Badge
                visible={trials.filter(t => t.isBookmarked).length > 0}
                size={16}
                style={styles.bookmarkBadge}
              >
                {trials.filter(t => t.isBookmarked).length}
              </Badge>
              <IconButton
                icon="bookmarks"
                size={24}
                iconColor="white"
                onPress={() => setBookmarkModalVisible(true)}
              />
            </View>
          </View>
          
          <Text style={styles.headerSubtitle}>
            Discover professional trials and scouting opportunities
          </Text>

          {/* Search */}
          <Searchbar
            placeholder="Search trials, organizations, scouts..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />

          {/* Quick Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            {sports.map((sport) => (
              <Chip
                key={sport}
                selected={selectedSport === sport}
                onPress={() => setSelectedSport(sport)}
                mode="flat"
                style={[
                  styles.filterChip,
                  selectedSport === sport && styles.selectedChip,
                ]}
                textStyle={[
                  styles.chipText,
                  selectedSport === sport && styles.selectedChipText,
                ]}
              >
                {sport}
              </Chip>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Content */}
      <FlatList
        data={trials}
        renderItem={renderTrialCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={filterModalVisible}
          onDismiss={() => setFilterModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
            <Text style={styles.modalTitle}>Filter Trials</Text>
            
            <Text style={styles.filterLabel}>Sport</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sports.map((sport) => (
                <Chip
                  key={sport}
                  selected={selectedSport === sport}
                  onPress={() => setSelectedSport(sport)}
                  style={styles.modalChip}
                >
                  {sport}
                </Chip>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Level</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {levels.map((level) => (
                <Chip
                  key={level}
                  selected={selectedLevel === level}
                  onPress={() => setSelectedLevel(level)}
                  style={styles.modalChip}
                >
                  {level}
                </Chip>
              ))}
            </ScrollView>

            <Button
              mode="contained"
              onPress={() => setFilterModalVisible(false)}
              style={styles.modalButton}
            >
              Apply Filters
            </Button>
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    gap: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkBadge: {
    position: 'absolute',
    top: 8,
    right: 40,
    backgroundColor: COLORS.error,
    zIndex: 1,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: SPACING.xs,
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 2,
    marginTop: SPACING.md,
  },
  searchInput: {
    color: COLORS.text,
  },
  filtersScroll: {
    marginTop: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedChip: {
    backgroundColor: 'white',
  },
  chipText: {
    color: 'white',
    fontSize: 14,
  },
  selectedChipText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  trialCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  trialTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  organizationText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    fontSize: 14,
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  badge: {
    height: 28,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    color: COLORS.text,
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.lightGray,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ratingText: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    color: COLORS.secondary,
  },
  costText: {
    ...TEXT_STYLES.heading,
    fontSize: 16,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  scoutsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  scoutsLabel: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scoutsText: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    color: COLORS.secondary,
    flex: 1,
  },
  divider: {
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.lightGray,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  detailsButton: {
    flex: 1,
    borderColor: COLORS.primary,
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  blurView: {
    padding: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  filterLabel: {
    ...TEXT_STYLES.body,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  modalChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.lg,
  },
});

export default TrialScouts;