import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ParentSearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const searchCategories = [
    { id: 'coaches', name: 'Coaches', icon: 'person-outline', color: '#007AFF' },
    { id: 'academies', name: 'Academies', icon: 'school-outline', color: '#34C759' },
    { id: 'sessions', name: 'Sessions', icon: 'time-outline', color: '#FF9500' },
    { id: 'events', name: 'Events', icon: 'calendar-outline', color: '#8E44AD' },
    { id: 'sports', name: 'Sports', icon: 'football-outline', color: '#FF3B30' },
    { id: 'activities', name: 'Activities', icon: 'fitness-outline', color: '#17A2B8' },
    { id: 'schedules', name: 'Schedules', icon: 'today-outline', color: '#FFC107' },
    { id: 'feedback', name: 'Feedback', icon: 'chatbubble-outline', color: '#6F42C1' },
  ];

  const mockSearchData = {
    coaches: [
      { id: 'c1', name: 'John Kimani', specialization: 'Football Coach', rating: 4.8, location: 'Nairobi', type: 'coach' },
      { id: 'c2', name: 'Mary Ochieng', specialization: 'Swimming Instructor', rating: 4.9, location: 'Nairobi', type: 'coach' },
      { id: 'c3', name: 'Peter Mbugua', specialization: 'Fitness Trainer', rating: 4.7, location: 'Kiambu', type: 'coach' },
    ],
    academies: [
      { id: 'a1', name: 'Elite Sports Academy', sports: ['Football', 'Basketball'], location: 'Westlands', rating: 4.6, type: 'academy' },
      { id: 'a2', name: 'Aquatic Excellence Center', sports: ['Swimming', 'Water Polo'], location: 'Karen', rating: 4.8, type: 'academy' },
      { id: 'a3', name: 'Champions Training Ground', sports: ['Athletics', 'Football'], location: 'Kasarani', rating: 4.5, type: 'academy' },
    ],
    sessions: [
      { id: 's1', name: 'Football Training - Alex', date: '2025-08-13', time: '16:00', coach: 'John Kimani', type: 'session' },
      { id: 's2', name: 'Swimming Practice - Sarah', date: '2025-08-14', time: '07:00', coach: 'Mary Ochieng', type: 'session' },
      { id: 's3', name: 'Fitness Assessment - Alex', date: '2025-08-15', time: '15:00', coach: 'Peter Mbugua', type: 'session' },
    ],
    events: [
      { id: 'e1', name: 'Regional Championship', date: '2025-08-20', location: 'Nairobi Sports Complex', type: 'event' },
      { id: 'e2', name: 'Swimming Gala', date: '2025-08-25', location: 'Aquatic Center', type: 'event' },
    ],
    sports: [
      { id: 'sp1', name: 'Football', participants: 12, academies: 8, type: 'sport' },
      { id: 'sp2', name: 'Swimming', participants: 6, academies: 4, type: 'sport' },
      { id: 'sp3', name: 'Basketball', participants: 8, academies: 5, type: 'sport' },
    ],
    activities: [
      { id: 'ac1', name: 'Recent Training Sessions', count: 24, type: 'activity' },
      { id: 'ac2', name: 'Upcoming Events', count: 3, type: 'activity' },
      { id: 'ac3', name: 'Performance Reports', count: 8, type: 'activity' },
    ],
    schedules: [
      { id: 'sc1', name: 'Alex - Weekly Schedule', sessions: 4, type: 'schedule' },
      { id: 'sc2', name: 'Sarah - Monthly Plan', sessions: 12, type: 'schedule' },
    ],
    feedback: [
      { id: 'f1', name: 'Coach Feedback - Alex', date: '2025-08-10', unread: true, type: 'feedback' },
      { id: 'f2', name: 'Session Notes - Sarah', date: '2025-08-09', unread: false, type: 'feedback' },
    ],
  };

  useEffect(() => {
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedCategories]);

  const loadRecentSearches = async () => {
    try {
      // Load from local storage or API
      const recent = [
        'John Kimani',
        'Swimming lessons',
        'Football training',
        'Elite Sports Academy',
        'Fitness assessment'
      ];
      setRecentSearches(recent);
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      // Simulate API search delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let results = [];
      const query = searchQuery.toLowerCase();

      // Search across all categories if none selected, or only selected categories
      const categoriesToSearch = selectedCategories.length > 0 
        ? selectedCategories 
        : Object.keys(mockSearchData);

      categoriesToSearch.forEach(category => {
        const categoryData = mockSearchData[category] || [];
        const filteredItems = categoryData.filter(item => {
          const searchFields = [
            item.name,
            item.specialization,
            item.sports?.join(' '),
            item.location,
            item.coach,
            item.description
          ].filter(Boolean).join(' ').toLowerCase();
          
          return searchFields.includes(query);
        });
        
        results = [...results, ...filteredItems];
      });

      // Add search query to recent searches
      if (!recentSearches.includes(searchQuery)) {
        const updatedRecent = [searchQuery, ...recentSearches.slice(0, 4)];
        setRecentSearches(updatedRecent);
      }

      setSearchResults(results);
    } catch (error) {
      Alert.alert('Error', 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToResult = (item) => {
    switch (item.type) {
      case 'coach':
        navigation.navigate('CoachChat', { coachId: item.id });
        break;
      case 'academy':
        navigation.navigate('SearchAcademies', { academyId: item.id });
        break;
      case 'session':
        navigation.navigate('SessionDetails', { sessionId: item.id });
        break;
      case 'event':
        navigation.navigate('EventDetails', { eventId: item.id });
        break;
      case 'schedule':
        navigation.navigate('Schedule', { scheduleId: item.id });
        break;
      case 'feedback':
        navigation.navigate('FeedbackScreen', { feedbackId: item.id });
        break;
      case 'sport':
        navigation.navigate('SearchAcademies', { sport: item.name });
        break;
      case 'activity':
        navigation.navigate('AllActivities', { filter: item.name });
        break;
      default:
        Alert.alert('Info', `Opening ${item.name}`);
    }
  };

  const toggleCategoryFilter = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setShowFilters(false);
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'coach': return 'person-outline';
      case 'academy': return 'school-outline';
      case 'session': return 'time-outline';
      case 'event': return 'calendar-outline';
      case 'sport': return 'football-outline';
      case 'activity': return 'fitness-outline';
      case 'schedule': return 'today-outline';
      case 'feedback': return 'chatbubble-outline';
      default: return 'search-outline';
    }
  };

  const getResultColor = (type) => {
    const category = searchCategories.find(cat => cat.id === type + 's') || 
                    searchCategories.find(cat => cat.id === type);
    return category?.color || '#666';
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => navigateToResult(item)}
    >
      <View style={[styles.resultIcon, { backgroundColor: getResultColor(item.type) + '20' }]}>
        <Ionicons name={getResultIcon(item.type)} size={20} color={getResultColor(item.type)} />
      </View>
      
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{item.name}</Text>
        {item.specialization && (
          <Text style={styles.resultSubtitle}>{item.specialization}</Text>
        )}
        {item.location && (
          <Text style={styles.resultLocation}>📍 {item.location}</Text>
        )}
        {item.coach && (
          <Text style={styles.resultCoach}>👨‍🏫 {item.coach}</Text>
        )}
        {item.sports && (
          <Text style={styles.resultSports}>🏃‍♂️ {item.sports.join(', ')}</Text>
        )}
        {item.date && (
          <Text style={styles.resultDate}>📅 {item.date} {item.time && `• ${item.time}`}</Text>
        )}
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.resultType}>
        <Text style={[styles.typeText, { color: getResultColor(item.type) }]}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={16} color="#666" />
    </TouchableOpacity>
  );

  const renderRecentSearch = (search, index) => (
    <TouchableOpacity 
      key={index}
      style={styles.recentSearchItem}
      onPress={() => setSearchQuery(search)}
    >
      <Ionicons name="time-outline" size={16} color="#666" />
      <Text style={styles.recentSearchText}>{search}</Text>
      <TouchableOpacity 
        onPress={() => {
          const updated = recentSearches.filter((_, i) => i !== index);
          setRecentSearches(updated);
        }}
      >
        <Ionicons name="close" size={16} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCategoryChip = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryChip,
        selectedCategories.includes(category.id) && styles.selectedCategoryChip,
        { borderColor: category.color }
      ]}
      onPress={() => toggleCategoryFilter(category.id)}
    >
      <Ionicons 
        name={category.icon} 
        size={16} 
        color={selectedCategories.includes(category.id) ? 'white' : category.color} 
      />
      <Text style={[
        styles.categoryText,
        selectedCategories.includes(category.id) && styles.selectedCategoryText,
        { color: selectedCategories.includes(category.id) ? 'white' : category.color }
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={24} color="#007AFF" />
          {selectedCategories.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{selectedCategories.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search anything in the app..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Access Categories */}
      {searchQuery.length === 0 && (
        <View style={styles.quickAccessContainer}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.categoriesGrid}>
            {searchCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { borderLeftColor: category.color }]}
                onPress={() => {
                  setSelectedCategories([category.id]);
                  setSearchQuery(category.name.toLowerCase());
                }}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                  <Ionicons name={category.icon} size={24} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Recent Searches */}
      {searchQuery.length === 0 && recentSearches.length > 0 && (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={() => setRecentSearches([])}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          {recentSearches.map((search, index) => renderRecentSearch(search, index))}
        </View>
      )}

      {/* Search Results */}
      {searchQuery.length > 0 && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {loading ? 'Searching...' : `${searchResults.length} Results`}
            </Text>
            {selectedCategories.length > 0 && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
              ListEmptyComponent={
                <View style={styles.emptyResults}>
                  <Ionicons name="search-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyTitle}>No results found</Text>
                  <Text style={styles.emptyDescription}>
                    Try different keywords or check your spelling
                  </Text>
                </View>
              }
            />
          )}
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterSectionTitle}>Search Categories</Text>
            <View style={styles.filterChipsContainer}>
              {searchCategories.map(renderCategoryChip)}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  filterButton: {
    padding: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#1a1a1a',
  },
  quickAccessContainer: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginLeft: 16,
  },
  recentContainer: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentSearchText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 12,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  resultLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  resultCoach: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  resultSports: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  resultDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  resultType: {
    marginRight: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'white',
    gap: 6,
  },
  selectedCategoryChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ParentSearchScreen;