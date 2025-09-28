import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ImageBackground,
  Animated,
  Modal,
} from 'react-native';
import {FAB} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';

const { width, height } = Dimensions.get('window');

const ParentSearchHome = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [modalVisible, setModalVisible] = useState(false);
  
  const [recentSearches, setRecentSearches] = useState([
    'Football academies near me',
    'Swimming lessons for kids',
    'Basketball coaching',
    'Tennis lessons Nairobi',
  ]);

  const [searchSuggestions] = useState([
    'Football near me',
    'Swimming lessons',
    'Basketball coaching',
    'Tennis for kids',
    'Gymnastics classes',
    'Martial arts',
  ]);

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

  const sportsCategories = [
    { 
      id: 1, 
      name: 'Football', 
      icon: 'sports-soccer', 
      gradient: ['#4CAF50', '#45A049'],
      participants: '2.4k kids',
      academies: '15 academies'
    },
    { 
      id: 2, 
      name: 'Basketball', 
      icon: 'sports-basketball', 
      gradient: ['#FF9800', '#F57C00'],
      participants: '1.8k kids',
      academies: '12 academies'
    },
    { 
      id: 3, 
      name: 'Swimming', 
      icon: 'pool', 
      gradient: ['#2196F3', '#1976D2'],
      participants: '3.1k kids',
      academies: '8 centers'
    },
    { 
      id: 4, 
      name: 'Tennis', 
      icon: 'sports-tennis', 
      gradient: ['#9C27B0', '#7B1FA2'],
      participants: '950 kids',
      academies: '6 courts'
    },
    { 
      id: 5, 
      name: 'Gymnastics', 
      icon: 'fitness-center', 
      gradient: ['#E91E63', '#C2185B'],
      participants: '1.2k kids',
      academies: '9 studios'
    },
    { 
      id: 6, 
      name: 'Athletics', 
      icon: 'directions-run', 
      gradient: ['#FF5722', '#E64A19'],
      participants: '2.8k kids',
      academies: '11 tracks'
    },
  ];

  const featuredAcademies = [
    {
      id: 1,
      name: 'Champions Sports Academy',
      rating: 4.8,
      reviews: 234,
      distance: '2.3 km',
      sports: ['Football', 'Basketball'],
      image: '🏆',
      priceRange: 'KES 3,000-5,000',
      nextAvailable: 'Tomorrow 2PM',
      badge: 'Top Rated',
      badgeColor: '#FFD700'
    },
    {
      id: 2,
      name: 'Aquatic Center Nairobi',
      rating: 4.6,
      reviews: 189,
      distance: '3.1 km',
      sports: ['Swimming', 'Water Polo'],
      image: '🏊',
      priceRange: 'KES 2,500-4,000',
      nextAvailable: 'Today 4PM',
      badge: 'New',
      badgeColor: '#4CAF50'
    },
    {
      id: 3,
      name: 'Elite Tennis Club',
      rating: 4.9,
      reviews: 156,
      distance: '1.8 km',
      sports: ['Tennis', 'Badminton'],
      image: '🎾',
      priceRange: 'KES 4,000-6,000',
      nextAvailable: 'Tomorrow 9AM',
      badge: 'Premium',
      badgeColor: '#9C27B0'
    },
  ];

  const quickStats = [
    { icon: 'school', value: '50+', label: 'Academies' },
    { icon: 'person', value: '200+', label: 'Coaches' },
    { icon: 'star', value: '4.8', label: 'Avg Rating' },
    { icon: 'group', value: '5K+', label: 'Happy Kids' },
  ];

  const handleSearch = (query) => {
    if (query.trim()) {
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 3)]);
      }
      navigation.navigate('SearchAcademies', { searchQuery: query });
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const handleMenuAction = (action) => {
    setModalVisible(false);
    switch(action) {
      case 'quickSearch':
        // Handle quick search
        break;
      case 'refresh':
        // Handle refresh
        break;
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'help':
        navigation.navigate('Support');
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { id: 'quickSearch', title: 'Quick Search', icon: 'search' },
    { id: 'refresh', title: 'Refresh', icon: 'refresh' },
    { id: 'settings', title: 'Settings', icon: 'settings' },
    { id: 'help', title: 'Help & Support', icon: 'help' },
  ];

  const renderQuickStat = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.statIcon}>
        <Icon name={item.icon} size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </Animated.View>
  );

  const renderSportsCategory = ({ item, index }) => (
    <Animated.View
      style={[
        styles.categoryCard,
        {
          opacity: fadeAnim,
          transform: [{ 
            translateY: slideAnim,
            scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1]
            })
          }]
        }
      ]}
    >
      <TouchableOpacity
        style={[styles.categoryContent]}
        onPress={() => navigation.navigate('SearchAcademies', { sport: item.name })}
        activeOpacity={0.8}
      >
        <View style={[styles.categoryIconContainer, { backgroundColor: item.gradient[0] + '20' }]}>
          <Icon name={item.icon} size={28} color={item.gradient[0]} />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryStats}>{item.participants}</Text>
        <Text style={styles.categoryAcademies}>{item.academies}</Text>
        <View style={styles.categoryArrow}>
          <Icon name="arrow-forward-ios" size={12} color={item.gradient[0]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFeaturedAcademy = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.academyCard}
      onPress={() => navigation.navigate('AcademyDetails', { academyId: item.id })}
      activeOpacity={0.9}
    >
      <View style={styles.academyBadge}>
        <Text style={[styles.badgeText, { color: item.badgeColor }]}>{item.badge}</Text>
      </View>
      
      <View style={styles.academyHeader}>
        <View style={styles.academyImageContainer}>
          <Text style={styles.academyEmoji}>{item.image}</Text>
        </View>
        <View style={styles.academyInfo}>
          <Text style={styles.academyName} numberOfLines={1}>{item.name}</Text>
          
          <View style={styles.academyRatingContainer}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon 
                  key={star}
                  name="star" 
                  size={12} 
                  color={star <= Math.floor(item.rating) ? "#FFD700" : "#E0E0E0"} 
                />
              ))}
            </View>
            <Text style={styles.academyRating}>{item.rating}</Text>
            <Text style={styles.academyReviews}>({item.reviews})</Text>
          </View>
          
          <View style={styles.academyDetails}>
            <Icon name="location-on" size={12} color={COLORS.gray} />
            <Text style={styles.academyDistance}>{item.distance}</Text>
            <Text style={styles.academyPrice}>• {item.priceRange}</Text>
          </View>
          
          <Text style={styles.academySports}>{item.sports.join(' • ')}</Text>
          
          <View style={styles.availabilityContainer}>
            <Icon name="schedule" size={12} color="#4CAF50" />
            <Text style={styles.availabilityText}>{item.nextAvailable}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header with Blue Background */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Find & Book</Text>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="dots-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuAction(item.id)}
              >
                <Icon name={item.icon} size={20} color={COLORS.primary} />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Subtitle below header */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.headerSubtitle}>
            Discover amazing sports experiences for your child
          </Text>
        </View>

        {/* Quick Stats */}
        <Animated.View 
          style={[
            styles.statsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <FlatList
            data={quickStats}
            renderItem={renderQuickStat}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          />
        </Animated.View>

        {/* Enhanced Search Bar */}
        <Animated.View 
          style={[
            styles.searchContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.searchBar}>
            <Icon name="search" size={22} color={COLORS.primary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search academies, coaches, sports..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch(searchQuery)}
              placeholderTextColor={COLORS.gray}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Icon name="clear" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.filterButton}>
                <Icon name="tune" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity style={styles.voiceButton}>
            <View style={styles.voiceButtonInner}>
              <Icon name="mic" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Enhanced Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => navigation.navigate('SearchAcademies')}
          >
            <View style={styles.actionIconContainer}>
              <Icon name="school" size={24} color="#fff" />
            </View>
            <Text style={styles.primaryActionText}>Academies</Text>
            <Text style={styles.actionSubtext}>50+ options</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={styles.secondaryAction}
              onPress={() => navigation.navigate('SavedCoachesTrainers')}
            >
              <Icon name="person" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryActionText}>My Coaches</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryAction}
              onPress={() => navigation.navigate('SearchCoaches')}
            >
              <Icon name="person" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryActionText}>Search Coaches</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryAction}
              onPress={() => navigation.navigate('SearchTrainers')}
            >
              <Icon name="person" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryActionText}>Search Trainers</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryAction}
              onPress={() => navigation.navigate('BookTrial')}
            >
              <Icon name="event" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryActionText}>Book Trial</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryAction}
              onPress={() => navigation.navigate('NearbyAcademies')}
            >
              <Icon name="near-me" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryActionText}>Nearby</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Suggestions */}
        {(recentSearches.length > 0 || searchSuggestions.length > 0) && (
          <View style={styles.suggestionsSection}>
            {recentSearches.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecentSearches} style={styles.clearButton}>
                    <Text style={styles.clearText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipsContainer}>
                    {recentSearches.map((search, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.searchChip}
                        onPress={() => handleSearch(search)}
                      >
                        <Icon name="history" size={16} color={COLORS.primary} />
                        <Text style={styles.chipText} numberOfLines={1}>{search}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
              <Icon name="trending-up" size={18} color="#4CAF50" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipsContainer}>
                {searchSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.searchChip, styles.trendingChip]}
                    onPress={() => handleSearch(suggestion)}
                  >
                    <Icon name="whatshot" size={16} color="#FF5722" />
                    <Text style={[styles.chipText, styles.trendingText]}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Enhanced Sports Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Sports</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={sportsCategories}
            renderItem={renderSportsCategory}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.categoryRow}
            ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
          />
        </View>

        {/* Enhanced Featured Academies */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Top Rated Near You</Text>
              <Text style={styles.sectionSubtitle}>Based on reviews and distance</Text>
            </View>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('SearchAcademies')}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Icon name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredAcademies}
            renderItem={renderFeaturedAcademy}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.academiesList}
            snapToInterval={width * 0.85}
            decelerationRate="fast"
          />
        </View>


        <View style={styles.bottomSpacing} />
      </ScrollView>
          <FAB
                  icon="map"
                        style={styles.fab}
                        color="white"
                        onPress={() => navigation.navigate('CompareAcademies')}
                      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
    fontWeight: '400',
  },
  statsSection: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statsContainer: {
    paddingVertical: 10,
  },
  statCard: {
    alignItems: 'center',
    marginRight: 30,
    paddingVertical: 8,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 56,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e8ecf0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    padding: 4,
  },
  voiceButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonInner: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryActionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  secondaryActions: {
    flex: 1,
  },
  secondaryAction: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8ecf0',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  suggestionsSection: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#fff',
    paddingVertical: 25,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  clearText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  searchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e8ecf0',
    maxWidth: width * 0.7,
  },
  trendingChip: {
    backgroundColor: '#fff5f2',
    borderColor: '#FFE0D6',
  },
  chipText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 8,
    fontWeight: '500',
  },
  trendingText: {
    color: '#FF5722',
  },
  categoryRow: {
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 50) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8ecf0',
    overflow: 'hidden',
  },
  categoryContent: {
    padding: 20,
    alignItems: 'flex-start',
    position: 'relative',
    minHeight: 140,
  },
  categoryIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  categoryStats: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryAcademies: {
    fontSize: 12,
    color: '#888',
  },
  categoryArrow: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  academiesList: {
    paddingHorizontal: 20,
  },
  academyCard: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#e8ecf0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  academyBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e8ecf0',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  academyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  academyImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  academyEmoji: {
    fontSize: 32,
  },
  academyInfo: {
    flex: 1,
  },
  academyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  academyRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  academyRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 4,
  },
  academyReviews: {
    fontSize: 12,
    color: '#888',
  },
  academyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  academyDistance: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  academyPrice: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  academySports: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  availabilityText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default ParentSearchHome;