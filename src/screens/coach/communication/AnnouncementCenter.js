import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  Animated,
  StatusBar,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Searchbar,
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const AnnouncementCenter = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, teams, players } = useSelector(state => state.user);
  const [announcements, setAnnouncements] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [priority, setPriority] = useState('normal');
  const [scheduleDate, setScheduleDate] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data - replace with actual API calls
  const mockAnnouncements = [
    {
      id: 1,
      title: 'Training Session Update',
      message: 'Tomorrow\'s training session has been moved to 4:00 PM due to field maintenance. Please arrive 15 minutes early for warm-up. 💪',
      priority: 'high',
      recipients: ['Team Alpha', 'Team Beta'],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      readCount: 12,
      totalRecipients: 24,
      status: 'sent',
      type: 'training'
    },
    {
      id: 2,
      title: 'Match Day Reminder',
      message: 'Don\'t forget about Saturday\'s match against City United at 10:00 AM. Meet at the club by 9:00 AM. Bring water bottles and shin guards! ⚽',
      priority: 'normal',
      recipients: ['Team Alpha'],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      readCount: 8,
      totalRecipients: 12,
      status: 'sent',
      type: 'match'
    },
    {
      id: 3,
      title: 'Equipment Collection',
      message: 'New team jerseys have arrived! Please collect them from the equipment room this week during regular training hours.',
      priority: 'low',
      recipients: ['All Teams'],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      readCount: 18,
      totalRecipients: 36,
      status: 'sent',
      type: 'equipment'
    },
    {
      id: 4,
      title: 'Parent Meeting',
      message: 'Monthly parent meeting scheduled for next Friday at 7:00 PM in the clubhouse. We\'ll discuss upcoming tournaments and fundraising activities.',
      priority: 'normal',
      recipients: ['Parents Group'],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      readCount: 22,
      totalRecipients: 28,
      status: 'scheduled',
      type: 'meeting'
    }
  ];

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnnouncements(mockAnnouncements);
      
      // Animate screen entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      Alert.alert('Error', 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeScreen();
    setRefreshing(false);
  }, [initializeScreen]);

  const getFilteredAnnouncements = () => {
    let filtered = announcements;
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => item.type === selectedFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'low': return COLORS.success;
      default: return COLORS.primary;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'training': return 'fitness-center';
      case 'match': return 'sports-soccer';
      case 'equipment': return 'inventory';
      case 'meeting': return 'group';
      default: return 'announcement';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleCreateAnnouncement = () => {
    if (!announcementTitle.trim() || !announcementText.trim()) {
      Alert.alert('Error', 'Please enter both title and message');
      return;
    }
    
    if (selectedTeams.length === 0 && selectedPlayers.length === 0) {
      Alert.alert('Error', 'Please select at least one recipient');
      return;
    }

    Alert.alert(
      'Create Announcement',
      'This feature is under development. Your announcement will be sent once the backend is ready!',
      [{ text: 'OK' }]
    );
    
    setShowCreateModal(false);
    resetCreateForm();
  };

  const resetCreateForm = () => {
    setAnnouncementTitle('');
    setAnnouncementText('');
    setSelectedTeams([]);
    setSelectedPlayers([]);
    setPriority('normal');
    setScheduleDate(null);
  };

  const renderAnnouncementCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card style={styles.announcementCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Surface style={[styles.typeIcon, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
              <Icon name={getTypeIcon(item.type)} size={24} color={getPriorityColor(item.priority)} />
            </Surface>
            <View style={styles.headerText}>
              <Text style={styles.announcementTitle}>{item.title}</Text>
              <View style={styles.metaRow}>
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.priorityChip, { borderColor: getPriorityColor(item.priority) }]}
                  textStyle={{ color: getPriorityColor(item.priority), fontSize: 10 }}
                >
                  {item.priority.toUpperCase()}
                </Chip>
                <Text style={styles.timeAgo}>{formatTimeAgo(item.createdAt)}</Text>
              </View>
            </View>
          </View>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => Alert.alert('Options', 'Edit/Delete options coming soon!')}
          />
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.announcementMessage}>{item.message}</Text>
          
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientLabel}>Recipients:</Text>
            <View style={styles.recipientTags}>
              {item.recipients.map((recipient, idx) => (
                <Chip key={idx} compact style={styles.recipientChip}>
                  {recipient}
                </Chip>
              ))}
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="visibility" size={16} color={COLORS.secondary} />
              <Text style={styles.statText}>
                {item.readCount}/{item.totalRecipients} read
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="send" size={16} color={COLORS.secondary} />
              <Text style={styles.statText}>{item.status}</Text>
            </View>
          </View>
          
          <ProgressBar
            progress={item.readCount / item.totalRecipients}
            color={COLORS.primary}
            style={styles.progressBar}
          />
        </View>
      </Card>
    </Animated.View>
  );

  const renderCreateModal = () => (
    <Portal>
      <Modal visible={showCreateModal} animationType="slide">
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <IconButton
                icon="close"
                iconColor="white"
                onPress={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
              />
              <Text style={styles.modalTitle}>Create Announcement</Text>
              <Button
                mode="text"
                textColor="white"
                onPress={handleCreateAnnouncement}
                disabled={!announcementTitle.trim() || !announcementText.trim()}
              >
                Send
              </Button>
            </View>
          </LinearGradient>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Title</Text>
              <TextInput
                style={styles.titleInput}
                value={announcementTitle}
                onChangeText={setAnnouncementTitle}
                placeholder="Enter announcement title..."
                placeholderTextColor={COLORS.secondary}
              />
            </View>
            
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Priority Level</Text>
              <View style={styles.priorityRow}>
                {['low', 'normal', 'high'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.priorityButton,
                      priority === level && { backgroundColor: getPriorityColor(level) + '20' }
                    ]}
                    onPress={() => setPriority(level)}
                  >
                    <Text style={[
                      styles.priorityText,
                      priority === level && { color: getPriorityColor(level) }
                    ]}>
                      {level.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Message</Text>
              <TextInput
                style={styles.messageInput}
                value={announcementText}
                onChangeText={setAnnouncementText}
                placeholder="Type your message here..."
                placeholderTextColor={COLORS.secondary}
                multiline
                numberOfLines={6}
              />
            </View>
            
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Recipients</Text>
              <Text style={styles.sectionHint}>Select teams or individual players</Text>
              
              <TouchableOpacity
                style={styles.recipientSelector}
                onPress={() => Alert.alert('Feature Coming Soon', 'Team and player selection interface is under development!')}
              >
                <Icon name="group-add" size={24} color={COLORS.primary} />
                <Text style={styles.selectorText}>
                  {selectedTeams.length + selectedPlayers.length > 0 
                    ? `${selectedTeams.length + selectedPlayers.length} selected`
                    : 'Select Recipients'
                  }
                </Text>
                <Icon name="arrow-forward-ios" size={16} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'view-list' },
    { key: 'training', label: 'Training', icon: 'fitness-center' },
    { key: 'match', label: 'Matches', icon: 'sports-soccer' },
    { key: 'equipment', label: 'Equipment', icon: 'inventory' },
    { key: 'meeting', label: 'Meetings', icon: 'group' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingHeader}>
          <Text style={styles.loadingTitle}>Loading Announcements...</Text>
        </LinearGradient>
        <View style={styles.loadingContent}>
          {[1, 2, 3].map((_, index) => (
            <Card key={index} style={styles.skeletonCard}>
              <View style={styles.skeletonHeader} />
              <View style={styles.skeletonContent} />
              <View style={styles.skeletonFooter} />
            </Card>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Announcement Center 📢</Text>
            <Text style={styles.headerSubtitle}>
              Keep your teams informed and engaged
            </Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{announcements.length}</Text>
              <Text style={styles.statLabel}>Total Sent</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {announcements.filter(a => a.status === 'sent').length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {Math.round(announcements.reduce((acc, a) => acc + (a.readCount / a.totalRecipients), 0) / announcements.length * 100) || 0}%
              </Text>
              <Text style={styles.statLabel}>Read Rate</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search announcements..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterChip,
              selectedFilter === option.key && styles.activeFilterChip
            ]}
            onPress={() => setSelectedFilter(option.key)}
          >
            <Icon
              name={option.icon}
              size={18}
              color={selectedFilter === option.key ? 'white' : COLORS.primary}
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === option.key && styles.activeFilterText
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <FlatList
        data={getFilteredAnnouncements()}
        renderItem={renderAnnouncementCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="campaign" size={64} color={COLORS.secondary} />
            <Text style={styles.emptyTitle}>No Announcements</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'No announcements match your search' : 'Create your first announcement to get started'}
            </Text>
          </View>
        }
      />
      
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setShowCreateModal(true)}
        color="white"
      />
      
      {renderCreateModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingHeader: {
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    textAlign: 'center',
  },
  loadingContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  skeletonCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  skeletonHeader: {
    height: 20,
    backgroundColor: COLORS.secondary + '20',
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  skeletonContent: {
    height: 60,
    backgroundColor: COLORS.secondary + '20',
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  skeletonFooter: {
    height: 16,
    width: '60%',
    backgroundColor: COLORS.secondary + '20',
    borderRadius: 4,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    minWidth: 80,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
    opacity: 0.8,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 2,
    borderRadius: 12,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterScroll: {
    marginTop: SPACING.md,
  },
  filterContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'white',
    gap: SPACING.xs,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  listContainer: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  announcementCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  announcementTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  priorityChip: {
    height: 24,
  },
  timeAgo: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  cardContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  announcementMessage: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  recipientInfo: {
    marginBottom: SPACING.md,
  },
  recipientLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  recipientTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  recipientChip: {
    height: 28,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h2,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    paddingTop: 50,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputSection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  sectionHint: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  titleInput: {
    ...TEXT_STYLES.body,
    borderWidth: 1,
    borderColor: COLORS.secondary + '40',
    borderRadius: 12,
    padding: SPACING.md,
    backgroundColor: 'white',
  },
  messageInput: {
    ...TEXT_STYLES.body,
    borderWidth: 1,
    borderColor: COLORS.secondary + '40',
    borderRadius: 12,
    padding: SPACING.md,
    backgroundColor: 'white',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary + '40',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  priorityText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  recipientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.secondary + '40',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  selectorText: {
    ...TEXT_STYLES.body,
    flex: 1,
    marginLeft: SPACING.sm,
  },
};

export default AnnouncementCenter;