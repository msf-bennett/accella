import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  SafeAreaView,
  Image
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const NewScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const { user } = useSelector(state => state.auth);
  
  const userType = user?.userType || 'player';

  // Quick Action Items based on user type
  const getQuickActions = () => {
    const commonActions = [
      {
        id: 'search-coaches',
        title: 'Find Coaches',
        subtitle: 'Discover certified trainers',
        icon: 'person-add',
        color: '#007bff',
        action: () => navigation.navigate('SearchCoaches')
      },
      {
        id: 'search-academies',
        title: 'Sports Academies',
        subtitle: 'Find training centers nearby',
        icon: 'business',
        color: '#28a745',
        action: () => navigation.navigate('SearchAcademies')
      },
      {
        id: 'join-session',
        title: 'Join Session',
        subtitle: 'Find open training sessions',
        icon: 'people',
        color: '#fd7e14',
        action: () => navigation.navigate('OpenSessions')
      }
    ];

    const coachActions = [
      {
        id: 'create-session',
        title: 'New Session',
        subtitle: 'Create training session',
        icon: 'add-circle',
        color: '#007bff',
        action: () => navigation.navigate('CreateSession')
      },
      {
        id: 'create-plan',
        title: 'Training Plan',
        subtitle: 'Design workout program',
        icon: 'calendar',
        color: '#6f42c1',
        action: () => navigation.navigate('CreateTrainingPlan')
      },
      {
        id: 'invite-players',
        title: 'Invite Players',
        subtitle: 'Add new team members',
        icon: 'person-add',
        color: '#20c997',
        action: () => navigation.navigate('InvitePlayers')
      }
    ];

    const playerActions = [
      {
        id: 'book-session',
        title: 'Book Session',
        subtitle: 'Schedule with a trainer',
        icon: 'time',
        color: '#17a2b8',
        action: () => navigation.navigate('BookSession')
      },
      {
        id: 'track-progress',
        title: 'Log Workout',
        subtitle: 'Record your training',
        icon: 'fitness',
        color: '#dc3545',
        action: () => navigation.navigate('LogWorkout')
      }
    ];

    return userType === 'coach' || userType === 'trainer' 
      ? [...coachActions, ...commonActions]
      : [...playerActions, ...commonActions];
  };

  // Suggested Items
  const suggestions = [
    {
      id: 'popular-coaches',
      title: 'Top Rated Coaches',
      items: [
        { name: 'Coach Sarah Miller', specialty: 'Football', rating: 4.9, location: 'Nairobi' },
        { name: 'Coach John Doe', specialty: 'Basketball', rating: 4.8, location: 'Westlands' },
        { name: 'Coach Maria Santos', specialty: 'Tennis', rating: 4.7, location: 'Karen' }
      ]
    },
    {
      id: 'nearby-academies',
      title: 'Nearby Academies',
      items: [
        { name: 'Elite Sports Academy', sports: ['Football', 'Rugby'], distance: '2.5 km' },
        { name: 'Champions Training Center', sports: ['Basketball', 'Volleyball'], distance: '3.8 km' },
        { name: 'Future Stars Academy', sports: ['Swimming', 'Athletics'], distance: '5.2 km' }
      ]
    },
    {
      id: 'trending-programs',
      title: 'Trending Programs',
      items: [
        { name: '12-Week Strength Building', participants: 156, category: 'Fitness' },
        { name: 'Youth Football Development', participants: 89, category: 'Football' },
        { name: 'Basketball Skills Masterclass', participants: 72, category: 'Basketball' }
      ]
    }
  ];

  const filters = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'coaches', label: 'Coaches', icon: 'person' },
    { key: 'academies', label: 'Academies', icon: 'business' },
    { key: 'sessions', label: 'Sessions', icon: 'calendar' }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search', 'Please enter something to search for');
      return;
    }
    
    navigation.navigate('SearchResults', { 
      query: searchQuery, 
      filter: activeFilter 
    });
  };

  const renderQuickAction = (action) => (
    <TouchableOpacity
      key={action.id}
      style={[styles.actionCard, { borderLeftColor: action.color }]}
      onPress={action.action}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
        <Icon name={action.icon} size={24} color={action.color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{action.title}</Text>
        <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderSuggestionSection = (section) => (
    <View key={section.id} style={styles.suggestionSection}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {section.items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionCard}
            onPress={() => {
              // Handle suggestion tap based on section type
              if (section.id === 'popular-coaches') {
                navigation.navigate('CoachProfile', { coachId: item.id });
              } else if (section.id === 'nearby-academies') {
                navigation.navigate('AcademyProfile', { academyId: item.id });
              } else if (section.id === 'trending-programs') {
                navigation.navigate('ProgramDetails', { programId: item.id });
              }
            }}
          >
            <View style={styles.suggestionHeader}>
              <Text style={styles.suggestionName}>{item.name}</Text>
              {item.rating && (
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={14} color="#ffc107" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              )}
            </View>
            
            {item.specialty && (
              <Text style={styles.suggestionDetail}>🏆 {item.specialty}</Text>
            )}
            {item.sports && (
              <Text style={styles.suggestionDetail}>🏃‍♂️ {item.sports.join(', ')}</Text>
            )}
            {item.category && (
              <Text style={styles.suggestionDetail}>📂 {item.category}</Text>
            )}
            
            {item.location && (
              <Text style={styles.suggestionLocation}>📍 {item.location}</Text>
            )}
            {item.distance && (
              <Text style={styles.suggestionLocation}>📍 {item.distance} away</Text>
            )}
            {item.participants && (
              <Text style={styles.suggestionLocation}>👥 {item.participants} participants</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>What would you like to do?</Text>
          <Text style={styles.headerSubtitle}>Create, discover, and connect</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search coaches, academies, programs..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Search Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  activeFilter === filter.key && styles.filterButtonActive
                ]}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Icon 
                  name={filter.icon} 
                  size={16} 
                  color={activeFilter === filter.key ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.filterText,
                  activeFilter === filter.key && styles.filterTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            {getQuickActions().map(renderQuickAction)}
          </View>
        </View>

        {/* Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover</Text>
          {suggestions.map(renderSuggestionSection)}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    marginTop: 5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  actionsContainer: {
    paddingHorizontal: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  suggestionSection: {
    marginBottom: 20,
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: 200,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 2,
  },
  suggestionDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  suggestionLocation: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default NewScreen;