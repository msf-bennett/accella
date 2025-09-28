import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Vibration,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Dialog,
  Searchbar,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const CoachNetwork = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, network, loading } = useSelector(state => state.coach);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sample coaches data (replace with Redux state)
  const [coachesData, setCoachesData] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      specialty: 'Strength Training',
      location: 'Nairobi, Kenya',
      rating: 4.9,
      experience: '8 years',
      clients: 45,
      isOnline: true,
      mutualConnections: 12,
      badges: ['CSCS', 'NSCA', 'ACSM'],
      bio: 'Passionate strength coach helping athletes reach peak performance',
      connectionStatus: 'not_connected',
      distance: '2.1 km',
      languages: ['English', 'Swahili'],
      sessionPrice: '$50/hour'
    },
    {
      id: '2',
      name: 'Mike Ochieng',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      specialty: 'Youth Development',
      location: 'Westlands, Nairobi',
      rating: 4.8,
      experience: '6 years',
      clients: 32,
      isOnline: false,
      mutualConnections: 8,
      badges: ['UEFA B', 'Youth Coaching'],
      bio: 'Developing young talent in football and life skills',
      connectionStatus: 'pending',
      distance: '5.3 km',
      languages: ['English', 'Swahili', 'Luo'],
      sessionPrice: '$35/hour'
    },
    {
      id: '3',
      name: 'Priya Patel',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      specialty: 'Nutrition Coaching',
      location: 'Karen, Nairobi',
      rating: 4.7,
      experience: '5 years',
      clients: 28,
      isOnline: true,
      mutualConnections: 5,
      badges: ['RD', 'Sports Nutrition'],
      bio: 'Helping athletes fuel their performance with proper nutrition',
      connectionStatus: 'connected',
      distance: '8.7 km',
      languages: ['English', 'Hindi'],
      sessionPrice: '$40/hour'
    }
  ]);

  const [myConnections, setMyConnections] = useState([
    {
      id: '3',
      name: 'Priya Patel',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      specialty: 'Nutrition Coaching',
      lastActive: '2 hours ago',
      mutualClients: 3,
      collaborations: 5
    },
    {
      id: '4',
      name: 'James Kiprotich',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      specialty: 'Running Coach',
      lastActive: '1 day ago',
      mutualClients: 1,
      collaborations: 2
    }
  ]);

  const filters = [
    { key: 'all', label: 'All Coaches', icon: 'people' },
    { key: 'nearby', label: 'Nearby', icon: 'location-on' },
    { key: 'online', label: 'Online Now', icon: 'radio-button-on' },
    { key: 'strength', label: 'Strength', icon: 'fitness-center' },
    { key: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
    { key: 'youth', label: 'Youth', icon: 'child-care' },
    { key: 'sports', label: 'Sports', icon: 'sports-soccer' }
  ];

  const tabs = [
    { key: 'discover', label: 'Discover', icon: 'explore' },
    { key: 'connections', label: 'Connections', icon: 'people' },
    { key: 'requests', label: 'Requests', icon: 'person-add', badge: 3 }
  ];

  useEffect(() => {
    // Animate screen entrance
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
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch action to fetch coaches
      // dispatch(fetchCoaches());
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh coach network');
    }
    setRefreshing(false);
  }, []);

  const filteredCoaches = coachesData.filter(coach => {
    const matchesSearch = coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coach.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    switch (selectedFilter) {
      case 'nearby':
        matchesFilter = parseFloat(coach.distance) <= 10;
        break;
      case 'online':
        matchesFilter = coach.isOnline;
        break;
      case 'strength':
        matchesFilter = coach.specialty.toLowerCase().includes('strength');
        break;
      case 'nutrition':
        matchesFilter = coach.specialty.toLowerCase().includes('nutrition');
        break;
      case 'youth':
        matchesFilter = coach.specialty.toLowerCase().includes('youth');
        break;
      case 'sports':
        matchesFilter = coach.specialty.toLowerCase().includes('sport') || 
                       coach.specialty.toLowerCase().includes('football');
        break;
    }
    
    return matchesSearch && matchesFilter;
  });

  const handleConnect = (coachId) => {
    Vibration.vibrate(50);
    const coach = coachesData.find(c => c.id === coachId);
    
    Alert.alert(
      'Send Connection Request',
      `Send a connection request to ${coach.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: () => {
            // Update coach status to pending
            setCoachesData(prev => prev.map(c => 
              c.id === coachId ? {...c, connectionStatus: 'pending'} : c
            ));
            Alert.alert('Success', 'Connection request sent! 🤝');
          }
        }
      ]
    );
  };

  const handleMessage = (coachId) => {
    Alert.alert('Feature Coming Soon', 'Direct messaging is under development! 💬');
  };

  const handleViewProfile = (coach) => {
    setSelectedCoach(coach);
    setShowProfileModal(true);
  };

  const handleCollaborate = (coachId) => {
    Alert.alert('Feature Coming Soon', 'Collaboration tools are under development! 🤝');
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Surface style={styles.statCard}>
        <LinearGradient
          colors={[COLORS.primary, '#764ba2']}
          style={styles.statGradient}
        >
          <Icon name="people" size={24} color="white" />
          <Text style={styles.statNumber}>{myConnections.length}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </LinearGradient>
      </Surface>
      
      <Surface style={styles.statCard}>
        <LinearGradient
          colors={[COLORS.success, '#4CAF50']}
          style={styles.statGradient}
        >
          <Icon name="handshake" size={24} color="white" />
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Collaborations</Text>
        </LinearGradient>
      </Surface>
      
      <Surface style={styles.statCard}>
        <LinearGradient
          colors={[COLORS.warning, '#FF9800']}
          style={styles.statGradient}
        >
          <Icon name="star" size={24} color="white" />
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Network Rating</Text>
        </LinearGradient>
      </Surface>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && styles.activeTab
          ]}
          onPress={() => setActiveTab(tab.key)}
        >
          <View style={styles.tabContent}>
            <Icon
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary}
            />
            {tab.badge && (
              <Badge style={styles.tabBadge} size={16}>
                {tab.badge}
              </Badge>
            )}
          </View>
          <Text style={[
            styles.tabLabel,
            activeTab === tab.key && styles.activeTabLabel
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {filters.map((filter) => (
        <Chip
          key={filter.key}
          mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
          selected={selectedFilter === filter.key}
          onPress={() => setSelectedFilter(filter.key)}
          icon={filter.icon}
          style={[
            styles.filterChip,
            selectedFilter === filter.key && styles.selectedFilterChip
          ]}
          textStyle={[
            styles.chipText,
            selectedFilter === filter.key && styles.selectedChipText
          ]}
        >
          {filter.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderCoachCard = ({ item: coach }) => (
    <TouchableOpacity
      onPress={() => handleViewProfile(coach)}
      activeOpacity={0.7}
    >
      <Card style={styles.coachCard}>
        <Card.Content>
          <View style={styles.coachHeader}>
            <View style={styles.avatarContainer}>
              <Avatar.Image
                size={60}
                source={{ uri: coach.avatar }}
                style={styles.avatar}
              />
              {coach.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            
            <View style={styles.coachInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.coachName}>{coach.name}</Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.rating}>{coach.rating}</Text>
                </View>
              </View>
              
              <Text style={styles.specialty}>{coach.specialty}</Text>
              
              <View style={styles.locationRow}>
                <Icon name="location-on" size={14} color={COLORS.textSecondary} />
                <Text style={styles.location}>{coach.location}</Text>
                <Text style={styles.distance}>• {coach.distance}</Text>
              </View>
              
              <View style={styles.metaRow}>
                <Text style={styles.experience}>{coach.experience}</Text>
                <Text style={styles.clients}>• {coach.clients} clients</Text>
                {coach.mutualConnections > 0 && (
                  <Text style={styles.mutual}>• {coach.mutualConnections} mutual</Text>
                )}
              </View>
            </View>
          </View>

          {/* Badges */}
          <View style={styles.badgesContainer}>
            {coach.badges.slice(0, 3).map((badge, index) => (
              <Chip
                key={index}
                mode="outlined"
                compact
                style={styles.badgeChip}
                textStyle={styles.badgeText}
              >
                {badge}
              </Chip>
            ))}
            {coach.badges.length > 3 && (
              <Chip
                mode="outlined"
                compact
                style={styles.badgeChip}
                textStyle={styles.badgeText}
              >
                +{coach.badges.length - 3}
              </Chip>
            )}
          </View>

          {/* Bio */}
          <Text style={styles.bio} numberOfLines={2}>{coach.bio}</Text>

          {/* Actions */}
          <View style={styles.actionRow}>
            {coach.connectionStatus === 'not_connected' && (
              <Button
                mode="contained"
                style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                onPress={() => handleConnect(coach.id)}
                compact
              >
                Connect
              </Button>
            )}
            
            {coach.connectionStatus === 'pending' && (
              <Button
                mode="outlined"
                style={styles.actionButton}
                disabled
                compact
              >
                Pending
              </Button>
            )}
            
            {coach.connectionStatus === 'connected' && (
              <Button
                mode="contained"
                style={[styles.actionButton, { backgroundColor: COLORS.success }]}
                onPress={() => handleMessage(coach.id)}
                compact
              >
                Message
              </Button>
            )}
            
            <Button
              mode="outlined"
              style={styles.actionButton}
              onPress={() => handleViewProfile(coach)}
              compact
            >
              View Profile
            </Button>
            
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => {
                Alert.alert(
                  'Coach Options',
                  'Choose an action',
                  [
                    { text: 'Share Profile', onPress: () => Alert.alert('Feature Coming Soon', 'Profile sharing is under development! 📤') },
                    { text: 'Report', onPress: () => Alert.alert('Feature Coming Soon', 'Reporting is under development! 🚨') },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderConnectionCard = ({ item: connection }) => (
    <Card style={styles.connectionCard}>
      <Card.Content>
        <View style={styles.connectionHeader}>
          <Avatar.Image
            size={50}
            source={{ uri: connection.avatar }}
            style={styles.connectionAvatar}
          />
          
          <View style={styles.connectionInfo}>
            <Text style={styles.connectionName}>{connection.name}</Text>
            <Text style={styles.connectionSpecialty}>{connection.specialty}</Text>
            <Text style={styles.lastActive}>Last active: {connection.lastActive}</Text>
          </View>
        </View>

        <View style={styles.connectionMeta}>
          <View style={styles.metaItem}>
            <Icon name="people" size={16} color={COLORS.primary} />
            <Text style={styles.metaText}>{connection.mutualClients} mutual clients</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="handshake" size={16} color={COLORS.success} />
            <Text style={styles.metaText}>{connection.collaborations} collaborations</Text>
          </View>
        </View>

        <View style={styles.connectionActions}>
          <Button
            mode="outlined"
            style={styles.connectionActionButton}
            onPress={() => handleMessage(connection.id)}
            compact
          >
            Message
          </Button>
          <Button
            mode="contained"
            style={[styles.connectionActionButton, { backgroundColor: COLORS.primary }]}
            onPress={() => handleCollaborate(connection.id)}
            compact
          >
            Collaborate
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderProfileModal = () => (
    <Modal
      visible={showProfileModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowProfileModal(false)}
    >
      <BlurView
        style={StyleSheet.absoluteFillObject}
        blurType="dark"
        blurAmount={10}
      />
      <View style={styles.modalContainer}>
        <Surface style={styles.modalContent}>
          {selectedCoach && (
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalHeader}>
                <IconButton
                  icon="close"
                  onPress={() => setShowProfileModal(false)}
                  style={styles.closeButton}
                />
              </View>

              <View style={styles.profileHeader}>
                <Avatar.Image
                  size={100}
                  source={{ uri: selectedCoach.avatar }}
                  style={styles.profileAvatar}
                />
                {selectedCoach.isOnline && <View style={styles.profileOnlineIndicator} />}
                
                <Text style={styles.profileName}>{selectedCoach.name}</Text>
                <Text style={styles.profileSpecialty}>{selectedCoach.specialty}</Text>
                
                <View style={styles.profileRating}>
                  <Icon name="star" size={20} color={COLORS.warning} />
                  <Text style={styles.profileRatingText}>{selectedCoach.rating}</Text>
                  <Text style={styles.profileClients}>({selectedCoach.clients} clients)</Text>
                </View>
              </View>

              <View style={styles.profileDetails}>
                <View style={styles.detailRow}>
                  <Icon name="location-on" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{selectedCoach.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="schedule" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{selectedCoach.experience} experience</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="attach-money" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{selectedCoach.sessionPrice}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="language" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{selectedCoach.languages.join(', ')}</Text>
                </View>
              </View>

              <View style={styles.profileBio}>
                <Text style={styles.bioTitle}>About</Text>
                <Text style={styles.bioText}>{selectedCoach.bio}</Text>
              </View>

              <View style={styles.profileBadges}>
                <Text style={styles.badgesTitle}>Certifications</Text>
                <View style={styles.modalBadgesContainer}>
                  {selectedCoach.badges.map((badge, index) => (
                    <Chip
                      key={index}
                      mode="outlined"
                      style={styles.modalBadgeChip}
                    >
                      {badge}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.profileActions}>
                <Button
                  mode="contained"
                  style={[styles.profileActionButton, { backgroundColor: COLORS.primary }]}
                  onPress={() => {
                    setShowProfileModal(false);
                    handleConnect(selectedCoach.id);
                  }}
                >
                  Connect
                </Button>
                <Button
                  mode="outlined"
                  style={styles.profileActionButton}
                  onPress={() => {
                    setShowProfileModal(false);
                    handleMessage(selectedCoach.id);
                  }}
                >
                  Message
                </Button>
              </View>
            </ScrollView>
          )}
        </Surface>
      </View>
    </Modal>
  );

  const renderDiscoverTab = () => (
    <View style={styles.tabContentView}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search coaches..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />
      </View>

      {/* Filters */}
      {renderFilterChips()}

      {/* Coaches List */}
      <FlatList
        data={filteredCoaches}
        renderItem={renderCoachCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="search-off" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No Coaches Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );

  const renderConnectionsTab = () => (
    <View style={styles.tabContentView}>
      <FlatList
        data={myConnections}
        renderItem={renderConnectionCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="people-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No Connections Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start building your coach network
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );

  const renderRequestsTab = () => (
    <View style={styles.tabContentView}>
      <Card style={styles.emptyCard}>
        <Card.Content style={styles.emptyContent}>
          <Icon name="person-add" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>Connection Requests</Text>
          <Text style={styles.emptySubtitle}>
            Manage incoming and outgoing requests
          </Text>
          <Button
            mode="outlined"
            style={{ marginTop: SPACING.md }}
            onPress={() => Alert.alert('Feature Coming Soon', 'Connection requests management is under development! 📬')}
          >
            View Requests
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'discover':
        return renderDiscoverTab();
      case 'connections':
        return renderConnectionsTab();
      case 'requests':
        return renderRequestsTab();
      default:
        return renderDiscoverTab();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Coach Network</Text>
            <IconButton
              icon="filter-list"
              iconColor="white"
              onPress={() => setShowFilters(true)}
            />
          </View>
          
          <View style={styles.headerStats}>
            <Text style={styles.welcomeText}>Connect & Collaborate 🤝</Text>
            <Text style={styles.subtitle}>Build your coaching network</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Stats Cards */}
          {renderStatsCards()}

          {/* Tab Bar */}
          {renderTabBar()}

          {/* Tab Content */}
          <View style={styles.tabContentContainer}>
            {renderTabContent()}
          </View>
        </ScrollView>
      </Animated.View>

      {/* FAB */}
      <FAB
        icon="group-add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => Alert.alert('Feature Coming Soon', 'Invite coaches feature is under development! 📧')}
        label="Invite Coaches"
      />

      {/* Profile Modal */}
      {renderProfileModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerStats: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  welcomeText: {
    ...TEXT_STYLES.h3,
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    elevation: 4,
  },
  statGradient: {
    padding: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primaryLight,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
  },
  tabLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontSize: 11,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContentContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  tabContentView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  filterContainer: {
    paddingLeft: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingRight: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    backgroundColor: 'white',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textPrimary,
  },
  selectedChipText: {
    color: 'white',
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  coachCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 12,
  },
  coachHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    backgroundColor: COLORS.primaryLight,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: 'white',
  },
  coachInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  coachName: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  rating: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  specialty: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  location: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs / 2,
  },
  distance: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experience: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  clients: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  mutual: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  badgeChip: {
    height: 24,
  },
  badgeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  bio: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  connectionCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  connectionHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  connectionAvatar: {
    marginRight: SPACING.md,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.xs / 2,
  },
  connectionSpecialty: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginBottom: SPACING.xs / 2,
  },
  lastActive: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  connectionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  metaText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  connectionActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  connectionActionButton: {
    flex: 1,
  },
  emptyCard: {
    elevation: 2,
    marginTop: SPACING.xl,
  },
  emptyContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 16,
    elevation: 8,
  },
  modalScrollView: {
    flex: 1,
  },
  modalHeader: {
    alignItems: 'flex-end',
    padding: SPACING.md,
  },
  closeButton: {
    margin: 0,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  profileAvatar: {
    backgroundColor: COLORS.primaryLight,
    marginBottom: SPACING.md,
  },
  profileOnlineIndicator: {
    position: 'absolute',
    top: 75,
    right: '50%',
    marginRight: -58,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileName: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  profileSpecialty: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: SPACING.md,
  },
  profileRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  profileRatingText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  profileClients: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  profileDetails: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  detailText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
  },
  profileBio: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  bioTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  bioText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  profileBadges: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  badgesTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  modalBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  modalBadgeChip: {
    backgroundColor: COLORS.primaryLight,
  },
  profileActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  profileActionButton: {
    flex: 1,
  },
});

export default CoachNetwork;