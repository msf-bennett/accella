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
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants';

const AcademyRankings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, rankings, userLocation } = useSelector(state => ({
    user: state.auth.user,
    rankings: state.academies.rankings || [],
    userLocation: state.location.userLocation
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedMetric, setSelectedMetric] = useState('Overall');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const sports = ['All', 'Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics'];
  const metrics = ['Overall', 'Performance', 'Facilities', 'Coaching', 'Value', 'Student Satisfaction'];
  const locations = ['All', 'Within 5km', 'Within 10km', 'Within 25km', 'Any Distance'];

  // Sample rankings data - replace with actual data from Redux
  const rankingsData = [
    {
      id: '1',
      name: 'Elite Football Academy',
      logo: null,
      sport: 'Football',
      location: {
        city: 'Nairobi',
        district: 'Westlands',
        distance: 2.3
      },
      rankings: {
        overall: { rank: 1, score: 9.4, change: 0 },
        performance: { rank: 1, score: 9.6, change: 1 },
        facilities: { rank: 2, score: 9.2, change: 0 },
        coaching: { rank: 1, score: 9.5, change: 0 },
        value: { rank: 3, score: 8.8, change: -1 },
        studentSatisfaction: { rank: 1, score: 9.3, change: 1 }
      },
      stats: {
        totalStudents: 245,
        avgRating: 4.8,
        reviewCount: 156,
        establishedYear: 2010,
        successRate: 94,
        championships: 12
      },
      features: ['Professional Coaches', 'Modern Facilities', 'Youth Programs', 'Adult Training'],
      priceRange: '$200-500',
      isFollowing: true,
      trending: 'up'
    },
    {
      id: '2',
      name: 'Champions Basketball Camp',
      logo: null,
      sport: 'Basketball',
      location: {
        city: 'Nairobi',
        district: 'Karen',
        distance: 5.1
      },
      rankings: {
        overall: { rank: 2, score: 9.1, change: 1 },
        performance: { rank: 3, score: 9.0, change: -1 },
        facilities: { rank: 1, score: 9.8, change: 1 },
        coaching: { rank: 2, score: 9.2, change: 0 },
        value: { rank: 1, score: 9.4, change: 2 },
        studentSatisfaction: { rank: 2, score: 9.0, change: 0 }
      },
      stats: {
        totalStudents: 189,
        avgRating: 4.6,
        reviewCount: 98,
        establishedYear: 2015,
        successRate: 88,
        championships: 8
      },
      features: ['State-of-art Courts', 'Video Analysis', 'Strength Training', 'Tournament Play'],
      priceRange: '$300-600',
      isFollowing: false,
      trending: 'up'
    },
    {
      id: '3',
      name: 'Aquatic Sports Center',
      logo: null,
      sport: 'Swimming',
      location: {
        city: 'Nairobi',
        district: 'Kilimani',
        distance: 3.8
      },
      rankings: {
        overall: { rank: 3, score: 8.9, change: -1 },
        performance: { rank: 2, score: 9.1, change: 1 },
        facilities: { rank: 3, score: 8.9, change: 0 },
        coaching: { rank: 4, score: 8.7, change: -2 },
        value: { rank: 2, score: 9.0, change: 0 },
        studentSatisfaction: { rank: 3, score: 8.8, change: 0 }
      },
      stats: {
        totalStudents: 132,
        avgRating: 4.5,
        reviewCount: 67,
        establishedYear: 2012,
        successRate: 91,
        championships: 6
      },
      features: ['Olympic Pool', 'Safety First', 'All Levels', 'Competitive Teams'],
      priceRange: '$150-350',
      isFollowing: true,
      trending: 'stable'
    },
    {
      id: '4',
      name: 'Tennis Excellence Academy',
      logo: null,
      sport: 'Tennis',
      location: {
        city: 'Nairobi',
        district: 'Lavington',
        distance: 7.2
      },
      rankings: {
        overall: { rank: 4, score: 8.7, change: 1 },
        performance: { rank: 4, score: 8.8, change: 0 },
        facilities: { rank: 4, score: 8.6, change: 1 },
        coaching: { rank: 3, score: 8.9, change: 1 },
        value: { rank: 5, score: 8.2, change: -2 },
        studentSatisfaction: { rank: 4, score: 8.5, change: 0 }
      },
      stats: {
        totalStudents: 87,
        avgRating: 4.4,
        reviewCount: 43,
        establishedYear: 2018,
        successRate: 85,
        championships: 4
      },
      features: ['Professional Courts', 'Private Lessons', 'Group Classes', 'Junior Programs'],
      priceRange: '$250-450',
      isFollowing: false,
      trending: 'up'
    },
    {
      id: '5',
      name: 'Athletic Performance Hub',
      logo: null,
      sport: 'Athletics',
      location: {
        city: 'Nairobi',
        district: 'Kasarani',
        distance: 12.5
      },
      rankings: {
        overall: { rank: 5, score: 8.5, change: 0 },
        performance: { rank: 5, score: 8.6, change: 0 },
        facilities: { rank: 5, score: 8.4, change: 0 },
        coaching: { rank: 5, score: 8.5, change: 1 },
        value: { rank: 4, score: 8.6, change: 1 },
        studentSatisfaction: { rank: 5, score: 8.3, change: -1 }
      },
      stats: {
        totalStudents: 203,
        avgRating: 4.3,
        reviewCount: 89,
        establishedYear: 2008,
        successRate: 82,
        championships: 15
      },
      features: ['Track & Field', 'Strength Training', 'Nutrition Guidance', 'Recovery Programs'],
      priceRange: '$180-400',
      isFollowing: false,
      trending: 'stable'
    }
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadRankings();
  }, []);

  const loadRankings = useCallback(async () => {
    try {
      setLoading(true);
      // dispatch(loadAcademyRankingsAction());
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading rankings:', error);
      Alert.alert('Error', 'Failed to load academy rankings');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRankings();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadRankings]);

  const handleFollowAcademy = useCallback((academyId) => {
    Vibration.vibrate(30);
    // dispatch(toggleFollowAcademyAction(academyId));
    Alert.alert('Feature Coming Soon', 'Follow functionality will be available in the next update! 👥');
  }, []);

  const handleViewAcademy = useCallback((academy) => {
    setSelectedAcademy(academy);
    setModalVisible(true);
    Vibration.vibrate(30);
  }, []);

  const handleVisitAcademy = useCallback((academy) => {
    Vibration.vibrate(30);
    Alert.alert('Feature Coming Soon', 'Academy profile navigation will be available in the next update! 🏫');
  }, []);

  const getRankChangeIcon = (change) => {
    if (change > 0) return { icon: 'trending-up', color: COLORS.success };
    if (change < 0) return { icon: 'trending-down', color: COLORS.error };
    return { icon: 'trending-flat', color: COLORS.textSecondary };
  };

  const getTrendingIcon = (trending) => {
    switch (trending) {
      case 'up': return { icon: 'arrow-upward', color: COLORS.success };
      case 'down': return { icon: 'arrow-downward', color: COLORS.error };
      default: return { icon: 'remove', color: COLORS.textSecondary };
    }
  };

  const getRankColors = (rank) => {
    if (rank === 1) return ['#FFD700', '#FFA000'];
    if (rank === 2) return ['#C0C0C0', '#757575'];
    if (rank === 3) return ['#CD7F32', '#8D6E63'];
    return ['#667eea', '#764ba2'];
  };

  const filteredRankings = rankingsData.filter(academy => {
    const matchesSearch = academy.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'All' || academy.sport === selectedSport;
    const matchesLocation = selectedLocation === 'All' || 
      (selectedLocation === 'Within 5km' && academy.location.distance <= 5) ||
      (selectedLocation === 'Within 10km' && academy.location.distance <= 10) ||
      (selectedLocation === 'Within 25km' && academy.location.distance <= 25);
    return matchesSearch && matchesSport && matchesLocation;
  }).sort((a, b) => {
    const metricKey = selectedMetric.toLowerCase().replace(' ', '');
    return a.rankings[metricKey].rank - b.rankings[metricKey].rank;
  });

  const renderRankingCard = ({ item: academy, index }) => {
    const currentMetric = selectedMetric.toLowerCase().replace(' ', '');
    const rankData = academy.rankings[currentMetric];
    const changeIcon = getRankChangeIcon(rankData.change);
    const trendingIcon = getTrendingIcon(academy.trending);
    const rankColors = getRankColors(rankData.rank);

    return (
      <Animated.View
        style={[
          styles.cardContainer,
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
        <Card style={styles.rankingCard} elevation={3}>
          <TouchableOpacity onPress={() => handleViewAcademy(academy)}>
            <LinearGradient
              colors={rankColors}
              style={styles.cardHeader}
            >
              <View style={styles.rankBadge}>
                <Text style={styles.rankNumber}>#{rankData.rank}</Text>
                <Icon name={changeIcon.icon} size={16} color={changeIcon.color} />
              </View>
              <View style={styles.academyInfo}>
                <Avatar.Text
                  size={48}
                  label={academy.name.charAt(0)}
                  style={styles.academyAvatar}
                />
                <View style={styles.academyDetails}>
                  <Text style={styles.academyName}>{academy.name}</Text>
                  <View style={styles.locationInfo}>
                    <Icon name="location-on" size={14} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.locationText}>
                      {academy.location.district} • {academy.location.distance}km
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.headerActions}>
                <IconButton
                  icon={academy.isFollowing ? 'favorite' : 'favorite-border'}
                  size={20}
                  onPress={() => handleFollowAcademy(academy.id)}
                  iconColor="white"
                />
                <Icon {...trendingIcon} size={20} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <Card.Content style={styles.cardContent}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>{selectedMetric} Score</Text>
              <Text style={styles.scoreValue}>{rankData.score}/10</Text>
              <ProgressBar
                progress={rankData.score / 10}
                color={COLORS.primary}
                style={styles.scoreProgress}
              />
            </View>

            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Icon name="group" size={16} color={COLORS.primary} />
                <Text style={styles.statValue}>{academy.stats.totalStudents}</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.statValue}>{academy.stats.avgRating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="jump-rope" size={16} color="#FF6F00" />
                <Text style={styles.statValue}>{academy.stats.championships}</Text>
                <Text style={styles.statLabel}>Titles</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="trending-up" size={16} color={COLORS.success} />
                <Text style={styles.statValue}>{academy.stats.successRate}%</Text>
                <Text style={styles.statLabel}>Success</Text>
              </View>
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Key Features</Text>
              <View style={styles.featuresList}>
                {academy.features.slice(0, 2).map((feature, index) => (
                  <Chip
                    key={index}
                    style={styles.featureChip}
                    textStyle={styles.featureChipText}
                  >
                    {feature}
                  </Chip>
                ))}
                {academy.features.length > 2 && (
                  <Chip
                    style={styles.moreChip}
                    textStyle={styles.moreChipText}
                  >
                    +{academy.features.length - 2} more
                  </Chip>
                )}
              </View>
            </View>
          </Card.Content>

          <Card.Actions style={styles.cardActions}>
            <Button
              mode="outlined"
              onPress={() => handleViewAcademy(academy)}
              style={styles.detailsButton}
              labelStyle={styles.detailsButtonText}
            >
              View Rankings
            </Button>
            <Button
              mode="contained"
              onPress={() => handleVisitAcademy(academy)}
              style={styles.visitButton}
            >
              Visit Profile
            </Button>
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

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

  const renderTopThree = () => (
    <View style={styles.topThreeContainer}>
      <Text style={styles.sectionTitle}>🏆 Top Performers</Text>
      <View style={styles.podium}>
        {filteredRankings.slice(0, 3).map((academy, index) => {
          const currentMetric = selectedMetric.toLowerCase().replace(' ', '');
          const rankData = academy.rankings[currentMetric];
          const podiumColors = [
            ['#FFD700', '#FFA000'],
            ['#C0C0C0', '#757575'],
            ['#CD7F32', '#8D6E63']
          ];
          
          return (
            <TouchableOpacity
              key={academy.id}
              style={[styles.podiumItem, { order: index === 1 ? -1 : index }]}
              onPress={() => handleViewAcademy(academy)}
            >
              <LinearGradient
                colors={podiumColors[index]}
                style={styles.podiumCard}
              >
                <Text style={styles.podiumRank}>#{rankData.rank}</Text>
                <Avatar.Text
                  size={36}
                  label={academy.name.charAt(0)}
                  style={styles.podiumAvatar}
                />
                <Text style={styles.podiumName} numberOfLines={1}>
                  {academy.name}
                </Text>
                <Text style={styles.podiumScore}>{rankData.score}/10</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
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
        <Text style={styles.headerTitle}>Academy Rankings 📊</Text>
        <Text style={styles.headerSubtitle}>
          Discover the best training academies
        </Text>
      </LinearGradient>

      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Search academies..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={TEXT_STYLES.body}
        />
      </Surface>

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
        <View style={styles.filtersContainer}>
          {renderFilterChips(sports, selectedSport, setSelectedSport, 'Sport')}
          {renderFilterChips(metrics, selectedMetric, setSelectedMetric, 'Ranking By')}
          {renderFilterChips(locations, selectedLocation, setSelectedLocation, 'Distance')}
        </View>

        {filteredRankings.length > 0 ? (
          <>
            {renderTopThree()}
            
            <View style={styles.rankingsList}>
              <Text style={styles.sectionTitle}>Complete Rankings</Text>
              <FlatList
                data={filteredRankings}
                renderItem={renderRankingCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="leaderboard" size={64} color={COLORS.primary} />
            <Text style={styles.emptyStateTitle}>No Rankings Found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || selectedSport !== 'All' || selectedLocation !== 'All'
                ? 'Try adjusting your search or filters'
                : 'No academy rankings available at the moment'}
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                setSearchQuery('');
                setSelectedSport('All');
                setSelectedLocation('All');
              }}
              style={styles.resetButton}
            >
              Reset Filters
            </Button>
          </View>
        )}
      </ScrollView>

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
                  title={selectedAcademy?.name}
                  subtitle={`${selectedAcademy?.location.district} • ${selectedAcademy?.sport}`}
                  left={(props) => (
                    <Avatar.Text
                      {...props}
                      label={selectedAcademy?.name?.charAt(0)}
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
                  <View style={styles.rankingsGrid}>
                    <Text style={styles.modalSectionTitle}>All Rankings</Text>
                    {selectedAcademy && Object.entries(selectedAcademy.rankings).map(([key, value]) => {
                      const changeIcon = getRankChangeIcon(value.change);
                      return (
                        <View key={key} style={styles.rankingRow}>
                          <View style={styles.rankingInfo}>
                            <Text style={styles.rankingCategory}>
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                            </Text>
                            <View style={styles.rankingDetails}>
                              <Text style={styles.rankingRank}>#{value.rank}</Text>
                              <Icon name={changeIcon.icon} size={14} color={changeIcon.color} />
                            </View>
                          </View>
                          <View style={styles.scoreContainer}>
                            <Text style={styles.scoreText}>{value.score}/10</Text>
                            <ProgressBar
                              progress={value.score / 10}
                              color={COLORS.primary}
                              style={styles.miniProgress}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.statsSection}>
                    <Text style={styles.modalSectionTitle}>Academy Statistics</Text>
                    <View style={styles.statsGrid}>
                      <View style={styles.statCard}>
                        <Icon name="group" size={24} color={COLORS.primary} />
                        <Text style={styles.statNumber}>{selectedAcademy?.stats.totalStudents}</Text>
                        <Text style={styles.statDescription}>Total Students</Text>
                      </View>
                      <View style={styles.statCard}>
                        <Icon name="star" size={24} color="#FFD700" />
                        <Text style={styles.statNumber}>{selectedAcademy?.stats.avgRating}</Text>
                        <Text style={styles.statDescription}>Average Rating</Text>
                      </View>
                      <View style={styles.statCard}>
                        <Icon name="jump-rope" size={24} color="#FF6F00" />
                        <Text style={styles.statNumber}>{selectedAcademy?.stats.championships}</Text>
                        <Text style={styles.statDescription}>Championships</Text>
                      </View>
                      <View style={styles.statCard}>
                        <Icon name="trending-up" size={24} color={COLORS.success} />
                        <Text style={styles.statNumber}>{selectedAcademy?.stats.successRate}%</Text>
                        <Text style={styles.statDescription}>Success Rate</Text>
                      </View>
                    </View>
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.featuresSection}>
                    <Text style={styles.modalSectionTitle}>Features & Amenities</Text>
                    <View style={styles.fullFeaturesList}>
                      {selectedAcademy?.features.map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                          <Icon name="check-circle" size={16} color={COLORS.success} />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
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
                      handleVisitAcademy(selectedAcademy);
                    }}
                    style={styles.modalVisitButton}
                  >
                    Visit Academy
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
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
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
  content: {
    flex: 1,
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
  topThreeContainer: {
    padding: SPACING.md,
    backgroundColor: 'white',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  podiumItem: {
    width: '30%',
  },
  podiumCard: {
    padding: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  podiumRank: {
    ...TEXT_STYLES.h4,
    color: 'white',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  podiumAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: SPACING.xs,
  },
  podiumName: {
    ...TEXT_STYLES.caption,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  podiumScore: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  rankingsList: {
    backgroundColor: 'white',
    padding: SPACING.md,
  },
  listContainer: {
    paddingBottom: SPACING.lg,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  rankingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    alignItems: 'center',
    marginRight: SPACING.md,
    minWidth: 50,
  },
  rankNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: '700',
    marginBottom: SPACING.xs,
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
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '600',
    marginBottom: 2,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    padding: SPACING.md,
  },
  scoreContainer: {
    marginBottom: SPACING.md,
  },
  scoreLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  scoreValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  scoreProgress: {
    height: 8,
    borderRadius: 4,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TEXT_STYLES.body,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  featuresContainer: {
    marginBottom: SPACING.sm,
  },
  featuresTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureChip: {
    backgroundColor: '#E3F2FD',
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  featureChipText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  moreChip: {
    backgroundColor: '#F5F5F5',
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  moreChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  cardActions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    borderColor: COLORS.primary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  detailsButtonText: {
    color: COLORS.primary,
  },
  visitButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
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
  modalSectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  rankingsGrid: {
    marginBottom: SPACING.lg,
  },
  rankingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rankingInfo: {
    flex: 1,
  },
  rankingCategory: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: 2,
  },
  rankingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankingRank: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  scoreText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  miniProgress: {
    height: 4,
    width: 60,
    borderRadius: 2,
  },
  divider: {
    marginVertical: SPACING.lg,
  },
  statsSection: {
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: '700',
    marginVertical: SPACING.xs,
  },
  statDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: SPACING.lg,
  },
  fullFeaturesList: {
    // Features list styles
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    color: COLORS.text,
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
  modalVisitButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
});

export default AcademyRankings;