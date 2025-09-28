import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  Animated,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Vibration
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
  Searchbar
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#10B981',
  error: '#EF4444',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB'
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary }
};

const { width, height } = Dimensions.get('window');

const AICoachingAssistantScreen = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('football');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('youth');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Redux state (assuming coaching slice exists)
  const user = useSelector(state => state.auth.user);
  const isLoading = useSelector(state => state.coaching.isLoading);
  const dispatch = useDispatch();

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI Coaching Assistant. I can help you create training plans, analyze player performance, suggest improvements, and answer coaching questions. What would you like to work on today?",
      timestamp: new Date(Date.now() - 5000)
    }
  ]);

  // Quick actions data
  const quickActions = [
    { id: 1, title: 'Generate Training Plan', icon: 'event', color: '#3B82F6', gradient: ['#3B82F6', '#1E40AF'] },
    { id: 2, title: 'Analyze Performance', icon: 'trending-up', color: '#10B981', gradient: ['#10B981', '#059669'] },
    { id: 3, title: 'Team Formation', icon: 'group', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
    { id: 4, title: 'Drill Suggestions', icon: 'sports-soccer', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] }
  ];

  const recentInsights = [
    { id: 1, title: 'Player Recovery Analysis', subtitle: 'Based on last week\'s data', time: '2h ago', icon: 'healing' },
    { id: 2, title: 'Training Load Optimization', subtitle: 'For upcoming match', time: '4h ago', icon: 'fitness-center' },
    { id: 3, title: 'Skill Development Plan', subtitle: 'Youth team recommendations', time: '1d ago', icon: 'school' }
  ];

  const sports = ['football', 'basketball', 'tennis', 'volleyball'];
  const ageGroups = [
    { value: 'youth', label: 'Youth (8-14)' },
    { value: 'junior', label: 'Junior (15-18)' },
    { value: 'adult', label: 'Adult (18+)' },
    { value: 'senior', label: 'Senior (35+)' }
  ];

  // Animation effects
  useEffect(() => {
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

  // Refresh control
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!message.trim()) return;

    Vibration.vibrate(50);
    
    const newMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response with animation
    setTimeout(() => {
      const aiResponse = {
        id: chatMessages.length + 2,
        type: 'ai',
        content: generateAIResponse(message),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  }, [message, chatMessages.length]);

  const generateAIResponse = useCallback((userMessage) => {
    const responses = [
      "I'd be happy to help you with that! Based on your requirements, I can create a customized training plan that focuses on specific skills and fitness components.",
      "Great question! Let me analyze the performance data and provide you with actionable insights to improve your team's performance.",
      "I can suggest several drills that would be perfect for your players' current skill level and training objectives.",
      "Based on best practices and recent sports science research, here are my recommendations for your training program."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }, []);

  const handleQuickAction = useCallback((action) => {
    Vibration.vibrate(100);
    
    const actionMessages = {
      'Generate Training Plan': `Please generate a ${selectedSport} training plan for ${selectedAgeGroup} players, focusing on skill development and fitness.`,
      'Analyze Performance': 'Can you analyze the recent performance data and provide insights on areas for improvement?',
      'Team Formation': 'Help me create an optimal team formation based on player strengths and match strategy.',
      'Drill Suggestions': 'Suggest effective drills for improving ball control and passing accuracy.'
    };

    const actionMessage = actionMessages[action.title];
    if (actionMessage) {
      setMessage(actionMessage);
      setActiveTab('chat');
    }
  }, [selectedSport, selectedAgeGroup]);

  // Tab content renderers
  const renderChatTab = () => (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Chat Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.chatHeader}>
        <View style={styles.chatHeaderContent}>
          <Avatar.Icon
            size={40}
            icon="psychology"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
          <View style={styles.chatHeaderText}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>AI Coach Assistant</Text>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Online</Text>
            </View>
          </View>
        </View>
        <IconButton icon="dots-vertical" iconColor="white" onPress={() => Alert.alert('Options', 'Feature coming soon!')} />
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {chatMessages.map((msg, index) => (
          <Animated.View
            key={msg.id}
            style={[
              styles.messageWrapper,
              msg.type === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Surface style={[
              styles.messageContent,
              msg.type === 'user' ? styles.userMessage : styles.aiMessage
            ]}>
              <Text style={[
                TEXT_STYLES.body,
                { color: msg.type === 'user' ? 'white' : COLORS.text, fontSize: 14 }
              ]}>
                {msg.content}
              </Text>
              <Text style={[
                TEXT_STYLES.caption,
                { 
                  color: msg.type === 'user' ? 'rgba(255,255,255,0.7)' : COLORS.textSecondary,
                  marginTop: SPACING.xs 
                }
              ]}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Surface>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Sport and Age Group Selectors */}
      <Surface style={styles.selectorsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          {sports.map((sport) => (
            <Chip
              key={sport}
              selected={selectedSport === sport}
              onPress={() => setSelectedSport(sport)}
              style={[styles.chip, selectedSport === sport && { backgroundColor: COLORS.primary }]}
              textStyle={{ color: selectedSport === sport ? 'white' : COLORS.text }}
            >
              {sport.charAt(0).toUpperCase() + sport.slice(1)}
            </Chip>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          {ageGroups.map((group) => (
            <Chip
              key={group.value}
              selected={selectedAgeGroup === group.value}
              onPress={() => setSelectedAgeGroup(group.value)}
              style={[styles.chip, selectedAgeGroup === group.value && { backgroundColor: COLORS.primary }]}
              textStyle={{ color: selectedAgeGroup === group.value ? 'white' : COLORS.text }}
            >
              {group.label}
            </Chip>
          ))}
        </ScrollView>
      </Surface>

      {/* Message Input */}
      <Surface style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <IconButton
            icon="attach-file"
            mode="contained-tonal"
            onPress={() => Alert.alert('File Upload', 'Feature coming soon!')}
          />
          
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Ask me anything about coaching..."
            multiline
            maxLength={500}
          />
          
          <IconButton
            icon="mic"
            mode={isRecording ? "contained" : "contained-tonal"}
            iconColor={isRecording ? "white" : COLORS.primary}
            containerColor={isRecording ? COLORS.error : undefined}
            onPress={() => {
              setIsRecording(!isRecording);
              Vibration.vibrate(100);
            }}
          />
          
          <IconButton
            icon="send"
            mode="contained"
            iconColor="white"
            containerColor={COLORS.primary}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          />
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );

  const renderQuickActionsTab = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={styles.sectionHeader}>
        <Text style={TEXT_STYLES.h2}>Quick Actions</Text>
        <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
          Get instant AI assistance for common coaching tasks
        </Text>
      </View>

      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionCard}
            onPress={() => handleQuickAction(action)}
            activeOpacity={0.8}
          >
            <Card style={styles.actionCard}>
              <Card.Content style={styles.actionCardContent}>
                <LinearGradient
                  colors={action.gradient}
                  style={styles.actionIcon}
                >
                  <Icon name={action.icon} size={24} color="white" />
                </LinearGradient>
                <View style={styles.actionText}>
                  <Text style={[TEXT_STYLES.h3, { fontSize: 16 }]}>{action.title}</Text>
                  <Text style={[TEXT_STYLES.caption, { marginTop: 2 }]}>AI-powered assistance</Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Smart Suggestions */}
      <LinearGradient
        colors={['#EBF4FF', '#DDD6FE']}
        style={styles.suggestionsContainer}
      >
        <View style={styles.suggestionsHeader}>
          <Icon name="flash-on" size={20} color="#F59E0B" />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>Smart Suggestions</Text>
        </View>
        
        <View style={styles.suggestionsList}>
          <Surface style={styles.suggestionItem}>
            <View style={styles.suggestionContent}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>Optimize Training Load</Text>
              <Text style={TEXT_STYLES.caption}>Based on recent performance data</Text>
            </View>
            <Button mode="text" textColor={COLORS.primary} onPress={() => Alert.alert('Applied!', 'Training load optimized')}>
              Apply
            </Button>
          </Surface>
          
          <Surface style={styles.suggestionItem}>
            <View style={styles.suggestionContent}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>Injury Prevention Plan</Text>
              <Text style={TEXT_STYLES.caption}>Custom exercises for your team</Text>
            </View>
            <Button mode="text" textColor={COLORS.primary} onPress={() => Alert.alert('Applied!', 'Prevention plan activated')}>
              Apply
            </Button>
          </Surface>
        </View>
      </LinearGradient>
    </ScrollView>
  );

  const renderInsightsTab = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={styles.sectionHeader}>
        <Text style={TEXT_STYLES.h2}>AI Insights</Text>
        <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
          Recent analysis and recommendations
        </Text>
      </View>

      {/* Recent Insights */}
      <View style={styles.insightsList}>
        {recentInsights.map((insight) => (
          <Card key={insight.id} style={styles.insightCard}>
            <Card.Content style={styles.insightContent}>
              <View style={styles.insightMain}>
                <Icon name={insight.icon} size={24} color={COLORS.primary} style={styles.insightIcon} />
                <View style={styles.insightText}>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>{insight.title}</Text>
                  <Text style={[TEXT_STYLES.caption, { marginTop: 2 }]}>{insight.subtitle}</Text>
                  <View style={styles.insightMeta}>
                    <Icon name="access-time" size={12} color={COLORS.textSecondary} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>{insight.time}</Text>
                    <Icon name="psychology" size={12} color={COLORS.textSecondary} style={{ marginLeft: SPACING.md }} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>AI Generated</Text>
                  </View>
                </View>
              </View>
              <IconButton icon="dots-vertical" size={16} />
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Performance Cards */}
      <View style={styles.performanceGrid}>
        <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>Performance Trends</Text>
            <Icon name="trending-up" size={20} color={COLORS.success} />
          </View>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.success, marginBottom: 4 }]}>+12%</Text>
          <Text style={TEXT_STYLES.caption}>Average improvement this month</Text>
        </LinearGradient>

        <LinearGradient colors={['#EBF8FF', '#DBEAFE']} style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>Training Efficiency</Text>
            <Icon name="jump-rope" size={20} color={COLORS.primary} />
          </View>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.primary, marginBottom: 4 }]}>87%</Text>
          <Text style={TEXT_STYLES.caption}>Session completion rate</Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>AI Coaching Assistant</Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginTop: 2 }]}>
              Powered by advanced sports AI
            </Text>
          </View>
          <Button
            mode="contained-tonal"
            icon="add"
            onPress={() => Alert.alert('New Session', 'Feature coming soon!')}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            labelStyle={{ color: 'white' }}
          >
            New Session
          </Button>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <Surface style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { id: 'chat', label: 'AI Chat', icon: 'chat' },
            { id: 'actions', label: 'Quick Actions', icon: 'flash-on' },
            { id: 'insights', label: 'Insights', icon: 'psychology' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => {
                setActiveTab(tab.id);
                Vibration.vibrate(50);
              }}
            >
              <Icon 
                name={tab.icon} 
                size={20} 
                color={activeTab === tab.id ? COLORS.primary : COLORS.textSecondary} 
              />
              <Text style={[
                TEXT_STYLES.body,
                {
                  color: activeTab === tab.id ? COLORS.primary : COLORS.textSecondary,
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  marginLeft: SPACING.xs
                }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Surface>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'actions' && renderQuickActionsTab()}
        {activeTab === 'insights' && renderInsightsTab()}
      </View>

      {/* Floating Action Button */}
      <FAB
        icon="psychology"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => setIsModalVisible(true)}
      />

      {/* Modal for additional actions */}
      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={() => setIsModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={TEXT_STYLES.h2}>AI Assistant Options</Text>
          <View style={styles.modalButtons}>
            <Button mode="contained" onPress={() => setIsModalVisible(false)}>
              Close
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = {
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  tabContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabContent: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
  },
  // Chat styles
  chatHeader: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatHeaderText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: SPACING.xs,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesContent: {
    padding: SPACING.md,
  },
  messageWrapper: {
    marginBottom: SPACING.md,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageContent: {
    maxWidth: width * 0.75,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: COLORS.primary,
  },
  aiMessage: {
    backgroundColor: COLORS.surface,
  },
  selectorsContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  chipsContainer: {
    marginBottom: SPACING.sm,
  },
  chip: {
    marginRight: SPACING.sm,
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.sm,
    maxHeight: 100,
    backgroundColor: COLORS.background,
  },
  // Quick Actions styles
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  quickActionCard: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  actionCard: {
    elevation: 3,
    backgroundColor: COLORS.surface,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  actionText: {
    flex: 1,
  },
  suggestionsContainer: {
    borderRadius: 16,
    padding: SPACING.lg,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  suggestionsList: {
    gap: SPACING.md,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 1,
  },
  suggestionContent: {
    flex: 1,
  },
  // Insights styles
  insightsList: {
    marginBottom: SPACING.xl,
  },
  insightCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    backgroundColor: COLORS.surface,
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  insightMain: {
    flexDirection: 'row',
    flex: 1,
  },
  insightIcon: {
    marginRight: SPACING.md,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
  },
  insightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceCard: {
    width: '48%',
    padding: SPACING.md,
    borderRadius: 16,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    margin: SPACING.xl,
    borderRadius: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
  },
};

export default AICoachingAssistantScreen;