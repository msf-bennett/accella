import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Platform,
  Vibration,
  Animated,
  FlatList,
  TextInput,
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
  Modal,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your established constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width, height } = Dimensions.get('window');

const WebinarHosting = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { webinars, loading } = useSelector(state => state.webinars);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Form states for creating webinar
  const [newWebinar, setNewWebinar] = useState({
    title: '',
    description: '',
    scheduledTime: new Date(),
    duration: 60,
    maxParticipants: 50,
    category: 'training',
    isRecorded: true,
  });

  // Mock data - replace with Redux state
  const [liveWebinars] = useState([
    {
      id: 1,
      title: 'Advanced Football Tactics',
      description: 'Deep dive into modern football strategies',
      participants: 45,
      maxParticipants: 50,
      startTime: new Date(),
      status: 'live',
      category: 'Football',
      viewers: 38,
      duration: 90,
    },
    {
      id: 2,
      title: 'Injury Prevention Workshop',
      description: 'Learn effective injury prevention techniques',
      participants: 23,
      maxParticipants: 30,
      startTime: new Date(Date.now() + 30 * 60000),
      status: 'scheduled',
      category: 'Health',
      viewers: 0,
      duration: 45,
    },
  ]);

  const [upcomingWebinars] = useState([
    {
      id: 3,
      title: 'Youth Development Strategies',
      description: 'Building successful youth programs',
      participants: 67,
      maxParticipants: 100,
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60000),
      status: 'scheduled',
      category: 'Development',
      registrations: 67,
    },
    {
      id: 4,
      title: 'Sports Psychology Fundamentals',
      description: 'Mental training for peak performance',
      participants: 34,
      maxParticipants: 50,
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60000),
      status: 'scheduled',
      category: 'Psychology',
      registrations: 34,
    },
  ]);

  const [pastWebinars] = useState([
    {
      id: 5,
      title: 'Nutrition for Athletes',
      description: 'Optimal nutrition strategies for performance',
      participants: 89,
      rating: 4.8,
      completedDate: new Date(Date.now() - 2 * 24 * 60 * 60000),
      duration: 75,
      views: 156,
      category: 'Nutrition',
    },
  ]);

  const [participants] = useState([
    { id: 1, name: 'John Smith', avatar: null, role: 'player', joined: new Date(), active: true },
    { id: 2, name: 'Sarah Johnson', avatar: null, role: 'coach', joined: new Date(), active: true },
    { id: 3, name: 'Mike Wilson', avatar: null, role: 'parent', joined: new Date(), active: false },
  ]);

  // Animation effects
  useEffect(() => {
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
  }, []);

  // Focus effect
  useFocusEffect(
    useCallback(() => {
      // Load webinars data
      loadWebinars();
    }, [])
  );

  const loadWebinars = useCallback(async () => {
    try {
      // Dispatch action to load webinars
      // dispatch(loadCoachWebinars());
    } catch (error) {
      console.error('Error loading webinars:', error);
    }
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWebinars();
    setRefreshing(false);
  }, [loadWebinars]);

  const handleCreateWebinar = () => {
    if (!newWebinar.title.trim()) {
      Alert.alert('Error', 'Please enter a webinar title');
      return;
    }

    Vibration.vibrate(50);
    
    // Create webinar logic
    Alert.alert(
      'Feature in Development 🚧',
      'Webinar creation functionality is being developed. This will include:\n\n• Live streaming capabilities\n• Interactive features\n• Recording options\n• Participant management',
      [{ text: 'Got it!', style: 'default' }]
    );

    setShowCreateModal(false);
    setNewWebinar({
      title: '',
      description: '',
      scheduledTime: new Date(),
      duration: 60,
      maxParticipants: 50,
      category: 'training',
      isRecorded: true,
    });
  };

  const handleStartWebinar = (webinar) => {
    Vibration.vibrate(100);
    setSelectedWebinar(webinar);
    setIsLiveStreaming(true);
    
    Alert.alert(
      'Start Live Webinar 🔴',
      `Ready to start "${webinar.title}"?\n\n${webinar.participants} participants are waiting.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go Live!',
          style: 'default',
          onPress: () => {
            Alert.alert(
              'Feature in Development 🚧',
              'Live webinar streaming is being developed with:\n\n• HD video streaming\n• Interactive chat\n• Screen sharing\n• Recording capabilities\n• Real-time analytics',
              [{ text: 'Awesome!', style: 'default' }]
            );
          }
        }
      ]
    );
  };

  const handleViewParticipants = (webinar) => {
    setSelectedWebinar(webinar);
    setShowParticipantsModal(true);
  };

  const getTabData = () => {
    switch (activeTab) {
      case 'live':
        return liveWebinars.filter(w => w.status === 'live' || w.status === 'scheduled');
      case 'upcoming':
        return upcomingWebinars;
      case 'past':
        return pastWebinars;
      default:
        return [];
    }
  };

  const renderWebinarCard = ({ item }) => (
    <Card style={styles.webinarCard} elevation={4}>
      <LinearGradient
        colors={item.status === 'live' ? ['#ff4444', '#cc0000'] : ['#667eea', '#764ba2']}
        style={styles.cardHeader}
      >
        <View style={styles.cardHeaderContent}>
          <View style={styles.webinarInfo}>
            <Text style={styles.webinarTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.webinarCategory}>{item.category}</Text>
            {item.status === 'live' && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.statusButton}
            onPress={() => handleViewParticipants(item)}
          >
            <Icon name="people" size={20} color="#fff" />
            <Text style={styles.participantCount}>
              {item.status === 'live' ? item.viewers : item.participants || item.registrations}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Card.Content style={styles.cardContent}>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.webinarStats}>
          <View style={styles.statItem}>
            <Icon name="schedule" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>
              {item.status === 'past' ? `${item.duration}min` : 
               item.status === 'live' ? `${Math.floor((Date.now() - item.startTime) / 60000)}min ago` :
               item.startTime.toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="group" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>
              {item.maxParticipants || item.participants || item.registrations} max
            </Text>
          </View>

          {item.rating && (
            <View style={styles.statItem}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>{item.rating}</Text>
            </View>
          )}
        </View>

        {item.status !== 'past' && (
          <ProgressBar
            progress={(item.participants || item.registrations || 0) / (item.maxParticipants || 1)}
            color={COLORS.primary}
            style={styles.progressBar}
          />
        )}
      </Card.Content>

      <Card.Actions style={styles.cardActions}>
        {item.status === 'live' ? (
          <Button
            mode="contained"
            onPress={() => handleStartWebinar(item)}
            style={[styles.actionButton, styles.liveButton]}
            icon="videocam"
            labelStyle={styles.buttonLabel}
          >
            Join Live
          </Button>
        ) : item.status === 'scheduled' ? (
          <Button
            mode="contained"
            onPress={() => handleStartWebinar(item)}
            style={styles.actionButton}
            icon="play-arrow"
            labelStyle={styles.buttonLabel}
          >
            Start Webinar
          </Button>
        ) : (
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Feature Coming Soon', 'Webinar analytics and replays are being developed!')}
            style={styles.actionButton}
            icon="analytics"
            labelStyle={styles.outlineButtonLabel}
          >
            View Analytics
          </Button>
        )}
        
        <IconButton
          icon="dots-vertical"
          size={20}
          onPress={() => Alert.alert('More Options', 'Additional webinar management options coming soon!')}
        />
      </Card.Actions>
    </Card>
  );

  const renderParticipantItem = ({ item }) => (
    <Surface style={styles.participantItem} elevation={1}>
      <Avatar.Text
        size={40}
        label={item.name.split(' ').map(n => n[0]).join('')}
        style={styles.participantAvatar}
      />
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{item.name}</Text>
        <Text style={styles.participantRole}>{item.role}</Text>
      </View>
      <View style={styles.participantStatus}>
        <View style={[styles.statusDot, { backgroundColor: item.active ? '#4CAF50' : '#9E9E9E' }]} />
        <Text style={styles.statusText}>{item.active ? 'Active' : 'Away'}</Text>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Webinar Hosting 🎥</Text>
              <Text style={styles.headerSubtitle}>Engage with your community</Text>
            </View>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        {['live', 'upcoming', 'past'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'live' && liveWebinars.filter(w => w.status === 'live').length > 0 && (
                <Text style={styles.liveBadge}> • LIVE</Text>
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Searchbar
          placeholder="Search webinars..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />

        <FlatList
          data={getTabData()}
          renderItem={renderWebinarCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="video-library" size={64} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>No webinars found</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'live' ? 'No live or scheduled webinars' :
                 activeTab === 'upcoming' ? 'No upcoming webinars scheduled' :
                 'No past webinars to display'}
              </Text>
            </View>
          }
        />
      </Animated.View>

      {/* Create Webinar Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Webinar 🎯</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Webinar Title"
              value={newWebinar.title}
              onChangeText={(text) => setNewWebinar({...newWebinar, title: text})}
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={newWebinar.description}
              onChangeText={(text) => setNewWebinar({...newWebinar, description: text})}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={newWebinar.duration.toString()}
                  onChangeText={(text) => setNewWebinar({...newWebinar, duration: parseInt(text) || 60})}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Max Participants</Text>
                <TextInput
                  style={styles.input}
                  value={newWebinar.maxParticipants.toString()}
                  onChangeText={(text) => setNewWebinar({...newWebinar, maxParticipants: parseInt(text) || 50})}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowCreateModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateWebinar}
                style={[styles.modalButton, styles.primaryButton]}
              >
                Create Webinar
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Participants Modal */}
      <Portal>
        <Modal
          visible={showParticipantsModal}
          onDismiss={() => setShowParticipantsModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Participants 👥</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowParticipantsModal(false)}
              />
            </View>
            
            <FlatList
              data={participants}
              renderItem={renderParticipantItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.participantsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Modal>
      </Portal>

      <FAB
        style={styles.fab}
        icon="video-call"
        onPress={() => Alert.alert(
          'Quick Start 🚀',
          'Start an instant webinar or schedule for later?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Schedule Later', onPress: () => setShowCreateModal(true) },
            { 
              text: 'Start Now', 
              onPress: () => Alert.alert('Feature Coming Soon', 'Instant webinar start is being developed!')
            },
          ]
        )}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  liveBadge: {
    color: '#ff4444',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  searchbar: {
    margin: SPACING.md,
    elevation: 2,
  },
  listContainer: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  webinarCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  webinarInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  webinarTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  webinarCategory: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  liveText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    fontWeight: 'bold',
  },
  statusButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantCount: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: SPACING.md,
  },
  description: {
    ...TEXT_STYLES.body,
    color: '#666',
    marginBottom: SPACING.sm,
  },
  webinarStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginLeft: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  cardActions: {
    padding: SPACING.md,
    paddingTop: 0,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  liveButton: {
    backgroundColor: '#ff4444',
  },
  buttonLabel: {
    ...TEXT_STYLES.button,
    color: '#fff',
  },
  outlineButtonLabel: {
    ...TEXT_STYLES.button,
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: '#666',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: SPACING.lg,
    borderRadius: 12,
    maxHeight: height * 0.8,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  inputLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  participantsList: {
    maxHeight: 300,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: 8,
  },
  participantAvatar: {
    backgroundColor: COLORS.primary,
  },
  participantInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  participantName: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    color: '#333',
  },
  participantRole: {
    ...TEXT_STYLES.caption,
    color: '#666',
    textTransform: 'capitalize',
  },
  participantStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default WebinarHosting;
