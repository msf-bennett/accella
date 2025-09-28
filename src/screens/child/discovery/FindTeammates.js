import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  TouchableOpacity,
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
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const FindTeammates = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { teammates, loading } = useSelector(state => state.discovery);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    sport: user?.primarySport || 'all',
    ageGroup: 'all',
    skillLevel: 'all',
    location: 'nearby',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState(null);

  // Mock data for teammates
  const [teammatesData] = useState([
    {
      id: '1',
      name: 'Alex Johnson',
      age: 14,
      sport: 'Football',
      skillLevel: 'Intermediate',
      position: 'Midfielder',
      location: 'New York, NY',
      distance: '2.3 km',
      avatar: 'https://images.unsplash.com/photo-1568822617270-2c1579f8dfe2?w=150',
      rating: 4.5,
      achievements: ['Top Scorer', 'Team Captain'],
      isOnline: true,
      mutualCoaches: 2,
    },
    {
      id: '2',
      name: 'Emma Davis',
      age: 13,
      sport: 'Basketball',
      skillLevel: 'Beginner',
      position: 'Point Guard',
      location: 'Brooklyn, NY',
      distance: '5.1 km',
      avatar: 'https://images.unsplash.com/photo-1574015974293-817f0ebebb74?w=150',
      rating: 4.2,
      achievements: ['Most Improved'],
      isOnline: false,
      mutualCoaches: 1,
    },
    {
      id: '3',
      name: 'Marcus Wilson',
      age: 15,
      sport: 'Tennis',
      skillLevel: 'Advanced',
      position: 'Singles',
      location: 'Manhattan, NY',
      distance: '8.7 km',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      rating: 4.8,
      achievements: ['Regional Champion', 'Ace Master'],
      isOnline: true,
      mutualCoaches: 0,
    },
    {
      id: '4',
      name: 'Sophie Martinez',
      age: 14,
      sport: 'Football',
      skillLevel: 'Intermediate',
      position: 'Forward',
      location: 'Queens, NY',
      distance: '12.4 km',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      rating: 4.6,
      achievements: ['Hat Trick Hero', 'Fair Play Award'],
      isOnline: true,
      mutualCoaches: 3,
    },
  ]);

  const sports = ['All Sports', 'Football', 'Basketball', 'Tennis', 'Baseball', 'Swimming', 'Track & Field'];
  const ageGroups = ['All Ages', '12-13', '14-15', '16-17', '18+'];
  const skillLevels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const locationOptions = ['Nearby', '5 km', '10 km', '25 km', 'Same City', 'Any Distance'];

  // Entrance animation
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
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    // Implement search logic here
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleConnectRequest = (teammateId) => {
    Alert.alert(
      'Connection Request',
      'Send a connection request to this teammate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: () => {
            // Implement connection request logic
            Alert.alert('Success', 'Connection request sent! 🚀');
          }
        }
      ]
    );
  };

  const handleMessageTeammate = (teammate) => {
    Alert.alert(
      'Feature Development',
      'Direct messaging feature is coming soon! 💬',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleViewProfile = (teammate) => {
    Alert.alert(
      'Feature Development',
      'Detailed profile view is coming soon! 👤',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.primary;
      case 'Expert': return COLORS.error;
      default: return COLORS.text;
    }
  };

  const renderTeammateCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <Card style={styles.teammateCard} elevation={3}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.teammateHeader}>
            <View style={styles.avatarContainer}>
              <Avatar.Image 
                size={60} 
                source={{ uri: item.avatar }}
                style={styles.avatar}
              />
              {item.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            
            <View style={styles.teammateInfo}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
                {item.name}
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                {item.age} years • {item.sport}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                📍 {item.distance} away
              </Text>
            </View>

            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color={COLORS.warning} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                {item.rating}
              </Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <Chip
              mode="outlined"
              style={[styles.chip, { borderColor: getSkillLevelColor(item.skillLevel) }]}
              textStyle={{ color: getSkillLevelColor(item.skillLevel), fontSize: 12 }}
            >
              {item.skillLevel}
            </Chip>
            <Chip
              mode="outlined"
              style={styles.chip}
              textStyle={{ fontSize: 12 }}
            >
              {item.position}
            </Chip>
            {item.mutualCoaches > 0 && (
              <Chip
                mode="outlined"
                style={[styles.chip, { borderColor: COLORS.primary }]}
                textStyle={{ color: COLORS.primary, fontSize: 12 }}
              >
                {item.mutualCoaches} Mutual Coach{item.mutualCoaches > 1 ? 'es' : ''}
              </Chip>
            )}
          </View>

          {item.achievements.length > 0 && (
            <View style={styles.achievementsContainer}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: 4 }]}>
                🏆 Recent Achievements
              </Text>
              <View style={styles.achievementsList}>
                {item.achievements.map((achievement, idx) => (
                  <Chip
                    key={idx}
                    mode="flat"
                    style={styles.achievementChip}
                    textStyle={{ fontSize: 11 }}
                  >
                    {achievement}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          <View style={styles.actionContainer}>
            <Button
              mode="contained"
              onPress={() => handleConnectRequest(item.id)}
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              contentStyle={styles.buttonContent}
              labelStyle={{ fontSize: 14 }}
            >
              Connect
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleMessageTeammate(item)}
              style={[styles.actionButton, styles.outlinedButton]}
              contentStyle={styles.buttonContent}
              labelStyle={{ fontSize: 14, color: COLORS.primary }}
            >
              Message
            </Button>
            <IconButton
              icon="account"
              size={20}
              onPress={() => handleViewProfile(item)}
              style={styles.profileButton}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>Filters</Text>
            <IconButton
              icon="close"
              onPress={() => setShowFilterModal(false)}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <Text style={[TEXT_STYLES.h3, styles.filterTitle]}>Sport</Text>
              <View style={styles.filterChips}>
                {sports.map((sport, index) => (
                  <Chip
                    key={index}
                    selected={filters.sport === sport.toLowerCase().replace(' ', '')}
                    onPress={() => handleFilterChange('sport', sport.toLowerCase().replace(' ', ''))}
                    style={styles.filterChip}
                  >
                    {sport}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[TEXT_STYLES.h3, styles.filterTitle]}>Age Group</Text>
              <View style={styles.filterChips}>
                {ageGroups.map((age, index) => (
                  <Chip
                    key={index}
                    selected={filters.ageGroup === age.toLowerCase().replace(' ', '')}
                    onPress={() => handleFilterChange('ageGroup', age.toLowerCase().replace(' ', ''))}
                    style={styles.filterChip}
                  >
                    {age}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[TEXT_STYLES.h3, styles.filterTitle]}>Skill Level</Text>
              <View style={styles.filterChips}>
                {skillLevels.map((level, index) => (
                  <Chip
                    key={index}
                    selected={filters.skillLevel === level.toLowerCase()}
                    onPress={() => handleFilterChange('skillLevel', level.toLowerCase())}
                    style={styles.filterChip}
                  >
                    {level}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[TEXT_STYLES.h3, styles.filterTitle]}>Location</Text>
              <View style={styles.filterChips}>
                {locationOptions.map((location, index) => (
                  <Chip
                    key={index}
                    selected={filters.location === location.toLowerCase().replace(' ', '')}
                    onPress={() => handleFilterChange('location', location.toLowerCase().replace(' ', ''))}
                    style={styles.filterChip}
                  >
                    {location}
                  </Chip>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setFilters({
                  sport: 'all',
                  ageGroup: 'all',
                  skillLevel: 'all',
                  location: 'nearby',
                });
              }}
              style={styles.clearButton}
            >
              Clear All
            </Button>
            <Button
              mode="contained"
              onPress={() => setShowFilterModal(false)}
              style={styles.applyButton}
            >
              Apply Filters
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>Find Teammates 🤝</Text>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Connect with players who share your passion!
        </Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search teammates..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
          inputStyle={TEXT_STYLES.body}
        />
        <IconButton
          icon="filter-variant"
          size={24}
          onPress={() => setShowFilterModal(true)}
          style={styles.filterButton}
          iconColor={COLORS.primary}
        />
      </View>

      <View style={styles.statsContainer}>
        <Surface style={styles.statCard}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>24</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
            Nearby Players
          </Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>8</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
            Same Sport
          </Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>12</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
            Your Age
          </Text>
        </Surface>
      </View>

      <FlatList
        data={teammatesData}
        renderItem={renderTeammateCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.background}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
              No teammates found
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
              Try adjusting your search filters or expand your location radius
            </Text>
          </View>
        )}
      />

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl + 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    elevation: 2,
    backgroundColor: 'white',
  },
  filterButton: {
    marginLeft: SPACING.sm,
    backgroundColor: 'white',
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  teammateCard: {
    borderRadius: 16,
    backgroundColor: 'white',
    marginBottom: SPACING.sm,
  },
  cardContent: {
    padding: SPACING.md,
  },
  teammateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    marginRight: SPACING.md,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: SPACING.md + 2,
    width: 14,
    height: 14,
    backgroundColor: COLORS.success,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'white',
  },
  teammateInfo: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  chip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    height: 28,
  },
  achievementsContainer: {
    marginBottom: SPACING.md,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    height: 26,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: SPACING.sm,
    borderRadius: 20,
  },
  outlinedButton: {
    borderColor: COLORS.primary,
  },
  buttonContent: {
    paddingHorizontal: SPACING.sm,
  },
  profileButton: {
    marginLeft: 'auto',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  filterModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSection: {
    padding: SPACING.md,
  },
  filterTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clearButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  applyButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
});

export default FindTeammates;