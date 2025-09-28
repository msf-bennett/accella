import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  ProgressBar,
  Portal,
  Modal,
  TextInput,
  Switch,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WebinarHostingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, webinars, loading } = useSelector(state => ({
    user: state.auth.user,
    webinars: state.webinars.hostedWebinars || [],
    loading: state.webinars.loading
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [activeWebinar, setActiveWebinar] = useState(null);
  
  // Form state for creating webinars
  const [newWebinar, setNewWebinar] = useState({
    title: '',
    description: '',
    date: new Date(),
    duration: 60,
    maxParticipants: 50,
    category: 'fitness',
    isPaid: false,
    price: 0,
    tags: [],
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sample data - replace with real data from Redux
  const [webinarData, setWebinarData] = useState([
    {
      id: 1,
      title: 'HIIT Training Fundamentals',
      description: 'Complete guide to High-Intensity Interval Training',
      date: new Date('2024-08-25T14:00:00'),
      duration: 90,
      participants: 24,
      maxParticipants: 50,
      status: 'scheduled',
      category: 'fitness',
      isPaid: true,
      price: 29.99,
      registrations: 24,
      revenue: 719.76,
      tags: ['HIIT', 'Cardio', 'Weight Loss'],
    },
    {
      id: 2,
      title: 'Nutrition for Athletes',
      description: 'Optimizing performance through proper nutrition',
      date: new Date('2024-08-30T18:00:00'),
      duration: 60,
      participants: 0,
      maxParticipants: 100,
      status: 'scheduled',
      category: 'nutrition',
      isPaid: false,
      price: 0,
      registrations: 42,
      revenue: 0,
      tags: ['Nutrition', 'Performance', 'Health'],
    },
    {
      id: 3,
      title: 'Injury Prevention Workshop',
      description: 'Essential techniques for preventing common injuries',
      date: new Date('2024-08-22T16:00:00'),
      duration: 75,
      participants: 18,
      maxParticipants: 30,
      status: 'completed',
      category: 'health',
      isPaid: true,
      price: 19.99,
      registrations: 18,
      revenue: 359.82,
      tags: ['Injury Prevention', 'Mobility', 'Safety'],
    }
  ]);

  useEffect(() => {
    // Entrance animations
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
      Vibration.vibrate(50);
    }, 1500);
  }, []);

  const getFilteredWebinars = useCallback(() => {
    let filtered = webinarData;

    // Filter by tab
    if (selectedTab === 'upcoming') {
      filtered = filtered.filter(webinar => webinar.status === 'scheduled');
    } else if (selectedTab === 'live') {
      filtered = filtered.filter(webinar => webinar.status === 'live');
    } else if (selectedTab === 'completed') {
      filtered = filtered.filter(webinar => webinar.status === 'completed');
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(webinar =>
        webinar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        webinar.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        webinar.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [webinarData, selectedTab, searchQuery]);

  const handleCreateWebinar = () => {
    if (!newWebinar.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a webinar title');
      return;
    }

    const webinar = {
      ...newWebinar,
      id: Date.now(),
      status: 'scheduled',
      participants: 0,
      registrations: 0,
      revenue: 0,
    };

    setWebinarData(prev => [...prev, webinar]);
    setShowCreateModal(false);
    setNewWebinar({
      title: '',
      description: '',
      date: new Date(),
      duration: 60,
      maxParticipants: 50,
      category: 'fitness',
      isPaid: false,
      price: 0,
      tags: [],
    });

    Vibration.vibrate(100);
    Alert.alert('Success! 🎉', 'Your webinar has been created and scheduled');
  };

  const handleStartWebinar = (webinar) => {
    setActiveWebinar(webinar);
    setShowLiveModal(true);
    Vibration.vibrate([100, 50, 100]);
  };

  const handleGoLive = () => {
    // Update webinar status to live
    setWebinarData(prev => prev.map(w => 
      w.id === activeWebinar.id ? { ...w, status: 'live' } : w
    ));
    setShowLiveModal(false);
    Alert.alert('🔴 You\'re Live!', 'Your webinar is now broadcasting to participants');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return COLORS.primary;
      case 'live': return COLORS.error;
      case 'completed': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return 'schedule';
      case 'live': return 'live-tv';
      case 'completed': return 'check-circle';
      default: return 'help';
    }
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const renderWebinarCard = ({ item: webinar }) => (
    <Card style={styles.webinarCard} key={webinar.id}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.statusContainer}>
            <Icon 
              name={getStatusIcon(webinar.status)} 
              size={16} 
              color={getStatusColor(webinar.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(webinar.status) }]}>
              {webinar.status.toUpperCase()}
            </Text>
          </View>
          <View style={styles.revenueContainer}>
            <Text style={styles.revenueText}>
              ${webinar.revenue.toFixed(2)}
            </Text>
          </View>
        </View>

        <Text style={styles.webinarTitle}>{webinar.title}</Text>
        <Text style={styles.webinarDescription}>{webinar.description}</Text>

        <View style={styles.webinarMeta}>
          <View style={styles.metaItem}>
            <Icon name="event" size={16} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{formatDateTime(webinar.date)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="schedule" size={16} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{webinar.duration} min</Text>
          </View>
        </View>

        <View style={styles.participantInfo}>
          <Text style={styles.participantText}>
            {webinar.registrations}/{webinar.maxParticipants} registered
          </Text>
          <ProgressBar
            progress={webinar.registrations / webinar.maxParticipants}
            color={COLORS.primary}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.tagsContainer}>
          {webinar.tags.map((tag, index) => (
            <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
              {tag}
            </Chip>
          ))}
        </View>

        <View style={styles.cardActions}>
          {webinar.status === 'scheduled' && (
            <>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('WebinarDetails', { webinar })}
                style={styles.actionButton}
              >
                Edit
              </Button>
              <Button
                mode="contained"
                onPress={() => handleStartWebinar(webinar)}
                style={styles.actionButton}
                buttonColor={COLORS.success}
              >
                Start Live
              </Button>
            </>
          )}
          {webinar.status === 'live' && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('LiveWebinar', { webinar })}
              style={styles.fullWidthButton}
              buttonColor={COLORS.error}
              icon="live-tv"
            >
              Join Live Session
            </Button>
          )}
          {webinar.status === 'completed' && (
            <>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('WebinarAnalytics', { webinar })}
                style={styles.actionButton}
              >
                Analytics
              </Button>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('WebinarRecording', { webinar })}
                style={styles.actionButton}
              >
                Recording
              </Button>
            </>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderCreateModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Webinar 🎥</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowCreateModal(false)}
            />
          </View>

          <TextInput
            label="Webinar Title"
            value={newWebinar.title}
            onChangeText={(text) => setNewWebinar(prev => ({ ...prev, title: text }))}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Description"
            value={newWebinar.description}
            onChangeText={(text) => setNewWebinar(prev => ({ ...prev, description: text }))}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Paid Webinar</Text>
            <Switch
              value={newWebinar.isPaid}
              onValueChange={(value) => setNewWebinar(prev => ({ ...prev, isPaid: value }))}
              color={COLORS.primary}
            />
          </View>

          {newWebinar.isPaid && (
            <TextInput
              label="Price ($)"
              value={newWebinar.price.toString()}
              onChangeText={(text) => setNewWebinar(prev => ({ ...prev, price: parseFloat(text) || 0 }))}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />
          )}

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
              style={styles.modalButton}
              buttonColor={COLORS.primary}
            >
              Create
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderLiveModal = () => (
    <Portal>
      <Modal
        visible={showLiveModal}
        onDismiss={() => setShowLiveModal(false)}
        contentContainerStyle={styles.liveModalContainer}
      >
        <BlurView style={styles.blurContainer} blurType="dark" blurAmount={10}>
          <View style={styles.liveModalContent}>
            <Icon name="live-tv" size={64} color={COLORS.error} />
            <Text style={styles.liveModalTitle}>Ready to go live?</Text>
            <Text style={styles.liveModalSubtitle}>
              {activeWebinar?.registrations} participants are waiting
            </Text>
            
            <View style={styles.liveActions}>
              <Button
                mode="outlined"
                onPress={() => setShowLiveModal(false)}
                style={styles.liveButton}
                textColor={COLORS.background}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleGoLive}
                style={styles.liveButton}
                buttonColor={COLORS.error}
                icon="videocam"
              >
                Go Live
              </Button>
            </View>
          </View>
        </BlurView>
      </Modal>
    </Portal>
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
        <Text style={styles.headerTitle}>Webinar Hosting 🎥</Text>
        <Text style={styles.headerSubtitle}>
          Educate and engage your community
        </Text>
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
        <Searchbar
          placeholder="Search webinars..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />

        <View style={styles.tabContainer}>
          {['upcoming', 'live', 'completed'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.activeTab
              ]}
              onPress={() => {
                setSelectedTab(tab);
                Vibration.vibrate(50);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.activeTabText
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
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
          {getFilteredWebinars().length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="video-library" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateText}>No webinars found</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first webinar to start educating your community
              </Text>
            </View>
          ) : (
            getFilteredWebinars().map(webinar => renderWebinarCard({ item: webinar }))
          )}
        </ScrollView>
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => {
          setShowCreateModal(true);
          Vibration.vibrate(100);
        }}
        color={COLORS.background}
      />

      {renderCreateModal()}
      {renderLiveModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.background,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.background,
  },
  webinarCard: {
    marginBottom: SPACING.md,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  revenueContainer: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  revenueText: {
    ...TEXT_STYLES.caption,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  webinarTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  webinarDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  webinarMeta: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  metaText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  participantInfo: {
    marginBottom: SPACING.md,
  },
  participantText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
  },
  fullWidthButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateText: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtext: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.textPrimary,
  },
  input: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  switchLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  modalButton: {
    flex: 0.48,
  },
  liveModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  liveModalContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  liveModalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.background,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  liveModalSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.background,
    opacity: 0.9,
    marginBottom: SPACING.xl,
  },
  liveActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  liveButton: {
    flex: 0.48,
  },
};

export default WebinarHostingScreen;