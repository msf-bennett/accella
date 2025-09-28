import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Alert,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../styles/colors';

const { width, height } = Dimensions.get('window');

const SavedCoachesTrainers = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('coaches'); // 'coaches' or 'trainers'
  const [savedCoaches, setSavedCoaches] = useState([]);
  const [savedTrainers, setSavedTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Mock data for saved coaches
  const mockCoaches = [
    {
      id: '1',
      name: 'Sarah Johnson',
      sport: 'Football',
      specialization: 'Youth Development',
      rating: 4.8,
      reviews: 127,
      experience: '8 years',
      location: 'Westlands, Nairobi',
      distance: '2.5 km',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9d22b8d?w=200',
      verified: true,
      availability: 'Available',
      phone: '+254712345678',
      email: 'sarah.johnson@email.com',
      sessions: [
        {
          id: 's1',
          title: 'Youth Football Fundamentals',
          duration: '60 minutes',
          price: 3500,
          description: 'Basic football skills for young players',
          maxParticipants: 1,
          type: 'individual'
        },
        {
          id: 's2',
          title: 'Team Tactics Training',
          duration: '90 minutes',
          price: 2500,
          description: 'Group training focusing on team coordination',
          maxParticipants: 8,
          type: 'group'
        },
        {
          id: 's3',
          title: 'Advanced Skills Workshop',
          duration: '120 minutes',
          price: 5000,
          description: 'Advanced technical skills and drills',
          maxParticipants: 1,
          type: 'individual'
        }
      ]
    },
    {
      id: '2',
      name: 'Michael Ochieng',
      sport: 'Basketball',
      specialization: 'Elite Performance',
      rating: 4.9,
      reviews: 89,
      experience: '12 years',
      location: 'Karen, Nairobi',
      distance: '5.2 km',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      verified: true,
      availability: 'Available',
      phone: '+254798765432',
      email: 'michael.ochieng@email.com',
      sessions: [
        {
          id: 's4',
          title: 'Elite Basketball Training',
          duration: '90 minutes',
          price: 4500,
          description: 'High-level basketball skills and conditioning',
          maxParticipants: 1,
          type: 'individual'
        },
        {
          id: 's5',
          title: 'Shooting Clinic',
          duration: '60 minutes',
          price: 3000,
          description: 'Focused shooting technique improvement',
          maxParticipants: 4,
          type: 'small_group'
        }
      ]
    }
  ];

  // Mock data for saved trainers
  const mockTrainers = [
    {
      id: '3',
      name: 'Grace Wanjiku',
      sport: 'Swimming',
      specialization: 'Beginner Friendly',
      rating: 4.7,
      reviews: 156,
      experience: '6 years',
      location: 'Kileleshwa, Nairobi',
      distance: '3.1 km',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      verified: true,
      availability: 'Available',
      phone: '+254723456789',
      email: 'grace.wanjiku@email.com',
      sessions: [
        {
          id: 's6',
          title: 'Beginner Swimming Lessons',
          duration: '45 minutes',
          price: 2800,
          description: 'Learn basic swimming strokes and water safety',
          maxParticipants: 1,
          type: 'individual'
        },
        {
          id: 's7',
          title: 'Competitive Swimming Training',
          duration: '75 minutes',
          price: 4000,
          description: 'Advanced swimming techniques for competition',
          maxParticipants: 1,
          type: 'individual'
        },
        {
          id: 's8',
          title: 'Water Safety Course',
          duration: '60 minutes',
          price: 2000,
          description: 'Group lesson on water safety and basic swimming',
          maxParticipants: 6,
          type: 'group'
        }
      ]
    },
    {
      id: '4',
      name: 'David Kiprop',
      sport: 'Athletics',
      specialization: 'Track & Field',
      rating: 4.6,
      reviews: 73,
      experience: '10 years',
      location: 'Kasarani, Nairobi',
      distance: '8.7 km',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      verified: false,
      availability: 'Busy',
      phone: '+254734567890',
      email: 'david.kiprop@email.com',
      sessions: [
        {
          id: 's9',
          title: 'Sprint Training',
          duration: '60 minutes',
          price: 3000,
          description: 'Specialized sprint technique and speed training',
          maxParticipants: 1,
          type: 'individual'
        },
        {
          id: 's10',
          title: 'Track & Field Basics',
          duration: '90 minutes',
          price: 2200,
          description: 'Introduction to various track and field events',
          maxParticipants: 8,
          type: 'group'
        }
      ]
    }
  ];

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSavedCoaches(mockCoaches);
      setSavedTrainers(mockTrainers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load saved coaches and trainers');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSavedData().then(() => setRefreshing(false));
  }, []);

  const makePhoneCall = (phoneNumber) => {
    const phoneUrl = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        } else {
          return Linking.openURL(phoneUrl);
        }
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to make phone call');
        console.error('Phone call error:', error);
      });
  };

  const sendMessage = (person) => {
    navigation.navigate('CoachChat', { 
      coach: person,
      coachId: person.id,
      coachName: person.name,
      coachImage: person.avatar
    });
  };

  const removeFavorite = (personId) => {
    Alert.alert(
      'Remove from Saved',
      'Are you sure you want to remove this person from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            if (activeTab === 'coaches') {
              setSavedCoaches(prev => prev.filter(coach => coach.id !== personId));
            } else {
              setSavedTrainers(prev => prev.filter(trainer => trainer.id !== personId));
            }
          }
        }
      ]
    );
  };

  const showSessions = (person) => {
    setSelectedPerson(person);
    setShowSessionsModal(true);
  };

  const bookSession = (person, session = null) => {
    if (session) {
      // Book specific session
      navigation.navigate('BookSession', { 
        trainer: person,
        selectedSession: session
      });
    } else {
      // General booking
      navigation.navigate('BookSession', { trainer: person });
    }
    setShowSessionsModal(false);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={12} color="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Icon key="half" name="star-half" size={12} color="#FFD700" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Icon key={`empty-${i}`} name="star-outline" size={12} color="#FFD700" />);
    }

    return stars;
  };

  const renderPersonCard = ({ item: person }) => {
    const isCoach = activeTab === 'coaches';
    
    return (
      <TouchableOpacity 
        style={styles.personCard}
        onPress={() => showSessions(person)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: person.avatar }} style={styles.avatar} />
            {person.verified && (
              <View style={styles.verifiedBadge}>
                <Icon name="checkmark-circle" size={16} color="#4CAF50" />
              </View>
            )}
            <View style={[
              styles.availabilityIndicator,
              { 
                backgroundColor: person.availability === 'Available' 
                  ? COLORS.success || '#4CAF50'
                  : COLORS.warning || '#FF9800'
              }
            ]} />
          </View>
          
          <View style={styles.personInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.personName}>{person.name}</Text>
              <Text style={styles.personType}>{isCoach ? 'Coach' : 'Trainer'}</Text>
            </View>
            
            <Text style={styles.sport}>{person.sport}</Text>
            <Text style={styles.specialization}>{person.specialization}</Text>
            
            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {renderStars(person.rating)}
              </View>
              <Text style={styles.ratingText}>
                {person.rating} ({person.reviews})
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Icon name="location-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{person.location}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="time-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{person.experience} experience</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="list-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{person.sessions.length} session{person.sessions.length !== 1 ? 's' : ''} available</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => makePhoneCall(person.phone)}
          >
            <Icon name="call-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => sendMessage(person)}
          >
            <Icon name="chatbubble-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => showSessions(person)}
          >
            <Icon name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Sessions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => bookSession(person)}
          >
            <Text style={styles.primaryButtonText}>Book Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeFavorite(person.id)}
          >
            <Icon name="heart" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSessionItem = ({ item: session }) => (
    <TouchableOpacity 
      style={styles.sessionCard}
      onPress={() => bookSession(selectedPerson, session)}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          <Text style={styles.sessionDescription}>{session.description}</Text>
        </View>
        <View style={styles.sessionPrice}>
          <Text style={styles.priceText}>KSh {session.price.toLocaleString()}</Text>
        </View>
      </View>
      
      <View style={styles.sessionDetails}>
        <View style={styles.sessionDetail}>
          <Icon name="time-outline" size={16} color="#666" />
          <Text style={styles.sessionDetailText}>{session.duration}</Text>
        </View>
        
        <View style={styles.sessionDetail}>
          <Icon name="people-outline" size={16} color="#666" />
          <Text style={styles.sessionDetailText}>
            Max {session.maxParticipants} {session.maxParticipants === 1 ? 'person' : 'people'}
          </Text>
        </View>
        
        <View style={[styles.sessionTypeTag, { 
          backgroundColor: session.type === 'individual' ? '#E3F2FD' : 
                          session.type === 'group' ? '#F3E5F5' : '#E8F5E8'
        }]}>
          <Text style={[styles.sessionTypeText, {
            color: session.type === 'individual' ? '#1976D2' : 
                   session.type === 'group' ? '#7B1FA2' : '#388E3C'
          }]}>
            {session.type.replace('_', ' ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const SessionsModal = () => (
    <Modal
      visible={showSessionsModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSessionsModal(false)}
    >
      {selectedPerson && (
        <View style={styles.sessionsModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSessionsModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Available Sessions</Text>
            <TouchableOpacity onPress={() => bookSession(selectedPerson)}>
              <Text style={styles.customBookText}>Custom</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalPersonInfo}>
            <Image source={{ uri: selectedPerson.avatar }} style={styles.modalAvatar} />
            <View>
              <Text style={styles.modalPersonName}>{selectedPerson.name}</Text>
              <Text style={styles.modalPersonSport}>{selectedPerson.sport} • {selectedPerson.specialization}</Text>
              <View style={styles.modalRating}>
                {renderStars(selectedPerson.rating)}
                <Text style={styles.modalRatingText}>{selectedPerson.rating} ({selectedPerson.reviews} reviews)</Text>
              </View>
            </View>
          </View>
          
          <FlatList
            data={selectedPerson.sessions}
            renderItem={renderSessionItem}
            keyExtractor={item => item.id}
            style={styles.sessionsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptySessionsContainer}>
                <Icon name="calendar-outline" size={48} color="#ccc" />
                <Text style={styles.emptySessionsText}>No sessions available</Text>
                <TouchableOpacity 
                  style={styles.customBookButton}
                  onPress={() => bookSession(selectedPerson)}
                >
                  <Text style={styles.customBookButtonText}>Book Custom Session</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      )}
    </Modal>
  );

  const currentData = activeTab === 'coaches' ? savedCoaches : savedTrainers;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My {activeTab === 'coaches' ? 'Coaches' : 'Trainers'}</Text>
        <TouchableOpacity 
          onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          style={styles.viewModeBtn}
        >
          <Icon 
            name={viewMode === 'list' ? 'grid-outline' : 'list-outline'} 
            size={24} 
            color="#333" 
          />
        </TouchableOpacity>
      </View>

      {/* Tab Switch */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'coaches' && styles.activeTab]}
          onPress={() => setActiveTab('coaches')}
        >
          <Icon 
            name="school-outline" 
            size={20} 
            color={activeTab === 'coaches' ? COLORS.primary : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'coaches' && styles.activeTabText]}>
            Coaches ({savedCoaches.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'trainers' && styles.activeTab]}
          onPress={() => setActiveTab('trainers')}
        >
          <Icon 
            name="fitness-outline" 
            size={20} 
            color={activeTab === 'trainers' ? COLORS.primary : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'trainers' && styles.activeTabText]}>
            Trainers ({savedTrainers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => navigation.navigate(activeTab === 'coaches' ? 'SearchCoaches' : 'SearchTrainers')}
        >
          <Icon name="add" size={20} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Find More</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction}>
          <Icon name="star" size={20} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Top Rated</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction}>
          <Icon name="time" size={20} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Available Now</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your saved {activeTab}...</Text>
        </View>
      ) : (
        <FlatList
          data={currentData}
          renderItem={renderPersonCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.personsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon 
                name={activeTab === 'coaches' ? 'school-outline' : 'fitness-outline'} 
                size={64} 
                color="#ccc" 
              />
              <Text style={styles.emptyTitle}>No saved {activeTab}</Text>
              <Text style={styles.emptyText}>
                Start by finding and saving your favorite {activeTab}
              </Text>
              <TouchableOpacity 
                style={styles.findButton}
                onPress={() => navigation.navigate(activeTab === 'coaches' ? 'SearchCoaches' : 'SearchTrainers')}
              >
                <Text style={styles.findButtonText}>Find {activeTab === 'coaches' ? 'Coaches' : 'Trainers'}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <SessionsModal />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewModeBtn: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
  personCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  availabilityIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  personInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  personType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sport: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 2,
  },
  specialization: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  cardBody: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 60,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#666',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  personsList: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  findButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  findButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  sessionsModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  customBookText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  modalPersonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  modalAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  modalPersonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalPersonSport: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRatingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  sessionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
    marginRight: 12,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  sessionPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sessionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  sessionDetailText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  sessionTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionTypeText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptySessionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptySessionsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  customBookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  customBookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SavedCoachesTrainers;