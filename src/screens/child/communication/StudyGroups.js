import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Vibration,
  Dimensions,
  FlatList,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Badge,
  FAB,
  Searchbar,
  Portal,
  Modal,
  TextInput,
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const StudyGroups = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, studyGroups, academics } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('my-groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupSubject, setGroupSubject] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchStudyGroups());
    } catch (error) {
      console.error('Error refreshing study groups:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleJoinGroup = (groupId) => {
    Vibration.vibrate(50);
    Alert.alert(
      '📚 Join Study Group',
      'Would you like to join this study group?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join Group', 
          onPress: () => {
            // dispatch(joinStudyGroup(groupId));
            Alert.alert('✅ Joined!', 'You\'ve successfully joined the study group!');
          }
        },
      ]
    );
  };

  const handleGroupPress = (group) => {
    Vibration.vibrate(50);
    navigation.navigate('StudyGroupDetail', { 
      groupId: group.id,
      groupName: group.name,
      subject: group.subject 
    });
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || !groupSubject || !groupDescription.trim()) {
      Alert.alert('📝 Form Incomplete', 'Please fill in all required fields.');
      return;
    }

    Vibration.vibrate(50);
    // dispatch(createStudyGroup({ name: groupName, subject: groupSubject, description: groupDescription, schedule: selectedSchedule }));
    Alert.alert('🎉 Group Created!', 'Your study group has been created successfully!');
    
    setGroupName('');
    setGroupSubject('');
    setGroupDescription('');
    setSelectedSchedule('');
    setShowCreateModal(false);
  };

  const handleStudySession = (sessionId) => {
    Vibration.vibrate(50);
    navigation.navigate('StudySession', { sessionId });
  };

  // Mock data for study groups
  const mockMyGroups = [
    {
      id: '1',
      name: 'Math Champions 🧮',
      subject: 'Mathematics',
      description: 'Helping each other with algebra and geometry homework!',
      members: 8,
      maxMembers: 10,
      nextSession: 'Today 4:00 PM',
      progress: 75,
      isActive: true,
      role: 'member',
      recentActivity: '2 new homework questions posted',
      studyStreak: 5,
    },
    {
      id: '2',
      name: 'Science Squad 🔬',
      subject: 'Science',
      description: 'Exploring physics, chemistry, and biology together!',
      members: 6,
      maxMembers: 8,
      nextSession: 'Tomorrow 3:30 PM',
      progress: 60,
      isActive: true,
      role: 'leader',
      recentActivity: 'Lab report due reminder',
      studyStreak: 12,
    },
    {
      id: '3',
      name: 'History Heroes 📜',
      subject: 'History',
      description: 'Making history fun with stories and discussions!',
      members: 5,
      maxMembers: 12,
      nextSession: 'Friday 2:00 PM',
      progress: 40,
      isActive: false,
      role: 'member',
      recentActivity: 'New timeline project assigned',
      studyStreak: 3,
    },
  ];

  const mockAvailableGroups = [
    {
      id: '4',
      name: 'English Explorers 📚',
      subject: 'English',
      description: 'Reading comprehension and creative writing practice!',
      members: 7,
      maxMembers: 10,
      meetingTime: 'Wednesdays 4:00 PM',
      rating: 4.8,
      requirements: 'Grade 6+',
      tags: ['Reading', 'Writing', 'Grammar'],
    },
    {
      id: '5',
      name: 'Code Crusaders 💻',
      subject: 'Computer Science',
      description: 'Learn programming basics and fun coding projects!',
      members: 4,
      maxMembers: 8,
      meetingTime: 'Saturdays 10:00 AM',
      rating: 4.9,
      requirements: 'Beginner friendly',
      tags: ['Programming', 'Logic', 'Projects'],
    },
    {
      id: '6',
      name: 'Art & Design Studio 🎨',
      subject: 'Art',
      description: 'Creative projects and art technique sharing!',
      members: 9,
      maxMembers: 12,
      meetingTime: 'Sundays 2:00 PM',
      rating: 4.7,
      requirements: 'All levels welcome',
      tags: ['Drawing', 'Painting', 'Digital Art'],
    },
  ];

  const upcomingSessions = [
    {
      id: '1',
      groupName: 'Math Champions',
      subject: 'Mathematics',
      topic: 'Quadratic Equations Practice',
      time: 'Today 4:00 PM',
      duration: '1 hour',
      participants: 6,
      type: 'homework-help',
      status: 'starting-soon',
    },
    {
      id: '2',
      groupName: 'Science Squad',
      subject: 'Science',
      topic: 'Chemical Reactions Lab Review',
      time: 'Tomorrow 3:30 PM',
      duration: '45 mins',
      participants: 5,
      type: 'study-session',
      status: 'scheduled',
    },
  ];

  const subjects = [
    { id: 'math', name: 'Mathematics', icon: '🧮', color: '#4CAF50' },
    { id: 'science', name: 'Science', icon: '🔬', color: '#2196F3' },
    { id: 'english', name: 'English', icon: '📚', color: '#9C27B0' },
    { id: 'history', name: 'History', icon: '📜', color: '#FF9800' },
    { id: 'art', name: 'Art', icon: '🎨', color: '#E91E63' },
    { id: 'computer', name: 'Computer Science', icon: '💻', color: '#607D8B' },
    { id: 'other', name: 'Other', icon: '📖', color: '#795548' },
  ];

  const scheduleOptions = [
    { id: 'weekday-afternoon', label: 'Weekday Afternoons' },
    { id: 'weekend-morning', label: 'Weekend Mornings' },
    { id: 'weekend-afternoon', label: 'Weekend Afternoons' },
    { id: 'flexible', label: 'Flexible Schedule' },
  ];

  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'my-groups' && styles.activeTab]}
        onPress={() => setActiveTab('my-groups')}
      >
        <MaterialIcons 
          name="group" 
          size={20} 
          color={activeTab === 'my-groups' ? COLORS.white : COLORS.textSecondary} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'my-groups' && styles.activeTabText
        ]}>
          My Groups
        </Text>
        <Badge style={styles.tabBadge} size={16}>
          {mockMyGroups.length}
        </Badge>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
        onPress={() => setActiveTab('discover')}
      >
        <MaterialIcons 
          name="explore" 
          size={20} 
          color={activeTab === 'discover' ? COLORS.white : COLORS.textSecondary} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'discover' && styles.activeTabText
        ]}>
          Discover
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'sessions' && styles.activeTab]}
        onPress={() => setActiveTab('sessions')}
      >
        <MaterialIcons 
          name="schedule" 
          size={20} 
          color={activeTab === 'sessions' ? COLORS.white : COLORS.textSecondary} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'sessions' && styles.activeTabText
        ]}>
          Sessions
        </Text>
        {upcomingSessions.filter(s => s.status === 'starting-soon').length > 0 && (
          <Badge style={styles.tabBadge} size={16}>
            {upcomingSessions.filter(s => s.status === 'starting-soon').length}
          </Badge>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderMyGroupCard = (group) => (
    <TouchableOpacity
      key={group.id}
      onPress={() => handleGroupPress(group)}
      activeOpacity={0.7}
    >
      <Card style={[
        styles.groupCard,
        group.isActive && styles.activeGroup
      ]}>
        <Card.Content style={styles.groupContent}>
          <View style={styles.groupHeader}>
            <View style={styles.groupInfo}>
              <Text style={[TEXT_STYLES.h4, styles.groupName]}>
                {group.name}
              </Text>
              <View style={styles.groupMeta}>
                <Chip style={styles.subjectChip} textStyle={styles.subjectChipText}>
                  {group.subject}
                </Chip>
                {group.role === 'leader' && (
                  <Chip style={styles.leaderChip} textStyle={styles.leaderChipText}>
                    👑 Leader
                  </Chip>
                )}
              </View>
            </View>
            
            <View style={styles.groupStats}>
              <Text style={[TEXT_STYLES.caption, styles.memberCount]}>
                {group.members}/{group.maxMembers} members
              </Text>
              <View style={styles.streakContainer}>
                <MaterialIcons name="local-fire-department" size={16} color="#FF6B6B" />
                <Text style={[TEXT_STYLES.caption, styles.streakText]}>
                  {group.studyStreak} day streak
                </Text>
              </View>
            </View>
          </View>

          <Text style={[TEXT_STYLES.body, styles.groupDescription]}>
            {group.description}
          </Text>

          <View style={styles.progressContainer}>
            <Text style={[TEXT_STYLES.caption, styles.progressLabel]}>
              Weekly Goal Progress
            </Text>
            <ProgressBar 
              progress={group.progress / 100} 
              color={COLORS.success}
              style={styles.progressBar}
            />
            <Text style={[TEXT_STYLES.caption, styles.progressText]}>
              {group.progress}% completed
            </Text>
          </View>

          <View style={styles.groupFooter}>
            <View style={styles.activityInfo}>
              <MaterialIcons name="schedule" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, styles.nextSession]}>
                {group.nextSession}
              </Text>
            </View>
            <Text style={[TEXT_STYLES.caption, styles.recentActivity]}>
              📝 {group.recentActivity}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderAvailableGroupCard = (group) => (
    <Card key={group.id} style={styles.availableGroupCard}>
      <Card.Content style={styles.availableGroupContent}>
        <View style={styles.availableGroupHeader}>
          <Text style={[TEXT_STYLES.h4, styles.availableGroupName]}>
            {group.name}
          </Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={[TEXT_STYLES.caption, styles.rating]}>
              {group.rating}
            </Text>
          </View>
        </View>

        <View style={styles.availableGroupMeta}>
          <Chip style={styles.subjectChip} textStyle={styles.subjectChipText}>
            {group.subject}
          </Chip>
          <Text style={[TEXT_STYLES.caption, styles.requirements]}>
            {group.requirements}
          </Text>
        </View>

        <Text style={[TEXT_STYLES.body, styles.availableGroupDescription]}>
          {group.description}
        </Text>

        <View style={styles.tagsContainer}>
          {group.tags.map((tag, index) => (
            <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
              {tag}
            </Chip>
          ))}
        </View>

        <View style={styles.availableGroupFooter}>
          <View style={styles.groupDetails}>
            <Text style={[TEXT_STYLES.caption, styles.meetingTime]}>
              📅 {group.meetingTime}
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.memberInfo]}>
              👥 {group.members}/{group.maxMembers} members
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={() => handleJoinGroup(group.id)}
            style={styles.joinButton}
            labelStyle={styles.joinButtonText}
            disabled={group.members >= group.maxMembers}
          >
            {group.members >= group.maxMembers ? 'Full' : 'Join'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderSessionCard = (session) => (
    <TouchableOpacity
      key={session.id}
      onPress={() => handleStudySession(session.id)}
      activeOpacity={0.7}
    >
      <Card style={[
        styles.sessionCard,
        session.status === 'starting-soon' && styles.urgentSession
      ]}>
        <Card.Content style={styles.sessionContent}>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionInfo}>
              <Text style={[TEXT_STYLES.h4, styles.sessionTitle]}>
                {session.topic}
              </Text>
              <Text style={[TEXT_STYLES.body, styles.sessionGroup]}>
                {session.groupName} • {session.subject}
              </Text>
            </View>
            {session.status === 'starting-soon' && (
              <Chip style={styles.urgentChip} textStyle={styles.urgentChipText}>
                Starting Soon! 🔥
              </Chip>
            )}
          </View>

          <View style={styles.sessionDetails}>
            <View style={styles.sessionTime}>
              <MaterialIcons name="access-time" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, styles.timeText]}>
                {session.time} • {session.duration}
              </Text>
            </View>
            <View style={styles.sessionParticipants}>
              <MaterialIcons name="people" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, styles.participantText]}>
                {session.participants} joining
              </Text>
            </View>
          </View>

          <View style={styles.sessionTypeContainer}>
            <Chip 
              style={[
                styles.typeChip,
                session.type === 'homework-help' && styles.homeworkChip,
                session.type === 'study-session' && styles.studyChip
              ]} 
              textStyle={styles.typeChipText}
            >
              {session.type === 'homework-help' ? '📚 Homework Help' : '🎯 Study Session'}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'my-groups':
        return (
          <View style={styles.tabContent}>
            {mockMyGroups.length > 0 ? (
              <View style={styles.myGroupsList}>
                {mockMyGroups.map(renderMyGroupCard)}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="group-add" size={80} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
                  Join Your First Study Group! 📚
                </Text>
                <Text style={[TEXT_STYLES.body, styles.emptyMessage]}>
                  Connect with teammates to study together and improve your grades!
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setActiveTab('discover')}
                  style={styles.discoverButton}
                >
                  Discover Groups
                </Button>
              </View>
            )}
          </View>
        );
      
      case 'discover':
        return (
          <View style={styles.tabContent}>
            <Searchbar
              placeholder="Search study groups..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              Available Study Groups 🌟
            </Text>
            <Text style={[TEXT_STYLES.body, styles.sectionSubtitle]}>
              Find the perfect study group to boost your grades!
            </Text>
            {mockAvailableGroups.map(renderAvailableGroupCard)}
          </View>
        );
      
      case 'sessions':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              Upcoming Study Sessions 📅
            </Text>
            <Text style={[TEXT_STYLES.body, styles.sectionSubtitle]}>
              Don't miss your scheduled study sessions!
            </Text>
            {upcomingSessions.map(renderSessionCard)}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
            Study Groups 📚
          </Text>
          <IconButton
            icon="help-circle"
            size={24}
            iconColor={COLORS.white}
            onPress={() => Alert.alert('📖 Study Groups', 'Join study groups to collaborate with teammates, get homework help, and improve your grades together!')}
            style={styles.helpButton}
          />
        </View>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Learn together, grow together! 🌱
        </Text>
      </LinearGradient>

      {renderTabBar()}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
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
          {renderContent()}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        color={COLORS.white}
      />

      {/* Create Group Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
            Create Study Group 📚
          </Text>
          
          <TextInput
            mode="outlined"
            label="Group Name *"
            placeholder="e.g., Math Champions"
            value={groupName}
            onChangeText={setGroupName}
            style={styles.modalInput}
            activeOutlineColor={COLORS.primary}
          />

          <Text style={[TEXT_STYLES.body, styles.fieldLabel]}>
            Subject *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectSelector}>
            {subjects.map((subject) => (
              <Chip
                key={subject.id}
                selected={groupSubject === subject.id}
                onPress={() => setGroupSubject(subject.id)}
                style={[
                  styles.subjectOption,
                  groupSubject === subject.id && { backgroundColor: subject.color + '40' }
                ]}
                textStyle={[
                  styles.subjectOptionText,
                  groupSubject === subject.id && { color: subject.color, fontWeight: 'bold' }
                ]}
              >
                {subject.icon} {subject.name}
              </Chip>
            ))}
          </ScrollView>
          
          <TextInput
            mode="outlined"
            label="Description *"
            placeholder="What will your group study together?"
            value={groupDescription}
            onChangeText={setGroupDescription}
            multiline
            numberOfLines={3}
            style={styles.modalInput}
            activeOutlineColor={COLORS.primary}
          />

          <Text style={[TEXT_STYLES.body, styles.fieldLabel]}>
            Preferred Meeting Time
          </Text>
          <View style={styles.scheduleSelector}>
            {scheduleOptions.map((option) => (
              <Chip
                key={option.id}
                selected={selectedSchedule === option.id}
                onPress={() => setSelectedSchedule(option.id)}
                style={[
                  styles.scheduleOption,
                  selectedSchedule === option.id && styles.selectedSchedule
                ]}
                textStyle={[
                  styles.scheduleOptionText,
                  selectedSchedule === option.id && styles.selectedScheduleText
                ]}
              >
                {option.label}
              </Chip>
            ))}
          </View>
          
          <View style={styles.modalActions}>
            <Button 
              mode="text" 
              onPress={() => setShowCreateModal(false)}
              textColor={COLORS.textSecondary}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCreateGroup}
              disabled={!groupName.trim() || !groupSubject || !groupDescription.trim()}
              style={styles.createButton}
            >
              Create Group 🚀
            </Button>
          </View>
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.white + 'CC',
    fontSize: 14,
  },
  helpButton: {
    margin: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  tabBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: COLORS.error,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
  },
  myGroupsList: {
    gap: SPACING.md,
  },
  groupCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activeGroup: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  groupContent: {
    paddingVertical: SPACING.md,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  groupInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  groupName: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  groupMeta: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  subjectChip: {
    backgroundColor: COLORS.primary + '20',
    height: 28,
  },
  subjectChipText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  leaderChip: {
    backgroundColor: '#FFD700' + '20',
    height: 28,
  },
  leaderChipText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  groupStats: {
    alignItems: 'flex-end',
  },
  memberCount: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  groupDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressLabel: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  progressText: {
    color: COLORS.success,
    fontWeight: '600',
    textAlign: 'right',
  },
  groupFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    paddingTop: SPACING.sm,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  nextSession: {
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  recentActivity: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  availableGroupCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 16,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  availableGroupContent: {
    paddingVertical: SPACING.md,
  },
  availableGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  availableGroupName: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  availableGroupMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  requirements: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  availableGroupDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tagChip: {
    backgroundColor: COLORS.surface,
    height: 28,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  availableGroupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    paddingTop: SPACING.sm,
  },
  groupDetails: {
    flex: 1,
  },
  meetingTime: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  memberInfo: {
    color: COLORS.textSecondary,
  },
  joinButton: {
    borderRadius: 20,
    marginLeft: SPACING.md,
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 16,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  urgentSession: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  sessionContent: {
    paddingVertical: SPACING.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  sessionInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  sessionTitle: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sessionGroup: {
    color: COLORS.textSecondary,
  },
  urgentChip: {
    backgroundColor: '#FF6B6B' + '20',
    height: 28,
  },
  urgentChipText: {
    fontSize: 11,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  sessionParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantText: {
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  sessionTypeContainer: {
    alignItems: 'flex-start',
  },
  typeChip: {
    height: 32,
  },
  homeworkChip: {
    backgroundColor: '#4CAF50' + '20',
  },
  studyChip: {
    backgroundColor: '#2196F3' + '20',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    textAlign: 'center',
    marginVertical: SPACING.md,
    color: COLORS.textPrimary,
  },
  emptyMessage: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    lineHeight: 22,
  },
  discoverButton: {
    borderRadius: 25,
    paddingHorizontal: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: 20,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  modalInput: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  fieldLabel: {
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subjectSelector: {
    marginBottom: SPACING.md,
  },
  subjectOption: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    height: 36,
  },
  subjectOptionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  scheduleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  scheduleOption: {
    backgroundColor: COLORS.surface,
    height: 36,
  },
  selectedSchedule: {
    backgroundColor: COLORS.primary + '20',
  },
  scheduleOptionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectedScheduleText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  createButton: {
    borderRadius: 25,
    paddingHorizontal: SPACING.lg,
  },
  bottomPadding: {
    height: 100,
  },
});

export default StudyGroups;
