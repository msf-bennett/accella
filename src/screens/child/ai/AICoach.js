import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  Vibration,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const AICoach = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [pulseAnim] = useState(new Animated.Value(1));
  const scrollViewRef = useRef();

  // Redux state
  const { user, isLoading } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // Chat messages state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hey there, superstar! 🌟 I'm your AI Coach and I'm SO excited to help you become the best athlete you can be!",
      sender: 'ai',
      timestamp: new Date(Date.now() - 60000),
      emoji: '🤖'
    },
    {
      id: 2,
      text: "What sport are you most excited about today? I have some amazing training tips just for you! 🏆",
      sender: 'ai',
      timestamp: new Date(Date.now() - 30000),
      emoji: '⚡'
    }
  ]);

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleQuickAction = useCallback((action) => {
    Vibration.vibrate(30);
    
    const responses = {
      motivation: "You're doing AMAZING! 🌟 Remember, every champion started as a beginner. Keep pushing yourself and you'll reach your goals! 💪",
      tips: "🏆 Pro Tip: Practice makes progress, not perfection! Focus on improving just 1% each day and you'll be unstoppable! ⚡",
      goals: "🎯 Let's set some exciting goals together! What's one thing you want to get better at this week? I'll help you make it happen! 🚀",
      celebrate: "🎉 CELEBRATION TIME! You've been working so hard and it shows! Give yourself a high-five - you've earned it! ✋"
    };

    const newMessage = {
      id: chatMessages.length + 1,
      text: responses[action],
      sender: 'ai',
      timestamp: new Date(),
      emoji: ['🤖', '⚡', '🌟', '🏆'][Math.floor(Math.random() * 4)]
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatVisible(true);
  }, [chatMessages]);

  const handleSendMessage = useCallback(() => {
    if (!chatMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: chatMessages.length + 1,
      text: chatMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    // Generate AI response
    const aiResponses = [
      "That's so cool! 🌟 Tell me more about that!",
      "You're such a smart athlete! 🧠 I love how you think!",
      "Awesome question! 🤔 Here's what I think...",
      "You're going to be AMAZING at that! 💪 Let's work on it together!",
      "I'm so proud of you for asking! 🏆 Learning is what champions do!"
    ];

    const aiMessage = {
      id: chatMessages.length + 2,
      text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      sender: 'ai',
      timestamp: new Date(),
      emoji: ['🤖', '⚡', '🌟', '🏆'][Math.floor(Math.random() * 4)]
    };

    setChatMessages(prev => [...prev, userMessage, aiMessage]);
    setChatMessage('');
    Vibration.vibrate(30);
  }, [chatMessage, chatMessages]);

  const handleAIFeature = useCallback((feature) => {
    const messages = {
      analysis: "🔍 AI Performance Analysis coming soon! I'll help you understand your strengths and what to work on next!",
      workout: "💪 Custom Workout Generator is being supercharged! Soon I'll create the perfect workout just for you!",
      nutrition: "🥗 Smart Nutrition Guide is cooking up! I'll help you fuel your body like a champion!",
      recovery: "😴 Recovery Optimizer is in development! Rest and recovery are just as important as training!"
    };

    Alert.alert(
      "🚀 AI Feature Update",
      messages[feature],
      [{ text: "Can't wait! 🎯", style: "default" }]
    );
  }, []);

  // Mock coach personality data
  const coachStats = {
    helpfulTips: 247,
    motivationalMessages: 189,
    workoutsCreated: 156,
    successStories: 42
  };

  const quickActions = [
    { id: 'motivation', icon: 'psychology', label: 'Motivate Me!', color: '#FF6B6B' },
    { id: 'tips', icon: 'lightbulb', label: 'Pro Tips', color: '#4ECDC4' },
    { id: 'goals', icon: 'flag', label: 'Set Goals', color: '#45B7D1' },
    { id: 'celebrate', icon: 'celebration', label: 'Celebrate', color: '#96CEB4' }
  ];

  const aiFeatures = [
    { id: 'analysis', title: 'Performance Analysis 📊', description: 'AI-powered insights about your progress', icon: 'analytics' },
    { id: 'workout', title: 'Custom Workouts 🏋️', description: 'Personalized training plans just for you', icon: 'fitness-center' },
    { id: 'nutrition', title: 'Nutrition Guide 🥗', description: 'Smart meal suggestions for young athletes', icon: 'restaurant' },
    { id: 'recovery', title: 'Recovery Tips 😴', description: 'Rest and recovery recommendations', icon: 'bedtime' }
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with gradient and AI Coach Avatar */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.coachInfo}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Avatar.Icon 
                  size={60} 
                  icon="smart-toy"
                  style={styles.coachAvatar}
                />
                <Badge 
                  style={styles.onlineBadge}
                  size={16}
                />
              </Animated.View>
              <View style={styles.coachDetails}>
                <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
                  Coach AI 🤖
                </Text>
                <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
                  Your Personal Training Buddy
                </Text>
                <Text style={[TEXT_STYLES.caption, styles.statusText]}>
                  🟢 Online & Ready to Help!
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              onPress={() => setChatVisible(true)}
              style={styles.chatButton}
            >
              <Icon name="chat-bubble" size={24} color="white" />
              <Badge style={styles.chatBadge}>2</Badge>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary, COLORS.secondary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Quick Actions */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionContainer}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              ⚡ Quick Help
            </Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  onPress={() => handleQuickAction(action.id)}
                  activeOpacity={0.7}
                >
                  <Surface style={styles.quickActionCard}>
                    <LinearGradient
                      colors={[action.color, `${action.color}80`]}
                      style={styles.quickActionGradient}
                    >
                      <Icon name={action.icon} size={28} color="white" />
                    </LinearGradient>
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </Surface>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Coach Stats */}
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              })
            }]
          }}
        >
          <View style={styles.sectionContainer}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              🏆 Coach AI's Impact
            </Text>
            <Card style={styles.statsCard}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{coachStats.helpfulTips}</Text>
                  <Text style={styles.statLabel}>💡 Tips Given</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{coachStats.motivationalMessages}</Text>
                  <Text style={styles.statLabel}>🌟 Motivations</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{coachStats.workoutsCreated}</Text>
                  <Text style={styles.statLabel}>💪 Workouts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{coachStats.successStories}</Text>
                  <Text style={styles.statLabel}>🎯 Success Stories</Text>
                </View>
              </View>
            </Card>
          </View>
        </Animated.View>

        {/* AI Features */}
        <View style={styles.sectionContainer}>
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
            🚀 AI Super Powers
          </Text>
          {aiFeatures.map((feature, index) => (
            <Animated.View
              key={feature.id}
              style={{
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })
                }]
              }}
            >
              <TouchableOpacity
                onPress={() => handleAIFeature(feature.id)}
                activeOpacity={0.7}
              >
                <Card style={[styles.featureCard, { marginTop: index > 0 ? SPACING.md : 0 }]}>
                  <View style={styles.featureContent}>
                    <Surface style={styles.featureIcon}>
                      <Icon name={feature.icon} size={24} color={COLORS.primary} />
                    </Surface>
                    <View style={styles.featureInfo}>
                      <Text style={[TEXT_STYLES.h4, styles.featureTitle]}>
                        {feature.title}
                      </Text>
                      <Text style={[TEXT_STYLES.body, styles.featureDescription]}>
                        {feature.description}
                      </Text>
                    </View>
                    <Surface style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>Soon! 🎯</Text>
                    </Surface>
                  </View>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Motivational Quote Card */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Card style={styles.quoteCard}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              style={styles.quoteGradient}
            >
              <Icon name="format-quote" size={30} color="white" style={styles.quoteIcon} />
              <Text style={[TEXT_STYLES.h4, styles.quoteText]}>
                "Champions are made from something deep inside - the will, the dream, the vision!"
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.quoteAuthor]}>
                - Your AI Coach 🤖
              </Text>
            </LinearGradient>
          </Card>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Chat Modal */}
      <Portal>
        <Modal
          visible={chatVisible}
          onDismiss={() => setChatVisible(false)}
          contentContainerStyle={styles.chatModal}
        >
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderInfo}>
              <Avatar.Icon size={40} icon="smart-toy" style={styles.chatAvatar} />
              <View>
                <Text style={[TEXT_STYLES.h4, styles.chatTitle]}>Coach AI 🤖</Text>
                <Text style={[TEXT_STYLES.caption, styles.chatStatus]}>Always here to help!</Text>
              </View>
            </View>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setChatVisible(false)}
            />
          </View>

          <ScrollView style={styles.chatMessages} showsVerticalScrollIndicator={false}>
            {chatMessages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.sender === 'user' ? styles.userMessage : styles.aiMessage
                ]}
              >
                {message.sender === 'ai' && (
                  <Text style={styles.messageEmoji}>{message.emoji}</Text>
                )}
                <Surface
                  style={[
                    styles.messageBubble,
                    message.sender === 'user' ? styles.userBubble : styles.aiBubble
                  ]}
                >
                  <Text style={[
                    TEXT_STYLES.body,
                    styles.messageText,
                    message.sender === 'user' && styles.userMessageText
                  ]}>
                    {message.text}
                  </Text>
                </Surface>
              </View>
            ))}
          </ScrollView>

          <View style={styles.chatInput}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask your AI Coach anything! 💬"
              value={chatMessage}
              onChangeText={setChatMessage}
              multiline
              maxLength={200}
            />
            <IconButton
              icon="send"
              size={24}
              iconColor="white"
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!chatMessage.trim()}
            />
          </View>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="chat"
        label="Chat with AI"
        style={styles.fab}
        onPress={() => setChatVisible(true)}
        color="white"
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coachAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  onlineBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#4CAF50',
  },
  coachDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  statusText: {
    color: 'white',
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  chatButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: SPACING.sm,
    position: 'relative',
  },
  chatBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - SPACING.lg * 3) / 2,
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: 'white',
    elevation: 4,
    marginBottom: SPACING.md,
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: 'white',
    elevation: 4,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: 'white',
    elevation: 4,
    borderRadius: 16,
  },
  featureContent: {
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}20`,
    marginRight: SPACING.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  comingSoonBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    backgroundColor: `${COLORS.secondary}20`,
  },
  comingSoonText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  quoteCard: {
    marginBottom: SPACING.xl,
    elevation: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quoteGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: SPACING.md,
    opacity: 0.8,
  },
  quoteText: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    color: 'white',
    opacity: 0.9,
  },
  chatModal: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    borderRadius: 20,
    maxHeight: height * 0.8,
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatAvatar: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.md,
  },
  chatTitle: {
    color: COLORS.text,
  },
  chatStatus: {
    color: COLORS.textSecondary,
  },
  chatMessages: {
    flex: 1,
    padding: SPACING.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageEmoji: {
    fontSize: 20,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: 16,
  },
  aiBubble: {
    backgroundColor: `${COLORS.primary}10`,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
  },
  messageText: {
    color: COLORS.text,
  },
  userMessageText: {
    color: 'white',
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    margin: 0,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default AICoach;