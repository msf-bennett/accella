import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Searchbar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const { width } = Dimensions.get('window');

const Competitions = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, competitions, loading } = useSelector(state => ({
    user: state.auth.user,
    competitions: state.competitions.list,
    loading: state.competitions.loading,
  }));

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [registeredComps, setRegisteredComps] = useState(new Set());
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for competitions
  const [competitionsData, setCompetitionsData] = useState([
    {
      id: '1',
      name: 'Youth Football Championship 2025',
      sport: 'Football',
      level: 'Youth',
      location: 'Nairobi, Kenya',
      date: '2025-09-15',
      endDate: '2025-09-17',
      registrationFee: 'KES 2,500',
      participants: 24,
      maxParticipants: 32,
      organizer: 'Kenya Football Federation',
      description: 'Annual youth championship for players under 18',
      image: require('../assets/football-comp.jpg'),
      category: 'Tournament',
      prizePool: 'KES 100,000',
      status: 'Open',
      tags: ['U18', 'Team Sport', 'Competitive'],
    },
    {
      id: '2',
      name: 'Nairobi Marathon 2025',
      sport: 'Athletics',
      level: 'Open',
      location: 'Nairobi, Kenya',
      date: '2025-10-28',
      endDate: '2025-10-28',
      registrationFee: 'KES 3,000',
      participants: 1250,
      maxParticipants: 2000,
      organizer: 'Athletics Kenya',
      description: 'Full and half marathon through the city',
      category: 'Marathon',
      prizePool: 'KES 500,000',
      status: 'Open',
      tags: ['Individual', 'Endurance', 'City Run'],
    },
    {
      id: '3',
      name: 'Swimming Gala Championships',
      sport: 'Swimming',
      level: 'Junior',
      location: 'Mombasa, Kenya',
      date: '2025-11-12',
      endDate: '2025-11-14',
      registrationFee: 'KES 1,800',
      participants: 45,
      maxParticipants: 60,
      organizer: 'Swimming Association of Kenya',
      description: 'Junior swimming championships with multiple events',
      category: 'Championship',
      prizePool: 'KES 75,000',
      status: 'Open',
      tags: ['U16', 'Individual', 'Multi-Event'],
    },
  ]);

  const sports = ['All', 'Football', 'Athletics', 'Swimming', 'Basketball', 'Tennis', 'Rugby'];
  const levels = ['All', 'Youth', 'Junior', 'Senior', 'Open', 'Professional'];
  const locations = ['All', 'Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru'];

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Load competitions data
    loadCompetitions();
  }, []);

  const loadCompetitions = useCallback(async () => {
    try {
      // Simulate API call
      // dispatch(fetchCompetitions());
    } catch (error) {
      console.error('Error loading competitions:', error);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCompetitions();
    setRefreshing(false);
  }, [loadCompetitions]);

  const filteredCompetitions = competitionsData.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comp.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comp.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'All' || comp.sport === selectedSport;
    const matchesLevel = selectedLevel === 'All' || comp.level === selectedLevel;
    const matchesLocation = selectedLocation === 'All' || comp.location.includes(selectedLocation);
    
    return matchesSearch && matchesSport && matchesLevel && matchesLocation;
  });

  const toggleFavorite = useCallback((compId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(compId)) {
        newFavorites.delete(compId);
      } else {
        newFavorites.add(compId);
      }
      return newFavorites;
    });
  }, []);

  const registerForCompetition = useCallback((competition) => {
    Alert.alert(
      'Register for Competition',
      `Do you want to register for ${competition.name}?\n\nRegistration Fee: ${competition.registrationFee}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: () => {
            setRegisteredComps(prev => new Set([...prev, competition.id]));
            Alert.alert('Success', 'Registration submitted! You will receive confirmation soon.');
          },
        },
      ]
    );
  }, []);

  const renderCompetitionCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50],
              }),
            },
          ],
        },
      ]}
    >
      <Card style={styles.competitionCard} elevation={4}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.cardHeader}
        >
          <View style={styles.headerContent}>
            <View style={styles.competitionInfo}>
              <Text style={styles.competitionName}>{item.name}</Text>
              <Text style={styles.competitionSport}>{item.sport} • {item.level}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite(item.id)}
              style={styles.favoriteButton}
            >
              <Icon
                name={favorites.has(item.id) ? 'favorite' : 'favorite-border'}
                size={24}
                color={favorites.has(item.id) ? COLORS.error : 'white'}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Card.Content style={styles.cardContent}>
          <View style={styles.competitionDetails}>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="event" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>
                {new Date(item.date).toLocaleDateString()} 
                {item.endDate !== item.date && ` - ${new Date(item.endDate).toLocaleDateString()}`}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="people" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>
                {item.participants}/{item.maxParticipants} participants
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="payment" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{item.registrationFee}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Registration Progress</Text>
            <ProgressBar
              progress={item.participants / item.maxParticipants}
              color={COLORS.primary}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.tagsContainer}>
            {item.tags.map((tag, tagIndex) => (
              <Chip
                key={tagIndex}
                mode="outlined"
                compact
                style={styles.tag}
                textStyle={styles.tagText}
              >
                {tag}
              </Chip>
            ))}
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardActions}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('CompetitionDetails', { competition: item })}
              style={styles.actionButton}
              labelStyle={styles.actionButtonLabel}
            >
              View Details
            </Button>
            <Button
              mode="contained"
              onPress={() => registerForCompetition(item)}
              style={[
                styles.actionButton,
                registeredComps.has(item.id) && styles.registeredButton
              ]}
              labelStyle={styles.actionButtonLabel}
              disabled={registeredComps.has(item.id)}
            >
              {registeredComps.has(item.id) ? 'Registered ✓' : 'Register'}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderFilterChip = (items, selected, onSelect) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScrollView}
      contentContainerStyle={styles.filterScrollContent}
    >
      {items.map((item) => (
        <Chip
          key={item}
          mode={selected === item ? 'flat' : 'outlined'}
          selected={selected === item}
          onPress={() => onSelect(item)}
          style={[
            styles.filterChip,
            selected === item && styles.selectedFilterChip
          ]}
          textStyle={[
            styles.filterChipText,
            selected === item && styles.selectedFilterChipText
          ]}
        >
          {item}
        </Chip>
      ))}
    </ScrollView>
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
        <View style={styles.headerTop}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.headerTitle}>Competitions</Text>
            <Text style={styles.headerSubtitle}>Discover and join exciting competitions</Text>
          </View>
          <Avatar.Image
            size={40}
            source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
        </View>

        <Searchbar
          placeholder="Search competitions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />

        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon name="filter-list" size={20} color="white" />
          <Text style={styles.filterToggleText}>Filters</Text>
          <Icon
            name={showFilters ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={20}
            color="white"
          />
        </TouchableOpacity>

        {showFilters && (
          <Animated.View style={styles.filtersContainer}>
            <Text style={styles.filterSectionTitle}>Sport</Text>
            {renderFilterChip(sports, selectedSport, setSelectedSport)}
            
            <Text style={styles.filterSectionTitle}>Level</Text>
            {renderFilterChip(levels, selectedLevel, setSelectedLevel)}
            
            <Text style={styles.filterSectionTitle}>Location</Text>
            {renderFilterChip(locations, selectedLocation, setSelectedLocation)}
          </Animated.View>
        )}
      </LinearGradient>

      <View style={styles.statsContainer}>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{filteredCompetitions.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{registeredComps.size}</Text>
          <Text style={styles.statLabel}>Registered</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{favorites.size}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </Surface>
      </View>

      {filteredCompetitions.length > 0 ? (
        <FlatList
          data={filteredCompetitions}
          renderItem={renderCompetitionCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="jump-rope" size={80} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>No competitions found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Info', 'Feature coming soon! Coaches will be able to create competitions.')}
        color="white"
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  welcomeContainer: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  avatar: {
    borderWidth: 2,
    borderColor: 'white',
  },
  searchBar: {
    marginVertical: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 4,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    marginTop: SPACING.sm,
  },
  filterToggleText: {
    color: 'white',
    marginHorizontal: SPACING.sm,
    ...TEXT_STYLES.body,
  },
  filtersContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterSectionTitle: {
    color: 'white',
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  filterScrollView: {
    marginBottom: SPACING.sm,
  },
  filterScrollContent: {
    paddingRight: SPACING.lg,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedFilterChip: {
    backgroundColor: 'white',
  },
  filterChipText: {
    color: 'white',
  },
  selectedFilterChipText: {
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    backgroundColor: 'white',
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  listContainer: {
    padding: SPACING.lg,
  },
  cardContainer: {
    marginBottom: SPACING.lg,
  },
  competitionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  competitionInfo: {
    flex: 1,
  },
  competitionName: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  competitionSport: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  cardContent: {
    padding: SPACING.md,
  },
  competitionDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    color: COLORS.text.primary,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: 'transparent',
  },
  tagText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  actionButtonLabel: {
    ...TEXT_STYLES.button,
  },
  registeredButton: {
    backgroundColor: COLORS.success,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default Competitions;